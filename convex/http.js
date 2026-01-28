import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Configuration
const JWT_SECRET = process.env.SBOS_WEBHOOK_SECRET || "sbos_rce_live_k_1a2b3c4d5e6f7g8h9i0j";

// Helper to verify HMAC-SHA256 signature
async function verifySignature(bodyText, signature, secret) {
    if (!signature) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const hmacBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
    const hmacHex = Array.from(new Uint8Array(hmacBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return hmacHex === signature;
}

http.route({
    path: "/switchboard-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const bodyText = await request.text();
            const signature = request.headers.get("x-sbos-signature");

            // 1. Verify Signature
            const isValid = await verifySignature(bodyText, signature, JWT_SECRET);
            if (!isValid) {
                console.error("Invalid webhook signature rejected.");
                return new Response("Unauthorized", { status: 401 });
            }

            const event = JSON.parse(bodyText);
            const { type, data } = event;

            // Idempotency check
            if (event.id) {
                const isProcessed = await ctx.runQuery(internal.payments.checkWebhookIdempotency, { eventId: event.id });
                if (isProcessed) return new Response("Already Processed", { status: 200 });
            }

            // 2. Handle Events
            switch (type) {
                case "payment.success":
                    await ctx.runMutation(internal.payments.handlePaymentSuccess, {
                        paymentIntentId: data.payment_intent_id,
                        transactionId: data.order_id || data.transaction_id,
                    });
                    break;
                case "payment.failed":
                    await ctx.runMutation(internal.payments.handlePaymentFailed, {
                        paymentIntentId: data.payment_intent_id,
                        transactionId: data.order_id || data.transaction_id,
                    });
                    break;
            }

            // Record processed
            if (event.id) {
                await ctx.runMutation(internal.payments.recordWebhook, { eventId: event.id, provider: "switchboard" });
            }

            return new Response("OK", { status: 200 });

        } catch (err) {
            console.error("Webhook Error:", err);
            return new Response("Webhook Error", { status: 400 });
        }
    }),
});

export default http;
