import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
    const signature = req.headers.get("x-switchboard-signature");
    const bodyText = await req.text();
    const secret = process.env.SWITCHBOARD_S2S_JWT_SECRET;

    // 1. Verify HMAC signature
    if (secret) {
        const hmac = crypto.createHmac("sha256", secret);
        const digest = hmac.update(bodyText).digest("hex");
        if (digest !== signature) {
            console.error("Webhook signature mismatch");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    }

    const payload = JSON.parse(bodyText);
    const { event_id, type, data } = payload;

    try {
        // 2. Idempotency Check (Convex)
        const isProcessed = await convex.query(api.payments.checkWebhookIdempotency, { eventId: event_id });
        if (isProcessed) {
            return NextResponse.json({ message: "Already processed" }, { status: 200 });
        }

        // 3. Process Event via Convex Internal Mutations
        const { payment_intent_id, transaction_id } = data;

        switch (type) {
            case "payment.success":
                await convex.mutation(api.payments.handlePaymentSuccess, {
                    paymentIntentId: payment_intent_id,
                    transactionId: transaction_id
                });
                break;
            case "payment.failed":
                await convex.mutation(api.payments.handlePaymentFailed, {
                    paymentIntentId: payment_intent_id
                });
                break;
            case "payment.refunded":
                await convex.mutation(api.payments.handlePaymentRefunded, {
                    paymentIntentId: payment_intent_id
                });
                break;
            default:
                console.log(`Unhandled webhook event type: ${type}`);
        }

        // 4. Persist ProcessedWebhook (Convex)
        await convex.mutation(api.payments.recordWebhook, {
            eventId: event_id,
            provider: "switchboard"
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
    }
}
