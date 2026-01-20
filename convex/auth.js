import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Shared helper to resolve a user from a token or identity.
 * This is meant to be called directly as a function from other queries/mutations.
 * It bypasses the need for ctx.runQuery, ensuring identity consistency.
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
        let identity = await ctx.auth.getUserIdentity();

        if (!identity) return null;


        const externalId = identity.subject || identity.tokenIdentifier;
        user = await ctx.db
            .query("users")
            .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
            .unique();
    }

    if (!user) return null;

    // Resolve and Prioritize Roles (Logic copied and centralized from users.js)
    const resolvedRoles = await Promise.all(
        (user.roles || []).map(async (userRole) => {
            const roleDoc = await ctx.db.get(userRole.roleId);
            return roleDoc ? { ...roleDoc, ...userRole } : null;
        })
    );

    const validRoles = resolvedRoles.filter(Boolean);

    // Prioritization: admin > organizer > attendee
    const priorityOrder = ["admin", "organizer", "attendee"];

    // Collect all candidate roles from both the array and the direct field
    const candidateRoles = validRoles.map(r => r.key);
    if (user.role) candidateRoles.push(user.role);

    // Sort to find the highest priority role
    candidateRoles.sort((a, b) => {
        const idxA = priorityOrder.indexOf(a);
        const idxB = priorityOrder.indexOf(b);
        // Handle unknown roles (put them at the end)
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    const roleKey = candidateRoles[0] || "attendee";

    return {
        ...user,
        role: roleKey,
        roles: validRoles,
    };
}
