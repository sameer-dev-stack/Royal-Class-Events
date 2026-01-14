"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Circle, Group, Text, Line, Image as KonvaImage } from "react-konva";
import useBookingStore from "@/hooks/use-booking-store";
import { calculateArcPosition, getRectTableSeats } from "@/utils/geometry";

/**
 * Royal Seat Viewer
 * Phase 6: Customer Experience
 * 
 * Read-only canvas for customers to select seats.
 */

// Constants
const MIN_SCALE = 0.05;
const MAX_SCALE = 5;
const SCALE_FACTOR = 1.1;
const TOOLTIP_OFFSET = 15;
const LOD_THRESHOLD = 0.4;

// Helper to generate seat ID
const getSeatId = (zoneId, rowLabel, colIndex) => {
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
 */
const InteractiveSeat = ({ x, y, radius, fill, id, zoneName, rowLabel, colIndex, price, isSold, category }) => {
    const { selectedSeatIds, toggleSeat } = useBookingStore();
    const isSelected = selectedSeatIds.includes(id);

    // Hover state for scale effect
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = (e) => {
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

    const handleMouseEnter = (e) => {
        if (isSold) return;
        const stage = e.target.getStage();
        stage.container().style.cursor = "pointer";
        setIsHovered(true);
    };

    const handleMouseLeave = (e) => {
        const stage = e.target.getStage();
        stage.container().style.cursor = "default";
        setIsHovered(false);
    };

    // Determine actual fill color
    let seatFill = fill;
    if (isSold) seatFill = SEAT_SOLD;
    else if (isSelected) seatFill = SEAT_SELECTED;

    return (
        <Circle
            x={x}
            y={y}
            radius={radius}
            fill={seatFill}
            scaleX={isHovered ? 1.3 : 1}
            scaleY={isHovered ? 1.3 : 1}
            shadowColor="black"
            shadowBlur={isHovered ? 5 : 0}
            shadowOpacity={isSold ? 0 : 0.3}
            opacity={isSold ? 0.5 : 1}
            onClick={handleClick}
            onTap={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            listening={!isSold}
            name={isSold ? "sold-seat" : "interactive-seat"}
            data-seat-id={id}
            data-seat-label={isSold ? "Sold" : `${zoneName} • Row ${rowLabel} • Seat ${colIndex + 1}`}
            data-seat-price={price}
        />
    );
};

/**
 * Render Zone with Seats
 */
const ZoneRenderer = ({ element, categories = [], soldSeatIds = [], scale = 1 }) => {
    const { seatConfig, width, height, fill, type } = element;

    // Derive Category Color and Price
    const category = categories.find(c => c.id === seatConfig?.categoryId);
    const fillColor = category ? category.color : (fill || "#D4AF37");
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

            for (let i = 0; i < capacity; i++) {
                const angle = (i / capacity) * 2 * Math.PI;
                const xc = width / 2 + Math.cos(angle) * (radius + chairRadius / 2);
                const yc = height / 2 + Math.sin(angle) * (radius + chairRadius / 2);
                chairs.push(
                    <Circle
                        key={`chair-${i}`}
                        x={xc} y={yc}
                        radius={chairRadius}
                        fill="#3f3f46"
                        stroke={tableColor}
                        strokeWidth={1}
                        listening={false}
                    />
                );
            }

            return (
                <Group x={element.x} y={element.y} rotation={element.rotation || 0}>
                    <Circle x={width / 2} y={height / 2} radius={radius} fill={tableColor} stroke="#451a03" strokeWidth={2} />
                    {chairs}
                    <Text text={`${capacity}`} width={width} height={height} align="center" verticalAlign="middle" fill="white" fontStyle="bold" fontSize={radius / 2} opacity={0.6} listening={false} />
                </Group>
            );
        }

        // --- RECT_TABLE Rendering ---
        if (assetConfig?.type === 'RECT_TABLE' || element.assetType === 'RECT_TABLE') {
            const capacity = element.seatConfig?.capacity || assetConfig?.defaultCapacity || 6;
            const tableColor = element.fill || assetConfig?.color || "#78350f";
            const chairs = [];
            const chairRadius = 6; // Matching builder

            const seatPositions = getRectTableSeats(width, height, capacity, 5, chairRadius);

            seatPositions.forEach((pos, i) => {
                chairs.push(
                    <Circle
                        key={`rect-chair-${i}`}
                        x={pos.x} y={pos.y}
                        radius={chairRadius}
                        fill="white"
                        stroke="gray"
                        strokeWidth={1}
                        listening={false}
                    />
                );
            });

            return (
                <Group x={element.x} y={element.y} rotation={element.rotation || 0}>
                    <Rect
                        width={width} height={height}
                        fill={tableColor}
                        stroke="#451a03"
                        strokeWidth={2}
                        cornerRadius={8}
                    />
                    {chairs}
                    <Text text={`${capacity}`} width={width} height={height} align="center" verticalAlign="middle" fill="white" fontStyle="bold" fontSize={20} opacity={0.6} listening={false} />
                </Group>
            );
        }

        // Generic Asset (Stage, Barrier, etc)
        // Match Builder logic: prioritize fill -> assetConfig.color -> #555
        const assetColor = element.fill || assetConfig?.color || "#555";
        return (
            <Group x={element.x} y={element.y} rotation={element.rotation || 0} listening={false}>
                <Rect width={width} height={height} fill={`${assetColor}40`} stroke={assetColor} strokeWidth={2} cornerRadius={4} dash={[5, 2]} />
                <Text text={element.name || assetConfig?.label || "ASSET"} width={width} height={height} align="center" verticalAlign="middle" fill="#fff" fontStyle="bold" fontSize={Math.max(10, Math.min(width, height) / 5)} padding={5} />
            </Group>
        );
    }

    // --- Seating Logic ---
    const background = (
        <Group x={element.x} y={element.y} rotation={element.rotation || 0} listening={false}>
            {type === "POLYGON" ? (
                <Line points={element.points || []} closed fill={fillColor} opacity={ZONE_OPACITY} stroke={fillColor} strokeWidth={2} />
            ) : type === "CIRCLE" ? (
                <Circle x={width / 2} y={height / 2} radius={width / 2} fill={fillColor} opacity={ZONE_OPACITY} stroke={fillColor} strokeWidth={1} />
            ) : (
                <Rect width={width} height={height} fill={fillColor} opacity={ZONE_OPACITY} cornerRadius={8} />
            )}

            {element.name && (
                <Text
                    x={type === "POLYGON" && element.points
                        ? (Math.min(...element.points.filter((_, i) => i % 2 === 0)) + Math.max(...element.points.filter((_, i) => i % 2 === 0))) / 2 - 50
                        : 0
                    }
                    y={type === "POLYGON" && element.points
                        ? (Math.min(...element.points.filter((_, i) => i % 2 === 1)) + Math.max(...element.points.filter((_, i) => i % 2 === 1))) / 2 - 10
                        : height / 2 - 10
                    }
                    width={type === "POLYGON" ? 100 : width}
                    text={element.name.toUpperCase()}
                    fontSize={Math.max(12, Math.min(width, 24))} fontStyle="bold"
                    fill={fillColor} opacity={0.3} align="center" letterSpacing={2}
                />
            )}
        </Group>
    );

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
        const baseRadius = (arcWidth * 100) / curvature;
        const centerY = -baseRadius + height / 2;
        const totalAngle = (arcWidth / baseRadius) * (180 / Math.PI);
        const startAngle = -totalAngle / 2;

        for (let row = 0; row < rowCount; row++) {
            const rowLabel = getRowLabel(row, seatNaming);
            const currentRadius = baseRadius + row * (height / rowCount);
            const step = totalAngle / Math.max(1, colCount - 1);

            for (let col = 0; col < colCount; col++) {
                const angle = startAngle + (col * step);
                const pos = calculateArcPosition(centerX, centerY, currentRadius, angle);
                const seatId = getSeatId(element.id, rowLabel, col);
                const isSold = soldSeatIds.includes(seatId);

                seats.push(
                    <InteractiveSeat
                        key={seatId} id={seatId} x={pos.x} y={pos.y}
                        radius={Math.min(10, 100 / colCount)} fill={fillColor}
                        zoneName={element.name || "Section"} rowLabel={rowLabel} colIndex={col}
                        price={seatPrice} isSold={isSold} category={element.category}
                    />
                );
            }
        }
    } else {
        // Standard Grid
        const availableWidth = width - 20 - LABEL_WIDTH_SPACE;
        const availableHeight = height - 30;
        const cellWidth = availableWidth / colCount;
        const cellHeight = availableHeight / rowCount;
        const seatRadius = Math.max(3, Math.min(Math.min(cellWidth, cellHeight) / 3, 12));

        for (let row = 0; row < rowCount; row++) {
            const rowLabel = getRowLabel(row, seatNaming);
            const y = 25 + cellHeight / 2 + row * cellHeight;

            if (showLabels) {
                seats.push(<Text key={`lbl-${row}`} x={10} y={y - 5} text={rowLabel} fontSize={10} fontStyle="bold" fill={fillColor} width={25} align="center" listening={false} />);
            }

            for (let col = 0; col < colCount; col++) {
                const x = 10 + LABEL_WIDTH_SPACE + cellWidth / 2 + col * cellWidth;
                const seatId = getSeatId(element.id, rowLabel, col);
                const isSold = soldSeatIds.includes(seatId);

                seats.push(
                    <InteractiveSeat
                        key={seatId} id={seatId} x={x} y={y} radius={seatRadius} fill={fillColor}
                        zoneName={element.name || "Section"} rowLabel={rowLabel} colIndex={col}
                        price={seatPrice} isSold={isSold} category={element.category}
                    />
                );
            }
        }
    }

    return (
        <Group>
            {background}
            <Group x={element.x} y={element.y} rotation={element.rotation || 0}>
                {seats}
            </Group>
        </Group>
    );
};


