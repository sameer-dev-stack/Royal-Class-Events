// Synced at: 2026-01-01T11:10:00+06:00
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const updateSeatingMode = mutation({
    args: {
        eventId: v.id("events"),
        seatingMode: v.union(
            v.literal("GENERAL_ADMISSION"),
            v.literal("RESERVED_SEATING"),
            v.literal("HYBRID"),
            v.literal("GENERAL"),
            v.literal("RESERVED")
        ),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        const event = await ctx.db.get(args.eventId);

        if (!event) throw new Error("Event not found");

        // Authorization check
        // Note: We're doing a basic check here. In production, use robust permission logic.
        if (event.ownerId !== user._id) {
            // Allow admins or authorized users
            const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin" || r.permissions.includes("*"));
            if (!isAdmin) throw new Error("Unauthorized to update event seating mode");
        }

        const updates = {
            seatingMode: args.seatingMode,
            audit: {
                ...event.audit,
                updatedAt: Date.now()
            },
            updatedAt: undefined // 🛡️ Schema Guard: Delete legacy top-level field
        };

        // If switching to GENERAL_ADMISSION, clear venue layout to free up space/confusion
        if (args.seatingMode === "GENERAL_ADMISSION") {
            updates.venueLayout = undefined;
        } else if (!event.venueLayout && (args.seatingMode === "RESERVED_SEATING" || args.seatingMode === "HYBRID")) {
            // Initialize empty layout structure if enabling reserved seating
            updates.venueLayout = {
                sections: []
            };
        }

        await ctx.db.patch(args.eventId, updates);
        return { success: true };
    }
});

export const saveVenueLayout = mutation({
    args: {
        eventId: v.id("events"),
        layout: v.any(),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        const event = await ctx.db.get(args.eventId);

        if (!event) throw new Error("Event not found");

        // Authorization check
        if (event.ownerId !== user._id) {
            const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin" || r.permissions.includes("*"));
            if (!isAdmin) throw new Error("Unauthorized");
        }

        // Ensure we are in a mode that supports layout
        if (event.seatingMode === "GENERAL_ADMISSION") {
            throw new Error("Cannot save layout for General Admission event");
        }

        await ctx.db.patch(args.eventId, {
            venueLayout: args.layout,
            audit: {
                ...event.audit,
                updatedAt: Date.now()
            },
            updatedAt: undefined // 🛡️ Schema Guard: Delete legacy top-level field
        });

        return { success: true };
    }
});

export const getVenueLayout = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);
        return event?.venueLayout || null;
    }
});
