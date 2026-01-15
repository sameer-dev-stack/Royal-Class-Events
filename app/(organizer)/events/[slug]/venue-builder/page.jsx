"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useUserRoles } from "@/hooks/use-user-roles";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "@mezh-hq/react-seat-toolkit/styles";
import "@/app/seat-toolkit-theme.css";

// Dynamic import to avoid SSR issues
const SeatToolkit = dynamic(() => import("@mezh-hq/react-seat-toolkit"), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
            <Loader2 className="w-8 h-8 animate-spin text-[#FBB03B]" />
        </div>
    ),
});

export default function VenueBuilderPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const [layoutData, setLayoutData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const { isAdmin, isLoading: isRoleLoading } = useUserRoles();

    // Fetch event data
    const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, {
        slug: unwrappedParams.slug,
    });

    // Fetch existing venue layout
    const { data: existingLayout } = useConvexQuery(
        api.events_seating.getVenueLayout,
        event?._id ? { eventId: event._id } : "skip"
    );

    // Save mutation
    const { mutate: saveVenueLayout } = useConvexMutation(
        api.events_seating.saveVenueLayout
    );

    // Load existing layout when available
    useEffect(() => {
        if (existingLayout) {
            setLayoutData(existingLayout);
        }
    }, [existingLayout]);

    const handleExport = async (data) => {
        setLayoutData(data);
    };

    const handleSave = async () => {
        if (!layoutData) {
            toast.error("No layout data to save");
            return;
        }

        if (!event?._id) {
            toast.error("Event not found");
            return;
        }

        setIsSaving(true);
        try {
            await saveVenueLayout({
                eventId: event._id,
                layoutData: layoutData,
            });

            toast.success("Venue layout saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save venue layout");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isRoleLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FBB03B]" />
            </div>
        );
    }

    if (!event) return <div className="text-white">Event not found</div>;

    // Authorization Guard
    const isOwner = isAuthenticated && user?._id && event.ownerId && user._id === event.ownerId;
    const canManage = isOwner || isAdmin;

    if (!canManage) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-8 text-center">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
                <p className="text-gray-400 mb-6">You do not have permission to access the Venue Builder for this event.</p>
                <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </div>
        );
    }

    // Security check: If not in reserved/hybrid mode, redirect back
    if (event.seatingMode === "GENERAL_ADMISSION") {
        // We can't use router.push immediately in render usually, but checking here is fine
        // Or just show a message.
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-8 text-center">
                <h1 className="text-2xl font-bold mb-4 text-[#FBB03B]">Access Denied</h1>
                <p className="mb-6">This event is configured for General Admission. You must enable Reserved Seating to use the Venue Builder.</p>
                <Button onClick={() => router.push(`/events/${unwrappedParams.slug}/tickets`)}>
                    Go to Ticket Configuration
                </Button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="bg-[#1f1f23] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/events/${unwrappedParams.slug}/tickets`)}
                        className="text-white hover:bg-white/5"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Tickets
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-white">{event.title?.en || (typeof event.title === "string" ? event.title : "Untitled Event")}</h1>
                        <p className="text-sm text-gray-400">Venue Builder</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 mr-2">
                        {isSaving ? "Saving..." : (layoutData ? "Unsaved changes" : "Ready")}
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !layoutData}
                        className="bg-gradient-to-r from-[#FBB03B] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#FBB03B] text-black font-bold"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Layout
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Seat Toolkit Designer */}
            <div className="flex-1 overflow-hidden relative">
                <SeatToolkit
                    mode="designer"
                    data={layoutData}
                    events={{
                        onExport: handleExport,
                    }}
                />
            </div>
        </div>
    );
}
