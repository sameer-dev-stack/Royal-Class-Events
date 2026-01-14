import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Create a new Lead (RFQ) from client to supplier
 */
export const createLead = mutation({
    args: {
        supplierId: v.id("suppliers"),
        token: v.optional(v.string()), // Auth Token
        eventDate: v.string(), // ISO String
        guestCount: v.number(),
        budget: v.number(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Auth Check
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to request a quote.");

        // 2. Verify Supplier exists
        const supplier = await ctx.db.get(args.supplierId);
        if (!supplier || supplier.status !== "active") {
            throw new Error("Supplier not found or not accepting requests.");
        }

        // 3. Create Lead (using our schema structure)
        const leadId = await ctx.db.insert("leads", {
            userId: user._id,
            supplierId: args.supplierId,
            status: "new",
            details: {
                eventDate: args.eventDate,
                guestCount: args.guestCount,
                budget: args.budget,
            },
            lastActionAt: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // 4. Create First Message
        // First, create or get conversation
        let conversationId;
        const existingConversation = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("supplierId"), args.supplierId),
                    q.or(
                        q.eq(q.field("participants"), [user._id, supplier.userId]),
                        q.eq(q.field("participants"), [supplier.userId, user._id])
                    )
                )
            )
            .first();

        if (existingConversation) {
            conversationId = existingConversation._id;
        } else {
            conversationId = await ctx.db.insert("conversations", {
                supplierId: args.supplierId,
                participants: [user._id, supplier.userId],
                lastMessageAt: Date.now(),
                createdAt: Date.now(),
            });
        }

        // Link conversation to lead
        await ctx.db.patch(leadId, { conversationId });

        // Create the message
        await ctx.db.insert("messages", {
            conversationId,
            senderId: user._id,
            content: args.message,
            type: "text",
            leadId,
            createdAt: Date.now(),
        });

        // Update conversation timestamp
        await ctx.db.patch(conversationId, { lastMessageAt: Date.now() });

        return leadId;
    },
});

/**
 * Get leads for current user (as client)
 */
export const getMyLeads = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return [];

        const leads = await ctx.db
            .query("leads")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        // Enrich with supplier info
        return Promise.all(
            leads.map(async (lead) => {
                const supplier = await ctx.db.get(lead.supplierId);
                return {
                    ...lead,
                    supplierName: supplier?.name || "Unknown Vendor",
                    supplierLogo: supplier?.logoUrl || null,
                };
            })
        );
    },
});

/**
 * Get leads for current supplier (as vendor)
 */
export const getSupplierLeads = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return [];

        // Find supplier profile for this user
        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!supplier) return [];

        const leads = await ctx.db
            .query("leads")
            .withIndex("by_supplier_status", (q) => q.eq("supplierId", supplier._id))
            .order("desc")
            .collect();

        // Enrich with client info
        return Promise.all(
            leads.map(async (lead) => {
                const client = await ctx.db.get(lead.userId);
                return {
                    ...lead,
                    clientName: client?.name || "Anonymous",
                    clientEmail: client?.email || null,
                };
            })
        );
    },
});

/**
 * Update lead status
 */
