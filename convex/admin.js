import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// --- Helper for Auth Check ---
async function checkAdmin(ctx, token) {
    let user = null;

    // 1. Try Custom Session Token (Internal Auth)
    if (token) {
        const session = await ctx.db
            .query("user_sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (session && session.expiresAt > Date.now()) {
            user = await ctx.db.get(session.userId);
        }
    }

    // 2. Fallback to Context Auth (Clerk/NextAuth if configured)
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

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Check for admin role
    const hasAdminRole = user.role === "admin" || (user.roles || []).some(r => r.key === "admin");

    if (!hasAdminRole) {
        throw new Error("Access denied: Admin rights required");
    }

    return user;
}

// --- Dashboard Stats ---
export const getDashboardStats = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const now = Date.now();

        const users = await ctx.db.query("users").collect();
        const events = await ctx.db.query("events").collect();
        const registrations = await ctx.db.query("registrations").collect();

        const totalUsers = users.length;
        const totalEvents = events.length;
        const activeEvents = events.filter(e => e.status?.current === 'published').length;

        const totalRevenue = registrations.reduce((sum, reg) => sum + (reg.amountPaid || 0), 0);

        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const newUsers = users.filter(u => u.createdAt > thirtyDaysAgo).length;

        // Prepare chart data: Sign-ups over last 7 days
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const count = users.filter(u => {
                const uDate = new Date(u.createdAt).toISOString().split('T')[0];
                return uDate === dateStr;
            }).length;
            chartData.push({ date: dateStr, signups: count });
        }

        return {
            totalUsers,
            newUsers,
            totalEvents,
            activeEvents,
            totalRevenue,
            recentRegistrations: registrations.slice(0, 5),
            chartData
        };
    }
});

// --- User Management ---
export const getAllUsers = query({
    args: {
        limit: v.optional(v.number()),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        return await ctx.db.query("users").order("desc").take(args.limit || 100);
    }
});

export const searchUsers = query({
    args: {
        query: v.optional(v.string()),
        limit: v.optional(v.number()),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        let usersQuery = ctx.db.query("users");
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
    args: { userId: v.id("users"), banned: v.boolean(), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.token);

        if (admin._id === args.userId) {
            throw new Error("You cannot ban yourself");
        }

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) throw new Error("User not found");

        const targetRoles = targetUser.roles || [];
        if (targetRoles.includes("super_admin")) {
            throw new Error("Cannot ban a Super Admin.");
        }

        await ctx.db.patch(args.userId, {
            status: args.banned ? 'suspended' : 'active',
            updatedAt: Date.now()
        });
    }
});

export const promoteToAdmin = mutation({
    args: { userId: v.id("users"), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        await ctx.db.patch(args.userId, {
            role: "admin",
            roles: [...(user.roles || []), {
                key: "admin",
                assignedAt: Date.now(),
                assignedBy: (await checkAdmin(ctx, args.token))._id
            }]
        });
    }
});

// --- Event Management ---
export const getAllEvents = query({
    args: { limit: v.optional(v.number()), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        return await ctx.db
            .query("events")
            .order("desc") // newest first
            .take(args.limit || 50);
    }
});

// Deprecated alias for compatibility if needed
export const getAllEventsAdmin = query({
    args: { limit: v.optional(v.number()), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        return await ctx.db.query("events").order("desc").take(args.limit || 50);
    }
});

export const deleteEventAdmin = mutation({
    args: { eventId: v.id("events"), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

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

// --- Finance & Transactions ---
export const getFinanceData = query({
    args: {
        limit: v.optional(v.number()),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const registrations = await ctx.db
            .query("registrations")
            .order("desc")
            .take(args.limit || 50);

        // Enhance registrations with user and event names
        const enriched = await Promise.all(
            registrations.map(async (reg) => {
                let user = null;
                let event = null;

                try {
                    if (reg.userId) user = await ctx.db.get(reg.userId);
                } catch (err) {
                    console.error(`Failed to fetch user for reg ${reg._id}:`, err.message);
                }

                try {
                    if (reg.eventId) event = await ctx.db.get(reg.eventId);
                } catch (err) {
                    console.error(`Failed to fetch event for reg ${reg._id}:`, err.message);
                }

                return {
                    ...reg,
                    userName: user?.name || user?.profile?.displayName || "Unknown User",
                    userEmail: user?.email || user?.profile?.primaryEmail?.address || "No Email",
                    eventTitle: event?.title || "Unknown Event",
                };
            })
        );

        return enriched;
    }
});

// --- Merchant Ops: Supplier Metrics ---
export const getMerchantMetrics = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        // 1. Get all active suppliers
        const suppliers = await ctx.db
            .query("suppliers")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        // 2. Enrich each supplier with metrics
        const enriched = await Promise.all(
            suppliers.map(async (supplier) => {
                // Get transactions for this supplier (assuming payeeId field)
                const transactions = await ctx.db
                    .query("transactions")
                    .filter((q) => q.eq(q.field("payeeId"), supplier._id))
                    .collect();

                const totalSales = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                const commission = Math.round(totalSales * 0.10); // 10% commission

                // Get active leads count
                const leads = await ctx.db
                    .query("leads")
                    .filter((q) =>
                        q.and(
                            q.eq(q.field("supplierId"), supplier._id),
                            q.neq(q.field("status"), "booked"),
                            q.neq(q.field("status"), "closed")
                        )
                    )
                    .collect();

                const activeLeads = leads.length;

                // Get services count
                const services = await ctx.db
                    .query("services")
                    .withIndex("by_supplier", (q) => q.eq("supplierId", supplier._id))
                    .filter((q) => q.eq(q.field("active"), true))
                    .collect();

                return {
                    _id: supplier._id,
                    name: supplier.name,
                    slug: supplier.slug,
                    category: supplier.categories?.[0] || "General",
                    location: supplier.location?.city || "Unknown",
                    rating: supplier.rating || 0,
                    verified: supplier.verified || false,
                    totalSales,
                    commission,
                    activeLeads,
                    serviceCount: services.length,
                    status: supplier.status,
                    createdAt: supplier.createdAt,
                };
            })
        );

        // Sort by total sales (highest first)
        return enriched.sort((a, b) => b.totalSales - a.totalSales);
    }
});
