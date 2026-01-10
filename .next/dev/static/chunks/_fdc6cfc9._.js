(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/hooks/use-seat-hotkeys.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useSeatHotkeys
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-engine.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useSeatHotkeys() {
    _s();
    const { setTool, clearSelection, deleteSelectedElement, copySelection, pasteSelection, nudgeElements, selectedIds } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSeatHotkeys.useEffect": ()=>{
            const handleKeyDown = {
                "useSeatHotkeys.useEffect.handleKeyDown": (e)=>{
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
                    // 3. Nudging
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
                        "V": __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].SELECT,
                        "R": __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].RECTANGLE,
                        "C": __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CIRCLE,
                        "P": __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON,
                        "A": __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CURVE,
                        "I": __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE
                    };
                    if (!ctrl && toolMap[key]) {
                        setTool(toolMap[key]);
                        clearSelection();
                    }
                }
            }["useSeatHotkeys.useEffect.handleKeyDown"];
            window.addEventListener("keydown", handleKeyDown);
            return ({
                "useSeatHotkeys.useEffect": ()=>window.removeEventListener("keydown", handleKeyDown)
            })["useSeatHotkeys.useEffect"];
        }
    }["useSeatHotkeys.useEffect"], [
        setTool,
        clearSelection,
        deleteSelectedElement,
        copySelection,
        pasteSelection,
        nudgeElements,
        selectedIds
    ]);
}
_s(useSeatHotkeys, "u9IKkyZ9DomixfeSgPMdT9oj+7Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/geometry.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Royal Seat Engine - Geometry Utilities
 * Phase 11: Curved Layouts
 */ /**
 * Calculates X/Y position for a point on an arc
 * @param {number} centerX 
 * @param {number} centerY 
 * @param {number} radius 
 * @param {number} angleInDegrees 
 */ __turbopack_context__.s([
    "calculateArcPosition",
    ()=>calculateArcPosition,
    "generateArcSeats",
    ()=>generateArcSeats
]);
const calculateArcPosition = (centerX, centerY, radius, angleInDegrees)=>{
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180); // Adjusted to start from top
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
    };
};
const generateArcSeats = ({ centerX, centerY, radius, startAngle, endAngle, seatCount, spacing = 1 })=>{
    const seats = [];
    if (seatCount <= 0) return seats;
    // Angle step
    const totalAngle = endAngle - startAngle;
    const step = seatCount > 1 ? totalAngle / (seatCount - 1) : 0;
    for(let i = 0; i < seatCount; i++){
        const angle = startAngle + step * i;
        const pos = calculateArcPosition(centerX, centerY, radius, angle);
        seats.push({
            ...pos,
            angle,
            id: `seat-${i}`
        });
    }
    return seats;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/seat-engine/CanvasStage.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CanvasStage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonva$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-konva/es/ReactKonva.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-konva/es/ReactKonvaCore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-engine.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$hotkeys$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-seat-hotkeys.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$geometry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/geometry.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
/**
 * Royal Seat Engine - Canvas Stage Component
 * Phase 11: Curves, LOD & Assets
 */ // Scale constraints
const MIN_SCALE = 0.05;
const MAX_SCALE = 5;
const SCALE_FACTOR = 1.1;
// Colors
const ZONE_FILL_DEFAULT = "#D4AF37";
const ZONE_OPACITY = 0.15;
const LOD_OPACITY = 0.8; // High opacity for zoomed out blocks
const SEAT_FILL_DEFAULT = "#52525b"; // Fallback zinc
const GHOST_OPACITY = 0.5;
const SNAP_RADIUS = 15;
// Zone padding
const ZONE_PADDING = 10;
const TITLE_HEIGHT = 20;
const LABEL_WIDTH = 25;
// LOD Threshold
const LOD_THRESHOLD = 0.4;
/**
 * Helper to generate row label text
 */ function getRowLabel(index, namingType) {
    if (namingType === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEAT_NAMING"].NUMERICAL) return (index + 1).toString();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (index < 26) return letters[index];
    const first = Math.floor(index / 26) - 1;
    const second = index % 26;
    return letters[first] + letters[second];
}
/**
 * Render seat grid or arc inside a zone
 */ function renderSeats(element, scale) {
    const { seatConfig, width, height, fill } = element;
    if (!seatConfig) return null;
    const { rowCount, colCount, seatNaming, showLabels, curvature = 0, categoryId } = seatConfig;
    const seats = [];
    // Derive category color
    const categories = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().categories;
    const category = categories.find((c)=>c.id === categoryId);
    const seatColor = category ? category.color : fill || SEAT_FILL_DEFAULT;
    // LOD: Skip rendering seats if zoomed out
    if (scale < LOD_THRESHOLD) return null;
    if (!rowCount || rowCount <= 0 || !colCount || colCount <= 0) return null;
    const labelSpace = showLabels ? LABEL_WIDTH : 0;
    // --- CURVED LOGIC ---
    if (curvature > 0) {
        // We Use Radian Math for Arcs
        // centerX is middle of width, centerY is far above depending on curvature
        const arcWidth = width - labelSpace;
        const centerX = labelSpace + arcWidth / 2;
        // Radius based on curvature (Higher curvature = Smaller radius = Deeper curve)
        // 100% curvature = semicircleish. 0% = straight.
        const baseRadius = arcWidth * 100 / curvature;
        const centerY = -baseRadius + height / 2;
        const totalAngle = arcWidth / baseRadius * (180 / Math.PI);
        const startAngle = -totalAngle / 2;
        for(let row = 0; row < rowCount; row++){
            const currentRadius = baseRadius + row * (height / rowCount);
            const step = totalAngle / Math.max(1, colCount - 1);
            for(let col = 0; col < colCount; col++){
                const angle = startAngle + col * step;
                const pos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$geometry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateArcPosition"])(centerX, centerY, currentRadius, angle);
                seats.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                    x: pos.x,
                    y: pos.y,
                    radius: Math.min(10, 100 / colCount),
                    fill: seatColor,
                    listening: false
                }, `seat-${row}-${col}`, false, {
                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                    lineNumber: 93,
                    columnNumber: 21
                }, this));
            }
        }
        return seats;
    }
    // --- STANDARD GRID LOGIC ---
    const availableWidth = width - ZONE_PADDING * 2 - labelSpace;
    const availableHeight = height - ZONE_PADDING * 2 - TITLE_HEIGHT;
    if (availableWidth <= 0 || availableHeight <= 0) return null;
    const cellWidth = availableWidth / colCount;
    const cellHeight = availableHeight / rowCount;
    const seatRadius = Math.max(3, Math.min(cellWidth, cellHeight) / 3);
    for(let row = 0; row < rowCount; row++){
        const y = ZONE_PADDING + TITLE_HEIGHT + cellHeight / 2 + row * cellHeight;
        if (showLabels) {
            seats.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                x: ZONE_PADDING,
                y: y - 6,
                text: getRowLabel(row, seatNaming),
                fontSize: 10,
                fontStyle: "bold",
                fill: fill || "#D4AF37",
                width: LABEL_WIDTH,
                align: "center",
                listening: false
            }, `label-${row}`, false, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 121,
                columnNumber: 17
            }, this));
        }
        for(let col = 0; col < colCount; col++){
            const x = ZONE_PADDING + labelSpace + cellWidth / 2 + col * cellWidth;
            seats.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                x: x,
                y: y,
                radius: seatRadius,
                fill: seatColor,
                listening: false
            }, `seat-${row}-${col}`, false, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 134,
                columnNumber: 17
            }, this));
        }
    }
    return seats;
}
/**
 * Universal Multi-Element Transformer
 */ function MultiTransformer({ selectedIds }) {
    _s();
    const transformerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MultiTransformer.useEffect": ()=>{
            if (transformerRef.current) {
                const stage = transformerRef.current.getStage();
                const nodes = selectedIds.map({
                    "MultiTransformer.useEffect.nodes": (id)=>stage.findOne({
                            "MultiTransformer.useEffect.nodes": (node)=>node.name() === id || node.id() === id
                        }["MultiTransformer.useEffect.nodes"])
                }["MultiTransformer.useEffect.nodes"]).filter(Boolean);
                // For Konva Groups, we often use name or custom attr to find them
                // In our elements, we should add 'id' attribute to the Group
                const elementNodes = stage.find('.element-group').filter({
                    "MultiTransformer.useEffect.elementNodes": (node)=>selectedIds.includes(node.id())
                }["MultiTransformer.useEffect.elementNodes"]);
                transformerRef.current.nodes(elementNodes);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }["MultiTransformer.useEffect"], [
        selectedIds
    ]);
    if (selectedIds.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Transformer"], {
        ref: transformerRef,
        rotateEnabled: true,
        anchorSize: 8,
        anchorCornerRadius: 2,
        borderStroke: "#D4AF37",
        anchorStroke: "#D4AF37",
        rotateAnchorOffset: 25,
        boundBoxFunc: (oldBox, newBox)=>{
            // Minimum size
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
            }
            return newBox;
        }
    }, void 0, false, {
        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
        lineNumber: 164,
        columnNumber: 9
    }, this);
}
_s(MultiTransformer, "mO6IZWK1L2ni55pv4GZeBaAiXUg=");
_c = MultiTransformer;
// Visual Asset Element
function AssetElement({ element, isSelected, onSelect, onChange }) {
    _s1();
    const shapeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // We use assetType to render specific graphics
    const renderAssetGraphic = ()=>{
        const { assetConfig, width, height } = element;
        // Prioritize element.fill (user's manual color choice) over default asset color
        const color = element.fill || assetConfig?.color || "#555";
        // Table specific rendering
        if (assetConfig?.type === 'TABLE' || element.assetType === 'TABLE') {
            const capacity = element.seatConfig?.capacity || assetConfig?.defaultCapacity || 6;
            // Prioritize element.fill (user's manual color choice) over default asset color
            const tableColor = element.fill || assetConfig?.color || "#78350f";
            const chairs = [];
            const radius = Math.min(width, height) / 2;
            const chairRadius = radius / 4;
            for(let i = 0; i < capacity; i++){
                const angle = i / capacity * 2 * Math.PI;
                const x = width / 2 + Math.cos(angle) * (radius + chairRadius / 2);
                const y = height / 2 + Math.sin(angle) * (radius + chairRadius / 2);
                chairs.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                    x: x,
                    y: y,
                    radius: chairRadius,
                    fill: "#3f3f46",
                    stroke: tableColor,
                    strokeWidth: 1,
                    listening: false
                }, `chair-${i}`, false, {
                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                    lineNumber: 207,
                    columnNumber: 21
                }, this));
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                        x: width / 2 + 2,
                        y: height / 2 + 2,
                        radius: radius,
                        fill: "black",
                        opacity: 0.2,
                        listening: false
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                        lineNumber: 222,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                        x: width / 2,
                        y: height / 2,
                        radius: radius,
                        fill: tableColor,
                        stroke: "#451a03",
                        strokeWidth: 2,
                        shadowBlur: 5,
                        shadowOpacity: 0.5
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                        lineNumber: 230,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                        x: width / 2,
                        y: height / 2,
                        radius: radius * 0.85,
                        stroke: "#451a03",
                        strokeWidth: 1,
                        opacity: 0.3,
                        listening: false
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                        lineNumber: 240,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                        x: width / 2,
                        y: height / 2,
                        radius: 2,
                        fill: "#451a03",
                        opacity: 0.5,
                        listening: false
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                        lineNumber: 249,
                        columnNumber: 21
                    }, this),
                    chairs,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                        text: `${capacity}`,
                        width: width,
                        height: height,
                        align: "center",
                        verticalAlign: "middle",
                        fill: "white",
                        fontStyle: "bold",
                        fontSize: radius / 2,
                        opacity: 0.9,
                        listening: false
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                        lineNumber: 259,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 220,
                columnNumber: 17
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"], {
                    width: width,
                    height: height,
                    fill: `${color}40`,
                    stroke: color,
                    strokeWidth: 2,
                    cornerRadius: 4,
                    dash: element.type === "PILLAR" ? undefined : [
                        5,
                        2
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                    lineNumber: 273,
                    columnNumber: 17
                }, this),
                (assetConfig?.type === "STAGE" || assetConfig?.type === "CONSOLE") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                            points: [
                                0,
                                0,
                                width,
                                height
                            ],
                            stroke: color,
                            strokeWidth: 1,
                            opacity: 0.3
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                            lineNumber: 286,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                            points: [
                                width,
                                0,
                                0,
                                height
                            ],
                            stroke: color,
                            strokeWidth: 1,
                            opacity: 0.3
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                            lineNumber: 287,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                    text: element.name || assetConfig?.label || "ASSET",
                    width: width,
                    height: height,
                    align: "center",
                    verticalAlign: "middle",
                    fill: "#fff",
                    fontStyle: "bold",
                    fontSize: Math.max(10, Math.min(width, height) / 5),
                    padding: 5
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                    lineNumber: 292,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
            lineNumber: 272,
            columnNumber: 13
        }, this);
    };
    // Removed individual transformer logic in favor of MultiTransformer
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
            id: element.id,
            name: "element-group",
            ref: shapeRef,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            rotation: element.rotation || 0,
            draggable: true,
            onClick: onSelect,
            onTap: onSelect,
            onDragStart: (e)=>{
                // Seamless drag: if not selected, select it first
                if (!isSelected) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().setSelectedIds([
                        element.id
                    ]);
                }
                // Store initial positions for all selected elements
                const stage = e.target.getStage();
                const currentSelectedIds = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().selectedIds;
                const allElements = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().elements;
                // Include the current element if it wasn't selected before
                const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [
                    element.id
                ];
                stage._draggedNodes = allElements.filter((el)=>targetIds.includes(el.id)).map((el)=>({
                        id: el.id,
                        x: el.x,
                        y: el.y
                    }));
                stage._dragStartPos = {
                    x: e.target.x(),
                    y: e.target.y()
                };
            },
            onDragMove: (e)=>{
                const stage = e.target.getStage();
                if (!stage._dragStartPos) return;
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;
                // Visual update for other selected elements
                stage.find('.element-group').forEach((node)=>{
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find((d)=>d.id === node.id());
                    if (stored) {
                        node.position({
                            x: stored.x + dx,
                            y: stored.y + dy
                        });
                    }
                });
            },
            onDragEnd: (e)=>{
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y()
                    });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;
                // Update all dragged elements in store
                stage._draggedNodes?.forEach((d)=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().updateElement(d.id, {
                        x: d.x + dx,
                        y: d.y + dy
                    });
                });
                delete stage._draggedNodes;
                delete stage._dragStartPos;
            },
            onTransformEnd: ()=>{
                const node = shapeRef.current;
                onChange({
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(20, node.width() * node.scaleX()),
                    height: Math.max(20, node.height() * node.scaleY()),
                    rotation: node.rotation()
                });
                node.scaleX(1);
                node.scaleY(1);
            },
            children: renderAssetGraphic()
        }, void 0, false, {
            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
            lineNumber: 311,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_s1(AssetElement, "raDOGb0uFMyxcrqhYe6Uarke3Ek=");
_c1 = AssetElement;
// Zone component with LOD
function ZoneElement({ element, isSelected, onSelect, onChange, scale }) {
    _s2();
    const groupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Removed individual transformer logic
    const categories = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().categories;
    const category = categories.find((c)=>c.id === element.seatConfig?.categoryId);
    const fillColor = category ? category.color : element.fill || ZONE_FILL_DEFAULT;
    const isLowDetail = scale < LOD_THRESHOLD;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
            id: element.id,
            name: "element-group",
            ref: groupRef,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            rotation: element.rotation || 0,
            draggable: true,
            onClick: onSelect,
            onTap: onSelect,
            onDragStart: (e)=>{
                // Seamless drag: if not selected, select it first
                if (!isSelected) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().setSelectedIds([
                        element.id
                    ]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().selectedIds;
                const allElements = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().elements;
                const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [
                    element.id
                ];
                stage._draggedNodes = allElements.filter((el)=>targetIds.includes(el.id)).map((el)=>({
                        id: el.id,
                        x: el.x,
                        y: el.y
                    }));
                stage._dragStartPos = {
                    x: e.target.x(),
                    y: e.target.y()
                };
            },
            onDragMove: (e)=>{
                const stage = e.target.getStage();
                if (!stage._dragStartPos) return;
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;
                stage.find('.element-group').forEach((node)=>{
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find((d)=>d.id === node.id());
                    if (stored) node.position({
                        x: stored.x + dx,
                        y: stored.y + dy
                    });
                });
            },
            onDragEnd: (e)=>{
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y()
                    });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;
                stage._draggedNodes?.forEach((d)=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().updateElement(d.id, {
                        x: d.x + dx,
                        y: d.y + dy
                    });
                });
                delete stage._draggedNodes;
                delete stage._dragStartPos;
            },
            onTransformEnd: ()=>{
                const node = groupRef.current;
                onChange({
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(20, node.width() * node.scaleX()),
                    height: Math.max(20, node.height() * node.scaleY()),
                    rotation: node.rotation()
                });
                node.scaleX(1);
                node.scaleY(1);
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"], {
                    width: element.width,
                    height: element.height,
                    fill: fillColor,
                    opacity: isLowDetail ? LOD_OPACITY : ZONE_OPACITY,
                    cornerRadius: isLowDetail ? 4 : 8,
                    stroke: isSelected ? "#D4AF37" : fillColor,
                    strokeWidth: isSelected ? 3 : 1
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                    lineNumber: 465,
                    columnNumber: 17
                }, this),
                isLowDetail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                    text: element.name?.toUpperCase() || "ZONE",
                    width: element.width,
                    height: element.height,
                    fontSize: Math.min(element.width, element.height) / 4,
                    fontStyle: "bold",
                    fill: "white",
                    align: "center",
                    verticalAlign: "middle",
                    listening: false
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                    lineNumber: 475,
                    columnNumber: 21
                }, this),
                !isLowDetail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        element.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                            x: 0,
                            y: 5,
                            width: element.width,
                            text: element.name,
                            fontSize: 12,
                            fontStyle: "bold",
                            fill: isSelected ? "#fff" : fillColor,
                            align: "center",
                            listening: false
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                            lineNumber: 486,
                            columnNumber: 29
                        }, this),
                        renderSeats(element, scale)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
            lineNumber: 403,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_s2(ZoneElement, "PnfuaQLrpH5YTV5484E1LZLgA0Q=");
