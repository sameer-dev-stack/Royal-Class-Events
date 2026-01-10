import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Client: Request a Quote
export const create = mutation({
    args: {
        supplierId: v.id("suppliers"),
        eventId: v.optional(v.id("events")),
        details: v.object({
            eventDate: v.optional(v.number()),
            guestCount: v.optional(v.number()),
            budget: v.optional(v.number()),
            requirements: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_external_id", (q) => q.eq("externalId", identity.subject))
            .first();

        if (!user) throw new Error("User not found");

        const rfqId = await ctx.db.insert("rfqs", {
            supplierId: args.supplierId,
            userId: user._id, // Client ID
            eventId: args.eventId,
            status: "pending",
            details: args.details,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // TODO: Trigger notification for Supplier

        return rfqId;
    },
});

// Supplier: List received RFQs
export const listForSupplier = query({
    args: { supplierId: v.id("suppliers") },
    handler: async (ctx, args) => {
        // Basic security check: ensure caller owns this supplier
        // For MVP, we skip strict ownership check here but it MUST be added
        return await ctx.db
            .query("rfqs")
            .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
            .collect();
    },
});

// Client: List my requests
export const listForClient = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_external_id", (q) => q.eq("externalId", identity.subject))
            .first();

        if (!user) return [];

        return await ctx.db
            .query("rfqs")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});
