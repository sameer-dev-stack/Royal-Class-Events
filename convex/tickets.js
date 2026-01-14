import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const getTicketTiers = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const tiers = await ctx.db
            .query("ticketTiers")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .collect();

        // Map to frontend-friendly format if needed, but for now just returning raw data.
        // The SeatSelectionModal expects: id (or _id), name, price, limit (capacity), sold, quantity (from state).

        // Schema check:
        // pricing is v.any(). We need to ensure we return a 'price' field for the frontend.
        // inventory is v.any(). We need to ensure we return 'limit' and 'sold'.

        return tiers.map(tier => {
            // Fallbacks for extracting simple values from complex objects (if they exist)
            const price = tier.price || tier.pricing?.basePrice || 0;
            const limit = tier.capacity || tier.inventory?.totalQuantity || 100;
            const sold = tier.sold || tier.inventory?.soldQuantity || 0;

            return {
                ...tier,
                price,
                limit,
                sold
            };
        });
    },
});

export const getSoldSeats = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const registrations = await ctx.db
            .query("registrations")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .filter((q) => q.neq(q.field("status.current"), "cancelled"))
            .collect();

        const allSoldSeats = [];
        for (const reg of registrations) {
            // Assume seat IDs are stored in metadata.selectedSeatIds or similar, 
            // OR we check the cart items if they are structured.
            // For now, let's check metadata.selectedSeatIds as a convention for reserved seating.
            if (reg.metadata?.selectedSeatIds) {
                allSoldSeats.push(...reg.metadata.selectedSeatIds);
            }

            // Also check if they are in the 'tickets' or 'items' structure if applicable
            // (Based on my proposed checkout logic)
        }

        return [...new Set(allSoldSeats)]; // Unique IDs
    },
});
export const validateEntry = mutation({
    args: {
        ticketId: v.string(),
        eventId: v.id("events"),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // 1. Resolve User & Permissions
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Unauthorized: Please login.");

        const event = await ctx.db.get(args.eventId);
        if (!event) throw new Error("Event not found.");

        // Security: Only Owner or Admin can scan
        const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin");
        const isOwner = event.ownerId === user._id;

        if (!isAdmin && !isOwner) {
            throw new Error("Unauthorized: You do not own this event.");
        }

        // 2. Resolve Registration by Ticket ID (Registration Number)
        const registration = await ctx.db
            .query("registrations")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .filter((q) => q.eq(q.field("registrationNumber"), args.ticketId))
            .first();

        if (!registration) {
            throw new Error("Invalid Ticket: No matching registration found for this event.");
        }

        // 3. Check for Duplicate Entry
        if (registration.checkIn?.status === "checked_in") {
            const entryTime = new Date(registration.checkIn.checkInTime).toLocaleTimeString();
            throw new Error(`Already Used: This ticket was swiped at ${entryTime}.`);
        }

        // 4. Atomic Update: Mark as Checked In
        const now = Date.now();
        await ctx.db.patch(registration._id, {
            checkIn: {
                ...registration.checkIn,
                status: "checked_in",
                checkInTime: now,
                checkedInBy: user._id,
                checkInMethod: "qr_scanner"
            },
            status: {
                ...registration.status,
                current: "checked_in",
                history: [
                    ...(registration.status?.history || []),
                    { status: "checked_in", changedAt: now, changedBy: user._id }
                ],
                lastUpdated: now
            }
        });

        // 5. Return Success Info
        return {
            success: true,
            attendee: registration.attendeeInfo?.primary?.verifiedName || "Guest",
            seat: registration.metadata?.seatLabel || registration.metadata?.selectedSeatIds?.[0] || "General",
            entryTime: now
        };
    },
});
