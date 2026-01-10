"use client";

import React, { useState } from "react";
import { Save, Loader2, Download } from "lucide-react";
import useSeatEngine from "@/hooks/use-seat-engine";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";

import useAuthStore from "@/hooks/use-auth-store";

export default function HeaderActions() {
    const { elements, stageConfig, categories } = useSeatEngine();
    const [isSaving, setIsSaving] = useState(false);

    // Auth Token
    const { token } = useAuthStore();

    // Convex Mutation
    const saveVenueLayout = useMutation(api.events.saveVenueLayout);

    // Get Event ID from URL or Hardcoded Test ID
    const searchParams = useSearchParams();
    // Use the ID from the previous output if possible or a fallback
    // Based on truncated output, I don't have a reliable ID. I will ask user to supply it via URL.
    // Or I'll use a placeholder that clearly indicates "TEST".
    // Wait, I can try to use a hardcoded valid looking ID from the seed script logic known IDs? 
    // No, IDs are generated. I'll stick to URL param as primary, and a placeholder as fallback.
    const TEST_EVENT_ID = "Please-Use-Query-Param";
    const eventId = searchParams.get("eventId") || TEST_EVENT_ID;

    const handleBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else if (eventId && eventId !== TEST_EVENT_ID) {
            window.location.href = `/my-events/${eventId}`; // Force reload to refresh data
        } else {
            window.location.href = '/my-events';
        }
    };

    const handleSave = async () => {
        if (!eventId || eventId === TEST_EVENT_ID) {
            toast.error("Missing Event ID", {
                description: "Add ?eventId=... to the URL to save."
            });
            return;
        }

        setIsSaving(true);
        try {
            // Calculate Total Seats with Smart Logic (Phase 16)
            const totalSeats = elements.reduce((acc, el) => {
                // 1. Explicit Capacity (e.g. Tables, Specific Standing Zones)
                if (typeof el.capacity === 'number') return acc + el.capacity;
                if (el.seatConfig?.capacity) return acc + el.seatConfig.capacity; // Handle nested seatConfig capacity

                // 2. Grid Zones (Rows * Cols)
                if (el.seatConfig?.rowCount && el.seatConfig?.colCount) {
                    return acc + (el.seatConfig.rowCount * el.seatConfig.colCount);
                }

                // 3. Fallback (Single item = 1 seat)
                // We exclude non-seating structural assets if needed, but for now assumption is 0 if generic?
                // Actually user said "Fallback: 1". But we should probably ignore generic walls/stages if they don't have seats.
                // Let's check type.
                if (['RECTANGLE', 'CIRCLE', 'POLYGON', 'ELLIPSE'].includes(el.type)) {
                    // If it's a Zone but has no rows/cols, maybe it's just a shape? 
                    // If shape has no seatConfig or 0 rows, treat as 0 capacity unless specified?
                    // Valid "Seat" area = 1 fallback?
                    // Let's stick to user request: Fallback = 1.
                    return acc + 1;
                }

                // Tables usually have seatConfig or capacity.
                // If it's an ASSET with type TABLE:
                if (el.type === 'ASSET' && (el.assetType === 'TABLE' || el.assetConfig?.type === 'TABLE')) {
                    return acc + (el.seatConfig?.capacity || el.assetConfig?.defaultCapacity || 4);
                }

                return acc;
            }, 0);

            // Construct Layout Object (UPDATED: Include categories)
            const layoutData = {
                stageConfig: stageConfig,
                shapes: elements,
                categories: categories || [] // Fix: Persist global categories
            };

            console.log("Saving Layout for Event:", eventId);

            await saveVenueLayout({
                eventId: eventId,
                layout: layoutData,
                totalSeats: totalSeats,
                token: token
            });

            toast.success("Layout saved successfully!", {
                description: `Saved ${elements.length} elements with ${totalSeats} total seats.`
            });
        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Failed to save layout", {
                description: error.message
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleBack}
                className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium"
            >
                Back to Dashboard
            </button>
            <div className="w-px h-6 bg-zinc-800 mx-1"></div>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
                {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save Layout"}
            </button>
        </div>
    );
}
