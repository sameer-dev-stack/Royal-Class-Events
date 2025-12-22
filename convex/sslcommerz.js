import { internal } from "./_generated/api";
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// 1. Initialize Payment (Create Pending Record)
export const initPayment = mutation({
    args: {
        eventId: v.id("events"),
        userId: v.id("users"),
        amount: v.number(),
        tranId: v.string(), // We generate this in the API route
    },
    handler: async (ctx, args) => {
        // Check if event exists
        const event = await ctx.db.get(args.eventId);
        if (!event) throw new Error("Event not found");

        const user = await ctx.db.get(args.userId);

        // 1. Create Pending Registration FIRST
        const regId = await ctx.db.insert("registrations", {
            eventId: args.eventId,
            userId: args.userId,
            attendeeName: user?.name || "Attendee",
            attendeeEmail: user?.email || "",
            qrCode: `pending-${args.tranId}`,
            checkedIn: false,
            status: "cancelled", // Pending payment = cancelled/unconfirmed
            registeredAt: Date.now(),
        });

        // 2. Create Payment Record linked to Registration
        const paymentId = await ctx.db.insert("payments", {
            eventId: args.eventId,
            organizerId: event.organizerId,
            amount: args.amount,
            sslTranId: args.tranId,
            status: "pending",
            gatewayStatus: "PENDING",
            registrationId: regId, // VALID ID NOW
            createdAt: Date.now(),
        });

        return paymentId;
    },
});


// 2. Validate Payment (Update Record)
export const validatePayment = mutation({
    args: {
        tranId: v.string(),
        valId: v.string(),
        status: v.string(), // VALID, FAILED
    },
    handler: async (ctx, args) => {
        const payment = await ctx.db
            .query("payments")
            .withIndex("by_tran_id", (q) => q.eq("sslTranId", args.tranId))
            .unique();

        if (!payment) throw new Error("Payment record not found");

        if (payment.status === "completed") return { success: true, alreadyProcessing: true };

        const newStatus = args.status === "VALID" ? "completed" : "failed";

        await ctx.db.patch(payment._id, {
            status: newStatus,
            gatewayStatus: args.status,
            sslValId: args.valId,
        });

        // If success, Confirm Registration
        if (newStatus === "completed") {
            await ctx.db.patch(payment.registrationId, {
                status: "confirmed",
                // Generate a real QR code or just keep the pending one?
                // Real one:
                qrCode: `ticket-${payment._id}-${Date.now()}`
            });

            // Increment Event Registration Count
            const event = await ctx.db.get(payment.eventId);
            if (event) {
                await ctx.db.patch(event._id, {
                    registrationCount: (event.registrationCount || 0) + 1,
                    // Add revenue tracking if you want
                });
            }
        }

        return { success: true };
    },
});
