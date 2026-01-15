import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Publicly accessible settings for frontend logic
 * (Maintenance mode check, etc.)
 */
export const getPublicSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("system_settings").collect();

        const mapped = settings.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value
        }), {
            maintenance_mode: false,
            commission_rate: 10
        });

        return {
            maintenance_mode: mapped.maintenance_mode,
            commission_rate: mapped.commission_rate
        };
    }
});
