"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";

export function useEventDashboard(eventId) {
    const { supabase } = useSupabase();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!eventId) return;

        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Event Details
                const { data: event, error: eventError } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', eventId)
                    .single();

                if (eventError) throw eventError;

                // 2. Fetch Registration Stats
                const { data: regs, error: regError } = await supabase
                    .from('registrations')
                    .select('id, status, checked_in')
                    .eq('event_id', eventId);

                if (regError) throw regError;

                // 3. Compute Stats (Mirroring Convex Logic)
                const totalRegistrations = regs.filter(r => r.status === 'confirmed').length;
                const checkedInCount = regs.filter(r => r.checked_in).length;
                const pendingCount = totalRegistrations - checkedInCount;

                const now = new Date();
                const startDate = new Date(event.start_date);
                const endDate = new Date(event.end_date);

                const isEventToday = startDate.toDateString() === now.toDateString();
                const isEventPast = endDate < now;
                const hoursUntilEvent = Math.max(0, Math.floor((startDate - now) / (1000 * 60 * 60)));

                setData({
                    event: {
                        ...event,
                        status: { current: event.status } // Support original UI nesting
                    },
                    stats: {
                        totalRegistrations,
                        capacity: event.capacity || 0,
                        checkedInCount,
                        pendingCount,
                        totalRevenue: totalRegistrations * (event.ticket_price || 0),
                        checkInRate: totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0,
                        isEventToday,
                        isEventPast,
                        hoursUntilEvent
                    }
                });
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [eventId, supabase]);

    return { data, isLoading, error };
}
