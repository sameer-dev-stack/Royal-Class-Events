import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        designId: v.id("venueDesigns"),
        parentZoneId: v.optional(v.id("venueZones")),
        name: v.string(),
        type: v.string(),
        boundary: v.any(), // GeoJSON or similar
        capacityConfig: v.any(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("venueZones", {
            designId: args.designId,
            parentZoneId: args.parentZoneId,
            name: args.name,
            type: args.type,
            category: "primary", // Default
            boundary: args.boundary,
            capacityConfig: args.capacityConfig,
            accessPoints: [],
            connectivity: {},
            amenities: [],
            display: { color: "#cccccc" }, // Default display props
        });
    },
});

export const getByDesign = query({
    args: { designId: v.id("venueDesigns") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("venueZones")
            .withIndex("byDesign", (q) => q.eq("designId", args.designId))
            .collect();
    },
});
