import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a grid of seats for a zone
export const generateGrid = mutation({
    args: {
        designId: v.id("venueDesigns"),
        zoneId: v.id("venueZones"),
        rows: v.number(),
        seatsPerRow: v.number(),
        price: v.number(),
        startX: v.number(),
        startY: v.number(),
        spacing: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const spacing = args.spacing || 40;
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let r = 0; r < args.rows; r++) {
            const rowLabel = alphabet[r % 26] + (Math.floor(r / 26) > 0 ? Math.floor(r / 26) : "");

            for (let s = 1; s <= args.seatsPerRow; s++) {
<<<<<<< HEAD
                await ctx.db.insert("designSeats", {
=======
                await ctx.db.insert("seats", {
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
                    designId: args.designId,
                    zoneId: args.zoneId,
                    row: rowLabel,
                    number: s,
                    name: `${rowLabel}-${s}`,
                    x: args.startX + (s * spacing),
                    y: args.startY + (r * spacing),
                    status: "available",
                    price: args.price,
                });
            }
        }

        return `Generated ${args.rows * args.seatsPerRow} seats`;
    },
});

export const getByDesign = query({
    args: { designId: v.id("venueDesigns") },
    handler: async (ctx, args) => {
        return await ctx.db
<<<<<<< HEAD
            .query("designSeats")
=======
            .query("seats")
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
            .withIndex("byDesign", (q) => q.eq("designId", args.designId))
            .collect();
    },
});

export const getByZone = query({
    args: { zoneId: v.id("venueZones") },
    handler: async (ctx, args) => {
        return await ctx.db
<<<<<<< HEAD
            .query("designSeats")
=======
            .query("seats")
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
            .withIndex("byZone", (q) => q.eq("zoneId", args.zoneId))
            .collect();
    },
});

// Reserve a seat temporarily (locking logic)
export const reserveSeat = mutation({
<<<<<<< HEAD
    args: { seatId: v.id("designSeats"), userId: v.string() },
=======
    args: { seatId: v.id("seats"), userId: v.string() },
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
    handler: async (ctx, args) => {
        const seat = await ctx.db.get(args.seatId);
        if (!seat || seat.status !== "available") throw new Error("Seat unavailable");

        await ctx.db.patch(args.seatId, {
            status: "reserved",
            buyerId: args.userId,
            reservedUntil: Date.now() + (10 * 60 * 1000), // 10 minutes lock
        });
    },
});
