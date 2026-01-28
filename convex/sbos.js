"use action";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Configuration (Should be in env variables, hardcoded for stability as per instruction)
const SBOS_CONFIG = {
    url: process.env.SBOS_URL || "https://switchboardos.onrender.com",
    jwtSecret: process.env.S2S_JWT_SECRET || "sbos_rce_live_k_1a2b3c4d5e6f7g8h9i0j",
    merchantId: process.env.MERCHANT_ID || "rce-vert-88c9-4d2a-9f1b-33e4f5a6b7c8",
    successUrl: "https://royal-class-events.vercel.app/payment/success", // Update with real domain if needed
    failureUrl: "https://royal-class-events.vercel.app/payment/cancel",
};

/**
 * Initiate a payment session with Switchboard OS
 */
export const initiatePayment = action({
    args: {
        orderId: v.string(), // The local payment ID
        amount: v.number(),
        currency: v.string(),
        customerName: v.string(),
        customerPhone: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const payload = {
            merchant_id: SBOS_CONFIG.merchantId,
            order_id: args.orderId,
            amount: args.amount,
            currency: args.currency,
            customer_name: args.customerName,
            customer_phone: args.customerPhone || "0000000000", // Required by some gateways
            customer_email: args.customerEmail,
            success_url: SBOS_CONFIG.successUrl,
            failure_url: SBOS_CONFIG.failureUrl,
        };

        try {
            const response = await fetch(`${SBOS_CONFIG.url}/api/payments/initiate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Add Authorization if SBOS requires it (usually merchant_id in body is enough or basic auth)
                    // Prompt doesn't specify auth header for initiate, just body.
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SBOS Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // data should contain { gateway_redirect_url, payment_intent_id, ... }

            // Save the SBOS intent ID to the local record
            // We call a mutation to update the record
            await ctx.runMutation(api.payments.updatePaymentWithSBOS, {
                paymentId: args.orderId, // We assume orderId IS the ticket_payments._id or lookup key
                sbosPaymentIntentId: data.payment_intent_id,
                sbosStatus: "PENDING",
            });

            return {
                gatewayUrl: data.gateway_redirect_url,
                paymentIntentId: data.payment_intent_id,
            };

        } catch (error) {
            console.error("Failed to initiate payment:", error);
            throw new Error(`Payment Initiation Failed: ${error.message}`);
        }
    },
});

/**
 * Refund a payment via Switchboard OS
 */
export const refundPayment = action({
    args: {
        paymentIntentId: v.string(),
        amount: v.optional(v.number()), // Optional partial refund
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const payload = {
            merchant_id: SBOS_CONFIG.merchantId,
            payment_intent_id: args.paymentIntentId,
            amount: args.amount,
            reason: args.reason,
        };

        const response = await fetch(`${SBOS_CONFIG.url}/api/payments/refund`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Refund Failed: ${errorText}`);
        }

        return await response.json();
    }
});
