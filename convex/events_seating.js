
export const updateSeatingMode = mutation({
    args: {
        eventId: v.id("events"),
        seatingMode: v.union(
            v.literal("GENERAL_ADMISSION"),
            v.literal("RESERVED_SEATING"),
            v.literal("HYBRID")
        )
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        const event = await ctx.db.get(args.eventId);

        if (!event) throw new Error("Event not found");

        // Authorization check
        // Note: We're doing a basic check here. In production, use robust permission logic.
        if (event.organizerId !== user._id) {
            // Allow admins or authorized users
            const hasAdminRole = user.roles?.some(r => r.key === "admin");
            if (!hasAdminRole) throw new Error("Unauthorized to update event seating mode");
        }

        const updates = {
            seatingMode: args.seatingMode,
            updatedAt: Date.now()
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
        layoutData: v.any() // Storing the full toolkit JSON
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        const event = await ctx.db.get(args.eventId);

        if (!event) throw new Error("Event not found");

        // Authorization check
        if (event.organizerId !== user._id) {
            const hasAdminRole = user.roles?.some(r => r.key === "admin");
            if (!hasAdminRole) throw new Error("Unauthorized");
        }

        // Ensure we are in a mode that supports layout
        if (event.seatingMode === "GENERAL_ADMISSION") {
            throw new Error("Cannot save layout for General Admission event");
        }

        await ctx.db.patch(args.eventId, {
            venueLayout: args.layoutData,
            updatedAt: Date.now()
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
