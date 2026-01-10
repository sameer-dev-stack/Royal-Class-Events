import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Public: Get Supplier by Slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        return supplier; // Returns null if not found
    },
});

// Admin/Owner: Register a new Supplier
export const register = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        categories: v.array(v.string()),
        contact: v.object({
            email: v.string(),
            phone: v.optional(v.string()),
            website: v.optional(v.string()),
        }),
        location: v.object({
            city: v.string(),
            country: v.string(),
            address: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Resolve user ID logic (assuming identity.subject maps to externalId or similar)
        // For now, we need to map identity to our internal user. 
        // This part often depends on how `users` are looked up. 
        // We'll trust the identity for now or look up the user.
        const user = await ctx.db
            .query("users")
            .withIndex("by_external_id", (q) => q.eq("externalId", identity.subject))
            .first();

        if (!user) throw new Error("User not found");

        // Check slug uniqueness
        const existing = await ctx.db
            .query("suppliers")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) throw new Error("Slug already taken");

        const supplierId = await ctx.db.insert("suppliers", {
            userId: user._id,
            name: args.name,
            slug: args.slug,
            categories: args.categories,
            contact: args.contact,
            location: args.location,
            rating: 0,
            reviewCount: 0,
            verified: false,
            status: "pending", // Requires admin approval
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return supplierId;
    },
});

// Public: List Suppliers with filtering
export const list = query({
    args: {
        category: v.optional(v.string()),
        city: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("suppliers").withIndex("by_status", (q) => q.eq("status", "active"));

        // Convex doesn't support multi-field filtering easily without searchIndex
        // We will use the search index if text search is needed, but for exact matches:

        // Naive client-side filtering (efficient for MVP, scalable via search later)
        const suppliers = await q.take(args.limit || 20);

        return suppliers.filter(s => {
            if (args.category && !s.categories.includes(args.category)) return false;
            if (args.city && s.location.city !== args.city) return false;
            return true;
        });
    },
});
