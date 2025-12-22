import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, eventId, userId } = body;

        if (!amount || !eventId || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Generate Transaction ID
        const tran_id = `TRAN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

        // Create Pending Record in Convex
        // We use fetchMutation to call Convex from the server side
        const paymentId = await fetchMutation(api.sslcommerz.initPayment, {
            eventId,
            userId,
            amount,
            tranId: tran_id,
        });

        // Construct Mock Gateway URL
        // In production, this would be the SSL Commerz Sandbox/Live URL with form data
        const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
        const gatewayUrl = `${baseUrl}/payment/mock?tran_id=${tran_id}&amount=${amount}&store_id=royal_class_events`;

        return NextResponse.json({
            status: "SUCCESS",
            gatewayPageURL: gatewayUrl, // This matches SSL Commerz API response structure logic
            tran_id
        });

    } catch (error) {
        console.error("Payment Init Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
