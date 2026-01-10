import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
    try {
        const body = await request.json();
        console.log("Payment Init Received Body:", body);
        const { amount, eventId, userId, attendeeName, attendeeEmail, ticketQuantity, tickets, seatIds } = body;

        if (!amount || !eventId || !userId) {
            console.error("Payment Init Error: Missing required fields", { amount, eventId, userId });
            return NextResponse.json({ error: `Missing fields: ${!amount ? 'amount ' : ''}${!eventId ? 'eventId ' : ''}${!userId ? 'userId' : ''}` }, { status: 400 });
        }

        // Generate Transaction ID
        const tran_id = `TRAN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

        // Create Pending Record in Convex
        const { paymentId, regId } = await fetchMutation(api.sslcommerz.initPayment, {
            eventId,
            userId,
            amount: parseFloat(amount),
            tranId: tran_id,
            attendeeName: attendeeName || "Guest",
            attendeeEmail: attendeeEmail || "",
            ticketQuantity: ticketQuantity || 1,
            tickets: tickets || [],
            seatIds: seatIds || [], // Pass seatIds to Convex
        });

        // Construct Gateway URL (Detect host for tunnels)
        const host = request.headers.get("host");
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const baseUrl = `${protocol}://${host}`;
        const gatewayUrl = `${baseUrl}/payment/sslcommerz?amount=${amount}&eventId=${eventId}&userId=${userId}&tran_id=${tran_id}&regId=${regId}`;

        return NextResponse.json({
            status: "SUCCESS",
            gatewayPageURL: gatewayUrl,
            tran_id,
            paymentId
        });

    } catch (error) {
        console.error("Payment Init Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
