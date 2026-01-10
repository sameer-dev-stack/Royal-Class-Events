"use client";

import { Crown, Undo2, Redo2, Trash2, Loader2, Settings2, Tag, LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";
import Toolbox from "@/components/seat-engine/Toolbox";
import PropertiesPanel from "@/components/seat-engine/PropertiesPanel";
import CategoryManager from "@/components/seat-engine/CategoryManager";
import AssetLibrary from "@/components/seat-engine/AssetLibrary";
import HeaderActions from "@/components/seat-engine/HeaderActions";
import useSeatEngine from "@/hooks/use-seat-engine";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// ... (CanvasStage dynamic import remains same)
const CanvasStage = dynamic(
    () => import("@/components/seat-engine/CanvasStage"),
    { ssr: false }
);

export default function SeatBuilderPage() {
    const { elements, clearElements, selectedId, setElements, setStagePosition, resetStage } = useSeatEngine();
    const [activeTab, setActiveTab] = useState("properties"); // properties | categories

    // Convex Integration
    const searchParams = useSearchParams();
    const eventId = searchParams.get("eventId");

    // Fetch Event Data if ID exists
    const event = useQuery(api.events.getById, eventId ? { id: eventId } : "skip");

    // Reset state on mount/unmount to prevent ghost data
    useEffect(() => {
        resetStage();
        return () => resetStage();
    }, [resetStage]);

    // Hydrate Store on Load
    useEffect(() => {
        if (event?.venueLayout) {
            const { shapes: savedElements, stageConfig: savedStage } = event.venueLayout;
            if (savedElements) setElements(savedElements);
            if (savedStage) setStagePosition(savedStage.x, savedStage.y, savedStage.scale);
        }
    }, [event, setElements, setStagePosition]);

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
                            Royal Seat Engine
                        </h1>
                        <p className="text-[10px] text-zinc-500 -mt-0.5">
                            Phase 12: The Category Engine
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
                        {elements.length} elements
                    </div>
                    <HeaderActions />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Left Sidebar - Toolbox */}
                <aside className="absolute left-4 top-4 z-50">
                    <Toolbox />
                </aside>

                {/* Canvas */}
                <main className="flex-1 relative">
                    {eventId && event === undefined ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-50">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : (
                        <CanvasStage />
                    )}
                </main>

                {/* Right Sidebar - Tabbed Panel */}
                <div className="flex relative">
                    {/* Tab Switcher (Thin vertical bar) */}
                    <div className="w-12 bg-zinc-950 border-l border-zinc-800/50 flex flex-col items-center py-4 gap-4 z-10">
                        <button
                            onClick={() => setActiveTab("properties")}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                activeTab === "properties" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300"
                            )}
                            title="Properties"
                        >
                            <Settings2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveTab("categories")}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                activeTab === "categories" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300"
                            )}
                            title="Pricing Categories"
                        >
                            <Tag className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveTab("assets")}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                activeTab === "assets" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300"
                            )}
                            title="Asset Library"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Active Panel Content */}
                    <div className="w-64">
                        {activeTab === "properties" ? <PropertiesPanel /> :
                            activeTab === "categories" ? <CategoryManager /> :
                                <AssetLibrary />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper for class merging if not already available in parent
function cn(...inputs) {
    return inputs.filter(Boolean).join(" ");
}
