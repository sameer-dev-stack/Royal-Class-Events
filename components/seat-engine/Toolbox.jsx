"use client";

import { MousePointer2, Square, Circle, PenTool, Image, RotateCw, LayoutGrid, Maximize2 } from "lucide-react";
import useSeatEngine, { TOOL_TYPES } from "@/hooks/use-seat-engine";
import { cn } from "@/lib/utils";

/**
 * Royal Seat Engine - Toolbox Component
 * Phase 12: Advanced Tools & Assets
 */

const tools = [
    {
        id: TOOL_TYPES.SELECT,
        icon: MousePointer2,
        label: "Select",
        shortcut: "V",
    },
    {
        id: TOOL_TYPES.RECTANGLE,
        icon: Square,
        label: "Rectangle",
        shortcut: "R",
    },
    {
        id: TOOL_TYPES.CIRCLE,
        icon: Circle,
        label: "Circle",
        shortcut: "C",
    },
    {
        id: TOOL_TYPES.POLYGON,
        icon: PenTool,
        label: "Pen Tool",
        shortcut: "P",
    },
    {
        id: TOOL_TYPES.CURVE,
        icon: RotateCw,
        label: "Arc Tool",
        shortcut: "A",
    },
    {
        id: "STAGE",
        icon: LayoutGrid,
        label: "Add Stage",
        type: TOOL_TYPES.IMAGE,
        assetType: "STAGE",
        shortcut: "S"
    },
    {
        id: "EXIT",
        icon: Maximize2,
        label: "Add Exit",
        type: TOOL_TYPES.IMAGE,
        assetType: "EXIT",
        shortcut: "E"
    },
    {
        id: TOOL_TYPES.IMAGE,
        icon: Image,
        label: "Custom Asset",
        shortcut: "I",
    },
];

export default function Toolbox() {
    const { tool, setTool, clearSelection } = useSeatEngine();

    const handleToolClick = (t) => {
        setTool(t.id);
        clearSelection();
    };

    return (
        <div className="flex flex-col gap-1.5 p-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl shadow-2xl">
            {tools.map((t) => {
                const isActive = tool === t.id;
                const Icon = t.icon;

                return (
                    <button
                        key={t.id}
                        onClick={() => handleToolClick(t)}
                        title={`${t.label} (Shortcut: ${t.shortcut})`}
                        className={cn(
                            "relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group",
                            isActive
                                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                                : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                        )}
                    >
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />

                        {/* Tooltip */}
                        <div className="absolute left-full ml-3 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                            {t.label}
                            {t.shortcut && <span className="ml-2 text-zinc-500 font-mono text-[10px]">{t.shortcut}</span>}
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-full blur-[2px]" />
                        )}
                    </button>
                );
            })}

            {/* Divider */}
            <div className="h-px bg-zinc-700/50 my-1 mx-1" />

            {/* Element count indicator */}
            <div className="py-1">
                <ElementCount />
            </div>
        </div>
    );
}

function ElementCount() {
    const elements = useSeatEngine((state) => state.elements);
    return (
        <div className="text-[9px] text-center text-zinc-600 font-bold uppercase tracking-tighter">
            {elements.length} OBJ
        </div>
    );
}
