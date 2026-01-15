"use client";

import { useEffect } from "react";
import useSeatEngine, { TOOL_TYPES } from "./use-seat-engine";

/**
 * Royal Seat Engine - Hotkeys Hook
 * Centralizes all keyboard shortcuts for the builder.
 */
export default function useSeatHotkeys() {
    const {
        setTool,
        clearSelection,
        deleteSelectedElement,
        copySelection,
        pasteSelection,
        nudgeElements,
        selectedIds
    } = useSeatEngine();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Skip if user is typing in an input
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

            const key = e.key.toUpperCase();
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;

            // 1. Deletion
            if (e.key === "Delete" || e.key === "Backspace") {
                deleteSelectedElement();
                return;
            }

            // 2. Clipboard Operations
            if (ctrl && key === "C") {
                copySelection();
                e.preventDefault();
                return;
            }
            if (ctrl && key === "V") {
                pasteSelection();
                e.preventDefault();
                return;
            }

            // 3. Undo/Redo
            if (ctrl && key === "Z") {
                if (shift) {
                    useSeatEngine.temporal.getState().redo();
                } else {
                    useSeatEngine.temporal.getState().undo();
                }
                e.preventDefault();
                return;
            }
            if (ctrl && key === "Y") {
                useSeatEngine.temporal.getState().redo();
                e.preventDefault();
                return;
            }

            // 4. Nudging
            const nudgeStep = shift ? 10 : 2;
            if (e.key === "ArrowLeft") {
                nudgeElements(-nudgeStep, 0);
                e.preventDefault();
            } else if (e.key === "ArrowRight") {
                nudgeElements(nudgeStep, 0);
                e.preventDefault();
            } else if (e.key === "ArrowUp") {
                nudgeElements(0, -nudgeStep);
                e.preventDefault();
            } else if (e.key === "ArrowDown") {
                nudgeElements(0, nudgeStep);
                e.preventDefault();
            }

            // 4. Tool Hotkeys
            const toolMap = {
                "V": TOOL_TYPES.SELECT,
                "R": TOOL_TYPES.RECTANGLE,
                "C": TOOL_TYPES.CIRCLE,
                "P": TOOL_TYPES.POLYGON,
                "A": TOOL_TYPES.CURVE,
                "I": TOOL_TYPES.IMAGE
            };

            if (!ctrl && toolMap[key]) {
                setTool(toolMap[key]);
                clearSelection();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        setTool, clearSelection, deleteSelectedElement,
        copySelection, pasteSelection, nudgeElements, selectedIds
    ]);
}
