"use client";

<<<<<<< HEAD
import { useParams, useRouter } from "next/navigation";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useState } from "react";

// Seat Toolkit Dynamic Import
const SeatToolkit = dynamic(
    () => import("@mezh-hq/react-seat-toolkit").then((mod) => mod.SeatToolkit),
    {
        ssr: false, loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <span className="ml-2">Loading Designer...</span>
            </div>
        )
    }
);
import "@mezh-hq/react-seat-toolkit/styles";
import "@/app/seat-toolkit-theme.css";

export default function SeatingBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId;
    const [isSaving, setIsSaving] = useState(false);

    // Fetch event data
    const { data: event, isLoading } = useConvexQuery(api.events.getById, { id: eventId });
    const { mutate: saveVenueLayout } = useConvexMutation(api.events.saveVenueLayout);

    const handleSave = async (json) => {
        setIsSaving(true);
        try {
            await saveVenueLayout({
                eventId: eventId,
                layout: json,
            });
            toast.success("Layout Saved");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save layout");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !event) {
=======
import { useParams } from "next/navigation";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SeatingBuilder from "@/components/organizer/seating-builder";

export default function SeatingBuilderPage() {
    const params = useParams();
    const eventId = params.eventId;
    const { data: event, isLoading } = useConvexQuery(api.events.getById, { id: eventId });

    if (isLoading) {
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

<<<<<<< HEAD
    return (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a] text-white font-['Manrope'] flex flex-col overflow-hidden select-none cursor-default">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111] shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold">Venue Designer</h1>
                        <p className="text-xs text-white/50">
                            {event.title?.en || (typeof event.title === "string" ? event.title : "Untitled Event")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isSaving && <span className="text-xs text-amber-500 animate-pulse">Saving changes...</span>}
                    <Button
                        onClick={() => {
                            toast.info("Click the 'Export' icon in the toolkit to save.");
                        }}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Help
                    </Button>
=======
    if (!event) {
        return <div className="text-white">Event not found</div>;
    }

    return (
        <div className="min-h-screen bg-[#111] text-white font-['Manrope']">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#181611]">
                <div className="flex items-center gap-4">
                    <Link href={`/my-events/${eventId}`}>
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Seating Builder</h1>
                        <p className="text-xs text-white/50">{event.title?.en || (typeof event.title === 'string' ? event.title : 'Untitled Event')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Save logic is handled inside the builder component */}
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
                </div>
            </header>

            {/* Builder Area */}
<<<<<<< HEAD
            <div className="flex-1 w-full relative overflow-hidden">
                <SeatToolkit
                    mode="designer"
                    events={{
                        onExport: (json) => handleSave(json),
                    }}
                    data={event.venueLayout || null}
                />
=======
            <div className="h-[calc(100vh-64px)]">
                <SeatingBuilder event={event} />
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
            </div>
        </div>
    );
}
