"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, ArrowLeft, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Custom Hooks
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

// 1. Dynamic Import for Canvas (Prevents "window is undefined" error)
const SeatToolkit = dynamic(
    () => import("@mezh-hq/react-seat-toolkit").then((mod) => mod.SeatToolkit),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center h-full text-amber-500 gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Initializing Design Engine...</span>
            </div>
        )
    }
);

// Styles
import "@mezh-hq/react-seat-toolkit/styles";
import "@/app/seat-toolkit-theme.css";

export default function SeatingBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId;
    const [isSaving, setIsSaving] = useState(false);

    // 2. Fetch Event Data
    const { data: event, isLoading } = useConvexQuery(api.events.getById, { id: eventId });
    const { mutate: saveVenueLayout } = useConvexMutation(api.events.saveVenueLayout);

    // 3. Handle Save
    const handleSave = async (json) => {
        setIsSaving(true);
        try {
            await saveVenueLayout({
                eventId: eventId,
                layout: json,
            });
            toast.success("Venue Layout Saved Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save layout");
        } finally {
            setIsSaving(false);
        }
    };

    // 4. Suppress Library Warning (AirplaneMode bug in library)
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (typeof args[0] === 'string' && args[0].includes('airplaneMode')) {
                return;
            }
            originalError.apply(console, args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);

    // Loading State
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center text-white">
                Event not found
            </div>
        );
    }

    return (
        // === FULL SCREEN WRAPPER ===
        // Uses 'fixed inset-0 z-[9999]' to overlay the entire dashboard.
        // This fixes the Cursor Offset issue by resetting coordinates to (0,0).
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in duration-300">

            {/* --- HEADER --- */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111] shrink-0 shadow-md z-50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="h-6 w-px bg-white/10" />
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide">VENUE DESIGNER</h1>
                        <p className="text-xs text-white/50 max-w-[200px] truncate">
                            {event.title?.en || (typeof event.title === "string" ? event.title : "Untitled Event")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Save Status */}
                    <div className="flex items-center gap-2 text-xs">
                        {isSaving ? (
                            <span className="text-amber-500 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                            </span>
                        ) : (
                            <span className="text-green-500 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Ready
                            </span>
                        )}
                    </div>

                    {/* Helper Text */}
                    <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded text-xs text-amber-500 font-medium">
                        Click "Export" in toolbar to save
                    </div>
                </div>
            </header>

            {/* --- CANVAS AREA --- */}
            {/* 'select-none' prevents cursor flickering during drag */}
            {/* 'isolate' prevents CSS leaks from parent theme */}
            <div className="relative flex-1 w-full bg-[#181611] select-none isolate overflow-hidden cursor-default">
                <SeatToolkit
                    mode="designer"
                    events={{
                        onExport: (json) => handleSave(json),
                    }}
                    data={event.venueLayout || null}
                />
            </div>
        </div>
    );
}