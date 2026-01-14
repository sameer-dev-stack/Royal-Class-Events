import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./admin";

/**
 * Helper to log admin actions. 
 * To be called from within other mutations.
 */
export async function logAdminAction(ctx, adminId, action, targetId, details) {
    await ctx.db.insert("audit_logs", {
        adminId,
        action,
        targetId: targetId ? String(targetId) : undefined,
        details,
        timestamp: Date.now()
    });
}

/**
 * Filtered Audit Logs for Admin Panel
 */
export const getAuditLogs = query({
    args: {
        actionType: v.optional(v.string()),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        let logQuery = ctx.db.query("audit_logs");

        if (args.actionType && args.actionType !== "all") {
            logQuery = logQuery.withIndex("by_action", (q) => q.eq("action", args.actionType));
        }

        const logs = await logQuery.order("desc").collect();

        // Enrich with Admin Name
        const enriched = await Promise.all(logs.map(async (log) => {
            const admin = await ctx.db.get(log.adminId);
            return {
                ...log,
                adminName: admin?.name || admin?.profile?.displayName || "System/Unknown"
            };
        }));

        return enriched;
    }
});
