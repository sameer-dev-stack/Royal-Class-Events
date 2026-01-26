import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request) {
    const supabase = createSupabaseAdmin();
    try {
        const body = await request.json();
        const { amount, eventId, userId, attendeeName, attendeeEmail, ticketQuantity, tickets, seatIds } = body;

        if (!amount || !eventId || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Sniper Guard (Concurrency Check)
        if (seatIds && seatIds.length > 0) {
            const { data: existingRegs, error: fetchError } = await supabase
                .from('registrations')
                .select('ticket_details')
                .eq('event_id', eventId)
                .neq('status', 'cancelled');

            if (fetchError) throw fetchError;

            const takenSeats = existingRegs.flatMap(reg => reg.ticket_details?.selected_seat_ids || []);
            const conflicts = seatIds.filter(id => takenSeats.includes(id));

            if (conflicts.length > 0) {
                return NextResponse.json({ error: "One or more seats have just been sold." }, { status: 409 });
            }
        }

        // 2. Generate IDs
        const tran_id = `TRAN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
        const regNumber = `REG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // 3. Create Pending Registration Record
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert([{
                event_id: eventId,
                user_id: userId,
                status: 'pending',
                ticket_details: {
                    attendee_name: attendeeName,
                    attendee_email: attendeeEmail,
                    ticket_quantity: ticketQuantity,
                    selected_seat_ids: seatIds || [],
                    tickets_meta: tickets
                }
            }])
            .select()
            .single();

        if (regError) throw regError;

        // 4. Create Pending Payment Record
        const { data: payment, error: payError } = await supabase
            .from('payments')
            .insert([{
                user_id: userId,
                event_id: eventId,
                registration_id: registration.id,
                amount: parseFloat(amount),
                status: 'pending',
                provider: 'sslcommerz',
                provider_txn_id: tran_id,
                order_details: {
                    reg_number: regNumber,
                    attendee_name: attendeeName
                }
            }])
            .select()
            .single();

        if (payError) throw payError;

        // 5. Build Gateway URL (Detect host)
        const host = request.headers.get("host");
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const baseUrl = `${protocol}://${host}`;
        const gatewayUrl = `${baseUrl}/payment/sslcommerz?amount=${amount}&eventId=${eventId}&userId=${userId}&tran_id=${tran_id}&regId=${registration.id}`;

        return NextResponse.json({
            status: "SUCCESS",
            gatewayPageURL: gatewayUrl,
            tran_id,
            paymentId: payment.id
        });

    } catch (error) {
        console.error("SSLCommerz Init Path Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
