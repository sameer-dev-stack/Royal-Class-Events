import { internalMutation, query } from "./_generated/server";

export const clearAll = internalMutation({
    args: {},
    handler: async (ctx) => {
        const tables = [
            "users", "organizations", "organizationMembers", "events",
            "ticketTiers", "promoCodes", "registrations", "waitlist",
            "payments", "eventAnalytics", "priceHistory", "reviews", "auditLogs",
            "tenants"
        ];

        for (const table of tables) {
            const docs = await ctx.db.query(table).collect();
            for (const doc of docs) {
                await ctx.db.delete(doc._id);
            }
        }
        return "Data cleared";
    },
});

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const tables = [
            "users", "tenants", "venues", "events",
            "ticketTiers", "registrations", "payments"
        ];
        const stats = {};
        for (const table of tables) {
            const docs = await ctx.db.query(table).collect();
            stats[table] = docs.length;
        }
        return stats;
    },
});
