import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Create a new Master Venue Design
export const create = mutation({
    args: {
        venueId: v.optional(v.string()),
        name: v.string(),
        baseArchetype: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) throw new Error("Unauthenticated");

        return await ctx.db.insert("venueDesigns", {
            venueId: args.venueId,
            name: args.name,
            designVersion: 1,
            designState: {}, // Initial empty state
            baseArchetype: args.baseArchetype,
            designLayers: [],
            tenantId: user.tenantId,
            createdBy: user._id,
            isTemplate: false,
            approvalState: "draft",
        });
    },
});

export const getById = query({
    args: { id: v.id("venueDesigns") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByVenue = query({
    args: { venueId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("venueDesigns")
            .withIndex("byVenue", (q) => q.eq("venueId", args.venueId))
            .collect();
    },
});

export const listTemplates = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("venueDesigns")
            .filter((q) => q.eq(q.field("isTemplate"), true))
            .collect();
    },
});

export const listMyDesigns = query({
    args: {},
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) return [];
        return await ctx.db
            .query("venueDesigns")
            .filter((q) => q.eq(q.field("createdBy"), user._id))
            .collect();
    },
});
