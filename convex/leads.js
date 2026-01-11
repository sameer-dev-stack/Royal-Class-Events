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
