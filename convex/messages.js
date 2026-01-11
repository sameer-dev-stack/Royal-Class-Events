import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Get message thread for a lead
 * Verifies user is either the client or supplier
 */
export const getThread = query({
    args: {
        leadId: v.id("leads"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Auth Check
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to view messages.");

        // 2. Get Lead
        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Conversation not found.");

        // 3. Get Supplier
        const supplier = await ctx.db.get(lead.supplierId);
        if (!supplier) throw new Error("Supplier not found.");

        // 4. Verify Access (user is either client or supplier)
        const isClient = lead.userId === user._id;
        const isSupplier = supplier.userId === user._id;

        if (!isClient && !isSupplier) {
            throw new Error("You don't have access to this conversation.");
        }

        // 5. Get Messages (via conversationId if exists, or directly via leadId)
        let messages = [];
        if (lead.conversationId) {
            messages = await ctx.db
                .query("messages")
                .withIndex("by_conversation", (q) => q.eq("conversationId", lead.conversationId))
                .order("asc")
                .collect();
        } else {
            // Fallback: get messages by leadId
            messages = await ctx.db
                .query("messages")
                .filter((q) => q.eq(q.field("leadId"), args.leadId))
                .order("asc")
                .collect();
        }

        // 6. Enrich messages with sender info
        const enrichedMessages = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return {
                    ...msg,
                    senderName: sender?.name || "Unknown",
                    senderImage: sender?.image || null,
                    isSelf: msg.senderId === user._id,
                };
            })
        );

        // 7. Get client info for supplier view
        const client = await ctx.db.get(lead.userId);

        return {
            lead: {
                ...lead,
                eventDate: lead.details?.eventDate,
                guestCount: lead.details?.guestCount,
                budget: lead.details?.budget,
            },
            supplier: {
                _id: supplier._id,
                name: supplier.name,
                logoUrl: supplier.logoUrl,
                categories: supplier.categories,
            },
            client: {
                _id: client?._id,
                name: client?.name || "Client",
                image: client?.image || null,
            },
            messages: enrichedMessages,
            isClient,
            isSupplier,
            currentUserId: user._id,
        };
    },
});

/**
 * Get all conversations for current user
 */
export const getConversations = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return [];

        // Get leads where user is client
        const clientLeads = await ctx.db
            .query("leads")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        // Get supplier profile if user is a supplier
        const supplierProfile = await ctx.db
            .query("suppliers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        // Get leads where user is supplier
        let supplierLeads = [];
        if (supplierProfile) {
            supplierLeads = await ctx.db
                .query("leads")
                .withIndex("by_supplier_status", (q) => q.eq("supplierId", supplierProfile._id))
                .order("desc")
                .collect();
        }

        // Combine and dedupe
        const allLeads = [...clientLeads, ...supplierLeads];
        const uniqueLeads = allLeads.filter(
            (lead, index, self) => index === self.findIndex((l) => l._id === lead._id)
        );

        // Enrich with other party info and last message
        const enrichedConversations = await Promise.all(
            uniqueLeads.map(async (lead) => {
                const isClient = lead.userId === user._id;
                const supplier = await ctx.db.get(lead.supplierId);
                const client = await ctx.db.get(lead.userId);

                // Get last message
                let lastMessage = null;
                if (lead.conversationId) {
                    lastMessage = await ctx.db
                        .query("messages")
                        .withIndex("by_conversation", (q) => q.eq("conversationId", lead.conversationId))
                        .order("desc")
                        .first();
                }

                return {
                    leadId: lead._id,
                    status: lead.status,
                    lastActionAt: lead.lastActionAt || lead.updatedAt,
                    otherParty: isClient
                        ? { name: supplier?.name || "Vendor", image: supplier?.logoUrl }
                        : { name: client?.name || "Client", image: client?.image },
                    lastMessage: lastMessage?.content || "No messages yet",
                    lastMessageAt: lastMessage?.createdAt || lead.createdAt,
                    isClient,
                    eventDate: lead.details?.eventDate,
                };
            })
        );

        // Sort by last message time
        return enrichedConversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    },
});

/**
 * Send a message in a lead conversation
 */
export const sendMessage = mutation({
    args: {
        leadId: v.id("leads"),
        text: v.string(),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Auth Check
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Please log in to send messages.");

        // 2. Get Lead
        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Conversation not found.");

        // 3. Get Supplier
        const supplier = await ctx.db.get(lead.supplierId);
        if (!supplier) throw new Error("Supplier not found.");

        // 4. Verify Access
        const isClient = lead.userId === user._id;
        const isSupplier = supplier.userId === user._id;

        if (!isClient && !isSupplier) {
            throw new Error("You don't have access to this conversation.");
        }

        // 5. Ensure conversation exists
        let conversationId = lead.conversationId;
        if (!conversationId) {
            conversationId = await ctx.db.insert("conversations", {
                supplierId: lead.supplierId,
                participants: [lead.userId, supplier.userId],
                lastMessageAt: Date.now(),
                createdAt: Date.now(),
            });
            await ctx.db.patch(args.leadId, { conversationId });
        }

        // 6. Insert Message
        const messageId = await ctx.db.insert("messages", {
            conversationId,
            senderId: user._id,
            content: args.text,
            type: "text",
            leadId: args.leadId,
            createdAt: Date.now(),
        });

        // 7. Update Lead
        await ctx.db.patch(args.leadId, {
            lastActionAt: Date.now(),
            updatedAt: Date.now(),
            status: lead.status === "new" ? "contacted" : lead.status,
        });

        // 8. Update Conversation timestamp
        await ctx.db.patch(conversationId, {
            lastMessageAt: Date.now(),
        });

        return messageId;
    },
});

/**
 * Mark messages as read
 */
export const markAsRead = mutation({
    args: {
        leadId: v.id("leads"),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return;

        const lead = await ctx.db.get(args.leadId);
        if (!lead) return;

        // Get all unread messages from other party
        if (lead.conversationId) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversation", (q) => q.eq("conversationId", lead.conversationId))
                .filter((q) => q.neq(q.field("senderId"), user._id))
                .collect();

            // Mark as read (if we had isRead field)
            // For now, just return success
        }

        return { success: true };
    },
});
