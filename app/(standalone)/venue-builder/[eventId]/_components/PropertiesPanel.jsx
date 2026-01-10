"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Grid3X3, Trash2, Settings, Image as ImageIcon } from "lucide-react";

const ROYAL_PALETTE = [
    { name: "Gold", value: "#fac529" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Grey", value: "#4b5563" },
];

export default function PropertiesPanel({
    selectedShape,
    backgroundConfig,
    onUpdate,
    onUpdateBackground,
    onDelete,
    onClose,
    onGenerateGrid
}) {
    // If no shape selected, show Global Settings
    if (!selectedShape) {
        return (
            <div className="absolute top-20 right-6 w-80 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
                    <Settings className="w-4 h-4 text-[#fac529]" />
                    <h2 className="text-white font-bold text-sm tracking-tight uppercase">Venue Settings</h2>
                </div>

                <div className="p-5 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-white/50" />
                            <Label className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Blueprint Image</Label>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white/40 text-[9px] uppercase font-bold">Image URL</Label>
                            <Input
                                value={backgroundConfig?.url || ""}
                                onChange={(e) => onUpdateBackground(prev => ({ ...prev, url: e.target.value }))}
                                className="bg-black/20 border-white/5 text-white h-8 text-xs font-mono"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-white/40 text-[9px] uppercase font-bold">Opacity</Label>
                                <span className="text-white/40 text-[9px] font-mono">{backgroundConfig?.opacity || 0.5}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={backgroundConfig?.opacity || 0.5}
                                onChange={(e) => onUpdateBackground(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#fac529]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-white/40 text-[9px] uppercase font-bold">Scale</Label>
                                <span className="text-white/40 text-[9px] font-mono">{backgroundConfig?.scale || 1}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.1" max="5" step="0.1"
                                value={backgroundConfig?.scale || 1}
                                onChange={(e) => onUpdateBackground(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#fac529]"
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-[10px] text-blue-200 leading-relaxed">
                        <strong>Pro Tip:</strong> Paste a URL to your venue's floor plan. It will appear behind the grid. Adjust opacity to trace over it with "Zones".
                    </div>
                </div>
            </div>
        );
    }

    const isRect = selectedShape.type === "rect";

    return (
        <div className="absolute top-20 right-6 w-80 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-white font-bold text-sm tracking-tight uppercase">Properties</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white h-8 w-8">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-white/50 text-[10px] uppercase font-bold tracking-widest leading-none">Label / Name</Label>
                        <Input
                            value={selectedShape.name || ""}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            className="bg-black/20 border-white/5 text-white h-9 focus-visible:ring-[#fac529]"
                            placeholder="e.g. VIP Section"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/50 text-[10px] uppercase font-bold tracking-widest leading-none">Price (BDT)</Label>
                        <Input
                            type="number"
                            value={selectedShape.price || ""}
                            onChange={(e) => onUpdate({ price: parseInt(e.target.value) || 0 })}
                            className="bg-black/20 border-white/5 text-white h-9 focus-visible:ring-[#fac529]"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-3">
                    <Label className="text-white/50 text-[10px] uppercase font-bold tracking-widest leading-none">Theme Color</Label>
                    <div className="flex gap-3">
                        {ROYAL_PALETTE.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => onUpdate({ fill: color.value })}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedShape.fill === color.value ? "border-white scale-110" : "border-transparent"
                                    }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Grid Generation (Rectangle Only) */}
                {isRect && (
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Grid3X3 className="w-4 h-4 text-[#fac529]" />
                            <Label className="text-[#fac529] text-[10px] uppercase font-bold tracking-widest leading-none">Seat Grid Generator</Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/40 text-[9px] uppercase font-bold">Rows</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={selectedShape.row_count || 5}
                                    onChange={(e) => onUpdate({ row_count: parseInt(e.target.value) || 1 })}
                                    className="bg-black/20 border-white/5 text-white h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/40 text-[9px] uppercase font-bold">Cols</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={selectedShape.col_count || 5}
                                    onChange={(e) => onUpdate({ col_count: parseInt(e.target.value) || 1 })}
                                    className="bg-black/20 border-white/5 text-white h-8 text-xs"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={onGenerateGrid}
                            className="w-full bg-[#fac529]/10 text-[#fac529] border border-[#fac529]/20 hover:bg-[#fac529] hover:text-black transition-all font-bold text-xs h-10 uppercase tracking-widest"
                        >
                            Generate Seats
                        </Button>
                    </div>
                )}

                {/* Delete */}
                <div className="pt-4">
                    <Button
                        variant="ghost"
                        onClick={onDelete}
                        className="w-full text-red-500/50 hover:text-red-500 hover:bg-red-500/10 justify-start h-10 px-0"
                    >
                        <Trash2 className="w-4 h-4 mr-2 ml-4" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Delete Shape</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
