import { internal } from "./_generated/api";
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// 1. Initialize Payment (Create Pending Record)
export const initPayment = mutation({
    args: {
        eventId: v.id("events"),
        userId: v.id("users"),
        amount: v.number(),
        tranId: v.string(),
        attendeeName: v.string(),
        attendeeEmail: v.string(),
        ticketQuantity: v.number(),
        tickets: v.optional(v.any()),
        seatIds: v.optional(v.array(v.string())), // Added seatIds
    },
    handler: async (ctx, args) => {
        // 🛡️ Sniper Check: Concurrency Guard
        if (args.seatIds && args.seatIds.length > 0) {
            const existingRegistrations = await ctx.db
                .query("registrations")
                .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
                .filter((q) => q.neq(q.field("status.current"), "cancelled"))
                .collect();

            const allSoldSeats = existingRegistrations.flatMap(reg => reg.metadata?.selectedSeatIds || []);
            const takenSeats = args.seatIds.filter(id => allSoldSeats.includes(id));

            if (takenSeats.length > 0) {
                throw new Error("One or more selected seats have just been sold.");
            }
        }

        // Check if event exists
        const event = await ctx.db.get(args.eventId);
        if (!event) throw new Error("Event not found");

        const user = await ctx.db.get(args.userId);

        // Calculate registration number
        const regNumber = `REG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // 1. Create Pending Registration
        const regId = await ctx.db.insert("registrations", {
            tenantId: event.tenantId,
            eventId: args.eventId,
            userId: args.userId,
            externalId: args.tranId,
            registrationNumber: regNumber,
            ticketQuantity: args.ticketQuantity,
            unitPrice: args.amount / args.ticketQuantity,
            status: { current: "pending" },
            attendeeInfo: {
                fullName: args.attendeeName,
                email: args.attendeeEmail,
            },
            metadata: {
                qrCode: `pending-${args.tranId}`,
                isSSLCommerz: true,
                tickets: args.tickets,
                selectedSeatIds: args.seatIds || [], // Save precise IDs
            },
            audit: {
                createdAt: Date.now(),
                version: 1,
                createdBy: args.userId
            }
        });

        // 2. Create Payment Record linked to Registration
        const paymentNumber = `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const paymentId = await ctx.db.insert("payments", {
            tenantId: event.tenantId,
            registrationId: regId,
            externalId: args.tranId,
            paymentNumber: paymentNumber,
            amount: {
                total: args.amount,
                currency: "BDT"
            },
            method: {
                type: "sslcommerz"
            },
            status: {
                current: "pending"
            },
            metadata: {
                sslTranId: args.tranId,
                eventId: args.eventId
            },
            audit: {
                createdAt: Date.now(),
                version: 1,
                createdBy: args.userId
            }
        });

        return { paymentId, regId };
    },
});


// 2. Validate Payment (Update Record)
export const validatePayment = mutation({
    args: {
        tranId: v.string(),
        valId: v.string(),
        status: v.string(), // SUCCESS, FAILED, CANCELLED
    },
    handler: async (ctx, args) => {
        const payment = await ctx.db
            .query("payments")
            .withIndex("by_external_id", (q) => q.eq("externalId", args.tranId))
            .unique();

        if (!payment) throw new Error("Payment record not found");

        if (payment.status?.current === "completed") return { success: true, alreadyProcessing: true };

        const newStatus = args.status === "SUCCESS" ? "completed" : "failed";

        // Update Payment Status
        await ctx.db.patch(payment._id, {
            status: {
                current: newStatus,
                updatedAt: Date.now()
            },
            processor: {
                transactionId: args.tranId,
                valId: args.valId,
                status: args.status
            }
        });

        // If success, Confirm Registration
        if (newStatus === "completed") {
            const registration = await ctx.db.get(payment.registrationId);
            const ticketId = `TKT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

            // 🛡️ Pattern: MERGE metadata, don't replace
            const existingMeta = registration.metadata || {};

            await ctx.db.patch(payment.registrationId, {
                status: {
                    current: "confirmed",
                    updatedAt: Date.now()
                },
                metadata: {
                    ...existingMeta,
                    qrCode: ticketId,
                    confirmedAt: Date.now()
                }
            });

            // Increment Event analytics
            const event = await ctx.db.get(payment.metadata.eventId);
            if (event && event.analytics) {
                await ctx.db.patch(event._id, {
                    analytics: {
                        ...event.analytics,
                        registrations: (event.analytics.registrations || 0) + 1,
                        revenue: (event.analytics.revenue || 0) + payment.amount.total
                    }
                });
            }
        } else {
            if (payment.registrationId) {
                await ctx.db.patch(payment.registrationId, {
                    status: {
                        current: "cancelled",
                        updatedAt: Date.now()
                    }
                });
            }
        }

        return { success: true };
    },
});

export const getPaymentByTranId = query({
    args: { tranId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("payments")
            .withIndex("by_external_id", (q) => q.eq("externalId", args.tranId))
            .unique();
    }
});
