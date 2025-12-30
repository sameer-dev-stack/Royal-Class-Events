import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper: Get current user with resolved roles
 */
async function getCurrentUserWithRoles(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
        .query("users")
        .withIndex("by_external_id", (q) => q.eq("externalId", identity.tokenIdentifier))
        .unique();

    if (!user) return null;

    // Resolve role objects
    const roles = await Promise.all(
        (user.roles || []).map(async (userRole) => {
            const role = await ctx.db.get(userRole.roleId);
            return role ? { ...role, ...userRole } : null;
        })
    );

    return { ...user, roles: roles.filter(Boolean) };
}

/**
 * Helper: Check if current user has admin role
 */
async function requireAdmin(ctx) {
    const user = await getCurrentUserWithRoles(ctx);
    if (!user) throw new Error("Unauthorized");

    const isAdmin = user.roles.some((r) => r.key === "admin");
    if (!isAdmin) throw new Error("Admin access required");

    return user;
}

/**
 * Helper: Check if current user has a specific role
 */
export async function requireRole(ctx, requiredRole) {
    const user = await getCurrentUserWithRoles(ctx);
    if (!user) throw new Error("Unauthorized");

    const hasRole = user.roles.some(
        (r) => r.key === requiredRole || r.key === "admin"
    );
    if (!hasRole) throw new Error(`Requires ${requiredRole} role`);

    return user;
}

// ===================== QUERIES =====================

/**
 * Get all available roles
 */
export const getAllRoles = query({
    handler: async (ctx) => {
        return await ctx.db.query("roles").collect();
    },
});

/**
 * Get pending role upgrade requests (admin only)
 */
export const getPendingRoleRequests = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);

        // Get users with pending role requests in metadata
        const users = await ctx.db.query("users").collect();
        return users.filter((u) => u.metadata?.pendingRoleRequest);
    },
});

// ===================== MUTATIONS =====================

/**
 * Request a role upgrade (e.g., attendee requesting organizer)
 * Creates a pending request for admin approval
 */
export const requestRoleUpgrade = mutation({
    args: {
        requestedRole: v.string(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserWithRoles(ctx);
        if (!user) throw new Error("Unauthorized");

        // Check if role exists
        const role = await ctx.db
            .query("roles")
            .withIndex("by_key", (q) => q.eq("key", args.requestedRole))
            .first();

        if (!role) throw new Error("Invalid role");

        // Check if already has the role
        const hasRole = user.roles.some((r) => r.key === args.requestedRole);
        if (hasRole) throw new Error("You already have this role");

        // Store pending request in metadata
        await ctx.db.patch(user._id, {
            metadata: {
                ...(user.metadata || {}),
                pendingRoleRequest: {
                    roleKey: args.requestedRole,
                    roleId: role._id,
                    reason: args.reason,
                    requestedAt: Date.now(),
                },
            },
            updatedAt: Date.now(),
        });

        return { success: true, message: "Role upgrade request submitted" };
    },
});

/**
 * Admin-only: Approve a role upgrade request
 */
export const approveRoleUpgrade = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx);

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const pendingRequest = user.metadata?.pendingRoleRequest;
        if (!pendingRequest) throw new Error("No pending role request");

        // Add the role
        const now = Date.now();
        await ctx.db.patch(user._id, {
            roles: [
                ...user.roles,
                {
                    roleId: pendingRequest.roleId,
                    assignedBy: admin._id,
                    assignedAt: now,
                },
            ],
            metadata: {
                ...(user.metadata || {}),
                pendingRoleRequest: undefined, // Clear the request
                roleUpgradeApprovedAt: now,
                roleUpgradeApprovedBy: admin._id,
            },
            updatedAt: now,
        });

        return { success: true };
    },
});

/**
 * Admin-only: Deny a role upgrade request
 */
export const denyRoleUpgrade = mutation({
    args: {
        userId: v.id("users"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Clear the pending request
        await ctx.db.patch(user._id, {
            metadata: {
                ...(user.metadata || {}),
                pendingRoleRequest: undefined,
                roleUpgradeDeniedAt: Date.now(),
                roleUpgradeDeniedReason: args.reason,
            },
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Admin-only: Directly assign any role to a user
 */
export const adminAssignRole = mutation({
    args: {
        userId: v.id("users"),
        roleKey: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx);

        // Prevent admins from modifying themselves
        if (args.userId === admin._id) {
            throw new Error("Cannot modify your own roles");
        }

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Get the role
        const role = await ctx.db
            .query("roles")
            .withIndex("by_key", (q) => q.eq("key", args.roleKey))
            .first();

        if (!role) throw new Error("Invalid role");

        // Check if user already has this role
        const hasRole = user.roles.some((r) => r.roleId === role._id);
        if (hasRole) throw new Error("User already has this role");

        // Assign the role
        const now = Date.now();
        await ctx.db.patch(user._id, {
            roles: [
                ...user.roles,
                {
                    roleId: role._id,
                    assignedBy: admin._id,
                    assignedAt: now,
                },
            ],
            updatedAt: now,
        });

        return { success: true };
    },
});

/**
 * Admin-only: Remove a role from a user
 */
export const adminRemoveRole = mutation({
    args: {
        userId: v.id("users"),
        roleKey: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx);

        // Prevent admins from modifying themselves
        if (args.userId === admin._id) {
            throw new Error("Cannot modify your own roles");
        }

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Get the role to remove
        const role = await ctx.db
            .query("roles")
            .withIndex("by_key", (q) => q.eq("key", args.roleKey))
            .first();

        if (!role) throw new Error("Invalid role");

        // Remove the role
        const updatedRoles = user.roles.filter((r) => r.roleId !== role._id);

        await ctx.db.patch(user._id, {
            roles: updatedRoles,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});
