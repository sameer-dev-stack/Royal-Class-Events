import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or Get Conversation
export const getOrCreate = mutation({
    args: {
        participantId: v.id("users"), // The *other* person
        entityId: v.optional(v.string()), // Optional context
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Resolve current user
        const user = await ctx.db
            .query("users")
            .withIndex("by_external_id", (q) => q.eq("externalId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        const myId = user._id;
        const otherId = args.participantId;

        // Check if conversation exists (Naive check for now)
        // In a real app, we'd have a specific index for participants logic
        // For now, let's create a new one every time strictly for context or simple filter

        // Better: Search for existing conversation with these exact 2 participants
        /* 
           This is complex in NoSQL without specific array-contains logic for *exact* match.
           For MVP, we just create. Logic to deduplicate can happen later.
        */

        const conversationId = await ctx.db.insert("conversations", {
            participants: [myId, otherId],
            entityId: args.entityId,
            lastMessageAt: Date.now(),
            unreadCounts: { [myId]: 0, [otherId]: 0 },
            status: "active",
        });

        return conversationId;
    },
});

// Send Message
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("image"), v.literal("offer")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_external_id", (q) => q.eq("externalId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            content: args.content,
            type: args.type,
            readBy: [user._id],
            createdAt: Date.now(),
        });

        // Update conversation last message
        await ctx.db.patch(args.conversationId, {
            lastMessageAt: Date.now(),
            lastMessagePreview: args.content.substring(0, 50),
            // Increment unread for others? Logic omitted for brevity
        });
    },
});

// List Messages
export const listMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .order("asc") // Oldest first for chat log
            .collect();
    },
});
