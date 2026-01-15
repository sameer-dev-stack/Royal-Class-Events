"use client";

import { create } from "zustand";
import { temporal } from "zundo";

/**
 * Royal Seat Engine - Zustand Store
 * Phase 14: Undo/Redo (Temporal state management)
 *
 * Manages canvas state, tools, elements, selection, and seat configuration.
 */

// Tool types for the seat engine
export const TOOL_TYPES = {
    SELECT: "SELECT",
    RECTANGLE: "RECTANGLE",
    CIRCLE: "CIRCLE",
    POLYGON: "POLYGON",
    CURVE: "CURVE",
    IMAGE: "IMAGE",
    ASSET: "ASSET",
};

// Seat naming conventions
export const SEAT_NAMING = {
    ALPHABETICAL: "ALPHABETICAL", // Row A, B, C...
    NUMERICAL: "NUMERICAL",       // Row 1, 2, 3...
};

// Generate unique IDs for elements
const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default seat configuration for Rectangle zones
const DEFAULT_SEAT_CONFIG = {
    rowCount: 5,
    colCount: 10,
    seatNaming: SEAT_NAMING.ALPHABETICAL,
    startLabel: "A",
    priceTierKey: null,
    showLabels: true,
    curvature: 0,
    categoryId: null, // Global category ID
    assetType: null, // 'STAGE' | 'EXIT' | 'CONSOLE' | 'TABLE'
    capacity: 0,      // For Tables (0-20)
};