_c2 = ZoneElement;
// Circle element
function CircleElement({ element, isSelected, onSelect, onChange }) {
    _s3();
    const shapeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fillColor = element.fill || ZONE_FILL_DEFAULT;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        id: element.id,
        name: "element-group",
        ref: shapeRef,
        x: element.x,
        y: element.y,
        draggable: true,
        onClick: onSelect,
        onDragStart: (e)=>{
            if (!isSelected) {
                __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().setSelectedIds([
                    element.id
                ]);
            }
            const stage = e.target.getStage();
            const currentSelectedIds = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().selectedIds;
            const allElements = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().elements;
            const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [
                element.id
            ];
            stage._draggedNodes = allElements.filter((el)=>targetIds.includes(el.id)).map((el)=>({
                    id: el.id,
                    x: el.x,
                    y: el.y
                }));
            stage._dragStartPos = {
                x: e.target.x(),
                y: e.target.y()
            };
        },
        onDragMove: (e)=>{
            const stage = e.target.getStage();
            if (!stage._dragStartPos) return;
            const dx = e.target.x() - stage._dragStartPos.x;
            const dy = e.target.y() - stage._dragStartPos.y;
            stage.find('.element-group').forEach((node)=>{
                if (node === e.target) return;
                const stored = stage._draggedNodes?.find((d)=>d.id === node.id());
                if (stored) node.position({
                    x: stored.x + dx,
                    y: stored.y + dy
                });
            });
        },
        onDragEnd: (e)=>{
            const stage = e.target.getStage();
            if (!stage._dragStartPos) {
                onChange({
                    x: e.target.x(),
                    y: e.target.y()
                });
                return;
            }
            const dx = e.target.x() - stage._dragStartPos.x;
            const dy = e.target.y() - stage._dragStartPos.y;
            stage._draggedNodes?.forEach((d)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().updateElement(d.id, {
                    x: d.x + dx,
                    y: d.y + dy
                });
            });
            delete stage._draggedNodes;
            delete stage._dragStartPos;
        },
        onTransformEnd: ()=>{
            const node = shapeRef.current;
            const scale = Math.max(node.scaleX(), node.scaleY());
            onChange({
                x: node.x(),
                y: node.y(),
                width: element.width * scale,
                height: element.height * scale
            });
            node.scaleX(1);
            node.scaleY(1);
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
            x: element.width / 2,
            y: element.height / 2,
            radius: element.width / 2,
            fill: fillColor,
            opacity: ZONE_OPACITY,
            stroke: isSelected ? "#D4AF37" : fillColor,
            strokeWidth: isSelected ? 2 : 1
        }, void 0, false, {
            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
            lineNumber: 552,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
        lineNumber: 501,
        columnNumber: 9
    }, this);
}
_s3(CircleElement, "raDOGb0uFMyxcrqhYe6Uarke3Ek=");
_c3 = CircleElement;
function PolygonElement({ element, isSelected, onSelect, onChange }) {
    _s4();
    const shapeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fillColor = element.fill || ZONE_FILL_DEFAULT;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        id: element.id,
        name: "element-group",
        ref: shapeRef,
        x: element.x,
        y: element.y,
        draggable: true,
        onClick: onSelect,
        onDragStart: (e)=>{
            if (!isSelected) {
                __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().setSelectedIds([
                    element.id
                ]);
            }
            const stage = e.target.getStage();
            const currentSelectedIds = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().selectedIds;
            const allElements = __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().elements;
            const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [
                element.id
            ];
            stage._draggedNodes = allElements.filter((el)=>targetIds.includes(el.id)).map((el)=>({
                    id: el.id,
                    x: el.x,
                    y: el.y
                }));
            stage._dragStartPos = {
                x: e.target.x(),
                y: e.target.y()
            };
        },
        onDragMove: (e)=>{
            const stage = e.target.getStage();
            if (!stage._dragStartPos) return;
            const dx = e.target.x() - stage._dragStartPos.x;
            const dy = e.target.y() - stage._dragStartPos.y;
            stage.find('.element-group').forEach((node)=>{
                if (node === e.target) return;
                const stored = stage._draggedNodes?.find((d)=>d.id === node.id());
                if (stored) node.position({
                    x: stored.x + dx,
                    y: stored.y + dy
                });
            });
        },
        onDragEnd: (e)=>{
            const stage = e.target.getStage();
            if (!stage._dragStartPos) {
                onChange({
                    x: e.target.x(),
                    y: e.target.y()
                });
                return;
            }
            const dx = e.target.x() - stage._dragStartPos.x;
            const dy = e.target.y() - stage._dragStartPos.y;
            stage._draggedNodes?.forEach((d)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().updateElement(d.id, {
                    x: d.x + dx,
                    y: d.y + dy
                });
            });
            delete stage._draggedNodes;
            delete stage._dragStartPos;
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                points: element.points || [],
                closed: true,
                fill: fillColor,
                opacity: ZONE_OPACITY,
                stroke: isSelected ? "#D4AF37" : fillColor,
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 606,
                columnNumber: 13
            }, this),
            element.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                text: element.name.toUpperCase(),
                x: element.points ? (Math.min(...element.points.filter((_, i)=>i % 2 === 0)) + Math.max(...element.points.filter((_, i)=>i % 2 === 0))) / 2 - 50 : 0,
                y: element.points ? (Math.min(...element.points.filter((_, i)=>i % 2 === 1)) + Math.max(...element.points.filter((_, i)=>i % 2 === 1))) / 2 - 10 : 0,
                width: 100,
                align: "center",
                fontSize: 14,
                fontStyle: "bold",
                fill: fillColor,
                opacity: 0.6,
                letterSpacing: 1,
                listening: false
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 608,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
        lineNumber: 561,
        columnNumber: 9
    }, this);
}
_s4(PolygonElement, "raDOGb0uFMyxcrqhYe6Uarke3Ek=");
_c4 = PolygonElement;
function CanvasStage() {
    _s5();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const stageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { stageConfig, setStageSize, setStagePosition, tool, setTool, elements, addElement, updateElement, selectedIds, setSelectedIds, toggleSelection, clearSelection, deleteSelectedElement, canvasSettings } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const [isDrawing, setIsDrawing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSelecting, setIsSelecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectionBox, setSelectionBox] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    });
    const [drawStart, setDrawStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [newElement, setNewElement] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [polyPoints, setPolyPoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [mousePos, setMousePos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CanvasStage.useEffect": ()=>{
            const updateSize = {
                "CanvasStage.useEffect.updateSize": ()=>{
                    if (!containerRef.current) return;
                    const { width, height } = containerRef.current.getBoundingClientRect();
                    setStageSize(width, height);
                }
            }["CanvasStage.useEffect.updateSize"];
            const resizeObserver = new ResizeObserver(updateSize);
            if (containerRef.current) resizeObserver.observe(containerRef.current);
            updateSize();
            return ({
                "CanvasStage.useEffect": ()=>resizeObserver.disconnect()
            })["CanvasStage.useEffect"];
        }
    }["CanvasStage.useEffect"], [
        setStageSize
    ]);
    // Integrated Keyboard Shortcuts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$hotkeys$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const getRelativePos = ()=>{
        const stage = stageRef.current;
        if (!stage) return null;
        const pointer = stage.getPointerPosition();
        if (!pointer) return null;
        return {
            x: (pointer.x - stage.x()) / stage.scaleX(),
            y: (pointer.y - stage.y()) / stage.scaleY()
        };
    };
    const handleWheel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CanvasStage.useCallback[handleWheel]": (e)=>{
            e.evt.preventDefault();
            const stage = stageRef.current;
            const oldScale = stageConfig.scale;
            const pointer = stage.getPointerPosition();
            const mousePointTo = {
                x: (pointer.x - stageConfig.x) / oldScale,
                y: (pointer.y - stageConfig.y) / oldScale
            };
            const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * (e.evt.deltaY > 0 ? 1 / SCALE_FACTOR : SCALE_FACTOR)));
            setStagePosition(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale, newScale);
        }
    }["CanvasStage.useCallback[handleWheel]"], [
        stageConfig,
        setStagePosition
    ]);
    const handleMouseDown = (e)=>{
        if (tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].SELECT) {
            if (e.target === e.target.getStage()) {
                clearSelection();
                // Start selection box
                const pos = getRelativePos();
                if (pos) {
                    setIsSelecting(true);
                    setSelectionBox({
                        x1: pos.x,
                        y1: pos.y,
                        x2: pos.x,
                        y2: pos.y
                    });
                }
            }
            return;
        }
        if (tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON) return;
        const pos = getRelativePos();
        if (!pos) return;
        setIsDrawing(true);
        setDrawStart(pos);
        // Handle explicit asset tools
        const isAssetTool = tool === "STAGE" || tool === "EXIT";
        const finalToolType = isAssetTool ? __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE : tool;
        const assetType = isAssetTool ? tool : null;
        setNewElement({
            type: finalToolType,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            fill: ZONE_FILL_DEFAULT,
            name: tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].RECTANGLE ? "New Section" : isAssetTool ? tool : "Asset",
            assetType
        });
    };
    const handleMouseMove = ()=>{
        const pos = getRelativePos();
        if (!pos) return;
        setMousePos(pos);
        if (isSelecting) {
            setSelectionBox((prev)=>({
                    ...prev,
                    x2: pos.x,
                    y2: pos.y
                }));
            return;
        }
        if (!isDrawing || !newElement || tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON) return;
        const width = pos.x - drawStart.x;
        const height = pos.y - drawStart.y;
        // Asset types usually maintain aspect ratio or have minimum size for preview
        const absWidth = Math.max(isDrawing && newElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE ? 50 : 0, Math.abs(width));
        const absHeight = Math.max(isDrawing && newElement.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE ? 30 : 0, Math.abs(height));
        setNewElement((prev)=>({
                ...prev,
                width: absWidth,
                height: absHeight,
                x: width < 0 ? pos.x : drawStart.x,
                y: height < 0 ? pos.y : drawStart.y
            }));
    };
    const handleMouseUp = ()=>{
        if (isSelecting) {
            setIsSelecting(false);
            // Find intersect elements
            const x = Math.min(selectionBox.x1, selectionBox.x2);
            const y = Math.min(selectionBox.y1, selectionBox.y2);
            const w = Math.abs(selectionBox.x1 - selectionBox.x2);
            const h = Math.abs(selectionBox.y1 - selectionBox.y2);
            if (w > 5 && h > 5) {
                const intersectIds = elements.filter((el)=>{
                    // Check if element's bounding box intersects with selection box
                    // Element box: el.x, el.y, el.width, el.height
                    const elX = el.x;
                    const elY = el.y;
                    const elR = el.x + el.width;
                    const elB = el.y + el.height;
                    const selX = x;
                    const selY = y;
                    const selR = x + w;
                    const selB = y + h;
                    return !(selR < elX || selX > elR || selB < elY || selY > elB);
                }).map((el)=>el.id);
                if (intersectIds.length > 0) {
                    setSelectedIds(intersectIds);
                }
            }
            return;
        }
        if (!isDrawing || tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON) return;
        if (newElement && (newElement.width > 20 || tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE)) {
            addElement(newElement);
        }
        setIsDrawing(false);
        setNewElement(null);
    };
    const handleStageClick = ()=>{
        if (tool !== __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON) return;
        const pos = getRelativePos();
        if (!pos) return;
        if (polyPoints.length >= 6) {
            const dist = Math.sqrt(Math.pow(pos.x - polyPoints[0], 2) + Math.pow(pos.y - polyPoints[1], 2));
            if (dist < SNAP_RADIUS) {
                addElement({
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON,
                    name: "Standing Area",
                    points: polyPoints,
                    fill: "#ef4444",
                    x: 0,
                    y: 0,
                    width: 10,
                    height: 10
                });
                setPolyPoints([]);
                return;
            }
        }
        setPolyPoints((prev)=>[
                ...prev,
                pos.x,
                pos.y
            ]);
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        // Try to parse dropped asset data
        const assetJson = e.dataTransfer.getData("asset");
        if (!assetJson) return;
        try {
            const asset = JSON.parse(assetJson);
            const stage = stageRef.current;
            stage.setPointersPositions(e);
            // Get pointer position relative to stage (account for pan/zoom)
            const transform = stage.getAbsoluteTransform().copy();
            transform.invert();
            const pos = transform.point(stage.getPointerPosition());
            addElement({
                type: __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].ASSET,
                x: pos.x,
                y: pos.y,
                width: asset.width,
                height: asset.height,
                rotation: 0,
                name: asset.label,
                assetConfig: asset // Store full asset metadata
            });
            // Switch to Select tool to avoid confusion
            if (setTool) setTool(__TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].SELECT);
            else __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getState().setTool(__TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].SELECT);
        } catch (err) {
            console.error("Failed to drop asset:", err);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative w-full h-full bg-zinc-950 overflow-hidden",
        onDragOver: (e)=>e.preventDefault(),
        onDrop: handleDrop,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `radial-gradient(circle, rgba(212, 175, 55, 0.15) 1px, transparent 1px)`,
                    backgroundSize: `${20 * stageConfig.scale}px ${20 * stageConfig.scale}px`,
                    backgroundPosition: `${stageConfig.x}px ${stageConfig.y}px`,
                    pointerEvents: "none"
                }
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 833,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stage"], {
                ref: stageRef,
                width: stageConfig.width,
                height: stageConfig.height,
                x: stageConfig.x,
                y: stageConfig.y,
                scaleX: stageConfig.scale,
                scaleY: stageConfig.scale,
                onWheel: handleWheel,
                onMouseDown: handleMouseDown,
                onMouseMove: handleMouseMove,
                onMouseUp: handleMouseUp,
                onClick: handleStageClick,
                draggable: tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].SELECT && selectedIds.length === 0,
                onDragEnd: (e)=>setStagePosition(e.target.x(), e.target.y(), stageConfig.scale),
                style: {
                    cursor: tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].SELECT ? "default" : "crosshair"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Layer"], {
                    children: [
                        elements.map((el)=>{
                            const isSelected = selectedIds.includes(el.id);
                            const handleSelect = (e)=>{
                                // If shift is pressed, toggle selection
                                if (e.evt.shiftKey) {
                                    toggleSelection(el.id);
                                } else {
                                    // Otherwise, single selection (unless already part of a multi-selection)
                                    if (!isSelected) {
                                        setSelectedIds([
                                            el.id
                                        ]);
                                    }
                                }
                            };
                            if (el.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].RECTANGLE || el.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CURVE) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ZoneElement, {
                                element: el,
                                isSelected: isSelected,
                                onSelect: handleSelect,
                                onChange: (u)=>updateElement(el.id, u),
                                scale: stageConfig.scale
                            }, el.id, false, {
                                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                                lineNumber: 871,
                                columnNumber: 36
                            }, this);
                            if (el.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].CIRCLE) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CircleElement, {
                                element: el,
                                isSelected: isSelected,
                                onSelect: handleSelect,
                                onChange: (u)=>updateElement(el.id, u)
                            }, el.id, false, {
                                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                                lineNumber: 873,
                                columnNumber: 36
                            }, this);
                            if (el.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PolygonElement, {
                                element: el,
                                isSelected: isSelected,
                                onSelect: handleSelect,
                                onChange: (u)=>updateElement(el.id, u)
                            }, el.id, false, {
                                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                                lineNumber: 875,
                                columnNumber: 36
                            }, this);
                            if (el.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].IMAGE || el.type === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].ASSET) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AssetElement, {
                                element: el,
                                isSelected: isSelected,
                                onSelect: handleSelect,
                                onChange: (u)=>updateElement(el.id, u)
                            }, el.id, false, {
                                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                                lineNumber: 877,
                                columnNumber: 36
                            }, this);
                            return null;
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MultiTransformer, {
                            selectedIds: selectedIds
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                            lineNumber: 882,
                            columnNumber: 21
                        }, this),
                        isSelecting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"], {
                            x: Math.min(selectionBox.x1, selectionBox.x2),
                            y: Math.min(selectionBox.y1, selectionBox.y2),
                            width: Math.abs(selectionBox.x1 - selectionBox.x2),
                            height: Math.abs(selectionBox.y1 - selectionBox.y2),
                            fill: "rgba(212, 175, 55, 0.1)",
                            stroke: "#D4AF37",
                            strokeWidth: 1,
                            dash: [
                                4,
                                2
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                            lineNumber: 886,
                            columnNumber: 25
                        }, this),
                        isDrawing && newElement && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"], {
                            x: newElement.x,
                            y: newElement.y,
                            width: newElement.width,
                            height: newElement.height,
                            fill: ZONE_FILL_DEFAULT,
                            opacity: 0.3,
                            stroke: "#D4AF37",
                            strokeWidth: 1,
                            dash: [
                                5,
                                5
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                            lineNumber: 899,
                            columnNumber: 25
                        }, this),
                        tool === __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOOL_TYPES"].POLYGON && polyPoints.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                    points: polyPoints,
                                    stroke: "#D4AF37",
                                    strokeWidth: 2
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                                    lineNumber: 904,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                    points: [
                                        polyPoints[polyPoints.length - 2],
                                        polyPoints[polyPoints.length - 1],
                                        mousePos.x,
                                        mousePos.y
                                    ],
                                    stroke: "#D4AF37",
                                    strokeWidth: 1,
                                    dash: [
                                        5,
                                        2
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                                    lineNumber: 905,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                                    x: polyPoints[0],
                                    y: polyPoints[1],
                                    radius: 5,
                                    fill: "#D4AF37"
                                }, void 0, false, {
                                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                                    lineNumber: 906,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                    lineNumber: 855,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 841,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-4 text-[10px] text-zinc-600 font-mono",
                children: [
                    "SCALE: ",
                    Math.round(stageConfig.scale * 100),
                    "% | LOD: ",
                    stageConfig.scale < LOD_THRESHOLD ? "LOW" : "HIGH"
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/CanvasStage.jsx",
                lineNumber: 911,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/CanvasStage.jsx",
        lineNumber: 826,
        columnNumber: 9
    }, this);
}
_s5(CanvasStage, "uVRtPcsIfijLsfj0DxKF4JiyAJw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$engine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$seat$2d$hotkeys$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c5 = CanvasStage;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "MultiTransformer");
__turbopack_context__.k.register(_c1, "AssetElement");
__turbopack_context__.k.register(_c2, "ZoneElement");
__turbopack_context__.k.register(_c3, "CircleElement");
__turbopack_context__.k.register(_c4, "PolygonElement");
__turbopack_context__.k.register(_c5, "CanvasStage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/seat-engine/CanvasStage.jsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/seat-engine/CanvasStage.jsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_fdc6cfc9._.js.map