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

/**
 * Shared helper to check if an event is publicly visible
 */
export function isEventVisible(event) {
    if (!event) return false;

    // 1. Resolve status safely
    let resolvedStatus = "";
    if (typeof event.status === "string") {
        resolvedStatus = event.status;
    } else if (event.status && typeof event.status === "object" && event.status.current) {
        resolvedStatus = event.status.current;
    } else if (event.statusMetadata && event.statusMetadata.current) {
        resolvedStatus = event.statusMetadata.current;
    }

    // 2. Strict whitelist: Only "published" or "active"
    const isPublished = (resolvedStatus === "published") || (resolvedStatus === "active");

    // 3. Filter out "test" or "junk" data
    const title = event.title?.en || (typeof event.title === "string" ? event.title : "");
    const isTesting = title.toLowerCase().includes("test") || title.toLowerCase().includes("junk");

    // 4. Date check: Ensure event is not in the deep past
    const startTime = event.timeConfiguration?.startDateTime || event.startDate || 0;
    // Give 48h grace for timezones/same-day displays
    const isNotPast = startTime > Date.now() - (48 * 60 * 60 * 1000);

    return isPublished && isNotPast && !isTesting;
}
