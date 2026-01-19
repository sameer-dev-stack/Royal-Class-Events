"use client";

import { Plus, Trash2, Palette } from "lucide-react";
import useSeatEngine from "@/hooks/use-seat-engine";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * Royal Seat Engine - Category Manager
 * Phase 12: Global Pricing & Color Management
 */

const PRESET_COLORS = [
    "#D4AF37", // Gold
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#a855f7", // Purple
    "#ec4899", // Pink
];

export default function CategoryManager() {
    const { categories, addCategory, updateCategory, removeCategory } = useSeatEngine();
    const [newCatName, setNewCatName] = useState("");
    const [newCatPrice, setNewCatPrice] = useState(50);
    const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

    const handleAddCategory = () => {
        if (!newCatName.trim()) return;
        addCategory({
            name: newCatName.trim(),
            price: newCatPrice,
            color: newCatColor
        });
        setNewCatName("");
        setNewCatPrice(50);
    };

    return (
        <div className="w-64 bg-zinc-900/90 backdrop-blur-sm border-l border-zinc-800/50 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Palette className="w-4 h-4 text-#D4AF37" />
                    <span className="text-sm font-medium">Pricing Categories</span>
                </div>
            </div>

            {/* Category List */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {categories.length === 0 ? (
                    <p className="text-xs text-zinc-600 text-center py-4">
                        No categories yet. Add one below to organize seat pricing.
                    </p>
                ) : (
                    categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border border-zinc-600"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <input
                                        type="text"
                                        value={cat.name}
                                        onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                                        className="bg-transparent text-sm text-white font-medium focus:outline-none w-24"
                                    />
                                </div>
                                <button
                                    onClick={() => removeCategory(cat.id)}
                                    className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500">$</span>
                                <input
                                    type="number"
                                    value={cat.price}
                                    onChange={(e) => updateCategory(cat.id, { price: parseFloat(e.target.value) || 0 })}
                                    className="w-16 px-2 py-1 bg-zinc-900/50 border border-zinc-700/50 rounded text-xs text-#D4AF37 font-bold focus:outline-none focus:border-#D4AF37/50"
                                />
                            </div>

                            {/* Color Picker */}
                            <div className="flex flex-wrap gap-1">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => updateCategory(cat.id, { color })}
                                        className={cn(
                                            "w-5 h-5 rounded-full border transition-all",
                                            cat.color === color
                                                ? "border-white scale-110"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add New Category */}
            <div className="p-4 border-t border-zinc-800/50 space-y-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Add New Category
                </div>
                <input
                    type="text"
                    placeholder="Category Name (e.g., VIP)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-#D4AF37/50"
                />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Price:</span>
                    <input
                        type="number"
                        value={newCatPrice}
                        onChange={(e) => setNewCatPrice(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded text-xs text-white focus:outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setNewCatColor(color)}
                            className={cn(
                                "w-5 h-5 rounded-full border transition-all",
                                newCatColor === color
                                    ? "border-white scale-110"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <button
                    onClick={handleAddCategory}
                    disabled={!newCatName.trim()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-#D4AF37/10 border border-#D4AF37/30 text-#D4AF37 rounded-lg text-sm font-medium hover:bg-#D4AF37/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>
        </div>
    );
}

