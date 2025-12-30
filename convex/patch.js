const { mutation, query } = require("./_generated/server");
const { v } = require("convex/values");

// Temporary mutation to patch an event with seatMapConfig
// Usage: npx convex run patch:addSeatMapConfig --args eventId="<EVENT_ID>"

export const addSeatMapConfig = mutation({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);
        if (!event) throw new Error("Event not found");

        // Fetch existing tickets to map IDs roughly if needed, 
        // but for now we'll just create a config that matches typical tiers.
        // In a real scenario, the Admin UI would align these IDs.

        // We will use a placeholder stadium map
        const imageUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1920&auto=format&fit=crop";

        await ctx.db.patch(args.eventId, {
            seatMapConfig: {
                imageUrl: imageUrl,
                zones: [
                    {
                        id: "VIP", // This ID needs to match a Ticket Tier ID or Name for the price lookup to work in our simplified component
                        name: "VIP",
                        color: "#FBB03B", // Gold
                        price: 5000
                    },
                    {
                        id: "Gold",
                        name: "Gold",
                        color: "#3B82F6", // Blue
                        price: 2000
                    },
                    {
                        id: "Standard",
                        name: "Standard",
                        color: "#10B981", // Emerald
                        price: 500
                    }
                ]
            }
        });

        console.log(`Updated event ${event.title} with seatMapConfig`);
    },
});

export const listEvents = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("events").take(5);
    }
});
