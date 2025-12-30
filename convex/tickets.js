import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTicketTiers = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const tiers = await ctx.db
            .query("ticketTiers")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .collect();

        // Map to frontend-friendly format if needed, but for now just returning raw data.
        // The SeatSelectionModal expects: id (or _id), name, price, limit (capacity), sold, quantity (from state).

        // Schema check:
        // pricing is v.any(). We need to ensure we return a 'price' field for the frontend.
        // inventory is v.any(). We need to ensure we return 'limit' and 'sold'.

        return tiers.map(tier => {
            // Fallbacks for extracting simple values from complex objects (if they exist)
            const price = tier.price || tier.pricing?.basePrice || 0;
            const limit = tier.capacity || tier.inventory?.totalQuantity || 100;
            const sold = tier.sold || tier.inventory?.soldQuantity || 0;

            return {
                ...tier,
                price,
                limit,
                sold
            };
        });
    },
});
