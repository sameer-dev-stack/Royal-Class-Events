"use client";

import { X, Trash2, Grid3X3, Move, RotateCw, Maximize2, LayoutGrid, Rows3, Columns3, AlignLeft, AlignCenterHorizontal, AlignStartVertical, AlignCenterVertical } from "lucide-react";
import useSeatEngine, { TOOL_TYPES, SEAT_NAMING } from "@/hooks/use-seat-engine";
import { cn } from "@/lib/utils";

/**
 * Royal Seat Engine - Properties Panel
 * Phase 4: Smart Zone Logic with Seating Configuration
 */

export default function PropertiesPanel() {
    const {
        selectedIds,
        elements,
        updateElement,
        updateSeatConfig,
        deleteSelectedElement,
        clearSelection,
        canvasSettings,
        updateCanvasSettings,
    } = useSeatEngine();

    const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
    const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

    // Handle input changes with two-way binding
    const handleChange = (field, value) => {
        if (selectedIds.length === 0) return;
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            // Apply to all selected (passing null as ID to update all in selectedIds)
            updateElement(null, { [field]: numValue });
        }
    };

    // Handle seat config changes
    const handleSeatConfigChange = (field, value) => {
        if (selectedIds.length === 0) return;
        // Apply to all selected
        updateSeatConfig(null, { [field]: value });
    };

    // Alignment logic
    const alignElements = (direction) => {
        if (selectedIds.length <= 1) return;
        const selected = elements.filter(el => selectedIds.includes(el.id));

        let targetValue;
        switch (direction) {
            case 'left':
                targetValue = Math.min(...selected.map(el => el.x));
                updateElement(null, { x: targetValue });
                break;
            case 'top':
                targetValue = Math.min(...selected.map(el => el.y));
                updateElement(null, { y: targetValue });
                break;
            case 'center-h':
                const minX = Math.min(...selected.map(el => el.x));
                const maxX = Math.max(...selected.map(el => el.x + el.width));
                const midX = (minX + maxX) / 2;
                selected.forEach(el => updateElement(el.id, { x: midX - el.width / 2 }));
                break;
            case 'center-v':
                const minY = Math.min(...selected.map(el => el.y));
                const maxY = Math.max(...selected.map(el => el.y + el.height));
                const midY = (minY + maxY) / 2;
                selected.forEach(el => updateElement(el.id, { y: midY - el.height / 2 }));
                break;
        }
    };

    // If nothing selected, show canvas settings
    if (selectedIds.length === 0) {
        return (
            <div className="w-64 bg-zinc-900/90 backdrop-blur-sm border-l border-zinc-800/50 flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Grid3X3 className="w-4 h-4" />
                        <span className="text-sm font-medium">Canvas Settings</span>
                    </div>
                </div>

                {/* Canvas Settings... contents remain same but variable names might need check */}
                {/* Omitted for brevity, but I will keep the actual JSX structure if I replace the whole block or just the condition */}
                <div className="p-4 space-y-4">
                    {/* Grid Size */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider">
                            Grid Size
                        </label>
                        <input
                            type="number"
                            value={canvasSettings.gridSize}
                            onChange={(e) =>
                                updateCanvasSettings({ gridSize: parseInt(e.target.value) || 20 })
                            }
                            className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                        />
                    </div>

                    {/* Show Grid Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider">
                            Show Grid
                        </label>
                        <button
                            onClick={() =>
                                updateCanvasSettings({ showGrid: !canvasSettings.showGrid })
                            }
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative",
                                canvasSettings.showGrid ? "bg-amber-500" : "bg-zinc-700"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    canvasSettings.showGrid ? "left-5" : "left-1"
                                )}
                            />
                        </button>
                    </div>

                    {/* Snap to Grid Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider">
                            Snap to Grid
                        </label>
                        <button
                            onClick={() =>
                                updateCanvasSettings({ snapToGrid: !canvasSettings.snapToGrid })
                            }
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative",
                                canvasSettings.snapToGrid ? "bg-amber-500" : "bg-zinc-700"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    canvasSettings.snapToGrid ? "left-5" : "left-1"
                                )}
                            />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-xs text-zinc-600 text-center">
                        Select one or more shapes to edit properties
                    </p>
                </div>
            </div>
        );
    }

    const isBulk = selectedIds.length > 1;
    const isRectangle = selectedElement?.type === TOOL_TYPES.RECTANGLE;
    const seatConfig = selectedElement?.seatConfig;
    const totalSeats = seatConfig ? seatConfig.rowCount * seatConfig.colCount : 0;

    // Shape selected - show properties
    return (
        <div className="w-64 bg-zinc-900/90 backdrop-blur-sm border-l border-zinc-800/50 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#D4AF37]" />
                    <span className="text-sm font-medium text-white">
                        {isBulk ? `Bulk Edit (${selectedIds.length})` :
                            selectedElement.type === TOOL_TYPES.RECTANGLE ? "Zone" :
                                selectedElement.type === TOOL_TYPES.CIRCLE ? "Circle" :
                                    selectedElement.type === TOOL_TYPES.POLYGON ? "Polygon" :
                                        selectedElement.type === TOOL_TYPES.CURVE ? "Arc" : "Asset"}
                    </span>
                    {!isBulk && isRectangle && seatConfig && (
                        <span className="text-xs text-zinc-500">
                            ({totalSeats} seats)
                        </span>
                    )}
                </div>
                <button
                    onClick={clearSelection}
                    className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Properties */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* IDENTITY - Name & Color */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <span className="text-xs uppercase tracking-wider">Identity</span>
                    </div>

                    {/* Name Input - Hide in Bulk */}
                    {!isBulk && (
                        <div>
                            <label className="text-[10px] text-zinc-600 mb-1 block">Name</label>
                            <input
                                type="text"
                                value={selectedElement.name || ""}
                                onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                                placeholder={isRectangle ? "Section Name" : "Shape Name"}
                                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Bulk Selection alignment tools */}
                    {isBulk && (
                        <div className="p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold mb-2">Align Selection</label>
                            <div className="flex items-center gap-1">
                                <button onClick={() => alignElements('left')} className="p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                                <button onClick={() => alignElements('center-h')} className="p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300" title="Align Center (H)"><AlignCenterHorizontal className="w-4 h-4" /></button>
                                <button onClick={() => alignElements('top')} className="p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300" title="Align Top"><AlignStartVertical className="w-4 h-4" /></button>
                                <button onClick={() => alignElements('center-v')} className="p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300" title="Align Middle (V)"><AlignCenterVertical className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}

                    {/* Category Selection */}
                    {(isBulk || selectedElement.type === TOOL_TYPES.RECTANGLE || selectedElement.type === TOOL_TYPES.CURVE) && (
                        <div className="p-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold">
                                {isBulk ? "Bulk Category" : "Pricing Category"}
                            </label>
                            <select
                                value={isBulk ? "" : (seatConfig?.categoryId || "")}
                                onChange={(e) => handleSeatConfigChange("categoryId", e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="">{isBulk ? "Choose Category..." : "No Category (Free/GA)"}</option>
                                {useSeatEngine.getState().categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                            {!isBulk && seatConfig?.categoryId && (
                                <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-900/50 rounded-md border border-zinc-800/50">
                                    <span className="text-[10px] text-zinc-500">Price Tier</span>
                                    <span className="text-[10px] text-amber-500 font-bold">
                                        ${useSeatEngine.getState().categories.find(c => c.id === seatConfig.categoryId)?.price || 0}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table Configuration */}
                    {(selectedElement?.type === TOOL_TYPES.ASSET || selectedElement?.type === TOOL_TYPES.IMAGE) && (selectedElement?.assetType === 'TABLE' || selectedElement?.assetConfig?.type === 'TABLE') && (
                        <div className="p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold">Table Capacity</label>
                                <span className="text-xs font-bold text-amber-500">{seatConfig?.capacity || 6}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={seatConfig?.capacity || 6}
                                onChange={(e) => handleSeatConfigChange("capacity", parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                                <span>0</span>
                                <span>10</span>
                                <span>20</span>
                            </div>
                        </div>
                    )}

                    {/* Asset Type Display */}
                    {(selectedElement?.type === TOOL_TYPES.IMAGE || selectedElement?.type === TOOL_TYPES.ASSET) && (
                        <div className="p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Asset Class</label>
                            <div className="flex items-center gap-2 text-white text-sm font-medium">
                                <LayoutGrid className="w-4 h-4 text-amber-500" />
                                {selectedElement.assetType || "Custom Asset"}
                            </div>
                        </div>
                    )}

                    {/* Color Picker */}
                    <div>
                        <label className="text-[10px] text-zinc-600 mb-1 block">
                            {isBulk ? "Bulk Color" : "Color"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "#D4AF37", // Gold
                                "#ef4444", // Red
                                "#f97316", // Orange
                                "#eab308", // Yellow
                                "#22c55e", // Green
                                "#3b82f6", // Blue
                                "#a855f7", // Purple
                                "#ec4899", // Pink
                                "#71717a", // Zinc
                            ].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateElement(null, { fill: color })}
                                    className={cn(
                                        "w-6 h-6 rounded-full border transition-all",
                                        !isBulk && selectedElement.fill === color
                                            ? "border-white scale-110 shadow-sm"
                                            : "border-transparent opacity-70 hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            {/* Custom Color Input */}
                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-zinc-700">
                                <input
                                    type="color"
                                    value={isBulk ? "#D4AF37" : (selectedElement.fill || "#D4AF37")}
                                    onChange={(e) => updateElement(null, { fill: e.target.value })}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-zinc-800/50 my-2" />
                {/* Position/Size/Rotation - Hide in Bulk for now to avoid complexity */}
                {!isBulk && (
                    <>
                        {/* Position */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Move className="w-3 h-3" />
                                <span className="text-xs uppercase tracking-wider">Position</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-zinc-600 mb-1 block">X</label>
                                    <input
                                        type="number"
                                        value={Math.round(selectedElement.x)}
                                        onChange={(e) => handleChange("x", e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-600 mb-1 block">Y</label>
                                    <input
                                        type="number"
                                        value={Math.round(selectedElement.y)}
                                        onChange={(e) => handleChange("y", e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Size */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Maximize2 className="w-3 h-3" />
                                <span className="text-xs uppercase tracking-wider">Size</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-zinc-600 mb-1 block">Width</label>
                                    <input
                                        type="number"
                                        value={Math.round(selectedElement.width)}
                                        onChange={(e) => handleChange("width", e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-600 mb-1 block">Height</label>
                                    <input
                                        type="number"
                                        value={Math.round(selectedElement.height)}
                                        onChange={(e) => handleChange("height", e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rotation */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <RotateCw className="w-3 h-3" />
                                <span className="text-xs uppercase tracking-wider">Rotation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={selectedElement.rotation || 0}
                                    onChange={(e) => handleChange("rotation", e.target.value)}
                                    className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <span className="text-xs text-zinc-400 w-10 text-right">
                                    {Math.round(selectedElement.rotation || 0)}°
                                </span>
                            </div>
                        </div>

                        {/* Curvature (Only for Rectangles) */}
                        {isRectangle && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <RotateCw className="w-3 h-3 text-amber-500/70" />
                                    <span className="text-xs uppercase tracking-wider">Curvature (Arc)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={seatConfig?.curvature || 0}
                                        onChange={(e) => handleSeatConfigChange("curvature", parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <span className="text-xs text-zinc-400 w-10 text-right">
                                        {seatConfig?.curvature || 0}%
                                    </span>
                                </div>
                                {seatConfig?.curvature > 0 && (
                                    <p className="text-[10px] text-zinc-600 italic">Converts section into a radial arc</p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* SEATING CONFIGURATION - Only for Rectangles */}
                {isRectangle && seatConfig && (
                    <>
                        <div className="h-px bg-zinc-800/50 my-2" />

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-500">
                                <LayoutGrid className="w-3 h-3" />
                                <span className="text-xs uppercase tracking-wider font-medium">
                                    Seating Configuration
                                </span>
                            </div>

                            {/* Row Count */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-zinc-600 mb-1 flex items-center gap-1">
                                        <Rows3 className="w-3 h-3" /> Rows
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={seatConfig.rowCount}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                                            handleSeatConfigChange("rowCount", val);
                                        }}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-amber-500/30 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-600 mb-1 flex items-center gap-1">
                                        <Columns3 className="w-3 h-3" /> Columns
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={seatConfig.colCount}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                                            handleSeatConfigChange("colCount", val);
                                        }}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-amber-500/30 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Naming Convention */}
                            <div>
                                <label className="text-[10px] text-zinc-600 mb-1 block">
                                    Row Naming
                                </label>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button
                                        onClick={() => handleSeatConfigChange("seatNaming", SEAT_NAMING.ALPHABETICAL)}
                                        className={cn(
                                            "px-3 py-2 text-xs rounded-lg border transition-colors",
                                            seatConfig.seatNaming === SEAT_NAMING.ALPHABETICAL
                                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                                        )}
                                    >
                                        A, B, C...
                                    </button>
                                    <button
                                        onClick={() => handleSeatConfigChange("seatNaming", SEAT_NAMING.NUMERICAL)}
                                        className={cn(
                                            "px-3 py-2 text-xs rounded-lg border transition-colors",
                                            seatConfig.seatNaming === SEAT_NAMING.NUMERICAL
                                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                                        )}
                                    >
                                        1, 2, 3...
                                    </button>
                                </div>

                                {/* Show Row Labels Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                        Show Row Labels
                                    </label>
                                    <button
                                        onClick={() => handleSeatConfigChange("showLabels", !seatConfig.showLabels)}
                                        className={cn(
                                            "w-8 h-5 rounded-full transition-colors relative",
                                            seatConfig.showLabels ? "bg-amber-500" : "bg-zinc-700"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "absolute top-1 w-3 h-3 rounded-full bg-white transition-transform",
                                                seatConfig.showLabels ? "left-4" : "left-1"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Total Seats Display */}
                            <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-400">Total Seats</span>
                                    <span className="text-amber-400 font-bold">{totalSeats}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Details - Only for Single selection */}
                {!isBulk && (
                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider text-zinc-500">ID</span>
                        <div className="px-3 py-2 bg-zinc-800/30 border border-zinc-700/30 rounded-lg text-xs text-zinc-500 font-mono truncate">
                            {selectedElement.id}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Button */}
            <div className="p-4 border-t border-zinc-800/50">
                <button
                    onClick={deleteSelectedElement}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete {isBulk ? `Selected (${selectedIds.length})` : (isRectangle ? "Zone" : "Shape")}
                </button>
                <p className="text-[10px] text-zinc-600 text-center mt-2">
                    Or press Delete / Backspace
                </p>
            </div>
        </div>
    );
}