const useSeatEngine = create(temporal((set, get) => ({
    // Stage configuration for Konva
    stageConfig: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        scale: 1,
    },

    // Current active tool
    tool: TOOL_TYPES.SELECT,

    // Elements array (seats, shapes, etc.)
    elements: [],

    // Selected element IDs
    selectedIds: [],

    // Canvas settings
    canvasSettings: {
        gridSize: 20,
        snapToGrid: false,
        showGrid: true,
    },

    // Global Categories
    categories: [
        { id: "cat_default", name: "General Admission", color: "#D4AF37", price: 0 }
    ],

    // Actions - Stage
    setStageSize: (width, height) =>
        set((state) => ({
            stageConfig: {
                ...state.stageConfig,
                width,
                height,
            },
        })),

    setStagePosition: (x, y, scale) =>
        set((state) => ({
            stageConfig: {
                ...state.stageConfig,
                x,
                y,
                scale,
            },
        })),

    // Actions - Tools
    setTool: (tool) => set({ tool }),

    // Actions - Selection
    setSelectedIds: (ids) => set({ selectedIds: Array.isArray(ids) ? ids : [ids] }),
    toggleSelection: (id) =>
        set((state) => ({
            selectedIds: state.selectedIds.includes(id)
                ? state.selectedIds.filter((currId) => currId !== id)
                : [...state.selectedIds, id],
        })),
    clearSelection: () => set({ selectedIds: [] }),
    selectAll: () => set((state) => ({ selectedIds: state.elements.map(el => el.id) })),

    // Clipboard for copy-paste
    clipboard: [],

    // Actions - Elements
    addElement: (element) =>
        set((state) => {
            const newElement = {
                ...element,
                id: element.id || generateId(),
            };

            // Initialize seatConfig for RECTANGLE and ASSET/IMAGE/TABLE types
            if (element.type === TOOL_TYPES.RECTANGLE || element.type === TOOL_TYPES.ASSET || element.type === TOOL_TYPES.IMAGE) {
                newElement.seatConfig = {
                    ...DEFAULT_SEAT_CONFIG,
                    ...element.seatConfig,
                };
            }

            return {
                elements: [...state.elements, newElement],
            };
        }),

    copySelection: () => {
        const { elements, selectedIds } = get();
        const selectedElements = elements.filter(el => selectedIds.includes(el.id));
        if (selectedElements.length > 0) {
            set({ clipboard: JSON.parse(JSON.stringify(selectedElements)) });
        }
    },

    pasteSelection: () => {
        const { clipboard } = get();
        if (clipboard.length === 0) return;

        const pastedElements = clipboard.map(el => ({
            ...el,
            id: generateId(),
            x: el.x + 20,
            y: el.y + 20
        }));

        set((state) => ({
            elements: [...state.elements, ...pastedElements],
            selectedIds: pastedElements.map(el => el.id)
        }));

        // After pasting, update clipboard with the pasted positions so subsequent pastes offset again
        set({ clipboard: pastedElements });
    },

    nudgeElements: (dx, dy) => {
        const { selectedIds } = get();
        if (selectedIds.length === 0) return;
        set((state) => ({
            elements: state.elements.map(el =>
                selectedIds.includes(el.id)
                    ? { ...el, x: el.x + dx, y: el.y + dy }
                    : el
            )
        }));
    },

    updateElement: (id, updates) =>
        set((state) => {
            const targets = id ? [id] : state.selectedIds;
            return {
                elements: state.elements.map((el) =>
                    targets.includes(el.id) ? { ...el, ...updates } : el
                ),
            };
        }),

    updateSeatConfig: (id, configUpdates) =>
        set((state) => {
            const targets = id ? [id] : state.selectedIds;
            return {
                elements: state.elements.map((el) =>
                    targets.includes(el.id)
                        ? {
                            ...el,
                            seatConfig: {
                                ...el.seatConfig,
                                ...configUpdates,
                            },
                        }
                        : el
                ),
            };
        }),

    deleteElement: (id) =>
        set((state) => ({
            elements: state.elements.filter((el) => el.id !== id),
            selectedIds: state.selectedIds.filter((currId) => currId !== id),
        })),

    deleteSelectedElement: () => {
        const { selectedIds, elements } = get();
        if (selectedIds.length > 0) {
            set({
                elements: elements.filter(el => !selectedIds.includes(el.id)),
                selectedIds: []
            });
        }
    },

    clearElements: () => set({ elements: [], selectedIds: [] }),

    // Actions - Categories
    addCategory: ({ name, price, color }) =>
        set((state) => ({
            categories: [
                ...state.categories,
                { id: `cat_${Date.now()}`, name, price, color }
            ]
        })),

    updateCategory: (id, updates) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === id ? { ...cat, ...updates } : cat
            )
        })),

    removeCategory: (id) =>
        set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id)
        })),


    // Bulk set elements (for loading from backend) with Sanitization
    setElements: (elements) => {
        if (!Array.isArray(elements)) return;

        const validElements = elements.filter(el => {
            return (
                el &&
                el.type &&
                typeof el.x === 'number' && typeof el.y === 'number' &&
                typeof el.width === 'number' && typeof el.height === 'number' &&
                el.width > 0 && el.height > 0 &&
                isFinite(el.x) && isFinite(el.y) && isFinite(el.width) && isFinite(el.height)
            );
        });

        if (elements.length !== validElements.length) {
            console.warn(`[SeatEngine] Filtered out ${elements.length - validElements.length} invalid elements.`);
        }

        set({ elements: validElements });
    },

    // Actions - Canvas Settings
    updateCanvasSettings: (updates) =>
        set((state) => ({
            canvasSettings: { ...state.canvasSettings, ...updates },
        })),

    // Actions - Categories
    addCategory: (category) =>
        set((state) => ({
            categories: [...state.categories, { ...category, id: `cat_${Date.now()}` }],
        })),

    updateCategory: (id, updates) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat.id === id ? { ...cat, ...updates } : cat
            ),
        })),

    deleteCategory: (id) =>
        set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
            // Reset elements using this category
            elements: state.elements.map((el) => {
                const newEl = { ...el };
                if (el.seatConfig && el.seatConfig.categoryId === id) {
                    newEl.seatConfig = { ...el.seatConfig, categoryId: null };
                }
                return newEl;
            }),
        })),

    assignCategory: (id, categoryId) =>
        set((state) => ({
            elements: state.elements.map((el) =>
                el.id === id
                    ? {
                        ...el,
                        seatConfig: {
                            ...el.seatConfig,
                            categoryId,
                        },
                    }
                    : el
            ),
        })),

    // Get selected element helpers
    getSelectedElements: () => {
        const { elements, selectedIds } = get();
        return elements.filter((el) => selectedIds.includes(el.id));
    },

    getSelectedIds: () => get().selectedIds,

    // Reset to initial state
    resetStage: () =>
        set({
            stageConfig: {
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                scale: 1,
            },
            tool: TOOL_TYPES.SELECT,
            elements: [],
            selectedIds: [],
        }),
})));

export default useSeatEngine;
