"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/hooks/use-auth-store";
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

export default function SeatDesignerPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const [layoutData, setLayoutData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { token } = useAuthStore();

    // Fetch event data
    const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, {
        slug: unwrappedParams.slug,
    });

    // Fetch existing seat map layout
    const { data: existingLayout } = useConvexQuery(
        api.seatMapToolkit.getSeatMapLayout,
        event?._id ? { eventId: event._id, token } : "skip"
    );

    // Save mutation
    const { mutate: saveSeatMap } = useConvexMutation(
        api.seatMapToolkit.saveSeatMapLayout
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
            await saveSeatMap({
                eventId: event._id,
                layoutData: layoutData,
                token,
            });

            toast.success("Seat map saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save seat map");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FBB03B]" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
                    <Button onClick={() => router.push("/events")}>
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    const eventTitle = event.title?.en || (typeof event.title === "string" ? event.title : "Untitled Event");

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="bg-[#1f1f23] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/events/${unwrappedParams.slug}/manage`)}
                        className="text-white hover:bg-white/5"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-white">{eventTitle}</h1>
                        <p className="text-sm text-gray-400">Seat Map Designer</p>
                    </div>
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

            {/* Seat Toolkit Designer */}
            <div className="flex-1 overflow-hidden">
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
