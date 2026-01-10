"use client";

import React from "react";
import { LayoutGrid } from "lucide-react";
import { ASSET_LIBRARY } from "@/constants/seat-engine-assets";
import { cn } from "@/lib/utils";

/**
 * Royal Seat Engine - Asset Library
 * Phase 13: Architectural Asset Library
 * 
 * Sidebar component that allows dragging architectural assets onto the canvas.
 */
export default function AssetLibrary() {
    const handleDragStart = (e, asset) => {
        // We set JSON data to be retrieved on drop
        e.dataTransfer.setData("asset", JSON.stringify(asset));
        e.dataTransfer.effectAllowed = "copy";
    };

    return (
        <div className="bg-zinc-900/90 flex flex-col h-full border-l border-zinc-800/50">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/40">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                        <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-zinc-100 tracking-tight block">Asset Library</span>
                        <span className="text-[10px] text-zinc-500">Drag items to canvas</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                    {ASSET_LIBRARY.map((asset) => {
                        const Icon = asset.icon;
                        return (
                            <div
                                key={asset.type}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, asset)}
                                className="group relative flex flex-col items-center justify-center p-4 bg-zinc-800/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/60 hover:border-amber-500/30 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing"
                            >
                                {/* Icon Preview */}
                                <div
                                    className="w-10 h-10 mb-3 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                                >
                                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                                </div>

                                {/* Label */}
                                <span className="text-xs font-medium text-zinc-300 text-center leading-tight">
                                    {asset.label}
                                </span>

                                {/* Hover Description Tooltip (Optional visual enhancement) */}
                                <div className="hidden">
                                    {asset.description}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Info */}
            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800/50">
                <div className="text-[10px] text-zinc-500 text-center">
                    Assets are visual props and do not contain seats.
                </div>
            </div>
        </div>
    );
}
