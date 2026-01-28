import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";

// 1. Add a Block (Mark as Busy)
export const addBlock = mutation({
    args: {
        token: v.optional(v.string()),
        startDateTime: v.number(),
        endDateTime: v.number(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        // Resolve Supplier ID from User
        // Assuming user is linked to a supplier profile or is the supplier
        const supplier = await ctx.db
            .query("suppliers")
            .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
            .first();

        if (!supplier) throw new Error("Supplier profile not found");

        // Basic Collision Check (Self-overlap)
        const existing = await ctx.db
            .query("supplier_availability")
            .withIndex("by_supplier_date", (q) =>
                q.eq("supplierId", supplier._id)
                    .gte("startDateTime", args.startDateTime)
            )
            .filter((q) => q.lt(q.field("startDateTime"), args.endDateTime))
            .collect();

        // If fully overlapping, maybe merge? For now, just simplistic add.
        // In production, we'd merging adjacent blocks.

        await ctx.db.insert("supplier_availability", {
            supplierId: supplier._id,
            startDateTime: args.startDateTime,
            endDateTime: args.endDateTime,
            isBlocked: true,
            reason: args.reason,
        });

        return { success: true };
    },
});

// 2. Remove a Block
export const removeBlock = mutation({
    args: {
        token: v.optional(v.string()),
        blockId: v.id("supplier_availability"),
    },
    handler: async (ctx, args) => {
        const user = await getAuthenticatedUser(ctx, args.token);
        if (!user) throw new Error("Unauthorized");

        const block = await ctx.db.get(args.blockId);
        if (!block) throw new Error("Block not found");

        // Verify ownership
        const supplier = await ctx.db.get(block.supplierId);
        if (supplier.ownerId !== user._id) throw new Error("Unauthorized");

        await ctx.db.delete(args.blockId);
        return { success: true };
    },
});

// 3. Get Availability (Blocks + Bookings)
export const getSchedule = query({
    args: {
        supplierId: v.id("suppliers"),
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        // 1. Fetch Manual Blocks
        const blocks = await ctx.db
            .query("supplier_availability")
            .withIndex("by_supplier_date", (q) =>
                q.eq("supplierId", args.supplierId)
                    .gte("startDateTime", args.startDate)
            )
            .filter((q) => q.lte(q.field("startDateTime"), args.endDate))
            .collect();

        // 2. Fetch Confirmed/Pending Leads (Bookings)
        // We assume 'leads' table has eventDate.
        // Leads schema might just have `details.eventDate`.
        // We need to fetch leads for this supplier.
        const leads = await ctx.db
            .query("leads")
            .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
            .filter((q) =>
                q.neq(q.field("status"), "rejected") &&
                q.neq(q.field("status"), "cancelled")
            )
            .collect();

        // Filter leads by date range in memory (since date is likely in JSON details)
        const activeLeads = leads.filter(l => {
            const d = l.details?.eventDate;
            return d >= args.startDate && d <= args.endDate;
        });

        return {
            blocks: blocks,
            bookings: activeLeads.map(l => ({
                _id: l._id,
                startDateTime: l.details.eventDate,
                endDateTime: l.details.eventDate + (60 * 60 * 1000), // Assume 1 hour default if not specified
                title: l.details.message || "Booking",
                type: "booking"
            }))
        };
    },
});

// 4. Internal Collision Check (Used by Leads/Bookings)
export const checkCollision = internalQuery({
    args: {
        supplierId: v.id("suppliers"),
        startDateTime: v.number(),
        durationMinutes: v.optional(v.number()), // default 60
    },
    handler: async (ctx, args) => {
        const endDateTime = args.startDateTime + (args.durationMinutes || 60) * 60 * 1000;

        // Check Blocks
        const blocked = await ctx.db
            .query("supplier_availability")
            .withIndex("by_supplier_date", (q) =>
                q.eq("supplierId", args.supplierId)
                    .gte("startDateTime", args.startDateTime)
            )
            .filter((q) => q.lt(q.field("startDateTime"), endDateTime))
            .first();

        if (blocked) return { collision: true, reason: "Blocked by supplier" };

        // Check Leads
        const leads = await ctx.db
            .query("leads")
            .withIndex("by_supplier", (q) => q.eq("supplierId", args.supplierId))
            .filter((q) =>
                q.neq(q.field("status"), "rejected") &&
                q.neq(q.field("status"), "cancelled")
            )
            .collect();

        const conflict = leads.find(l => {
            const start = l.details?.eventDate;
            const end = start + (60 * 60 * 1000); // 1 hr buffer
            return (args.startDateTime < end && endDateTime > start);
        });

        if (conflict) return { collision: true, reason: "Already booked" };

        return { collision: false };
    },
});
