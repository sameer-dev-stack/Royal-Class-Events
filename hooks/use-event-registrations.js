"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";

export function useEventRegistrations(eventId) {
    const { token } = useAuthStore();

    const data = useQuery(api.registrations.getEventRegistrations, {
        eventId: eventId,
        token: token || ""
    });

    const isLoading = data === undefined;
    const error = data === null && eventId ? new Error("Failed to load registrations") : null;

    return {
        data: data || [],
        isLoading,
        error
    };
}
