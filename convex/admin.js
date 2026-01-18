import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { logAdminAction } from "./audit";
import { getAuthenticatedUser } from "./auth";

// --- Helper for Auth Check ---
// --- Helper for Auth Check ---
export async function checkAdmin(ctx, token) {
    const user = await getAuthenticatedUser(ctx, token);

    if (!user) {
        throw new Error("Unauthorized: Invalid Session or Missing Permissions");
    }

    // Check for admin role
    const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin");

    if (!isAdmin) {
        console.error("Admin Access Denied for user:", user.email || user._id);
        throw new Error("Access Denied: Admin rights required");
    }

    return user;
}

// --- Dashboard Stats ---
export const getAdminStats = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const users = await ctx.db.query("users").collect();
        const events = await ctx.db.query("events").collect();
        const registrations = await ctx.db.query("registrations").collect();

        // Calculate Revenue
        const totalRevenue = registrations.reduce((sum, reg) => {
            if (reg.status?.current === 'cancelled') return sum;
            return sum + ((reg.unitPrice || 0) * (reg.ticketQuantity || 1));
        }, 0);

        // Recent Activity
        const recentRegistrations = registrations
            .sort((a, b) => b._creationTime - a._creationTime)
            .slice(0, 5)
            .map(reg => ({
                id: reg._id,
                user: reg.attendeeInfo?.primary?.name || "Guest",
                email: reg.attendeeInfo?.primary?.email || "N/A",
                amount: (reg.unitPrice || 0) * (reg.ticketQuantity || 1),
                date: reg._creationTime,
                status: reg.status?.current || "booked"
            }));

        return {
            totalUsers: users.length,
            totalEvents: events.length,
            activeEvents: events.filter(e => e.status === "published" || e.status === "active").length,
            totalRevenue,
            recentRegistrations
        };
    }
});

// --- User Management ---
export const getAllUsers = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const users = await ctx.db.query("users").order("desc").collect();

        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        let organizerCount = 0;
        let newUsersCount = 0;

        const enriched = users.map(user => {
            if (user.role === "organizer") organizerCount++;
            if (user._creationTime > sevenDaysAgo) newUsersCount++;

            return {
                ...user,
                name: user.name || user.profile?.displayName || "N/A",
                email: user.email || user.profile?.primaryEmail?.address || "N/A",
                avatarUrl: user.profile?.imageUrl || null
            };
        });

        return {
            users: enriched,
            summary: {
                totalUsers: users.length,
                organizerCount,
                newUsersCount
            }
        };
    }
});

export const toggleUserStatus = mutation({
    args: {
        userId: v.id("users"),
        status: v.string(), // "active" or "banned"
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);

        if (admin._id === args.userId) {
            throw new Error("You cannot change your own status.");
        }

        // Apply status update
        await ctx.db.patch(args.userId, { status: args.status });

        await logAdminAction(ctx, admin._id, "USER_STATUS_CHANGE", args.userId, {
            status: args.status,
            previousStatus: admin.status || "active"
        });
    }
});

export const updateUserStatus = mutation({
    args: { userId: v.id("users"), status: v.string(), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);
        if (admin._id === args.userId) throw new Error("Cannot change your own status");
        await ctx.db.patch(args.userId, { status: args.status });

        await logAdminAction(ctx, admin._id, "USER_STATUS_CHANGE_V2", args.userId, {
            status: args.status
        });
    }
});

export const updateUserRole = mutation({
    args: { userId: v.id("users"), role: v.string(), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);
        if (admin._id === args.userId) throw new Error("Cannot change your own role");

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const currentRoles = user.roles || [];
        const hasRole = currentRoles.some(r => r.key === args.role);

        let newRoles = currentRoles;

        // Add role if not present
        if (!hasRole) {
            newRoles.push({
                key: args.role,
                assignedAt: Date.now(),
                assignedBy: admin._id
            });
        }

        await ctx.db.patch(args.userId, {
            role: args.role, // Update primary role string
            roles: newRoles
        });

        await logAdminAction(ctx, admin._id, "USER_ROLE_CHANGE", args.userId, {
            newRole: args.role
        });
    }
});