export const updateStatus = mutation({
    args: {
        token: v.optional(v.string()),
        leadId: v.id("leads"),
        status: v.union(
            v.literal("new"),
            v.literal("viewed"),
            v.literal("contacted"),
            v.literal("quoted"),
            v.literal("booked"),
            v.literal("declined"),
            v.literal("archived"),
            v.literal("expired")
        ),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Unauthorized");

        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Lead not found");

        // Verify ownership (either client or supplier)
        const supplier = await ctx.db.get(lead.supplierId);
        if (lead.userId !== user._id && supplier?.userId !== user._id) {
            throw new Error("You don't have permission to update this lead.");
        }

        await ctx.db.patch(args.leadId, {
            status: args.status,
            lastActionAt: Date.now(),
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Send an Offer (Contract) in chat - Supplier only
 */
export const sendOffer = mutation({
    args: {
        leadId: v.id("leads"),
        token: v.optional(v.string()),
        title: v.string(),
        description: v.optional(v.string()),
        price: v.number(),
        validForDays: v.optional(v.number()), // How many days the offer is valid
    },
    handler: async (ctx, args) => {
        // 1. Auth Check
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to send an offer.");

        // 2. Get Lead
        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Conversation not found.");

        // 3. Get Supplier and verify ownership
        const supplier = await ctx.db.get(lead.supplierId);
        if (!supplier) throw new Error("Supplier not found.");

        if (supplier.userId !== user._id) {
            throw new Error("Only the vendor can send offers.");
        }

        // 4. Ensure conversation exists
        let conversationId = lead.conversationId;
        if (!conversationId) {
            conversationId = await ctx.db.insert("conversations", {
                supplierId: lead.supplierId,
                participants: [lead.userId, supplier.userId],
                lastMessageAt: Date.now(),
                createdAt: Date.now(),
                status: "active",
            });
            await ctx.db.patch(args.leadId, { conversationId });
        }

        // 5. Calculate valid until date
        const validDays = args.validForDays || 7;
        const validUntil = Date.now() + validDays * 24 * 60 * 60 * 1000;

        // 6. Insert Offer Message
        const messageId = await ctx.db.insert("messages", {
            conversationId,
            senderId: user._id,
            content: `Official Offer: ${args.title}`,
            type: "offer",
            metadata: {
                offerTitle: args.title,
                offerDescription: args.description || "",
                offerAmount: args.price,
                offerCurrency: "BDT",
                offerStatus: "pending", // pending, accepted, declined, expired
                validUntil,
                createdAt: Date.now(),
            },
            readBy: [user._id],
            leadId: args.leadId,
            createdAt: Date.now(),
        });

        // 7. Update Lead status to quoted
        await ctx.db.patch(args.leadId, {
            status: "quoted",
            lastActionAt: Date.now(),
            updatedAt: Date.now(),
            quote: {
                amount: args.price,
                currency: "BDT",
                validUntil,
                note: args.description,
            },
        });

        // 8. Update Conversation timestamp
        await ctx.db.patch(conversationId, {
            lastMessageAt: Date.now(),
            lastMessagePreview: `Offer: ${args.title}`,
        });

        return { messageId, success: true };
    },
});

/**
 * Accept an Offer - Client only
 */
export const acceptOffer = mutation({
    args: {
        messageId: v.id("messages"),
        leadId: v.id("leads"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Auth Check
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to accept offers.");

        // 2. Get Lead
        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Conversation not found.");

        // 3. Verify client ownership
        if (lead.userId !== user._id) {
            throw new Error("Only the client can accept this offer.");
        }

        // 4. Get the offer message
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Offer not found.");

        if (message.type !== "offer") {
            throw new Error("This is not an offer message.");
        }

        // 5. Check if offer is still valid
        const metadata = message.metadata;
        if (metadata?.offerStatus !== "pending") {
            throw new Error(`This offer has already been ${metadata?.offerStatus}.`);
        }

        if (metadata?.validUntil && metadata.validUntil < Date.now()) {
            // Mark as expired
            await ctx.db.patch(args.messageId, {
                metadata: { ...metadata, offerStatus: "expired" },
            });
            throw new Error("This offer has expired.");
        }

        // 6. Update offer status to accepted
        await ctx.db.patch(args.messageId, {
            metadata: {
                ...metadata,
                offerStatus: "accepted",
                acceptedAt: Date.now(),
                acceptedBy: user._id,
            },
        });

        // 7. Update Lead status to booked
        await ctx.db.patch(args.leadId, {
            status: "booked",
            lastActionAt: Date.now(),
            updatedAt: Date.now(),
        });

        // 8. Send a system message confirming acceptance
        if (lead.conversationId) {
            await ctx.db.insert("messages", {
                conversationId: lead.conversationId,
                senderId: user._id,
                content: `✅ Offer "${metadata?.offerTitle}" has been accepted! Total: ৳${metadata?.offerAmount?.toLocaleString()}`,
                type: "text",
                metadata: {
                    isSystemMessage: true,
                    relatedOfferId: args.messageId,
                },
                readBy: [user._id],
                createdAt: Date.now(),
            });

            await ctx.db.patch(lead.conversationId, {
                lastMessageAt: Date.now(),
                lastMessagePreview: "Offer accepted! 🎉",
            });
        }

        return {
            success: true,
            message: "Offer accepted successfully!",
            // In future: return paymentUrl for payment gateway redirect
        };
    },
});

/**
 * Decline an Offer - Client only
 */
export const declineOffer = mutation({
    args: {
        messageId: v.id("messages"),
        leadId: v.id("leads"),
        token: v.optional(v.string()),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Auth Check
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to decline offers.");

        // 2. Get Lead and verify client ownership
        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Conversation not found.");

        if (lead.userId !== user._id) {
            throw new Error("Only the client can decline this offer.");
        }

        // 3. Get the offer message
        const message = await ctx.db.get(args.messageId);
        if (!message || message.type !== "offer") {
            throw new Error("Offer not found.");
        }

        const metadata = message.metadata;
        if (metadata?.offerStatus !== "pending") {
            throw new Error(`This offer has already been ${metadata?.offerStatus}.`);
        }

        // 4. Update offer status to declined
        await ctx.db.patch(args.messageId, {
            metadata: {
                ...metadata,
                offerStatus: "declined",
                declinedAt: Date.now(),
                declinedBy: user._id,
                declineReason: args.reason,
            },
        });

        // 5. Send a message notifying the decline
        if (lead.conversationId) {
            await ctx.db.insert("messages", {
                conversationId: lead.conversationId,
                senderId: user._id,
                content: args.reason
                    ? `❌ Offer declined. Reason: ${args.reason}`
                    : "❌ Offer has been declined.",
                type: "text",
                metadata: { isSystemMessage: true },
                readBy: [user._id],
                createdAt: Date.now(),
            });

            await ctx.db.patch(lead.conversationId, {
                lastMessageAt: Date.now(),
            });
        }

        return { success: true };
    },
});

/**
 * Process simulated payment for an offer
 * Splits payment: 10% Platform Commission, 90% Vendor Earnings
 */
export const processPayment = mutation({
    args: {
        leadId: v.id("leads"),
        messageId: v.id("messages"),
        amount: v.number(),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Unauthorized");

        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Lead not found");

        if (lead.userId !== user._id) {
            throw new Error("Only the client can pay for this offer.");
        }

        const message = await ctx.db.get(args.messageId);
        if (!message || message.type !== "offer") {
            throw new Error("Offer not found.");
        }

        if (message.metadata?.offerStatus !== "pending" && message.metadata?.offerStatus !== "accepted") {
            if (message.metadata?.offerStatus === "paid") {
                throw new Error("Offer already paid.");
            }
        }

        // Get supplier for balance update
        const supplier = await ctx.db.get(lead.supplierId);
        if (!supplier) throw new Error("Supplier not found.");

        const now = Date.now();

        // ========== COMMISSION SPLIT LOGIC ==========
        const COMMISSION_RATE = 0.10; // 10%
        const totalAmount = args.amount;
        const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);
        const vendorEarnings = totalAmount - commissionAmount;
        // ============================================

        // 1. Update Message Metadata to 'paid'
        await ctx.db.patch(args.messageId, {
            metadata: {
                ...message.metadata,
                offerStatus: "paid",
                paidAt: now,
                paidAmount: totalAmount,
                commissionDeducted: commissionAmount,
                vendorReceived: vendorEarnings,
            }
        });

        // 2. Update Lead status to 'booked'
        await ctx.db.patch(args.leadId, {
            status: "booked",
            updatedAt: now,
            lastActionAt: now,
        });

        // 3. Create Transaction: Full Payment (Escrow In)
        await ctx.db.insert("transactions", {
            leadId: args.leadId,
            payerId: user._id,
            payeeId: lead.supplierId,
            amount: totalAmount,
            type: "escrow_in",
            status: "completed",
            timestamp: now,
            metadata: {
                messageId: args.messageId,
                note: `Payment for offer: ${message.metadata?.offerTitle}`,
            },
        });

        // 4. Create Transaction: Platform Commission (10%)
        await ctx.db.insert("transactions", {
            leadId: args.leadId,
            payerId: lead.supplierId, // Deducted from vendor
            payeeId: null, // Platform
            amount: commissionAmount,
            type: "commission",
            status: "completed",
            timestamp: now,
            metadata: {
                rate: COMMISSION_RATE,
                sourceTransaction: args.messageId,
            },
        });

        // 5. Create Transaction: Vendor Credit (90%)
        await ctx.db.insert("transactions", {
            leadId: args.leadId,
            payerId: user._id,
            payeeId: lead.supplierId,
            amount: vendorEarnings,
            type: "vendor_credit",
            status: "completed",
            timestamp: now,
            metadata: {
                afterCommission: true,
                commissionDeducted: commissionAmount,
            },
        });

        // 6. ========== UPDATE VENDOR BALANCE ==========
        const currentBalance = supplier.walletBalance || 0;
        const currentTotalEarnings = supplier.totalEarnings || 0;

        await ctx.db.patch(lead.supplierId, {
            walletBalance: currentBalance + vendorEarnings,
            totalEarnings: currentTotalEarnings + vendorEarnings,
            updatedAt: now,
        });
        // =============================================

        // 7. Insert System Message
        if (lead.conversationId) {
            await ctx.db.insert("messages", {
                conversationId: lead.conversationId,
                senderId: user._id,
                content: `✅ Payment Successful!\n💰 Total: ৳${totalAmount.toLocaleString()}\n📊 Platform Fee (10%): ৳${commissionAmount.toLocaleString()}\n💵 Vendor Receives: ৳${vendorEarnings.toLocaleString()}`,
                type: "text",
                metadata: {
                    isSystemMessage: true,
                    paymentConfirmation: true,
                    relatedOfferId: args.messageId,
                    breakdown: {
                        total: totalAmount,
                        commission: commissionAmount,
                        vendorEarnings: vendorEarnings,
                    }
                },
                readBy: [user._id],
                createdAt: now,
            });

            // Update conversation preview
            await ctx.db.patch(lead.conversationId, {
                lastMessageAt: now,
                lastMessagePreview: `Booking confirmed ✅ Vendor received ৳${vendorEarnings.toLocaleString()}`,
            });
        }

        return {
            success: true,
            breakdown: {
                total: totalAmount,
                commission: commissionAmount,
                vendorEarnings: vendorEarnings,
            }
        };
    },
});
