"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEventSubscription } from "@/hooks/use-supabase-realtime";
import Toolbar from "./_components/Toolbar";
import PropertiesPanel from "./_components/PropertiesPanel";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Dynamic import for SSR safety (Critical for Konva)
// We use a custom loading component to prevent layout shift
const CanvasStage = dynamic(() => import("./_components/CanvasStage"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#111] animate-pulse" />
});

export default function VenueBuilderPage() {
    const { eventId } = useParams();
    const router = useRouter();

    // Data Loading & Realtime Sync
    const { data: eventData, updateLayout, isConnected } = useEventSubscription(eventId);

    const stageRef = useRef(null);
    const [activeTool, setActiveTool] = useState("select");
    const [shapes, setShapes] = useState([]);
    const [activeShapeId, setSelectedId] = useState(null); // Rename for clarity
    const [backgroundConfig, setBackgroundConfig] = useState(null);

    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef(null);

    // 1. Initial Load & Remote Sync
    React.useEffect(() => {
        if (eventData?.venue_layout) {
            // Only update if we are not currently dragging/editing to prevent jumps
            // In a full prod app, we'd use CRDTs or operational transforms.
            // For now, we trust the hook's diffing.
            const remoteShapes = eventData.venue_layout.shapes || [];
            const remoteBg = eventData.venue_layout.background || null;

            // Simple check to avoid loop if deep equal
            if (JSON.stringify(remoteShapes) !== JSON.stringify(shapes)) {
                setShapes(remoteShapes);
            }
            if (JSON.stringify(remoteBg) !== JSON.stringify(backgroundConfig)) {
                setBackgroundConfig(remoteBg);
            }
        }
    }, [eventData]);

    // 2. Debounced Auto-Save
    const triggerSave = (newShapes, newBg) => {
        setIsSaving(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateLayout({
                    shapes: newShapes,
                    background: newBg
                });
                // Small delay to show "Saved" state
                setTimeout(() => setIsSaving(false), 500);
            } catch (err) {
                console.error("Auto-save failed:", err);
                toast.error("Failed to save changes");
                setIsSaving(false);
            }
        }, 1000); // 1s debounce
    };

    // Manual Save (Force)
    const handleSave = async () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setIsSaving(true);
        try {
            await updateLayout({
                shapes,
                background: backgroundConfig
            });
            toast.success("Venue layout saved successfully");
        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Failed to save layout");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Actions ---

    const handleShapeAdd = (newShape) => {
        // Init default properties for a new shape
        const shapeWithProps = {
            ...newShape,
            name: newShape.type === 'rect' ? 'New Section' : 'New Table',
            price: 500,
            row_count: 5,
            col_count: 5,
            seats: [],
            is_zone: false
        };
        const newShapes = [...shapes, shapeWithProps];
        setShapes(newShapes);
        triggerSave(newShapes, backgroundConfig); // Auto-save
        setSelectedId(newShape.id);
        setActiveTool("select");
    };

    // Better: Effect-based save that ignores initial mount
    const isFirstRun = useRef(true);
    React.useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        // If we have data, trigger save
        if (shapes.length > 0) {
            triggerSave(shapes, backgroundConfig);
        }
    }, [shapes, backgroundConfig]);

    const updateShape = (id, data) => {
        setShapes(prev => prev.map(shape => {
            if (shape.id !== id) return shape;
            const updatedShape = { ...shape, ...data };
            // ... (Regrid logic same as before) ...
            if (updatedShape.is_zone && (data.width || data.height || data.row_count || data.col_count)) {
                // ... (Keep existing regrid logic) ...
                const rows = updatedShape.row_count || 5;
                const cols = updatedShape.col_count || 5;
                const padding = 10;
                const seatRadius = 6;
                const w = updatedShape.width - (padding * 2);
                const h = updatedShape.height - (padding * 2);
                const xStep = cols > 1 ? w / (cols - 1) : 0;
                const yStep = rows > 1 ? h / (rows - 1) : 0;
                const newSeats = [];
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const existingSeat = updatedShape.seats.find(s => s.id === `${updatedShape.id}-s-${r}-${c}`);
                        newSeats.push({
                            id: `${updatedShape.id}-s-${r}-${c}`,
                            x: padding + (c * xStep),
                            y: padding + (r * yStep),
                            radius: seatRadius,
                            status: existingSeat ? existingSeat.status : 'available'
                        });
                    }
                }
                updatedShape.seats = newSeats;
            }
            return updatedShape;
        }));
    };

    // Wrapper for CanvasStage updates
    const handleShapeChange = (id, newAttrs) => {
        updateShape(id, newAttrs);
    };

    const handleSelect = (id) => {
        setSelectedId(id);
    };

    const handleDelete = () => {
        if (activeShapeId) {
            setShapes(prev => prev.filter(s => s.id !== activeShapeId));
            setSelectedId(null);
        }
    };

    // Keyboard Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                handleDelete();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeShapeId]);

    // Grid Generation Logic
    const handleGenerateGrid = () => {
        const shape = shapes.find(s => s.id === activeShapeId);
        if (!shape || shape.type !== 'rect') return;

        const rows = shape.row_count || 5;
        const cols = shape.col_count || 5;
        const padding = 10;
        const seatRadius = 6;

        const availableWidth = shape.width - (padding * 2);
        const availableHeight = shape.height - (padding * 2);

        const xStep = cols > 1 ? availableWidth / (cols - 1) : 0;
        const yStep = rows > 1 ? availableHeight / (rows - 1) : 0;

        const newSeats = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                newSeats.push({
                    id: `${shape.id}-s-${r}-${c}`,
                    x: padding + (c * xStep),
                    y: padding + (r * yStep),
                    radius: seatRadius,
                    status: 'available'
                });
            }
        }

        updateShape(activeShapeId, { seats: newSeats, is_zone: true });
        toast.success(`Generated ${newSeats.length} seats for ${shape.name}`);
    };

    const selectedShape = shapes.find(s => s.id === activeShapeId);

    return (
        <div className="relative w-screen h-screen bg-[#111] overflow-hidden">
            {/* 1. Dynamic Background Grid (CSS-based) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(#333 1px, transparent 1px),
                        linear-gradient(90deg, #333 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* 2. Main Canvas */}
            <CanvasStage
                ref={stageRef}
                shapes={shapes}
                tool={activeTool}
                selectedId={activeShapeId}
                onSelect={handleSelect}
                onShapeAdd={handleShapeAdd}
                onShapeChange={handleShapeChange}
                backgroundConfig={backgroundConfig}
            />

            {/* 3. Properties Panel (Right Sidebar) */}
            <PropertiesPanel
                selectedShape={selectedShape}
                backgroundConfig={backgroundConfig}
                onUpdate={(data) => updateShape(activeShapeId, data)}
                onUpdateBackground={setBackgroundConfig}
                onDelete={handleDelete}
                onClose={() => setSelectedId(null)}
                onGenerateGrid={handleGenerateGrid}
            />

            {/* 3. UI Overlay */}
            <Toolbar
                activeTool={activeTool}
                onSelectTool={(tool) => {
                    setActiveTool(tool);
                    if (tool !== 'select') setSelectedId(null); // Deselect when switching tools
                }}
            />

            {/* 4. Save Button (Floating) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#fac529] hover:bg-[#fac529]/90 text-black font-extrabold px-8 h-12 rounded-xl shadow-[0_0_30px_rgba(250,197,41,0.3)] min-w-[160px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />
                            SAVING...
                        </>
                    ) : (
                        "SAVE LAYOUT"
                    )}
                </Button>
            </div>

            {/* Debug Overlay */}
            <div className="absolute top-4 right-4 pointer-events-none text-white/30 text-xs font-mono">
                Royal Seat Engine v0.2
                <br />
                Shapes: {shapes.length}
                <br />
                Selected: {activeShapeId || 'None'}
                <br />
                {isConnected ? <span className="text-green-500">● LIVE</span> : <span className="text-red-500">● DISCONNECTED</span>}
            </div>
        </div>
    );
}
