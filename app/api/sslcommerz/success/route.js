import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// SSL Commerz redirects/POSTs here after success
export async function GET(request) {
    return handleSuccess(request);
}

export async function POST(request) {
    return handleSuccess(request);
}

async function handleSuccess(request) {
    const searchParams = request.nextUrl.searchParams;
    const tran_id = searchParams.get("tran_id");
    const val_id = searchParams.get("val_id");

    // In a generic GET/POST handler, params might come from body in POST, but our Mock Gateway uses GET params for simplicity.
    // Real SSL Commerz sends POST data. 
    // For this Mock, we rely on the query params we set in the Mock Page redirect.

    if (!tran_id || !val_id) {
        return NextResponse.json({ error: "Invalid Callback" }, { status: 400 });
    }

    try {
        // Validate and Update in Convex
        await fetchMutation(api.sslcommerz.validatePayment, {
            tranId: tran_id,
            valId: val_id,
            status: "VALID",
        });

        // Redirect to "My Events" or a "Thank You" page
        // We'll redirect to /my-events for now (showing the ticket)
        const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
        return NextResponse.redirect(`${baseUrl}/my-events?payment=success`);

    } catch (error) {
        console.error("Payment Success Error:", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/payment/fail`);
    }
}
