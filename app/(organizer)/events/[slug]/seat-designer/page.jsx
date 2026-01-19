"use client";

import { Crown, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Toolbox from "@/components/seat-engine/Toolbox";
import PropertiesPanel from "@/components/seat-engine/PropertiesPanel";
import HeaderActions from "@/components/seat-engine/HeaderActions";
import useSeatEngine from "@/hooks/use-seat-engine";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CanvasStage = dynamic(
    () => import("@/components/seat-engine/CanvasStage"),
    { ssr: false }
);

export default function SeatDesignerPage({ params }) {
    const unwrappedParams = use(params);
    const { elements, setElements, setStagePosition, resetStage } = useSeatEngine();

    // 1. Fetch Event by Slug
    const event = useQuery(api.events.getEventBySlug, { slug: unwrappedParams.slug });
    const eventId = event?._id;

    // Reset state
    useEffect(() => {
        resetStage();
        return () => resetStage();
    }, [resetStage]);

    // Hydrate Store
    useEffect(() => {
        if (event?.venueLayout) {
            const { shapes: savedElements, stageConfig: savedStage } = event.venueLayout;
            if (savedElements) setElements(savedElements);
            if (savedStage) setStagePosition(savedStage.x, savedStage.y, savedStage.scale);
        }
    }, [event, setElements, setStagePosition]);

    if (!event) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 z-50">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-zinc-950 flex flex-col z-[9999]">
            {/* Header */}
            <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Crown className="w-4 h-4 text-black" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-tight">
                            Seat Designer
                        </h1>
                        <p className="text-[10px] text-zinc-500 -mt-0.5">
                            {event.title?.en ?? event.title ?? "Untitled Event"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <HeaderActions eventId={eventId} />
                </div>
            </header>

            {/* Layout */}
            <div className="flex-1 flex relative overflow-hidden">
                <aside className="absolute left-4 top-4 z-50">
                    <Toolbox />
                </aside>

                <main className="flex-1 relative">
                    <CanvasStage />
                </main>

                <aside className="absolute right-4 top-4 bottom-4 w-80 z-50 flex flex-col gap-4">
                    <PropertiesPanel />
                </aside>
            </div>
        </div>
    );
}
