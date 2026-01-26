"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";

export function useEventAnalytics(eventId) {
    const { supabase } = useSupabase();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!eventId) return;

        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Event for Views & Capacity
                const { data: event, error: eventError } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', eventId)
                    .single();

                if (eventError) throw eventError;

                // 2. Fetch All Registrations for Revenue
                const { data: registrations, error: regError } = await supabase
                    .from('registrations')
                    .select('ticket_details')
                    .eq('event_id', eventId)
                    .eq('status', 'confirmed');

                if (regError) throw regError;

                // 3. Fetch Historical Snapshots
                const { data: snapshots, error: snapError } = await supabase
                    .from('event_analytics')
                    .select('*')
                    .eq('event_id', eventId)
                    .order('date', { ascending: true });

                if (snapError) throw snapError;

                // 4. Fetch Price History
                const { data: priceHistory, error: priceError } = await supabase
                    .from('price_history')
                    .select('*')
                    .eq('event_id', eventId)
                    .order('created_at', { ascending: false });

                if (priceError) throw priceError;

                // Calculate Totals
                const totalRevenue = registrations.reduce((sum, reg) => {
                    const price = reg.ticket_details?.price || 0;
                    return sum + price;
                }, 0);

                // Calculate Growth (vs last week snapshot if available)
                const lastWeekIndex = snapshots.length > 7 ? snapshots.length - 8 : 0;
                const lastWeekRevenue = snapshots[lastWeekIndex]?.revenue || 0;
                const revenueGrowth = lastWeekRevenue > 0
                    ? ((totalRevenue - lastWeekRevenue) / lastWeekRevenue * 100).toFixed(1)
                    : 0;

                setData({
                    totalRevenue,
                    revenueGrowth,
                    totalViews: event.views || 0,
                    totalRegistrations: registrations.length,
                    snapshots,
                    priceHistory: priceHistory.map(ph => ({
                        ...ph,
                        timestamp: ph.created_at
                    })),
                    event: {
                        ...event,
                        capacity: event.capacity || 0
                    }
                });
            } catch (err) {
                console.error("Analytics Fetch Error:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [eventId, supabase]);

    return { data, isLoading, error };
}
