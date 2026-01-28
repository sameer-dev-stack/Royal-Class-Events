import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { initiatePayment } from "./lib/switchboard";

export const initiateSbosPayment = action({
    args: {
        eventId: v.id("events"),
        seatIds: v.array(v.string()),
        amount: v.number(),
        token: v.optional(v.string()),
        guestName: v.string(),
        guestEmail: v.string(),
        guestPhone: v.string(),
        attendeeDetails: v.optional(v.array(v.object({ seatId: v.string(), name: v.string() }))),
        couponCode: v.optional(v.string()),
        success_url: v.string(),
        failure_url: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Create Pending Booking & Transaction via Mutation
        const bookingResult = await ctx.runMutation(api.registrations.bookSeats, {
            eventId: args.eventId,
            seatIds: args.seatIds,
            amount: args.amount,
            token: args.token,
            guestName: args.guestName,
            guestEmail: args.guestEmail,
            guestPhone: args.guestPhone,
            attendeeDetails: args.attendeeDetails || [],
            couponCode: args.couponCode,
        });

        if (!bookingResult.success) {
            throw new Error("Failed to create pending booking");
        }

        const { transactionId, bookingIds, amount: finalAmount } = bookingResult;

        try {
            // 2. Initiate Payment via Switchboard OS
            const sbosResult = await initiatePayment({
                amount: finalAmount || args.amount,
                currency: "BDT",
                order_id: transactionId, // Using transactionId as order_id for webhook matching
                success_url: args.success_url,
                failure_url: args.failure_url,
            });

            // 3. Update Transaction with SBOS Payment Intent ID
            await ctx.runMutation(api.registrations.updateTransactionIntent, {
                transactionId,
                sbosPaymentIntentId: sbosResult.payment_intent_id,
            });

            return {
                success: true,
                gateway_redirect_url: sbosResult.gateway_redirect_url,
                transactionId,
            };
        } catch (error) {
            console.error("Payment initiation failed:", error);

            // Optionally fail the booking immediately if initiation fails
            await ctx.runMutation(api.registrations.failBooking, {
                transactionId,
                reason: error.message || "Payment initiation failed",
            });

            throw error;
        }
    },
});
export const initiateOfferPayment = action({
    args: {
        leadId: v.id("leads"),
        messageId: v.id("messages"),
        amount: v.number(),
        token: v.optional(v.string()),
        success_url: v.string(),
        failure_url: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Process Pending Payment via Mutation
        const result = await ctx.runMutation(api.leads.processPayment, {
            leadId: args.leadId,
            messageId: args.messageId,
            amount: args.amount,
            token: args.token,
        });

        if (!result.success) throw new Error("Failed to initiate offer payment");

        const { transactionId } = result;

        try {
            // 2. Initiate Switchboard OS
            const sbosResult = await initiatePayment({
                amount: args.amount,
                currency: "BDT",
                order_id: transactionId,
                success_url: args.success_url,
                failure_url: args.failure_url,
            });

            // 3. Update Transaction with Intent
            await ctx.runMutation(api.registrations.updateTransactionIntent, {
                transactionId,
                sbosPaymentIntentId: sbosResult.payment_intent_id,
            });

            return {
                success: true,
                gateway_redirect_url: sbosResult.gateway_redirect_url,
                transactionId,
            };
        } catch (error) {
            console.error("Offer payment initiation failed:", error);
            throw error;
        }
    },
});

// Webhook handlers (Internal Mutations)
export const checkWebhookIdempotency = query({
    args: { eventId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("processed_webhooks")
            .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
            .unique();
        return !!existing;
    },
});

export const recordWebhook = mutation({
    args: { eventId: v.string(), provider: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.insert("processed_webhooks", {
            eventId: args.eventId,
            provider: args.provider,
            processedAt: Date.now(),
        });
    },
});

export const handlePaymentSuccess = mutation({
    args: {
        paymentIntentId: v.optional(v.string()),
        transactionId: v.string(),
    },
    handler: async (ctx, args) => {
        const tid = ctx.db.normalizeId("transactions", args.transactionId);
        if (!tid) throw new Error("Invalid transaction ID");

        const transaction = await ctx.db.get(tid);
        if (!transaction) throw new Error("Transaction record missing");

        if (transaction.type === "ticket_sale") {
            await ctx.runMutation(api.registrations.confirmBooking, {
                transactionId: tid,
                sbosPaymentIntentId: args.paymentIntentId || "N/A",
            });
        } else if (transaction.type === "escrow_in") {
            await ctx.runMutation(api.leads.confirmOfferPayment, {
                transactionId: tid,
                sbosPaymentIntentId: args.paymentIntentId || "N/A",
            });
        }
    },
});

export const handlePaymentFailed = mutation({
    args: {
        paymentIntentId: v.optional(v.string()),
        transactionId: v.optional(v.string()), // If available
    },
    handler: async (ctx, args) => {
        // If we have transactionId, we can fail it
        if (args.transactionId) {
            const tid = ctx.db.normalizeId("transactions", args.transactionId);
            if (tid) {
                await ctx.runMutation(api.registrations.failBooking, {
                    transactionId: tid,
                    reason: "Payment failed at Switchboard OS",
                });
            }
        } else if (args.paymentIntentId) {
            // Fallback: search by intent id
            const transaction = await ctx.db
                .query("transactions")
                .filter(q => q.eq(q.field("sbos_payment_intent_id"), args.paymentIntentId))
                .first();

            if (transaction) {
                const failReason = "Payment failed at Switchboard OS";
                if (transaction.type === "ticket_sale") {
                    await ctx.runMutation(api.registrations.failBooking, {
                        transactionId: transaction._id,
                        reason: failReason,
                    });
                } else if (transaction.type === "escrow_in") {
                    await ctx.runMutation(api.leads.failOfferPayment, {
                        transactionId: transaction._id,
                        reason: failReason,
                    });
                }
            }
        }
    },
});
// Mock handler for testing
export const mockConfirmLatestPayment = mutation({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser, { token: args.token });
        if (!user) throw new Error("Not logged in");

        // Find the latest pending transaction for this user
        const latestPending = await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("desc")
            .first();

        if (!latestPending) {
            return { success: false, message: "No pending transaction found to mock confirm." };
        }

        // Confirm it
        if (latestPending.type === "ticket_sale") {
            await ctx.runMutation(api.registrations.confirmBooking, {
                transactionId: latestPending._id,
                sbosPaymentIntentId: "MOCK_PAYMENT_" + Date.now(),
            });
        }

        return { success: true, transactionId: latestPending._id };
    },
});
