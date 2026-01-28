"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";

export function useEventDashboard(eventId) {
    const { token } = useAuthStore();

    // Convex real-time query handles all computation on the server
    const data = useQuery(api.dashboard.getEventDashboard, {
        eventId: eventId,
        token: token || ""
    });

    const isLoading = data === undefined;
    const error = data === null && eventId ? new Error("Failed to load dashboard") : null;

    return { data, isLoading, error };
}
