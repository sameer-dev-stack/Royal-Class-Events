import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const backfillZones = mutation({
    args: {},
    handler: async (ctx) => {
        const events = await ctx.db.query("events").collect();
        let updatedCount = 0;

        for (const event of events) {
            if (event.seatMapConfig && event.seatMapConfig.zones) {
                let changed = false;
                const newZones = event.seatMapConfig.zones.map(zone => {
                    let z = { ...zone };
                    if (z.x === undefined) { z.x = 100; changed = true; }
                    if (z.y === undefined) { z.y = 100; changed = true; }
                    if (z.width === undefined) { z.width = 100; changed = true; }
                    if (z.height === undefined) { z.height = 100; changed = true; }
                    if (z.shape === undefined) { z.shape = "rect"; changed = true; }
                    return z;
                });

                if (changed) {
                    await ctx.db.patch(event._id, {
                        seatMapConfig: {
                            ...event.seatMapConfig,
                            zones: newZones
                        }
                    });
                    updatedCount++;
                }
            }
        }
        return `Backfilled ${updatedCount} events`;
    },
});
