import { internal } from "./_generated/api";
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// 1. Initialize Payment (Create Pending Record)
// export const initPayment = mutation({
// ... (Disabled for Switchboard OS Integration)
// });


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