export default function SeatViewer({ initialData, soldSeatIds = [] }) {
    const stageRef = useRef(null);
    const containerRef = useRef(null);
    const [hasFitted, setHasFitted] = useState(false);

    // Fix: Use stageConfig property correctly
    const [stageConfig, setStageConfig] = useState(initialData?.stageConfig || initialData?.stage || { width: 800, height: 600, x: 0, y: 0, scale: 1 });

    // Safe Data Extraction
    const elements = initialData?.shapes || initialData?.elements || initialData?.venueLayout?.shapes || [];
    const categories = initialData?.categories || initialData?.venueLayout?.categories || [];

    // Tooltip State
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });

    // Auto-Fit Logic
    const fitToScreen = useCallback(() => {
        if (!containerRef.current || elements.length === 0) return;

        const containerW = containerRef.current.offsetWidth;
        const containerH = containerRef.current.offsetHeight;

        // Calculate Bounding Box
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        elements.forEach(el => {
            // Rough approximation using width/height. For better precision, consider rotation.
            // Using logic similar to builder would be ideal, but this is sufficient for viewing.
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + (el.width || 100));
            maxY = Math.max(maxY, el.y + (el.height || 100));
        });

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

        setStageConfig(prev => ({
            ...prev,
            width: containerW,
            height: containerH,
            scale: safeScale,
            x: centerX - minX * safeScale,
            y: centerY - minY * safeScale
        }));
        setHasFitted(true);
    }, [elements]);

    // Handle Resize & Initial Fit
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setStageConfig(prev => ({ ...prev, width, height }));

                // Trigger fit on first valid resize if not fitted yet
                if (!hasFitted && width > 0 && height > 0 && elements.length > 0) {
                    // We need to call fitToScreen, but we can't call it directly here efficiently without deps.
                    // Instead, we rely on a separate effect or just run logic here.
                    // Let's rely on a separate effect that watches dimensions.
                }
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [hasFitted, elements.length]);

    // Trigger Fit when dimensions actally exist and elements are ready
    useEffect(() => {
        if (!hasFitted && elements.length > 0 && stageConfig.width > 0) {
            fitToScreen();
        }
    }, [stageConfig.width, stageConfig.height, elements.length, hasFitted, fitToScreen]);

    // Pan & Zoom Logic
    const handleWheel = useCallback((e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        // Clear tooltip on zoom
        setTooltip(prev => ({ ...prev, visible: false }));

        const oldScale = stageConfig.scale;
        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stageConfig.x) / oldScale,
            y: (pointer.y - stageConfig.y) / oldScale,
        };

        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * (direction > 0 ? SCALE_FACTOR : 1 / SCALE_FACTOR)));

        setStageConfig(prev => ({
            ...prev,
            scale: newScale,
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        }));
    }, [stageConfig]);

    const handleDragEnd = (e) => {
        setStageConfig(prev => ({
            ...prev,
            x: e.target.x(),
            y: e.target.y()
        }));
    };

    // Tooltip Global Handler
    const handleMouseMove = (e) => {
        // Check if we are over an interactive seat
        const shape = e.target;
        if (shape.attrs.name === "interactive-seat" || shape.attrs.name === "sold-seat") {
            const absPos = shape.getAbsolutePosition();
            // Tip 1 applied: use getAbsolutePosition
            setTooltip({
                visible: true,
                x: absPos.x,
                y: absPos.y - TOOLTIP_OFFSET, // Slightly above
                text: shape.attrs['data-seat-label']
            });
        } else {
            setTooltip(prev => ({ ...prev, visible: false }));
        }
    };


    return (
        <div ref={containerRef} className="relative w-full h-full bg-zinc-950 overflow-hidden">
            <Stage
                ref={stageRef}
                width={stageConfig.width}
                height={stageConfig.height}
                x={stageConfig.x}
                y={stageConfig.y}
                scaleX={stageConfig.scale}
                scaleY={stageConfig.scale}
                draggable
                onWheel={handleWheel}
                onDragEnd={handleDragEnd}
                onMouseMove={handleMouseMove}
                onMouseDown={() => setTooltip(p => ({ ...p, visible: false }))} // Hide on drag start
            >
                <Layer>
                    {elements.map(el => {
                        // Support for all element types
                        return (
                            <ZoneRenderer
                                key={el.id}
                                element={el}
                                categories={categories}
                                soldSeatIds={soldSeatIds}
                                scale={stageConfig.scale}
                            />
                        );
                    })}
                </Layer>
            </Stage>

            {/* HTML Tooltip Portal */}
            {tooltip.visible && (
                <div
                    className="absolute px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white pointer-events-none shadow-xl z-50 whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)' // Center above point
                    }}
                >
                    {tooltip.text}
                </div>
            )}

            {/* Controls Hint */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-xs text-zinc-400">
                Scroll to Zoom • Drag to Pan • Click to Select
            </div>
        </div>
    );
}