export const getAllEvents = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const events = await ctx.db.query("events").order("desc").collect();

        let liveCount = 0;
        let draftCount = 0;
        let totalRevenue = 0;

        const enriched = await Promise.all(events.map(async (e) => {
            let organizerName = "Unknown";
            let organizerAvatar = null;
            const ownerId = e.ownerId || e.userId;

            if (ownerId) {
                const organizer = await ctx.db.get(ownerId);
                organizerName = organizer?.name || organizer?.profile?.displayName || "Unknown";
                organizerAvatar = organizer?.profile?.imageUrl || null;
            }

            const statusStr = e.status?.current || (typeof e.status === 'string' ? e.status : "draft");
            if (statusStr === 'published') liveCount++;
            else draftCount++;

            // Get revenue for this event
            const txs = await ctx.db
                .query("transactions")
                .withIndex("by_event", (q) => q.eq("eventId", e._id))
                .filter((q) => q.eq(q.field("status"), "success"))
                .collect();

            const eventRevenue = txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
            totalRevenue += eventRevenue;

            return {
                ...e,
                title: e.title?.en || "Untitled",
                status: statusStr,
                organizerName,
                organizerAvatar,
                revenue: eventRevenue,
                startDate: e.timeConfiguration?.startDateTime || e.startDate || null,
                coverImage: e.media?.coverImage || e.coverImage || null
            };
        }));

        return {
            events: enriched,
            summary: {
                totalRevenue,
                liveCount,
                draftCount,
                totalCount: events.length
            }
        };
    }
});

export const adminDeleteEvent = mutation({
    args: { eventId: v.id("events"), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);
        await ctx.db.delete(args.eventId);

        await logAdminAction(ctx, admin._id, "EVENT_DELETE", args.eventId, {});
    }
});

export const adminToggleEventStatus = mutation({
    args: {
        eventId: v.id("events"),
        status: v.string(),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);

        // Update both nested and flat status for reliability
        await ctx.db.patch(args.eventId, {
            status: args.status, // Simple string status
            "status.current": args.status, // Legacy/Nested object status support
        });

        await logAdminAction(ctx, admin._id, "EVENT_STATUS_TOGGLE", args.eventId, {
            status: args.status
        });

        return { success: true };
    }
});

export const getAnalyticsData = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        // Mock Data for Charts (Real aggregation is complex for MVP)
        return [
            { date: "Jan 1", users: 2, revenue: 500 },
            { date: "Jan 5", users: 5, revenue: 1200 },
            { date: "Jan 10", users: 8, revenue: 800 },
            { date: "Jan 15", users: 12, revenue: 2500 },
            { date: "Jan 20", users: 15, revenue: 3000 },
            { date: "Jan 25", users: 20, revenue: 4500 },
            { date: "Jan 30", users: 25, revenue: 6000 },
        ];
    }
});


// --- System Settings ---
export const getSettings = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const settings = await ctx.db.query("system_settings").collect();

        // Transform list into object
        return settings.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value
        }), {
            commission_rate: 10, // Default fallbacks
            maintenance_mode: false
        });
    }
});

export const updateSetting = mutation({
    args: {
        key: v.string(),
        value: v.any(),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);

        const existing = await ctx.db
            .query("system_settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { value: args.value });
        } else {
            await ctx.db.insert("system_settings", { key: args.key, value: args.value });
        }

        await logAdminAction(ctx, admin._id, "SYSTEM_SETTING_CHANGE", args.key, {
            newValue: args.value
        });

        return { success: true };
    }
});

// --- Broadcasting ---
export const broadcastMessage = mutation({
    args: {
        title: v.string(),
        message: v.string(),
        targetRole: v.string(), // "all", "organizer", "attendee", "admin"
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);

        let usersQuery = ctx.db.query("users");
        if (args.targetRole !== "all") {
            usersQuery = usersQuery.filter((q) => q.eq(q.field("role"), args.targetRole));
        }

        const users = await usersQuery.collect();

        // Dispatch notifications to all target users
        for (const user of users) {
            await ctx.runMutation(internal.notifications.send, {
                userId: user._id,
                title: args.title,
                message: args.message,
                type: "system",
                link: "/notifications"
            });
        }

        await logAdminAction(ctx, admin._id, "BROADCAST_SEND", "SYSTEM", {
            title: args.title,
            target: args.targetRole,
            count: users.length
        });

        return { success: true, count: users.length };
    }
});
