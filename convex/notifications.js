import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Step 1: Internal Helper to send notifications
 * Only callable from other Convex functions
 */
export const send = internalMutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.string(), // 'info', 'success', 'warning'
        link: v.optional(v.string()),
        timestamp: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            userId: args.userId,
            title: args.title,
            message: args.message,
            type: args.type,
            link: args.link,
            isRead: false,
            timestamp: args.timestamp || Date.now(),
        });
    },
});

/**
 * Step 2: Fetch last 20 notifications for current user
 */
export const get = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) return [];

        return await ctx.db
            .query("notifications")
            .withIndex("by_user_latest", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(20);
    },
});

/**
 * Get unread count for badge
 */
export const getUnreadCount = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id).eq("isRead", false))
            .collect();

        return unread.length;
    },
});

/**
 * Step 3: Mark specific notification as read
 */
export const markRead = mutation({
    args: {
        notificationId: v.id("notifications"),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        await ctx.db.patch(args.notificationId, { isRead: true });
        return { success: true };
    },
});

/**
 * Step 4: Mark all as read
 */
export const markAllRead = mutation({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id).eq("isRead", false))
            .collect();

        for (const n of unread) {
            await ctx.db.patch(n._id, { isRead: true });
        }

        return { success: true };
    },
});

/**
 * Helper to get authenticated user from token or context
 */
async function getAuthenticatedUser(ctx, token) {
    let user = null;
    if (token) {
        const session = await ctx.db
            .query("user_sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();
        if (session && session.expiresAt > Date.now()) {
            user = await ctx.db.get(session.userId);
        }
    }
    if (!user) {
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
            const externalId = identity.subject || identity.tokenIdentifier;
            user = await ctx.db
                .query("users")
                .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
                .unique();
        }
    }
    return user;
}
