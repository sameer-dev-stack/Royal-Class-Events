import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request) {
    const supabase = createSupabaseAdmin();
    try {
        const body = await request.json();
        const { tran_id } = body;

        const { data: payment, error: payFetchError } = await supabase
            .from('payments')
            .select('*')
            .eq('provider_txn_id', tran_id)
            .single();

        if (payFetchError || !payment) {
            throw new Error("Payment record not found");
        }

        await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
        await supabase.from('registrations').update({ status: 'cancelled' }).eq('id', payment.registration_id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("SSLCommerz Fail Path Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
