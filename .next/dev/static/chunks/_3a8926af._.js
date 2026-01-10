(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/components/seat-engine/SeatViewer.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SeatViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonva$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-konva/es/ReactKonva.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-konva/es/ReactKonvaCore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$booking$2d$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-booking-store.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$geometry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/geometry.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
/**
 * Royal Seat Viewer
 * Phase 6: Customer Experience
 * 
 * Read-only canvas for customers to select seats.
 */ // Constants
const MIN_SCALE = 0.05;
const MAX_SCALE = 5;
const SCALE_FACTOR = 1.1;
const TOOLTIP_OFFSET = 15;
const LOD_THRESHOLD = 0.4;
// Helper to generate seat ID
const getSeatId = (zoneId, rowLabel, colIndex)=>{
    return `${zoneId}-${rowLabel}-${colIndex + 1}`;
};
// Helper for row labels (reused logic)
function getRowLabel(index, namingType) {
    if (namingType === "NUMERICAL") return (index + 1).toString();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (index < 26) return letters[index];
    const first = Math.floor(index / 26) - 1;
    const second = index % 26;
    return letters[first] + letters[second];
}
// Colors
const SEAT_AVAILABLE_DEFAULT = "#52525b"; // Zinc 600
const SEAT_SOLD = "#3f3f46"; // Zinc 700
const SEAT_SELECTED = "#22c55e"; // Green 500
const ZONE_OPACITY = 0.15;
/**
 * Individual Interactive Seat
 */ const InteractiveSeat = ({ x, y, radius, fill, id, zoneName, rowLabel, colIndex, price, isSold, category })=>{
    _s();
    const { selectedSeatIds, toggleSeat } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$booking$2d$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const isSelected = selectedSeatIds.includes(id);
    // Hover state for scale effect
    const [isHovered, setIsHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleClick = (e)=>{
        if (isSold) return;
        e.cancelBubble = true; // Prevent stage drag/click
        toggleSeat({
            id,
            label: `${zoneName} • Row ${rowLabel} • Seat ${colIndex + 1}`,
            price,
            category: category || "Standard",
            zone: zoneName
        });
    };
    const handleMouseEnter = (e)=>{
        if (isSold) return;
        const stage = e.target.getStage();
        stage.container().style.cursor = "pointer";
        setIsHovered(true);
    };
    const handleMouseLeave = (e)=>{
        const stage = e.target.getStage();
        stage.container().style.cursor = "default";
        setIsHovered(false);
    };
    // Determine actual fill color
    let seatFill = fill;
    if (isSold) seatFill = SEAT_SOLD;
    else if (isSelected) seatFill = SEAT_SELECTED;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
        x: x,
        y: y,
        radius: radius,
        fill: seatFill,
        scaleX: isHovered ? 1.3 : 1,
        scaleY: isHovered ? 1.3 : 1,
        shadowColor: "black",
        shadowBlur: isHovered ? 5 : 0,
        shadowOpacity: isSold ? 0 : 0.3,
        opacity: isSold ? 0.5 : 1,
        onClick: handleClick,
        onTap: handleClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        listening: !isSold,
        name: isSold ? "sold-seat" : "interactive-seat",
        "data-seat-id": id,
        "data-seat-label": isSold ? "Sold" : `${zoneName} • Row ${rowLabel} • Seat ${colIndex + 1}`,
        "data-seat-price": price
    }, void 0, false, {
        fileName: "[project]/components/seat-engine/SeatViewer.jsx",
        lineNumber: 84,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(InteractiveSeat, "Wb3egBFN3OXKyWFXz1MppOT737o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$booking$2d$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = InteractiveSeat;
/**
 * Render Zone with Seats
 */ const ZoneRenderer = ({ element, categories = [], soldSeatIds = [], scale = 1 })=>{
    const { seatConfig, width, height, fill, type } = element;
    // Derive Category Color and Price
    const category = categories.find((c)=>c.id === seatConfig?.categoryId);
    const fillColor = category ? category.color : fill || "#D4AF37";
    const seatPrice = category?.price || 50;
    // --- Asset Rendering (Table, Stage, Bar etc) ---
    if (type === "ASSET" || type === "IMAGE") {
        const assetConfig = element.assetConfig;
        const isTable = assetConfig?.type === 'TABLE' || element.assetType === 'TABLE';
        if (isTable) {
            const capacity = element.seatConfig?.capacity || assetConfig?.defaultCapacity || 6;
            // Prioritize element.fill over asset default to match Builder
            const tableColor = element.fill || assetConfig?.color || "#78350f";
            const radius = Math.min(width, height) / 2;
            const chairRadius = radius / 4;
            const chairs = [];
            for(let i = 0; i < capacity; i++){
                const angle = i / capacity * 2 * Math.PI;
                const xc = width / 2 + Math.cos(angle) * (radius + chairRadius / 2);
                const yc = height / 2 + Math.sin(angle) * (radius + chairRadius / 2);
                chairs.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                    x: xc,
                    y: yc,
                    radius: chairRadius,
                    fill: "#3f3f46",
                    stroke: tableColor,
                    strokeWidth: 1,
                    listening: false
                }, `chair-${i}`, false, {
                    fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                    lineNumber: 137,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0)));
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
                x: element.x,
                y: element.y,
                rotation: element.rotation || 0,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                        x: width / 2,
                        y: height / 2,
                        radius: radius,
                        fill: tableColor,
                        stroke: "#451a03",
                        strokeWidth: 2
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                        lineNumber: 151,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
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
                        opacity: 0.6,
                        listening: false
                    }, void 0, false, {
                        fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                        lineNumber: 153,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 150,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0));
        }
        // Generic Asset (Stage, Barrier, etc)
        // Match Builder logic: prioritize fill -> assetConfig.color -> #555
        const assetColor = element.fill || assetConfig?.color || "#555";
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
            x: element.x,
            y: element.y,
            rotation: element.rotation || 0,
            listening: false,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"], {
                    width: width,
                    height: height,
                    fill: `${assetColor}40`,
                    stroke: assetColor,
                    strokeWidth: 2,
                    cornerRadius: 4,
                    dash: [
                        5,
                        2
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                    lineNumber: 163,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
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
                    fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                    lineNumber: 164,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/seat-engine/SeatViewer.jsx",
            lineNumber: 162,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0));
    }
    // --- Seating Logic ---
    const background = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        x: element.x,
        y: element.y,
        rotation: element.rotation || 0,
        listening: false,
        children: [
            type === "POLYGON" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                points: element.points || [],
                closed: true,
                fill: fillColor,
                opacity: ZONE_OPACITY,
                stroke: fillColor,
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 173,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)) : type === "CIRCLE" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                x: width / 2,
                y: height / 2,
                radius: width / 2,
                fill: fillColor,
                opacity: ZONE_OPACITY,
                stroke: fillColor,
                strokeWidth: 1
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 175,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"], {
                width: width,
                height: height,
                fill: fillColor,
                opacity: ZONE_OPACITY,
                cornerRadius: 8
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 177,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            element.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                x: type === "POLYGON" && element.points ? (Math.min(...element.points.filter((_, i)=>i % 2 === 0)) + Math.max(...element.points.filter((_, i)=>i % 2 === 0))) / 2 - 50 : 0,
                y: type === "POLYGON" && element.points ? (Math.min(...element.points.filter((_, i)=>i % 2 === 1)) + Math.max(...element.points.filter((_, i)=>i % 2 === 1))) / 2 - 10 : height / 2 - 10,
                width: type === "POLYGON" ? 100 : width,
                text: element.name.toUpperCase(),
                fontSize: Math.max(12, Math.min(width, 24)),
                fontStyle: "bold",
                fill: fillColor,
                opacity: 0.3,
                align: "center",
                letterSpacing: 2
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 181,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/SeatViewer.jsx",
        lineNumber: 171,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
    // LOD: Skip seats if zoomed out
    if (scale < LOD_THRESHOLD) return background;
    if (!seatConfig) return background;
    const { rowCount, colCount, seatNaming, showLabels, curvature = 0 } = seatConfig;
    if (!rowCount || rowCount <= 0 || !colCount || colCount <= 0) return background;
    const seats = [];
    const LABEL_WIDTH_SPACE = showLabels ? 25 : 0;
    // CURVED OR GRID
    if (curvature > 0) {
        const arcWidth = width - LABEL_WIDTH_SPACE;
        const centerX = LABEL_WIDTH_SPACE + arcWidth / 2;
        const baseRadius = arcWidth * 100 / curvature;
        const centerY = -baseRadius + height / 2;
        const totalAngle = arcWidth / baseRadius * (180 / Math.PI);
        const startAngle = -totalAngle / 2;
        for(let row = 0; row < rowCount; row++){
            const rowLabel = getRowLabel(row, seatNaming);
            const currentRadius = baseRadius + row * (height / rowCount);
            const step = totalAngle / Math.max(1, colCount - 1);
            for(let col = 0; col < colCount; col++){
                const angle = startAngle + col * step;
                const pos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$geometry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateArcPosition"])(centerX, centerY, currentRadius, angle);
                const seatId = getSeatId(element.id, rowLabel, col);
                const isSold = soldSeatIds.includes(seatId);
                seats.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InteractiveSeat, {
                    id: seatId,
                    x: pos.x,
                    y: pos.y,
                    radius: Math.min(10, 100 / colCount),
                    fill: fillColor,
                    zoneName: element.name || "Section",
                    rowLabel: rowLabel,
                    colIndex: col,
                    price: seatPrice,
                    isSold: isSold,
                    category: element.category
                }, seatId, false, {
                    fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                    lineNumber: 230,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0)));
            }
        }
    } else {
        // Standard Grid
        const availableWidth = width - 20 - LABEL_WIDTH_SPACE;
        const availableHeight = height - 30;
        const cellWidth = availableWidth / colCount;
        const cellHeight = availableHeight / rowCount;
        const seatRadius = Math.max(3, Math.min(Math.min(cellWidth, cellHeight) / 3, 12));
        for(let row = 0; row < rowCount; row++){
            const rowLabel = getRowLabel(row, seatNaming);
            const y = 25 + cellHeight / 2 + row * cellHeight;
            if (showLabels) {
                seats.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Text"], {
                    x: 10,
                    y: y - 5,
                    text: rowLabel,
                    fontSize: 10,
                    fontStyle: "bold",
                    fill: fillColor,
                    width: 25,
                    align: "center",
                    listening: false
                }, `lbl-${row}`, false, {
                    fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                    lineNumber: 252,
                    columnNumber: 28
                }, ("TURBOPACK compile-time value", void 0)));
            }
            for(let col = 0; col < colCount; col++){
                const x = 10 + LABEL_WIDTH_SPACE + cellWidth / 2 + col * cellWidth;
                const seatId = getSeatId(element.id, rowLabel, col);
                const isSold = soldSeatIds.includes(seatId);
                seats.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InteractiveSeat, {
                    id: seatId,
                    x: x,
                    y: y,
                    radius: seatRadius,
                    fill: fillColor,
                    zoneName: element.name || "Section",
                    rowLabel: rowLabel,
                    colIndex: col,
                    price: seatPrice,
                    isSold: isSold,
                    category: element.category
                }, seatId, false, {
                    fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                    lineNumber: 261,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0)));
            }
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        children: [
            background,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
                x: element.x,
                y: element.y,
                rotation: element.rotation || 0,
                children: seats
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 274,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/SeatViewer.jsx",
        lineNumber: 272,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c1 = ZoneRenderer;
function SeatViewer({ initialData, soldSeatIds = [] }) {
    _s1();
    const stageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [hasFitted, setHasFitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Fix: Use stageConfig property correctly
    const [stageConfig, setStageConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.stageConfig || initialData?.stage || {
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        scale: 1
    });
    // Safe Data Extraction
    const elements = initialData?.shapes || initialData?.elements || initialData?.venueLayout?.shapes || [];
    const categories = initialData?.categories || initialData?.venueLayout?.categories || [];
    // Tooltip State
    const [tooltip, setTooltip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        visible: false,
        x: 0,
        y: 0,
        text: ""
    });
    // Auto-Fit Logic
    const fitToScreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SeatViewer.useCallback[fitToScreen]": ()=>{
            if (!containerRef.current || elements.length === 0) return;
            const containerW = containerRef.current.offsetWidth;
            const containerH = containerRef.current.offsetHeight;
            // Calculate Bounding Box
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            elements.forEach({
                "SeatViewer.useCallback[fitToScreen]": (el)=>{
                    // Rough approximation using width/height. For better precision, consider rotation.
                    // Using logic similar to builder would be ideal, but this is sufficient for viewing.
                    minX = Math.min(minX, el.x);
                    minY = Math.min(minY, el.y);
                    maxX = Math.max(maxX, el.x + (el.width || 100));
                    maxY = Math.max(maxY, el.y + (el.height || 100));
                }
            }["SeatViewer.useCallback[fitToScreen]"]);
            if (minX === Infinity) return; // No elements
            const contentW = maxX - minX;
            const contentH = maxY - minY;
            const padding = 80; // More breathing room
            const scaleX = (containerW - padding * 2) / contentW;
            const scaleY = (containerH - padding * 2) / contentH;
            const scale = Math.min(Math.max(scaleX, scaleY), MAX_SCALE);
            const safeScale = Math.min(scale, 0.9); // Don't zoom in initially; keep it at 90% or fitting
            // Center logic (unchanged)
            const centerX = (containerW - contentW * safeScale) / 2;
            const centerY = (containerH - contentH * safeScale) / 2;
            setStageConfig({
                "SeatViewer.useCallback[fitToScreen]": (prev)=>({
                        ...prev,
                        width: containerW,
                        height: containerH,
                        scale: safeScale,
                        x: centerX - minX * safeScale,
                        y: centerY - minY * safeScale
                    })
            }["SeatViewer.useCallback[fitToScreen]"]);
            setHasFitted(true);
        }
    }["SeatViewer.useCallback[fitToScreen]"], [
        elements
    ]);
    // Handle Resize & Initial Fit
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SeatViewer.useEffect": ()=>{
            if (!containerRef.current) return;
            const resizeObserver = new ResizeObserver({
                "SeatViewer.useEffect": (entries)=>{
                    for (const entry of entries){
                        const { width, height } = entry.contentRect;
                        setStageConfig({
                            "SeatViewer.useEffect": (prev)=>({
                                    ...prev,
                                    width,
                                    height
                                })
                        }["SeatViewer.useEffect"]);
                        // Trigger fit on first valid resize if not fitted yet
                        if (!hasFitted && width > 0 && height > 0 && elements.length > 0) {
                        // We need to call fitToScreen, but we can't call it directly here efficiently without deps.
                        // Instead, we rely on a separate effect or just run logic here.
                        // Let's rely on a separate effect that watches dimensions.
                        }
                    }
                }
            }["SeatViewer.useEffect"]);
            resizeObserver.observe(containerRef.current);
            return ({
                "SeatViewer.useEffect": ()=>resizeObserver.disconnect()
            })["SeatViewer.useEffect"];
        }
    }["SeatViewer.useEffect"], [
        hasFitted,
        elements.length
    ]);
    // Trigger Fit when dimensions actally exist and elements are ready
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SeatViewer.useEffect": ()=>{
            if (!hasFitted && elements.length > 0 && stageConfig.width > 0) {
                fitToScreen();
            }
        }
    }["SeatViewer.useEffect"], [
        stageConfig.width,
        stageConfig.height,
        elements.length,
        hasFitted,
        fitToScreen
    ]);
    // Pan & Zoom Logic
    const handleWheel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SeatViewer.useCallback[handleWheel]": (e)=>{
            e.evt.preventDefault();
            const stage = stageRef.current;
            if (!stage) return;
            // Clear tooltip on zoom
            setTooltip({
                "SeatViewer.useCallback[handleWheel]": (prev)=>({
                        ...prev,
                        visible: false
                    })
            }["SeatViewer.useCallback[handleWheel]"]);
            const oldScale = stageConfig.scale;
            const pointer = stage.getPointerPosition();
            const mousePointTo = {
                x: (pointer.x - stageConfig.x) / oldScale,
                y: (pointer.y - stageConfig.y) / oldScale
            };
            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * (direction > 0 ? SCALE_FACTOR : 1 / SCALE_FACTOR)));
            setStageConfig({
                "SeatViewer.useCallback[handleWheel]": (prev)=>({
                        ...prev,
                        scale: newScale,
                        x: pointer.x - mousePointTo.x * newScale,
                        y: pointer.y - mousePointTo.y * newScale
                    })
            }["SeatViewer.useCallback[handleWheel]"]);
        }
    }["SeatViewer.useCallback[handleWheel]"], [
        stageConfig
    ]);
    const handleDragEnd = (e)=>{
        setStageConfig((prev)=>({
                ...prev,
                x: e.target.x(),
                y: e.target.y()
            }));
    };
    // Tooltip Global Handler
    const handleMouseMove = (e)=>{
        // Check if we are over an interactive seat
        const shape = e.target;
        if (shape.attrs.name === "interactive-seat" || shape.attrs.name === "sold-seat") {
            const absPos = shape.getAbsolutePosition();
            // Tip 1 applied: use getAbsolutePosition
            setTooltip({
                visible: true,
                x: absPos.x,
                y: absPos.y - TOOLTIP_OFFSET,
                text: shape.attrs['data-seat-label']
            });
        } else {
            setTooltip((prev)=>({
                    ...prev,
                    visible: false
                }));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative w-full h-full bg-zinc-950 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stage"], {
                ref: stageRef,
                width: stageConfig.width,
                height: stageConfig.height,
                x: stageConfig.x,
                y: stageConfig.y,
                scaleX: stageConfig.scale,
                scaleY: stageConfig.scale,
                draggable: true,
                onWheel: handleWheel,
                onDragEnd: handleDragEnd,
                onMouseMove: handleMouseMove,
                onMouseDown: ()=>setTooltip((p)=>({
                            ...p,
                            visible: false
                        })),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Layer"], {
                    children: elements.map((el)=>{
                        // Support for all element types
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ZoneRenderer, {
                            element: el,
                            categories: categories,
                            soldSeatIds: soldSeatIds,
                            scale: stageConfig.scale
                        }, el.id, false, {
                            fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                            lineNumber: 443,
                            columnNumber: 29
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                    lineNumber: 439,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 425,
                columnNumber: 13
            }, this),
            tooltip.visible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white pointer-events-none shadow-xl z-50 whitespace-nowrap",
                style: {
                    left: tooltip.x,
                    top: tooltip.y,
                    transform: 'translate(-50%, -100%)' // Center above point
                },
                children: tooltip.text
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 457,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-xs text-zinc-400",
                children: "Scroll to Zoom • Drag to Pan • Click to Select"
            }, void 0, false, {
                fileName: "[project]/components/seat-engine/SeatViewer.jsx",
                lineNumber: 470,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/seat-engine/SeatViewer.jsx",
        lineNumber: 424,
        columnNumber: 9
    }, this);
}
_s1(SeatViewer, "OS+k/2BszExGv+7JxDvpmy/cISc=");
_c2 = SeatViewer;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "InteractiveSeat");
__turbopack_context__.k.register(_c1, "ZoneRenderer");
__turbopack_context__.k.register(_c2, "SeatViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/seat-engine/SeatViewer.jsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/seat-engine/SeatViewer.jsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_3a8926af._.js.map