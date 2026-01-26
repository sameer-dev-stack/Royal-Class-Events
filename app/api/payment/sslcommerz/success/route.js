import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request) {
    const supabase = createSupabaseAdmin();
    try {
        const body = await request.json();
        const { tran_id, val_id, status } = body;

        if (status !== "SUCCESS") {
            return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
        }

        // 1. Fetch Payment Record
        const { data: payment, error: payFetchError } = await supabase
            .from('payments')
            .select('*, events(*)')
            .eq('provider_txn_id', tran_id)
            .single();

        if (payFetchError || !payment) {
            throw new Error("Payment record not found");
        }

        if (payment.status === "successful") {
            return NextResponse.json({ success: true, message: "Already processed" });
        }

        // 2. Atomic Updates
        // Update Payment status
        await supabase
            .from('payments')
            .update({
                status: 'successful',
                order_details: { ...payment.order_details, val_id }
            })
            .eq('id', payment.id);

        // Update Registration status
        const ticketId = `TKT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        await supabase
            .from('registrations')
            .update({
                status: 'confirmed',
                ticket_details: {
                    ...payment.registrations?.ticket_details,
                    qr_code: ticketId,
                    confirmed_at: new Date().toISOString()
                }
            })
            .eq('id', payment.registration_id);

        // Update Event Analytics
        const event = payment.events;
        if (event) {
            const currentAnalytics = event.analytics || { registrations: 0, revenue: 0 };
            await supabase
                .from('events')
                .update({
                    analytics: {
                        ...currentAnalytics,
                        registrations: (currentAnalytics.registrations || 0) + 1,
                        revenue: (currentAnalytics.revenue || 0) + payment.amount
                    }
                })
                .eq('id', event.id);
        }

        // 3. Trigger Email Notification (Asynchronous)
        // Note: In production, this would be a Database Webhook. 
        // We trigger it here for immediate feedback during migration testing.
        try {
            const protocol = request.headers.get("x-forwarded-proto") || "http";
            const host = request.headers.get("host");
            const baseUrl = `${protocol}://${host}`;

            fetch(`${baseUrl}/api/functions/resend-notification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'TICKET_CONFIRMATION',
                    payload: {
                        attendee_email: payment.registrations?.ticket_details?.attendee_email || payment.profiles?.email,
                        attendee_name: payment.registrations?.ticket_details?.attendee_name || payment.profiles?.full_name,
                        event_title: event?.title,
                        ticket_id: ticketId,
                        quantity: payment.registrations?.ticket_details?.ticket_quantity || 1,
                        amount: payment.amount,
                        currency: 'BDT'
                    }
                })
            }).catch(err => console.error("Email trigger failed:", err));
        } catch (e) {
            console.error("Notification bridge error:", e);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("SSLCommerz Success Path Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
