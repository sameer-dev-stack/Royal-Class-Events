import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Save seat map layout from react-seat-toolkit designer
 */
export const saveSeatMapLayout = mutation({
    args: {
        eventId: v.id("events"),
        layoutData: v.any(), // The full JSON export from seat-toolkit
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        const event = await ctx.db.get(args.eventId);

        if (!event || event.ownerId !== user._id) {
            throw new Error("Unauthorized");
        }

        // Update event with new seat map configuration
        await ctx.db.patch(args.eventId, {
            seatMapConfig: {
                toolkitData: args.layoutData,
                lastUpdated: Date.now(),
                updatedBy: user._id,
            },
        });

        return { success: true };
    },
});

/**
 * Get seat map layout for an event
 */
export const getSeatMapLayout = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event) return null;

        return event.seatMapConfig?.toolkitData || null;
    },
});

/**
 * Update seat status (for booking/holding seats)
 */
export const updateSeatStatus = mutation({
    args: {
        eventId: v.id("events"),
        seatId: v.string(),
        status: v.union(
            v.literal("available"),
            v.literal("selected"),
            v.literal("held"),
            v.literal("booked"),
            v.literal("sold")
        ),
        userId: v.optional(v.id("users")),
        holdUntil: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event || !event.seatMapConfig?.toolkitData) {
            throw new Error("Event or seat map not found");
        }

        const layoutData = event.seatMapConfig.toolkitData;

        // Find and update the seat
        if (layoutData.seats) {
            const seatIndex = layoutData.seats.findIndex((s) => s.id === args.seatId);

            if (seatIndex !== -1) {
                layoutData.seats[seatIndex] = {
                    ...layoutData.seats[seatIndex],
                    status: args.status,
                    userId: args.userId,
                    holdUntil: args.holdUntil,
                };

                await ctx.db.patch(args.eventId, {
                    seatMapConfig: {
                        ...event.seatMapConfig,
                        toolkitData: layoutData,
                    },
                });

                return { success: true, seat: layoutData.seats[seatIndex] };
            }
        }

        throw new Error("Seat not found");
    },
});

/**
 * Bulk update seat statuses (for checkout)
 */
export const bulkUpdateSeatStatus = mutation({
    args: {
        eventId: v.id("events"),
        seats: v.array(
            v.object({
                seatId: v.string(),
                status: v.string(),
            })
        ),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);

        if (!event || !event.seatMapConfig?.toolkitData) {
            throw new Error("Event or seat map not found");
        }

        const layoutData = event.seatMapConfig.toolkitData;

        if (layoutData.seats) {
            args.seats.forEach(({ seatId, status }) => {
                const seatIndex = layoutData.seats.findIndex((s) => s.id === seatId);
                if (seatIndex !== -1) {
                    layoutData.seats[seatIndex] = {
                        ...layoutData.seats[seatIndex],
                        status,
                        userId: args.userId,
                        updatedAt: Date.now(),
                    };
                }
            });

            await ctx.db.patch(args.eventId, {
                seatMapConfig: {
                    ...event.seatMapConfig,
                    toolkitData: layoutData,
                },
            });

            return { success: true, updatedCount: args.seats.length };
        }

        return { success: false, error: "No seats found" };
    },
});
