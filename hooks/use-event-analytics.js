"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useEventAnalytics(eventId) {
    const data = useQuery(api.pricing.getEventAnalytics, {
        eventId: eventId
    });

    const isLoading = data === undefined;
    const error = data === null && eventId ? new Error("Failed to load analytics") : null;

    return { data, isLoading, error };
}
