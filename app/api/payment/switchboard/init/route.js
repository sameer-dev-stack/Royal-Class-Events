import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { paymentService } from "@/lib/payments/PaymentService";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, eventId, userId, guestName, guestEmail, guestPhone, attendeeDetails, couponCode, seatIds, token } = body;

        if (!amount || !eventId || !seatIds) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Use the unified initiateSbosPayment action that handles booking + gateway initiation
        const sbosResult = await convex.action(api.payments.initiateSbosPayment, {
            eventId,
            seatIds,
            amount,
            token,
            guestName: guestName || "Guest",
            guestEmail: guestEmail || "guest@example.com",
            guestPhone: guestPhone || "0000000000",
            attendeeDetails: attendeeDetails || [],
            couponCode: couponCode,
            success_url: `${request.nextUrl.origin}/my-tickets?payment=success`,
            failure_url: `${request.nextUrl.origin}/explore?payment=failed`
        });

        return NextResponse.json({
            status: "SUCCESS",
            gatewayPageURL: sbosResult.gateway_redirect_url,
            transactionId: sbosResult.transactionId
        });

    } catch (error) {
        console.error("SBOS Initiation Route Error:", error);
        return NextResponse.json({ error: error.message || "Failed to initialize payment" }, { status: 500 });
    }
}
