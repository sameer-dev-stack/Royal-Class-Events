import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Shared helper to get authenticated user from token or context
 */
export async function getAuthenticatedUser(ctx, token) {
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

/**
 * Shared helper to fetch system settings
 */
export async function getSystemSettings(ctx) {
    const settings = await ctx.db.query("system_settings").collect();
    return settings.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.value
    }), {
        commission_rate: 10, // Defaults
        maintenance_mode: false
    });
}
