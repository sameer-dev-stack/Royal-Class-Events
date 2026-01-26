import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types for the Royal Seat Engine payload
type SeatEngineDetails = {
    venue_layout: any; // The Konva Node Tree
    seat_map_config: any;
};

/**
 * useEventSubscription
 * 
 * specialized hook for the Royal Seat Engine.
 * Replaces Convex's useSubscription for real-time CAD updates.
 * 
 * @param eventId - The ID of the event to listen to.
 * @param initialData - Optimistic initial data to show before sync.
 */
export function useEventSubscription(eventId: string, initialData?: SeatEngineDetails) {
    const [data, setData] = useState<SeatEngineDetails | null>(initialData || null);
    const [isConnected, setIsConnected] = useState(false);
    const supabase = createClient();
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!eventId) return;

        // 1. Setup the Channel
        // We listen specifically to the 'events' table for this specific row ID
        const channel = supabase
            .channel(`event_seats:${eventId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'events',
                    filter: `id=eq.${eventId}`,
                },
                (payload) => {
                    // 2. JITTER HANDLING (The "Success Bar")
                    // We only update if the 'venue_layout' has actually changed.
                    // This prevents re-renders on unrelated column changes (like title updates).
                    const newLayout = payload.new.venue_layout;

                    if (JSON.stringify(newLayout) !== JSON.stringify(data?.venue_layout)) {
                        setData((prev) => ({
                            ...prev,
                            ...payload.new as any
                        }));
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        channelRef.current = channel;

        // 3. Initial Fetch (to ensure we aren't stale)
        const fetchData = async () => {
            const { data: currentEvent, error } = await supabase
                .from('events')
                .select('venue_layout, seat_map_config')
                .eq('id', eventId)
                .single();

            if (currentEvent && !error) {
                setData(currentEvent);
            }
        };

        fetchData();

        // Cleanup
        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId]);

    return {
        data,
        isConnected,
        // Helper to manually push updates (Throttled wrapper would go here)
        updateLayout: async (newLayout: any) => {
            // Optimistic Update
            setData(prev => ({ ...prev!, venue_layout: newLayout }));

            // Actual Push
            await supabase
                .from('events')
                .update({ venue_layout: newLayout })
                .eq('id', eventId);
        }
    };
}
