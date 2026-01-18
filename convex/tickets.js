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
        eventId: v.optional(v.id("events")),
        token: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // 1. Resolve User & Permissions
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Unauthorized: Please login.");

        console.log("Validating ticketId:", args.ticketId);

        // 2. Resolve Registration by Ticket ID using the index
        let ticket = await ctx.db
            .query("registrations")
            .withIndex("by_reg_number", (q) => q.eq("registrationNumber", args.ticketId))
            .first();

        // Fallback: Case-insensitive match check (Normalized to upper case as per generator)
        if (!ticket) {
            ticket = await ctx.db
                .query("registrations")
                .withIndex("by_reg_number", (q) => q.eq("registrationNumber", args.ticketId.toUpperCase()))
                .first();
        }

        console.log("Found ticket:", ticket);

        if (!ticket) {
            throw new Error("Invalid Ticket: No matching registration found.");
        }

        // 3. Permission Check: Only Owner or Admin can scan
        const event = await ctx.db.get(ticket.eventId);
        if (!event) throw new Error("Event data for this ticket not found.");

        const isAdmin = user.role === "admin" || user.roles?.some(r => r.key === "admin");
        const isOwner = event.ownerId === user._id;

        if (!isAdmin && !isOwner) {
            throw new Error("Unauthorized: You do not own this event.");
        }

        // 4. --- SMART CHECK (Idempotency) ---
        const now = Date.now();
        const isAlreadyCheckedIn =
            ticket.checkIn?.status === "checked_in" ||
            ticket.status?.current === "checked_in";

        const lastCheckInTime = ticket.checkIn?.checkInTime || ticket.status?.lastUpdated;

        if (isAlreadyCheckedIn) {
            // Grace Period: If scanned within the last 60 seconds, allow it as a success
            if (lastCheckInTime && (now - lastCheckInTime < 60000)) {
                return {
                    success: true,
                    valid: true,
                    attendee: ticket.attendeeInfo?.primary?.verifiedName || "Guest",
                    seat: "Double Scan (Allowed)",
                    entryTime: lastCheckInTime,
                    isDoubleScan: true
                };
            }
            const timeStr = lastCheckInTime ? new Date(lastCheckInTime).toLocaleTimeString() : "an earlier time";
            throw new Error(`Already Used: This ticket was swiped at ${timeStr}.`);
        }

        // 5. Atomic Update: Mark as Checked In
        await ctx.db.patch(ticket._id, {
            checkIn: {
                ...ticket.checkIn,
                status: "checked_in",
                checkInTime: now,
                checkedInBy: user._id,
                checkInMethod: "qr_scanner"
            },
            status: {
                ...ticket.status,
                current: "checked_in",
                history: [
                    ...(ticket.status?.history || []),
                    { status: "checked_in", changedAt: now, changedBy: user._id }
                ],
                lastUpdated: now
            }
        });

        // 6. Return Success Info
        return {
            success: true,
            valid: true,
            attendee: ticket.attendeeInfo?.primary?.verifiedName || "Welcome!",
            seat: ticket.metadata?.seatLabel || ticket.metadata?.selectedSeatIds?.[0] || "Verified",
            entryTime: now
        };
    },
});

export const getMyTickets = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) return [];

        const registrations = await ctx.db
            .query("registrations")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        const results = [];
        for (const reg of registrations) {
            const event = await ctx.db.get(reg.eventId);
            results.push({
                ...reg,
                event
            });
        }

        return results;
    },
});
