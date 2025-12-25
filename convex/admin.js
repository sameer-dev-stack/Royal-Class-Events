import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// --- Helper for Auth Check ---
async function checkAdmin(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_external_id", (q) => q.eq("externalId", identity.tokenIdentifier))
        .unique();

    if (!user) {
        throw new Error("User not found");
    }

    // Check for super_admin role
    // const roles = user.roles || [];
    // if (!roles.includes("super_admin")) {
    //     throw new Error("Access denied: Admin rights required");
    // }

    // TEMPORARY: Allow access for testing as requested
    console.log("Allowing admin access for testing user:", user.profile?.displayName);

    return user;
}

// --- Dashboard Stats ---
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);

        const now = Date.now();

        // This is inefficient for massive scale, but fine for MVP/Admin
        // For scale, we would use aggregate tables or mutations to update counters.
        const users = await ctx.db.query("users").collect();
        const events = await ctx.db.query("events").collect();
        const registrations = await ctx.db.query("registrations").collect();

        const totalUsers = users.length;
        const totalEvents = events.length;
        const activeEvents = events.filter(e => e.status?.current === 'published').length;

        // Revenue Calculation (approximate from registrations)
        // In real world, query 'payments' or 'invoices' table
        const totalRevenue = registrations.reduce((sum, reg) => sum + (reg.amountPaid || 0), 0);

        // Recent Signups (last 30 days)
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const newUsers = users.filter(u => u.createdAt > thirtyDaysAgo).length;

        return {
            totalUsers,
            newUsers,
            totalEvents,
            activeEvents,
            totalRevenue,
            recentRegistrations: registrations.slice(0, 5) // Just a few for feed
        };
    }
});

// --- User Management ---
export const searchUsers = query({
    args: {
        query: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        let usersQuery = ctx.db.query("users");

        // Convex search is best, but for simple MVP admin list:
        const users = await usersQuery.order("desc").take(args.limit || 50);

        if (args.query) {
            const q = args.query.toLowerCase();
            return users.filter(u =>
                u.profile?.displayName?.toLowerCase().includes(q) ||
                u.profile?.primaryEmail?.address?.toLowerCase().includes(q)
            );
        }

        return users;
    }
});

export const toggleUserBan = mutation({
    args: { userId: v.id("users"), banned: v.boolean() },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx);

        // Prevent banning yourself
        if (admin._id === args.userId) {
            throw new Error("You cannot ban yourself");
        }

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) throw new Error("User not found");

        // Prevent banning other admins
        const targetRoles = targetUser.roles || [];
        if (targetRoles.includes("super_admin")) {
            throw new Error("Cannot ban a Super Admin. Demote them first.");
        }

        await ctx.db.patch(args.userId, {
            status: args.banned ? 'suspended' : 'active',
            updatedAt: Date.now()
        });
    }
});

export const promoteToAdmin = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const currentRoles = user.roles || [];
        if (!currentRoles.includes("super_admin")) {
            await ctx.db.patch(args.userId, {
                roles: [...currentRoles, "super_admin"],
                updatedAt: Date.now()
            });
        }
    }
});

// --- Event Management ---
export const getAllEventsAdmin = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        return await ctx.db
            .query("events")
            .order("desc") // newest first
            .take(args.limit || 50);
    }
});

export const deleteEventAdmin = mutation({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        // Check for existing registrations
        const registrations = await ctx.db
            .query("registrations")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .first();

        if (registrations) {
            throw new Error("Cannot delete event with existing registrations. Cancel the event instead.");
        }

        await ctx.db.delete(args.eventId);
    }
});
