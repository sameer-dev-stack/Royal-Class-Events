import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

// Log a change event for the activity stream
export const logChange = mutation({
    args: {
        designId: v.id("venueDesigns"),
        action: v.string(),
        elementType: v.string(),
        elementId: v.optional(v.string()),
        changeset: v.any(),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        return await ctx.db.insert("collaborationEvents", {
            designId: args.designId,
            userId: user._id,
            action: args.action,
            elementType: args.elementType,
            elementId: args.elementId,
            changeset: args.changeset,
            timestamp: Date.now(),
        });
    },
});

export const getHistory = query({
    args: { designId: v.id("venueDesigns") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("collaborationEvents")
            .withIndex("byDesign", (q) => q.eq("designId", args.designId))
            .order("desc")
            .take(50);
    },
});
