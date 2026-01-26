"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";

export function useEventRegistrations(eventId) {
    const { supabase } = useSupabase();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!eventId) return;

        const fetchRegistrations = async () => {
            setIsLoading(true);
            try {
                const { data: regs, error: regError } = await supabase
                    .from('registrations')
                    .select(`
                        id,
                        status,
                        checked_in,
                        checked_in_at,
                        qr_code,
                        created_at,
                        user_id,
                        profiles!inner(full_name, email)
                    `)
                    .eq('event_id', eventId);

                if (regError) throw regError;

                // Format to match original UI expectations
                const formatted = regs.map(r => ({
                    _id: r.id,
                    status: r.status,
                    checkedIn: r.checked_in,
                    checkedInAt: r.checked_in_at,
                    qrCode: r.qr_code,
                    registeredAt: r.created_at,
                    attendeeName: r.profiles.full_name,
                    attendeeEmail: r.profiles.email
                }));

                setData(formatted);
            } catch (err) {
                console.error("Registrations Fetch Error:", err);
                if (err.details) console.error("Reg Error Details:", err.details);
                if (err.hint) console.error("Reg Error Hint:", err.hint);
                if (err.code) console.error("Reg Error Code:", err.code);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistrations();
    }, [eventId, supabase]);

    return { data, isLoading, error };
}
