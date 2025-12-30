import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(request) {
    return handleCancel(request);
}

export async function POST(request) {
    return handleCancel(request);
}

async function handleCancel(request) {
    const searchParams = request.nextUrl.searchParams;
    const tran_id = searchParams.get("tran_id");

    if (tran_id) {
        try {
            await fetchMutation(api.sslcommerz.validatePayment, {
                tranId: tran_id,
                valId: "",
                status: "CANCELLED",
            });
        } catch (e) { console.error(e); }
    }

    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/events?payment=cancelled`);
}
