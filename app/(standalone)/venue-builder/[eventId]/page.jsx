"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import Toolbar from "./_components/Toolbar";
import PropertiesPanel from "./_components/PropertiesPanel";
import { Button } from "@/components/ui/button";

// Dynamic import for SSR safety (Critical for Konva)
// We use a custom loading component to prevent layout shift
const CanvasStage = dynamic(() => import("./_components/CanvasStage"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#111] animate-pulse" />
});

export default function VenueBuilderPage() {
    const { eventId } = useParams();
    const router = useRouter();

    // Data Loading
    const event = useQuery(api.events.getById, { id: eventId });
    const saveLayout = useMutation(api.events_seating.saveVenueLayout);

    const stageRef = useRef(null);
    const [activeTool, setActiveTool] = useState("select");
    const [shapes, setShapes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [backgroundConfig, setBackgroundConfig] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- Persistence ---

    // Load Data
    React.useEffect(() => {
        if (event?.venueLayout) {
            if (event.venueLayout.shapes) setShapes(event.venueLayout.shapes);
            if (event.venueLayout.background) setBackgroundConfig(event.venueLayout.background);
        }
    }, [event]);

    // Save Data
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveLayout({
                eventId,
                layout: {
                    shapes,
                    background: backgroundConfig || undefined,
                }
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
        setShapes(prev => [...prev, shapeWithProps]);
        setSelectedId(newShape.id);
        setActiveTool("select");
    };

    const updateShape = (id, data) => {
        setShapes(prev => prev.map(shape => {
            if (shape.id !== id) return shape;

            const updatedShape = { ...shape, ...data };

            // Responsive Seating: If dimensions changed and it's a zone, regenerate grid
            if (updatedShape.is_zone && (data.width || data.height || data.row_count || data.col_count)) {
                // Determine layout
                const rows = updatedShape.row_count || 5;
                const cols = updatedShape.col_count || 5;
                const padding = 10;
                const seatRadius = 6; // Keep seat radius consistent for regeneration

                // Available space
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
                            status: existingSeat ? existingSeat.status : 'available' // Preserve status if seat existed
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
        if (selectedId) {
            setShapes(prev => prev.filter(s => s.id !== selectedId));
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
    }, [selectedId]);

    // Grid Generation Logic
    const handleGenerateGrid = () => {
        const shape = shapes.find(s => s.id === selectedId);
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

        updateShape(selectedId, { seats: newSeats, is_zone: true });
        toast.success(`Generated ${newSeats.length} seats for ${shape.name}`);
    };

    const selectedShape = shapes.find(s => s.id === selectedId);

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
                selectedId={selectedId}
                onSelect={handleSelect}
                onShapeAdd={handleShapeAdd}
                onShapeChange={handleShapeChange}
                backgroundConfig={backgroundConfig}
            />

            {/* 3. Properties Panel (Right Sidebar) */}
            <PropertiesPanel
                selectedShape={selectedShape}
                backgroundConfig={backgroundConfig}
                onUpdate={(data) => updateShape(selectedId, data)}
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
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin rounded-full mr-2" />
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
                Selected: {selectedId || 'None'}
            </div>
        </div>
    );
}
