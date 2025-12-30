"use client";

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
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

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
                </div>
            </header>

            {/* Builder Area */}
            <div className="h-[calc(100vh-64px)]">
                <SeatingBuilder event={event} />
            </div>
        </div>
    );
}
