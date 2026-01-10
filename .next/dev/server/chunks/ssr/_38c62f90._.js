module.exports = [
"[project]/hooks/use-seat-engine.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SEAT_NAMING",
    ()=>SEAT_NAMING,
    "TOOL_TYPES",
    ()=>TOOL_TYPES,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
"use client";
;
const TOOL_TYPES = {
    SELECT: "SELECT",
    RECTANGLE: "RECTANGLE",
    CIRCLE: "CIRCLE",
    POLYGON: "POLYGON",
    CURVE: "CURVE",
    IMAGE: "IMAGE",
    ASSET: "ASSET"
};
const SEAT_NAMING = {
    ALPHABETICAL: "ALPHABETICAL",
    NUMERICAL: "NUMERICAL"
};
// Generate unique IDs for elements
const generateId = ()=>`element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// Default seat configuration for Rectangle zones
const DEFAULT_SEAT_CONFIG = {
    rowCount: 5,
    colCount: 10,
    seatNaming: SEAT_NAMING.ALPHABETICAL,
    startLabel: "A",
    priceTierKey: null,
    showLabels: true,
    curvature: 0,
    categoryId: null,
    assetType: null,
    capacity: 0
};
const useSeatEngine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        // Stage configuration for Konva
        stageConfig: {
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            scale: 1
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
            showGrid: true
        },
        // Global Categories
        categories: [
            {
                id: "cat_default",
                name: "General Admission",
                color: "#D4AF37",
                price: 0
            }
        ],
        // Actions - Stage
        setStageSize: (width, height)=>set((state)=>({
                    stageConfig: {
                        ...state.stageConfig,
                        width,
                        height
                    }
                })),
        setStagePosition: (x, y, scale)=>set((state)=>({
                    stageConfig: {
                        ...state.stageConfig,
                        x,
                        y,
                        scale
                    }
                })),
        // Actions - Tools
        setTool: (tool)=>set({
                tool
            }),
        // Actions - Selection
        setSelectedIds: (ids)=>set({
                selectedIds: Array.isArray(ids) ? ids : [
                    ids
                ]
            }),
        toggleSelection: (id)=>set((state)=>({
                    selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter((currId)=>currId !== id) : [
                        ...state.selectedIds,
                        id
                    ]
                })),
        clearSelection: ()=>set({
                selectedIds: []
            }),
        selectAll: ()=>set((state)=>({
                    selectedIds: state.elements.map((el)=>el.id)
                })),
        // Clipboard for copy-paste
        clipboard: [],
        // Actions - Elements
        addElement: (element)=>set((state)=>{
                const newElement = {
                    ...element,
                    id: element.id || generateId()
                };
                // Initialize seatConfig for RECTANGLE and ASSET/IMAGE/TABLE types
                if (element.type === TOOL_TYPES.RECTANGLE || element.type === TOOL_TYPES.ASSET || element.type === TOOL_TYPES.IMAGE) {
                    newElement.seatConfig = {
                        ...DEFAULT_SEAT_CONFIG,
                        ...element.seatConfig
                    };
                }
                return {
                    elements: [
                        ...state.elements,
                        newElement
                    ]
                };
            }),
        copySelection: ()=>{
            const { elements, selectedIds } = get();
            const selectedElements = elements.filter((el)=>selectedIds.includes(el.id));
            if (selectedElements.length > 0) {
                set({
                    clipboard: JSON.parse(JSON.stringify(selectedElements))
                });
            }
        },
        pasteSelection: ()=>{
            const { clipboard } = get();
            if (clipboard.length === 0) return;
            const pastedElements = clipboard.map((el)=>({
                    ...el,
                    id: generateId(),
                    x: el.x + 20,
                    y: el.y + 20
                }));
            set((state)=>({
                    elements: [
                        ...state.elements,
                        ...pastedElements
                    ],
                    selectedIds: pastedElements.map((el)=>el.id)
                }));
            // After pasting, update clipboard with the pasted positions so subsequent pastes offset again
            set({
                clipboard: pastedElements
            });
        },
        nudgeElements: (dx, dy)=>{
            const { selectedIds } = get();
            if (selectedIds.length === 0) return;
            set((state)=>({
                    elements: state.elements.map((el)=>selectedIds.includes(el.id) ? {
                            ...el,
                            x: el.x + dx,
                            y: el.y + dy
                        } : el)
                }));
        },
        updateElement: (id, updates)=>set((state)=>{
                const targets = id ? [
                    id
                ] : state.selectedIds;
                return {
                    elements: state.elements.map((el)=>targets.includes(el.id) ? {
                            ...el,
                            ...updates
                        } : el)
                };
            }),
        updateSeatConfig: (id, configUpdates)=>set((state)=>{
                const targets = id ? [
                    id
                ] : state.selectedIds;
                return {
                    elements: state.elements.map((el)=>targets.includes(el.id) ? {
                            ...el,
                            seatConfig: {
                                ...el.seatConfig,
                                ...configUpdates
                            }
                        } : el)
                };
            }),
        deleteElement: (id)=>set((state)=>({
                    elements: state.elements.filter((el)=>el.id !== id),
                    selectedIds: state.selectedIds.filter((currId)=>currId !== id)
                })),
        deleteSelectedElement: ()=>{
            const { selectedIds, elements } = get();
            if (selectedIds.length > 0) {
                set({
                    elements: elements.filter((el)=>!selectedIds.includes(el.id)),
                    selectedIds: []
                });
            }
        },
        clearElements: ()=>set({
                elements: [],
                selectedIds: []
            }),
        // Actions - Categories
        addCategory: ({ name, price, color })=>set((state)=>({
                    categories: [
                        ...state.categories,
                        {
                            id: `cat_${Date.now()}`,
                            name,
                            price,
                            color
                        }
                    ]
                })),
        updateCategory: (id, updates)=>set((state)=>({
                    categories: state.categories.map((cat)=>cat.id === id ? {
                            ...cat,
                            ...updates
                        } : cat)
                })),
        removeCategory: (id)=>set((state)=>({
                    categories: state.categories.filter((cat)=>cat.id !== id)
                })),
        // Bulk set elements (for loading from backend) with Sanitization
        setElements: (elements)=>{
            if (!Array.isArray(elements)) return;
            const validElements = elements.filter((el)=>{
                return el && el.type && typeof el.x === 'number' && typeof el.y === 'number' && typeof el.width === 'number' && typeof el.height === 'number' && el.width > 0 && el.height > 0 && isFinite(el.x) && isFinite(el.y) && isFinite(el.width) && isFinite(el.height);
            });
            if (elements.length !== validElements.length) {
                console.warn(`[SeatEngine] Filtered out ${elements.length - validElements.length} invalid elements.`);
            }
            set({
                elements: validElements
            });
        },
        // Actions - Canvas Settings
        updateCanvasSettings: (updates)=>set((state)=>({
                    canvasSettings: {
                        ...state.canvasSettings,
                        ...updates
                    }
                })),
        // Actions - Categories
        addCategory: (category)=>set((state)=>({
                    categories: [
                        ...state.categories,
                        {
                            ...category,
                            id: `cat_${Date.now()}`
                        }
                    ]
                })),
        updateCategory: (id, updates)=>set((state)=>({
                    categories: state.categories.map((cat)=>cat.id === id ? {
                            ...cat,
                            ...updates
                        } : cat)
                })),
        deleteCategory: (id)=>set((state)=>({
                    categories: state.categories.filter((cat)=>cat.id !== id),
                    // Reset elements using this category
                    elements: state.elements.map((el)=>{
                        const newEl = {
                            ...el
                        };
                        if (el.seatConfig && el.seatConfig.categoryId === id) {
                            newEl.seatConfig = {
                                ...el.seatConfig,
                                categoryId: null
                            };
                        }
                        return newEl;
                    })
                })),
        assignCategory: (id, categoryId)=>set((state)=>({
                    elements: state.elements.map((el)=>el.id === id ? {
                            ...el,
                            seatConfig: {
                                ...el.seatConfig,
                                categoryId
                            }
                        } : el)
                })),
        // Get selected element helpers
        getSelectedElements: ()=>{
            const { elements, selectedIds } = get();
            return elements.filter((el)=>selectedIds.includes(el.id));
        },
        getSelectedIds: ()=>get().selectedIds,
        // Reset to initial state
        resetStage: ()=>set({
                stageConfig: {
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0,
                    scale: 1
                },
                tool: TOOL_TYPES.SELECT,
                elements: [],
                selectedIds: []
            })
    }));
const __TURBOPACK__default__export__ = useSeatEngine;
}),
"[project]/components/seat-engine/Toolbox.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Toolbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-2.js [app-ssr] (ecmascript) <export default as MousePointer2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-ssr] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle.js [app-ssr] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$tool$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PenTool$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-tool.js [app-ssr] (ecmascript) <export default as PenTool>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-cw.js [app-ssr] (ecmascript) <export default as RotateCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-ssr] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-engine.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/**
 * Royal Seat Engine - Toolbox Component
 * Phase 12: Advanced Tools & Assets
 */ const tools = [
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].SELECT,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"],
        label: "Select",
        shortcut: "V"
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].RECTANGLE,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"],
        label: "Rectangle",
        shortcut: "R"
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CIRCLE,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"],
        label: "Circle",
        shortcut: "C"
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$tool$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PenTool$3e$__["PenTool"],
        label: "Pen Tool",
        shortcut: "P"
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CURVE,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__["RotateCw"],
        label: "Arc Tool",
        shortcut: "A"
    },
    {
        id: "STAGE",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"],
        label: "Add Stage",
        type: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE,
        assetType: "STAGE",
        shortcut: "S"
    },
    {
        id: "EXIT",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"],
        label: "Add Exit",
        type: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE,
        assetType: "EXIT",
        shortcut: "E"
    },
    {
        id: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"],
        label: "Custom Asset",
        shortcut: "I"
    }
];
function Toolbox() {
    const { tool, setTool, clearSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    const handleToolClick = (t)=>{
        setTool(t.id);
        clearSelection();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1.5 p-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl shadow-2xl",
        children: [
            tools.map((t)=>{
                const isActive = tool === t.id;
                const Icon = t.icon;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>handleToolClick(t),
                    title: `${t.label} (Shortcut: ${t.shortcut})`,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group", isActive ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                            className: "w-5 h-5",
                            strokeWidth: isActive ? 2.5 : 2
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/Toolbox.jsx",
                            lineNumber: 93,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute left-full ml-3 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50",
                            children: [
                                t.label,
                                t.shortcut && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2 text-zinc-500 font-mono text-[10px]",
                                    children: t.shortcut
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/Toolbox.jsx",
                                    lineNumber: 98,
                                    columnNumber: 44
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/seat-engine/Toolbox.jsx",
                            lineNumber: 96,
                            columnNumber: 25
                        }, this),
                        isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-full blur-[2px]"
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/Toolbox.jsx",
                            lineNumber: 103,
                            columnNumber: 29
                        }, this)
                    ]
                }, t.id, true, {
                    fileName: "[project]/components/seat-engine/Toolbox.jsx",
                    lineNumber: 82,
                    columnNumber: 21
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-px bg-zinc-700/50 my-1 mx-1"
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/Toolbox.jsx",
                lineNumber: 110,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "py-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ElementCount, {}, void 0, false, {
                    fileName: "[project]/components/seat-engine/Toolbox.jsx",
                    lineNumber: 114,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/Toolbox.jsx",
                lineNumber: 113,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/Toolbox.jsx",
        lineNumber: 76,
        columnNumber: 9
    }, this);
}
function ElementCount() {
    const elements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((state)=>state.elements);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-[9px] text-center text-zinc-600 font-bold uppercase tracking-tighter",
        children: [
            elements.length,
            " OBJ"
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/Toolbox.jsx",
        lineNumber: 123,
        columnNumber: 9
    }, this);
}
}),
"[project]/components/seat-engine/PropertiesPanel.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PropertiesPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-ssr] (ecmascript) <export default as Grid3X3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/move.js [app-ssr] (ecmascript) <export default as Move>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-cw.js [app-ssr] (ecmascript) <export default as RotateCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-ssr] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rows-3.js [app-ssr] (ecmascript) <export default as Rows3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/columns-3.js [app-ssr] (ecmascript) <export default as Columns3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-start.js [app-ssr] (ecmascript) <export default as AlignLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$align$2d$center$2d$horizontal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenterHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/align-center-horizontal.js [app-ssr] (ecmascript) <export default as AlignCenterHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$align$2d$start$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignStartVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/align-start-vertical.js [app-ssr] (ecmascript) <export default as AlignStartVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$align$2d$center$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenterVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/align-center-vertical.js [app-ssr] (ecmascript) <export default as AlignCenterVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-engine.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function PropertiesPanel() {
    const { selectedIds, elements, updateElement, updateSeatConfig, deleteSelectedElement, clearSelection, canvasSettings, updateCanvasSettings } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    const selectedElements = elements.filter((el)=>selectedIds.includes(el.id));
    const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
    // Handle input changes with two-way binding
    const handleChange = (field, value)=>{
        if (selectedIds.length === 0) return;
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            // Apply to all selected (passing null as ID to update all in selectedIds)
            updateElement(null, {
                [field]: numValue
            });
        }
    };
    // Handle seat config changes
    const handleSeatConfigChange = (field, value)=>{
        if (selectedIds.length === 0) return;
        // Apply to all selected
        updateSeatConfig(null, {
            [field]: value
        });
    };
    // Alignment logic
    const alignElements = (direction)=>{
        if (selectedIds.length <= 1) return;
        const selected = elements.filter((el)=>selectedIds.includes(el.id));
        let targetValue;
        switch(direction){
            case 'left':
                targetValue = Math.min(...selected.map((el)=>el.x));
                updateElement(null, {
                    x: targetValue
                });
                break;
            case 'top':
                targetValue = Math.min(...selected.map((el)=>el.y));
                updateElement(null, {
                    y: targetValue
                });
                break;
            case 'center-h':
                const minX = Math.min(...selected.map((el)=>el.x));
                const maxX = Math.max(...selected.map((el)=>el.x + el.width));
                const midX = (minX + maxX) / 2;
                selected.forEach((el)=>updateElement(el.id, {
                        x: midX - el.width / 2
                    }));
                break;
            case 'center-v':
                const minY = Math.min(...selected.map((el)=>el.y));
                const maxY = Math.max(...selected.map((el)=>el.y + el.height));
                const midY = (minY + maxY) / 2;
                selected.forEach((el)=>updateElement(el.id, {
                        y: midY - el.height / 2
                    }));
                break;
        }
    };
    // If nothing selected, show canvas settings
    if (selectedIds.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-64 bg-zinc-900/90 backdrop-blur-sm border-l border-zinc-800/50 flex flex-col h-full",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-b border-zinc-800/50",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-zinc-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__["Grid3X3"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 81,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium",
                                children: "Canvas Settings"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 82,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 80,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                    lineNumber: 79,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs text-zinc-500 uppercase tracking-wider",
                                    children: "Grid Size"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                    lineNumber: 91,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    value: canvasSettings.gridSize,
                                    onChange: (e)=>updateCanvasSettings({
                                            gridSize: parseInt(e.target.value) || 20
                                        }),
                                    className: "w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                    lineNumber: 94,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                            lineNumber: 90,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs text-zinc-500 uppercase tracking-wider",
                                    children: "Show Grid"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                    lineNumber: 106,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>updateCanvasSettings({
                                            showGrid: !canvasSettings.showGrid
                                        }),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-10 h-6 rounded-full transition-colors relative", canvasSettings.showGrid ? "bg-amber-500" : "bg-zinc-700"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", canvasSettings.showGrid ? "left-5" : "left-1")
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 118,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                    lineNumber: 109,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                            lineNumber: 105,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs text-zinc-500 uppercase tracking-wider",
                                    children: "Snap to Grid"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                    lineNumber: 129,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>updateCanvasSettings({
                                            snapToGrid: !canvasSettings.snapToGrid
                                        }),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-10 h-6 rounded-full transition-colors relative", canvasSettings.snapToGrid ? "bg-amber-500" : "bg-zinc-700"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", canvasSettings.snapToGrid ? "left-5" : "left-1")
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 141,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                    lineNumber: 132,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                            lineNumber: 128,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                    lineNumber: 88,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex items-center justify-center p-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-zinc-600 text-center",
                        children: "Select one or more shapes to edit properties"
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 152,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                    lineNumber: 151,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
            lineNumber: 77,
            columnNumber: 13
        }, this);
    }
    const isBulk = selectedIds.length > 1;
    const isRectangle = selectedElement?.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].RECTANGLE;
    const seatConfig = selectedElement?.seatConfig;
    const totalSeats = seatConfig ? seatConfig.rowCount * seatConfig.colCount : 0;
    // Shape selected - show properties
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-64 bg-zinc-900/90 backdrop-blur-sm border-l border-zinc-800/50 flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-zinc-800/50 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded bg-[#D4AF37]"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 171,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-medium text-white",
                                children: isBulk ? `Bulk Edit (${selectedIds.length})` : selectedElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].RECTANGLE ? "Zone" : selectedElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CIRCLE ? "Circle" : selectedElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON ? "Polygon" : selectedElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CURVE ? "Arc" : "Asset"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 172,
                                columnNumber: 21
                            }, this),
                            !isBulk && isRectangle && seatConfig && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-zinc-500",
                                children: [
                                    "(",
                                    totalSeats,
                                    " seats)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 180,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 170,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: clearSelection,
                        className: "p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                            lineNumber: 189,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 185,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                lineNumber: 169,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-4 flex-1 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-zinc-500",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs uppercase tracking-wider",
                                    children: "Identity"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                    lineNumber: 198,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 197,
                                columnNumber: 21
                            }, this),
                            !isBulk && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] text-zinc-600 mb-1 block",
                                        children: "Name"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 204,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: selectedElement.name || "",
                                        onChange: (e)=>updateElement(selectedElement.id, {
                                                name: e.target.value
                                            }),
                                        placeholder: isRectangle ? "Section Name" : "Shape Name",
                                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 205,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 203,
                                columnNumber: 25
                            }, this),
                            isBulk && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold mb-2",
                                        children: "Align Selection"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 218,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>alignElements('left'),
                                                className: "p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300",
                                                title: "Align Left",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$start$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignLeft$3e$__["AlignLeft"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 220,
                                                    columnNumber: 172
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 220,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>alignElements('center-h'),
                                                className: "p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300",
                                                title: "Align Center (H)",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$align$2d$center$2d$horizontal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenterHorizontal$3e$__["AlignCenterHorizontal"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 221,
                                                    columnNumber: 182
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 221,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>alignElements('top'),
                                                className: "p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300",
                                                title: "Align Top",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$align$2d$start$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignStartVertical$3e$__["AlignStartVertical"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 222,
                                                    columnNumber: 170
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 222,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>alignElements('center-v'),
                                                className: "p-2 hover:bg-zinc-700 rounded transition-colors text-zinc-300",
                                                title: "Align Middle (V)",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$align$2d$center$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignCenterVertical$3e$__["AlignCenterVertical"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 223,
                                                    columnNumber: 182
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 223,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 219,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 217,
                                columnNumber: 25
                            }, this),
                            (isBulk || selectedElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].RECTANGLE || selectedElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CURVE) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold",
                                        children: isBulk ? "Bulk Category" : "Pricing Category"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 231,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: isBulk ? "" : seatConfig?.categoryId || "",
                                        onChange: (e)=>handleSeatConfigChange("categoryId", e.target.value),
                                        className: "w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none appearance-none cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: isBulk ? "Choose Category..." : "No Category (Free/GA)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 239,
                                                columnNumber: 33
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getState().categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: cat.id,
                                                    children: cat.name
                                                }, cat.id, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 241,
                                                    columnNumber: 37
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 234,
                                        columnNumber: 29
                                    }, this),
                                    !isBulk && seatConfig?.categoryId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between px-2 py-1.5 bg-zinc-900/50 rounded-md border border-zinc-800/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-zinc-500",
                                                children: "Price Tier"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 249,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-amber-500 font-bold",
                                                children: [
                                                    "$",
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getState().categories.find((c)=>c.id === seatConfig.categoryId)?.price || 0
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 250,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 248,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 230,
                                columnNumber: 25
                            }, this),
                            (selectedElement?.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].ASSET || selectedElement?.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE) && (selectedElement?.assetType === 'TABLE' || selectedElement?.assetConfig?.type === 'TABLE') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[10px] text-zinc-500 uppercase tracking-widest block font-semibold",
                                                children: "Table Capacity"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 262,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-bold text-amber-500",
                                                children: seatConfig?.capacity || 6
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 263,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 261,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: "0",
                                        max: "20",
                                        value: seatConfig?.capacity || 6,
                                        onChange: (e)=>handleSeatConfigChange("capacity", parseInt(e.target.value)),
                                        className: "w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 265,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between text-[8px] text-zinc-600 font-mono",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "0"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 274,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "10"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 275,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "20"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 276,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 273,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 260,
                                columnNumber: 25
                            }, this),
                            (selectedElement?.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE || selectedElement?.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOOL_TYPES"].ASSET) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 bg-zinc-800/30 border border-zinc-700/30 rounded-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] text-zinc-500 uppercase tracking-widest block mb-1",
                                        children: "Asset Class"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 284,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-white text-sm font-medium",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                                className: "w-4 h-4 text-amber-500"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 286,
                                                columnNumber: 33
                                            }, this),
                                            selectedElement.assetType || "Custom Asset"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 285,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 283,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[10px] text-zinc-600 mb-1 block",
                                        children: isBulk ? "Bulk Color" : "Color"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 294,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            [
                                                "#D4AF37",
                                                "#ef4444",
                                                "#f97316",
                                                "#eab308",
                                                "#22c55e",
                                                "#3b82f6",
                                                "#a855f7",
                                                "#ec4899",
                                                "#71717a"
                                            ].map((color)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>updateElement(null, {
                                                            fill: color
                                                        }),
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-6 h-6 rounded-full border transition-all", !isBulk && selectedElement.fill === color ? "border-white scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"),
                                                    style: {
                                                        backgroundColor: color
                                                    }
                                                }, color, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 309,
                                                    columnNumber: 33
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative w-6 h-6 rounded-full overflow-hidden border border-zinc-700",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "color",
                                                    value: isBulk ? "#D4AF37" : selectedElement.fill || "#D4AF37",
                                                    onChange: (e)=>updateElement(null, {
                                                            fill: e.target.value
                                                        }),
                                                    className: "absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 323,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 322,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 297,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 293,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 196,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-px bg-zinc-800/50 my-2"
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 334,
                        columnNumber: 17
                    }, this),
                    !isBulk && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-zinc-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__["Move"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 341,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs uppercase tracking-wider",
                                                children: "Position"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 342,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 340,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] text-zinc-600 mb-1 block",
                                                        children: "X"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 346,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: Math.round(selectedElement.x),
                                                        onChange: (e)=>handleChange("x", e.target.value),
                                                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 347,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 345,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] text-zinc-600 mb-1 block",
                                                        children: "Y"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 355,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: Math.round(selectedElement.y),
                                                        onChange: (e)=>handleChange("y", e.target.value),
                                                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 356,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 354,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 344,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 339,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-zinc-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 369,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs uppercase tracking-wider",
                                                children: "Size"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 370,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 368,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] text-zinc-600 mb-1 block",
                                                        children: "Width"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 374,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: Math.round(selectedElement.width),
                                                        onChange: (e)=>handleChange("width", e.target.value),
                                                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 375,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 373,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] text-zinc-600 mb-1 block",
                                                        children: "Height"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 383,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: Math.round(selectedElement.height),
                                                        onChange: (e)=>handleChange("height", e.target.value),
                                                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 384,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 382,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 372,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 367,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-zinc-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__["RotateCw"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 397,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs uppercase tracking-wider",
                                                children: "Rotation"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 398,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 396,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "range",
                                                min: "0",
                                                max: "360",
                                                value: selectedElement.rotation || 0,
                                                onChange: (e)=>handleChange("rotation", e.target.value),
                                                className: "flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 401,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-zinc-400 w-10 text-right",
                                                children: [
                                                    Math.round(selectedElement.rotation || 0),
                                                    "°"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 409,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 400,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 395,
                                columnNumber: 25
                            }, this),
                            isRectangle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-zinc-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__["RotateCw"], {
                                                className: "w-3 h-3 text-amber-500/70"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 419,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs uppercase tracking-wider",
                                                children: "Curvature (Arc)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 420,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 418,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "range",
                                                min: "0",
                                                max: "100",
                                                value: seatConfig?.curvature || 0,
                                                onChange: (e)=>handleSeatConfigChange("curvature", parseInt(e.target.value)),
                                                className: "flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 423,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-zinc-400 w-10 text-right",
                                                children: [
                                                    seatConfig?.curvature || 0,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 431,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 422,
                                        columnNumber: 33
                                    }, this),
                                    seatConfig?.curvature > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-zinc-600 italic",
                                        children: "Converts section into a radial arc"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 436,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 417,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true),
                    isRectangle && seatConfig && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-px bg-zinc-800/50 my-2"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 446,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-amber-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 450,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs uppercase tracking-wider font-medium",
                                                children: "Seating Configuration"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 451,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 449,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] text-zinc-600 mb-1 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__["Rows3"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                                lineNumber: 460,
                                                                columnNumber: 41
                                                            }, this),
                                                            " Rows"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 459,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 1,
                                                        max: 50,
                                                        value: seatConfig.rowCount,
                                                        onChange: (e)=>{
                                                            const val = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                                                            handleSeatConfigChange("rowCount", val);
                                                        },
                                                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-amber-500/30 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 462,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 458,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] text-zinc-600 mb-1 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns3$3e$__["Columns3"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                                lineNumber: 476,
                                                                columnNumber: 41
                                                            }, this),
                                                            " Columns"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 475,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: 1,
                                                        max: 50,
                                                        value: seatConfig.colCount,
                                                        onChange: (e)=>{
                                                            const val = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                                                            handleSeatConfigChange("colCount", val);
                                                        },
                                                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-amber-500/30 rounded-lg text-sm text-white focus:border-amber-500/50 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 478,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 474,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 457,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-[10px] text-zinc-600 mb-1 block",
                                                children: "Row Naming"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 494,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-2 mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleSeatConfigChange("seatNaming", __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEAT_NAMING"].ALPHABETICAL),
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-3 py-2 text-xs rounded-lg border transition-colors", seatConfig.seatNaming === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEAT_NAMING"].ALPHABETICAL ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"),
                                                        children: "A, B, C..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 498,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleSeatConfigChange("seatNaming", __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEAT_NAMING"].NUMERICAL),
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-3 py-2 text-xs rounded-lg border transition-colors", seatConfig.seatNaming === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEAT_NAMING"].NUMERICAL ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"),
                                                        children: "1, 2, 3..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 509,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 497,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] text-zinc-500 uppercase tracking-wider",
                                                        children: "Show Row Labels"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 524,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleSeatConfigChange("showLabels", !seatConfig.showLabels),
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-8 h-5 rounded-full transition-colors relative", seatConfig.showLabels ? "bg-amber-500" : "bg-zinc-700"),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute top-1 w-3 h-3 rounded-full bg-white transition-transform", seatConfig.showLabels ? "left-4" : "left-1")
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                            lineNumber: 534,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                        lineNumber: 527,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                lineNumber: 523,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 493,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-zinc-400",
                                                    children: "Total Seats"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 547,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-amber-400 font-bold",
                                                    children: totalSeats
                                                }, void 0, false, {
                                                    fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                                    lineNumber: 548,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                            lineNumber: 546,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                        lineNumber: 545,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 448,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true),
                    !isBulk && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs uppercase tracking-wider text-zinc-500",
                                children: "ID"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 558,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-2 bg-zinc-800/30 border border-zinc-700/30 rounded-lg text-xs text-zinc-500 font-mono truncate",
                                children: selectedElement.id
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 559,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 557,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                lineNumber: 194,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-zinc-800/50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: deleteSelectedElement,
                        className: "w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                                lineNumber: 572,
                                columnNumber: 21
                            }, this),
                            "Delete ",
                            isBulk ? `Selected (${selectedIds.length})` : isRectangle ? "Zone" : "Shape"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 568,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] text-zinc-600 text-center mt-2",
                        children: "Or press Delete / Backspace"
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                        lineNumber: 575,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
                lineNumber: 567,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/PropertiesPanel.jsx",
        lineNumber: 167,
        columnNumber: 9
    }, this);
}
}),
"[project]/components/seat-engine/CategoryManager.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CategoryManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-ssr] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-engine.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
/**
 * Royal Seat Engine - Category Manager
 * Phase 12: Global Pricing & Color Management
 */ const PRESET_COLORS = [
    "#D4AF37",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#ec4899"
];
function CategoryManager() {
    const { categories, addCategory, updateCategory, removeCategory } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    const [newCatName, setNewCatName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [newCatPrice, setNewCatPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(50);
    const [newCatColor, setNewCatColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(PRESET_COLORS[0]);
    const handleAddCategory = ()=>{
        if (!newCatName.trim()) return;
        addCategory({
            name: newCatName.trim(),
            price: newCatPrice,
            color: newCatColor
        });
        setNewCatName("");
        setNewCatPrice(50);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-64 bg-zinc-900/90 backdrop-blur-sm border-l border-zinc-800/50 flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-zinc-800/50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-zinc-400",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"], {
                            className: "w-4 h-4 text-amber-500"
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                            lineNumber: 46,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm font-medium",
                            children: "Pricing Categories"
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                            lineNumber: 47,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                    lineNumber: 45,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                lineNumber: 44,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 p-4 space-y-3 overflow-y-auto",
                children: categories.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-zinc-600 text-center py-4",
                    children: "No categories yet. Add one below to organize seat pricing."
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                    lineNumber: 54,
                    columnNumber: 21
                }, this) : categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-4 h-4 rounded-full border border-zinc-600",
                                                style: {
                                                    backgroundColor: cat.color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                                lineNumber: 65,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: cat.name,
                                                onChange: (e)=>updateCategory(cat.id, {
                                                        name: e.target.value
                                                    }),
                                                className: "bg-transparent text-sm text-white font-medium focus:outline-none w-24"
                                            }, void 0, false, {
                                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                                lineNumber: 69,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                        lineNumber: 64,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>removeCategory(cat.id),
                                        className: "p-1 text-zinc-500 hover:text-red-500 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                            lineNumber: 80,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                        lineNumber: 76,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                lineNumber: 63,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-zinc-500",
                                        children: "$"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                        lineNumber: 86,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        value: cat.price,
                                        onChange: (e)=>updateCategory(cat.id, {
                                                price: parseFloat(e.target.value) || 0
                                            }),
                                        className: "w-16 px-2 py-1 bg-zinc-900/50 border border-zinc-700/50 rounded text-xs text-amber-500 font-bold focus:outline-none focus:border-amber-500/50"
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                        lineNumber: 87,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                lineNumber: 85,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-1",
                                children: PRESET_COLORS.map((color)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>updateCategory(cat.id, {
                                                color
                                            }),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-5 h-5 rounded-full border transition-all", cat.color === color ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"),
                                        style: {
                                            backgroundColor: color
                                        }
                                    }, color, false, {
                                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                        lineNumber: 98,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                lineNumber: 96,
                                columnNumber: 29
                            }, this)
                        ]
                    }, cat.id, true, {
                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                        lineNumber: 59,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                lineNumber: 52,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-zinc-800/50 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[10px] text-zinc-500 uppercase tracking-wider font-semibold",
                        children: "Add New Category"
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Category Name (e.g., VIP)",
                        value: newCatName,
                        onChange: (e)=>setNewCatName(e.target.value),
                        className: "w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                        lineNumber: 121,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-zinc-500",
                                children: "Price:"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                lineNumber: 129,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                value: newCatPrice,
                                onChange: (e)=>setNewCatPrice(parseFloat(e.target.value) || 0),
                                className: "w-20 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded text-xs text-white focus:outline-none"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                lineNumber: 130,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                        lineNumber: 128,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-1",
                        children: PRESET_COLORS.map((color)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setNewCatColor(color),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-5 h-5 rounded-full border transition-all", newCatColor === color ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"),
                                style: {
                                    backgroundColor: color
                                }
                            }, color, false, {
                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                lineNumber: 139,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                        lineNumber: 137,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleAddCategory,
                        disabled: !newCatName.trim(),
                        className: "w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                                lineNumber: 157,
                                columnNumber: 21
                            }, this),
                            "Add Category"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                        lineNumber: 152,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/CategoryManager.jsx",
                lineNumber: 117,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/CategoryManager.jsx",
        lineNumber: 42,
        columnNumber: 9
    }, this);
}
}),
"[project]/constants/seat-engine-assets.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ASSET_LIBRARY",
    ()=>ASSET_LIBRARY
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2d$speaker$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MonitorSpeaker$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor-speaker.js [app-ssr] (ecmascript) <export default as MonitorSpeaker>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$martini$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Martini$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/martini.js [app-ssr] (ecmascript) <export default as Martini>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$accessibility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Accessibility$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/accessibility.js [app-ssr] (ecmascript) <export default as Accessibility>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$door$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DoorOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/door-open.js [app-ssr] (ecmascript) <export default as DoorOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$justify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignJustify$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/text-align-justify.js [app-ssr] (ecmascript) <export default as AlignJustify>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-dot.js [app-ssr] (ecmascript) <export default as CircleDot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$armchair$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Armchair$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/armchair.js [app-ssr] (ecmascript) <export default as Armchair>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$vocal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic-vocal.js [app-ssr] (ecmascript) <export default as Mic2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tv.js [app-ssr] (ecmascript) <export default as Tv>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Utensils$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/utensils.js [app-ssr] (ecmascript) <export default as Utensils>");
;
const ASSET_LIBRARY = [
    {
        type: 'STAGE',
        label: 'Main Stage',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2d$speaker$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MonitorSpeaker$3e$__["MonitorSpeaker"],
        width: 300,
        height: 150,
        color: '#D4AF37',
        description: "Primary performance area"
    },
    {
        type: 'BAR',
        label: 'Bar / Food',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$martini$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Martini$3e$__["Martini"],
        width: 120,
        height: 80,
        color: '#ec4899',
        description: "Refreshment station"
    },
    {
        type: 'RESTROOM',
        label: 'Restroom',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$accessibility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Accessibility$3e$__["Accessibility"],
        width: 80,
        height: 80,
        color: '#3b82f6',
        description: "Public facilities"
    },
    {
        type: 'EXIT',
        label: 'Emergency Exit',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$door$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DoorOpen$3e$__["DoorOpen"],
        width: 60,
        height: 40,
        color: '#ef4444',
        description: "Safety exit point"
    },
    {
        type: 'STAIRS',
        label: 'Stairs',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$text$2d$align$2d$justify$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlignJustify$3e$__["AlignJustify"],
        width: 60,
        height: 100,
        color: '#71717a',
        description: "Access stairway"
    },
    {
        type: 'PILLAR',
        label: 'Pillar (Obstructed)',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleDot$3e$__["CircleDot"],
        width: 40,
        height: 40,
        color: '#27272a',
        description: "Structural column"
    },
    {
        type: 'CONSOLE',
        label: 'Sound/Light Console',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$vocal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic2$3e$__["Mic2"],
        width: 100,
        height: 60,
        color: '#8b5cf6',
        description: "Tech control area"
    },
    {
        type: 'VIP_BOOTH',
        label: 'VIP Booth',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$armchair$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Armchair$3e$__["Armchair"],
        width: 120,
        height: 80,
        color: '#f59e0b',
        description: "Private seating area"
    },
    {
        type: 'SCREEN',
        label: 'Display Screen',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tv$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tv$3e$__["Tv"],
        width: 150,
        height: 20,
        color: '#06b6d4',
        description: "LED Wall / Projection"
    },
    {
        type: 'TABLE',
        label: 'VIP Table',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Utensils$3e$__["Utensils"],
        width: 120,
        height: 120,
        color: '#78350f',
        description: "Professional table with dynamic seating",
        defaultCapacity: 6,
        maxCapacity: 20
    }
];
}),
"[project]/components/seat-engine/AssetLibrary.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AssetLibrary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$seat$2d$engine$2d$assets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/seat-engine-assets.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function AssetLibrary() {
    const handleDragStart = (e, asset)=>{
        // We set JSON data to be retrieved on drop
        e.dataTransfer.setData("asset", JSON.stringify(asset));
        e.dataTransfer.effectAllowed = "copy";
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-zinc-900/90 flex flex-col h-full border-l border-zinc-800/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-zinc-800/50 bg-zinc-900/40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-1.5 rounded-md bg-amber-500/10 text-amber-500",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                                lineNumber: 27,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                            lineNumber: 26,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-semibold text-zinc-100 tracking-tight block",
                                    children: "Asset Library"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                                    lineNumber: 30,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] text-zinc-500",
                                    children: "Drag items to canvas"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                                    lineNumber: 31,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                            lineNumber: 29,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                    lineNumber: 25,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                lineNumber: 24,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-3",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$seat$2d$engine$2d$assets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ASSET_LIBRARY"].map((asset)=>{
                        const Icon = asset.icon;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            draggable: "true",
                            onDragStart: (e)=>handleDragStart(e, asset),
                            className: "group relative flex flex-col items-center justify-center p-4 bg-zinc-800/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/60 hover:border-amber-500/30 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-10 h-10 mb-3 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                    style: {
                                        backgroundColor: `${asset.color}20`,
                                        color: asset.color
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        className: "w-6 h-6",
                                        strokeWidth: 1.5
                                    }, void 0, false, {
                                        fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                                        lineNumber: 53,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                                    lineNumber: 49,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-medium text-zinc-300 text-center leading-tight",
                                    children: asset.label
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                                    lineNumber: 57,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden",
                                    children: asset.description
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                                    lineNumber: 62,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, asset.type, true, {
                            fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                            lineNumber: 42,
                            columnNumber: 29
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                    lineNumber: 38,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                lineNumber: 37,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-zinc-900/50 border-t border-zinc-800/50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-[10px] text-zinc-500 text-center",
                    children: "Assets are visual props and do not contain seats."
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                    lineNumber: 73,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
                lineNumber: 72,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/AssetLibrary.jsx",
        lineNumber: 22,
        columnNumber: 9
    }, this);
}
}),
"[project]/components/seat-engine/HeaderActions.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HeaderActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-ssr] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-engine.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/convex/dist/esm/react/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/convex/dist/esm/react/client.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/convex/_generated/api.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$auth$2d$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-auth-store.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
function HeaderActions() {
    const { elements, stageConfig, categories } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Auth Token
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$auth$2d$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    // Convex Mutation
    const saveVenueLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])(__TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].events.saveVenueLayout);
    // Get Event ID from URL or Hardcoded Test ID
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    // Use the ID from the previous output if possible or a fallback
    // Based on truncated output, I don't have a reliable ID. I will ask user to supply it via URL.
    // Or I'll use a placeholder that clearly indicates "TEST".
    // Wait, I can try to use a hardcoded valid looking ID from the seed script logic known IDs? 
    // No, IDs are generated. I'll stick to URL param as primary, and a placeholder as fallback.
    const TEST_EVENT_ID = "Please-Use-Query-Param";
    const eventId = searchParams.get("eventId") || TEST_EVENT_ID;
    const handleBack = ()=>{
        if (window.history.length > 2) {
            window.history.back();
        } else if (eventId && eventId !== TEST_EVENT_ID) {
            window.location.href = `/my-events/${eventId}`; // Force reload to refresh data
        } else {
            window.location.href = '/my-events';
        }
    };
    const handleSave = async ()=>{
        if (!eventId || eventId === TEST_EVENT_ID) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Missing Event ID", {
                description: "Add ?eventId=... to the URL to save."
            });
            return;
        }
        setIsSaving(true);
        try {
            // Calculate Total Seats with Smart Logic (Phase 16)
            const totalSeats = elements.reduce((acc, el)=>{
                // 1. Explicit Capacity (e.g. Tables, Specific Standing Zones)
                if (typeof el.capacity === 'number') return acc + el.capacity;
                if (el.seatConfig?.capacity) return acc + el.seatConfig.capacity; // Handle nested seatConfig capacity
                // 2. Grid Zones (Rows * Cols)
                if (el.seatConfig?.rowCount && el.seatConfig?.colCount) {
                    return acc + el.seatConfig.rowCount * el.seatConfig.colCount;
                }
                // 3. Fallback (Single item = 1 seat)
                // We exclude non-seating structural assets if needed, but for now assumption is 0 if generic?
                // Actually user said "Fallback: 1". But we should probably ignore generic walls/stages if they don't have seats.
                // Let's check type.
                if ([
                    'RECTANGLE',
                    'CIRCLE',
                    'POLYGON',
                    'ELLIPSE'
                ].includes(el.type)) {
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Layout saved successfully!", {
                description: `Saved ${elements.length} elements with ${totalSeats} total seats.`
            });
        } catch (error) {
            console.error("Save failed:", error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Failed to save layout", {
                description: error.message
            });
        } finally{
            setIsSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleBack,
                className: "px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium",
                children: "Back to Dashboard"
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/HeaderActions.jsx",
                lineNumber: 116,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-px h-6 bg-zinc-800 mx-1"
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/HeaderActions.jsx",
                lineNumber: 122,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleSave,
                disabled: isSaving,
                className: "flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20",
                children: [
                    isSaving ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-4 h-4 animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/HeaderActions.jsx",
                        lineNumber: 129,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/HeaderActions.jsx",
                        lineNumber: 131,
                        columnNumber: 21
                    }, this),
                    isSaving ? "Saving..." : "Save Layout"
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/HeaderActions.jsx",
                lineNumber: 123,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/HeaderActions.jsx",
        lineNumber: 115,
        columnNumber: 9
    }, this);
}
}),
"[project]/app/(organizer)/seat-builder/page.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SeatBuilderPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-ssr] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.js [app-ssr] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-ssr] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$Toolbox$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/seat-engine/Toolbox.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$PropertiesPanel$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/seat-engine/PropertiesPanel.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$CategoryManager$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/seat-engine/CategoryManager.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$AssetLibrary$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/seat-engine/AssetLibrary.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$HeaderActions$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/seat-engine/HeaderActions.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-engine.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/convex/dist/esm/react/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/convex/dist/esm/react/client.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/convex/_generated/api.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
// ... (CanvasStage dynamic import remains same)
const CanvasStage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/components/seat-engine/CanvasStage.jsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
function SeatBuilderPage() {
    const { elements, clearElements, selectedId, setElements, setStagePosition, resetStage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("properties"); // properties | categories
    // Convex Integration
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const eventId = searchParams.get("eventId");
    // Fetch Event Data if ID exists
    const event = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])(__TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].events.getById, eventId ? {
        id: eventId
    } : "skip");
    // Reset state on mount/unmount to prevent ghost data
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        resetStage();
        return ()=>resetStage();
    }, [
        resetStage
    ]);
    // Hydrate Store on Load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (event?.venueLayout) {
            const { shapes: savedElements, stageConfig: savedStage } = event.venueLayout;
            if (savedElements) setElements(savedElements);
            if (savedStage) setStagePosition(savedStage.x, savedStage.y, savedStage.scale);
        }
    }, [
        event,
        setElements,
        setStagePosition
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 w-screen h-screen overflow-hidden bg-zinc-950 flex flex-col z-[9999]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                    className: "w-4 h-4 text-black"
                                }, void 0, false, {
                                    fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                    lineNumber: 54,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                lineNumber: 53,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-base font-bold text-white tracking-tight",
                                        children: "Royal Seat Engine"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                        lineNumber: 57,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-zinc-500 -mt-0.5",
                                        children: "Phase 12: The Category Engine"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                        lineNumber: 60,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                lineNumber: 56,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                        lineNumber: 52,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400",
                                children: [
                                    elements.length,
                                    " elements"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                lineNumber: 68,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$HeaderActions$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                lineNumber: 71,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                        lineNumber: 67,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                lineNumber: 51,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex relative overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "absolute left-4 top-4 z-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$Toolbox$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                            lineNumber: 79,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                        lineNumber: 78,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 relative",
                        children: eventId && event === undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 flex items-center justify-center bg-zinc-950 z-50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-8 h-8 text-amber-500 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                lineNumber: 86,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                            lineNumber: 85,
                            columnNumber: 25
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CanvasStage, {}, void 0, false, {
                            fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                            lineNumber: 89,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                        lineNumber: 83,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-12 bg-zinc-950 border-l border-zinc-800/50 flex flex-col items-center py-4 gap-4 z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab("properties"),
                                        className: cn("p-2 rounded-lg transition-all", activeTab === "properties" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300"),
                                        title: "Properties",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                            lineNumber: 105,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                        lineNumber: 97,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab("categories"),
                                        className: cn("p-2 rounded-lg transition-all", activeTab === "categories" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300"),
                                        title: "Pricing Categories",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                            lineNumber: 115,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                        lineNumber: 107,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab("assets"),
                                        className: cn("p-2 rounded-lg transition-all", activeTab === "assets" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300"),
                                        title: "Asset Library",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                            lineNumber: 125,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                        lineNumber: 117,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                lineNumber: 96,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-64",
                                children: activeTab === "properties" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$PropertiesPanel$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                    lineNumber: 131,
                                    columnNumber: 55
                                }, this) : activeTab === "categories" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$CategoryManager$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                    lineNumber: 132,
                                    columnNumber: 58
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seat$2d$engine$2f$AssetLibrary$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                    lineNumber: 133,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                                lineNumber: 130,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                        lineNumber: 94,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
                lineNumber: 76,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(organizer)/seat-builder/page.jsx",
        lineNumber: 49,
        columnNumber: 9
    }, this);
}
// Helper for class merging if not already available in parent
function cn(...inputs) {
    return inputs.filter(Boolean).join(" ");
}
}),
];

//# sourceMappingURL=_38c62f90._.js.map