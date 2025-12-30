import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(request) {
    return handleSuccess(request, true);
}

export async function POST(request) {
    return handleSuccess(request, false);
}

async function handleSuccess(request, isGet) {
    let tran_id, val_id, status;

    try {
        if (isGet) {
            const searchParams = request.nextUrl.searchParams;
            tran_id = searchParams.get("tran_id");
            val_id = searchParams.get("val_id");
            status = "SUCCESS";
        } else {
            const body = await request.json();
            tran_id = body.tran_id;
            val_id = body.val_id;
            status = body.status || "SUCCESS";
        }

        if (!tran_id) {
            return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
        }

        // Validate and Update in Convex
        await fetchMutation(api.sslcommerz.validatePayment, {
            tranId: tran_id,
            valId: val_id || `MOCK_VAL_${Date.now()}`,
            status: status === "SUCCESS" ? "SUCCESS" : "FAILED",
        });

        // If it's a direct browser access (GET), redirect. 
        // If it's a fetch call (POST), return JSON.
        if (isGet) {
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
            return NextResponse.redirect(`${baseUrl}/order-confirmation?orderId=${tran_id}&status=success`);
        }

        return NextResponse.json({ status: "SUCCESS" });

    } catch (error) {
        console.error("Payment Callback Error:", error);
        if (isGet) {
            const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
            return NextResponse.redirect(`${baseUrl}/payment/fail`);
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
