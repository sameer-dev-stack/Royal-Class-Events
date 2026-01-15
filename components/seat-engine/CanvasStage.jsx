"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Circle, Group, Transformer, Text, Line, Image as KonvaImage } from "react-konva";
import useSeatEngine, { TOOL_TYPES, SEAT_NAMING } from "@/hooks/use-seat-engine";
import useSeatHotkeys from "@/hooks/use-seat-hotkeys";
import { calculateArcPosition, getRectTableSeats } from "@/utils/geometry";
import { ASSET_LIBRARY } from "@/constants/seat-engine-assets";

/**
 * Royal Seat Engine - Canvas Stage Component
 * Phase 11: Curves, LOD & Assets
 */

// Scale constraints
const MIN_SCALE = 0.05;
const MAX_SCALE = 5;
const SCALE_FACTOR = 1.1;

// Colors
const ZONE_FILL_DEFAULT = "#D4AF37";
const ZONE_OPACITY = 0.15;
const LOD_OPACITY = 0.8; // High opacity for zoomed out blocks
const SEAT_FILL_DEFAULT = "#52525b"; // Fallback zinc
const SNAP_RADIUS = 15;
const SNAP_SIZE = 20;
const GHOST_OPACITY = 0.5;

// Zone padding
const ZONE_PADDING = 10;
const TITLE_HEIGHT = 20;
const LABEL_WIDTH = 25;

// LOD Threshold
const LOD_THRESHOLD = 0.4;

/**
 * Helper to generate row label text
 */
function getRowLabel(index, namingType) {
    if (namingType === SEAT_NAMING.NUMERICAL) return (index + 1).toString();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (index < 26) return letters[index];
    const first = Math.floor(index / 26) - 1;
    const second = index % 26;
    return letters[first] + letters[second];
}

/**
 * Render seat grid or arc inside a zone
 */
function renderSeats(element, scale) {
    const { seatConfig, width, height, fill } = element;
    if (!seatConfig) return null;

    const { rowCount, colCount, seatNaming, showLabels, curvature = 0, categoryId } = seatConfig;
    const seats = [];

    // Derive category color
    const categories = useSeatEngine.getState().categories;
    const category = categories.find(c => c.id === categoryId);
    const seatColor = category ? category.color : (fill || SEAT_FILL_DEFAULT);

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
        const baseRadius = (arcWidth * 100) / curvature;
        const centerY = -baseRadius + height / 2;

        const totalAngle = (arcWidth / baseRadius) * (180 / Math.PI);
        const startAngle = -totalAngle / 2;

        for (let row = 0; row < rowCount; row++) {
            const currentRadius = baseRadius + row * (height / rowCount);
            const step = totalAngle / Math.max(1, colCount - 1);

            for (let col = 0; col < colCount; col++) {
                const angle = startAngle + (col * step);
                const pos = calculateArcPosition(centerX, centerY, currentRadius, angle);

                seats.push(
                    <Circle
                        key={`seat-${row}-${col}`}
                        x={pos.x}
                        y={pos.y}
                        radius={Math.min(10, 100 / colCount)}
                        fill={seatColor}
                        listening={false}
                    />
                );
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

    for (let row = 0; row < rowCount; row++) {
        const y = ZONE_PADDING + TITLE_HEIGHT + cellHeight / 2 + row * cellHeight;
        if (showLabels) {
            seats.push(
                <Text
                    key={`label-${row}`}
                    x={ZONE_PADDING} y={y - 6}
                    text={getRowLabel(row, seatNaming)}
                    fontSize={10} fontStyle="bold"
                    fill={fill || "#D4AF37"} width={LABEL_WIDTH} align="center"
                    listening={false}
                />
            );
        }
        for (let col = 0; col < colCount; col++) {
            const x = ZONE_PADDING + labelSpace + cellWidth / 2 + col * cellWidth;
            seats.push(
                <Circle key={`seat-${row}-${col}`} x={x} y={y} radius={seatRadius} fill={seatColor} listening={false} />
            );
        }
    }
    return seats;
}

/**
 * Universal Multi-Element Transformer
 */
function MultiTransformer({ selectedIds }) {
    const transformerRef = useRef(null);

    useEffect(() => {
        if (transformerRef.current) {
            const stage = transformerRef.current.getStage();
            const nodes = selectedIds.map(id => stage.findOne(node => node.name() === id || node.id() === id)).filter(Boolean);

            // For Konva Groups, we often use name or custom attr to find them
            // In our elements, we should add 'id' attribute to the Group
            const elementNodes = stage.find('.element-group').filter(node => selectedIds.includes(node.id()));

            transformerRef.current.nodes(elementNodes);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedIds]);

    if (selectedIds.length === 0) return null;

    return (
        <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            anchorSize={8}
            anchorCornerRadius={2}
            borderStroke="#D4AF37"
            anchorStroke="#D4AF37"
            rotateAnchorOffset={25}
            boundBoxFunc={(oldBox, newBox) => {
                // Minimum size
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                    return oldBox;
                }
                return newBox;
            }}
        />
    );
}

// Visual Asset Element
// Visual Asset Graphic Component (Extracted for reuse in Ghost Preview)
const AssetGraphic = ({ element, width, height }) => {
    const { assetConfig } = element;
    const color = element.fill || assetConfig?.color || "#555";

    // Table specific rendering (Circular)
    if (assetConfig?.type === 'TABLE' || element.assetType === 'TABLE') {
        const capacity = element.seatConfig?.capacity || assetConfig?.defaultCapacity || 6;
        const tableColor = element.fill || assetConfig?.color || "#78350f";
        const chairs = [];
        const radius = Math.min(width, height) / 2;
        const chairRadius = radius / 4;

        for (let i = 0; i < capacity; i++) {
            const angle = (i / capacity) * 2 * Math.PI;
            const x = width / 2 + Math.cos(angle) * (radius + chairRadius / 2);
            const y = height / 2 + Math.sin(angle) * (radius + chairRadius / 2);
            chairs.push(
                <Circle
                    key={`chair-${i}`}
                    x={x} y={y}
                    radius={chairRadius}
                    fill="#3f3f46"
                    stroke={tableColor}
                    strokeWidth={1}
                    listening={false}
                />
            );
        }

        return (
            <Group>
                <Circle x={width / 2 + 2} y={height / 2 + 2} radius={radius} fill="black" opacity={0.2} listening={false} />
                <Circle x={width / 2} y={height / 2} radius={radius} fill={tableColor} stroke="#451a03" strokeWidth={2} shadowBlur={5} shadowOpacity={0.5} />
                <Circle x={width / 2} y={height / 2} radius={radius * 0.85} stroke="#451a03" strokeWidth={1} opacity={0.3} listening={false} />
                {chairs}
                <Text text={`${capacity}`} width={width} height={height} align="center" verticalAlign="middle" fill="white" fontStyle="bold" fontSize={radius / 2} opacity={0.9} listening={false} />
            </Group>
        );
    }

    // Rectangular table rendering
    if (assetConfig?.type === 'RECT_TABLE' || element.assetType === 'RECT_TABLE') {
        const chairRadius = 6;
        const capacity = element.seatConfig?.capacity || assetConfig?.defaultCapacity || 6;
        const tableColor = element.fill || assetConfig?.color || "#78350f";
        const w = width || 120;
        const h = height || 80;
        const chairs = [];

        const seatPositions = getRectTableSeats(w, h, capacity, 5, chairRadius);
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
            <Group listening={true}>
                <Rect x={2} y={2} width={w} height={h} fill="black" opacity={0.2} cornerRadius={8} listening={false} />
                <Rect width={w} height={h} fill={tableColor} stroke="#451a03" strokeWidth={2} cornerRadius={8} shadowBlur={5} shadowOpacity={0.5} />
                <Rect x={10} y={10} width={w - 20} height={h - 20} stroke="#451a03" strokeWidth={1} opacity={0.3} cornerRadius={4} listening={false} />
                {chairs}
                <Text text={`${capacity}`} width={w} height={h} align="center" verticalAlign="middle" fill="white" fontStyle="bold" fontSize={24} opacity={0.9} listening={false} />
            </Group>
        );
    }

    // Default Asset Graphic
    return (
        <Group>
            <Rect width={width} height={height} fill={`${color}40`} stroke={color} strokeWidth={2} cornerRadius={4} dash={element.type === "PILLAR" ? undefined : [5, 2]} />
            {(assetConfig?.type === "STAGE" || assetConfig?.type === "CONSOLE") && (
                <>
                    <Line points={[0, 0, width, height]} stroke={color} strokeWidth={1} opacity={0.3} />
                    <Line points={[width, 0, 0, height]} stroke={color} strokeWidth={1} opacity={0.3} />
                </>
            )}
            <Text text={element.name || assetConfig?.label || "ASSET"} width={width} height={height} align="center" verticalAlign="middle" fill="#fff" fontStyle="bold" fontSize={Math.max(10, Math.min(width, height) / 5)} padding={5} />
        </Group>
    );
};

// Visual Asset Element
function AssetElement({ element, isSelected, onSelect, onChange, draggable }) {
    const shapeRef = useRef(null);

    return (
        <Group
            id={element.id}
            name="element-group"
            ref={shapeRef}
            x={element.x} y={element.y}
            width={element.width} height={element.height}
            rotation={element.rotation || 0}
            draggable={draggable}
            onMouseEnter={(e) => {
                if (draggable) e.target.getStage().container().style.cursor = 'move';
            }}
            onMouseLeave={(e) => {
                e.target.getStage().container().style.cursor = 'default';
            }}
            onClick={onSelect} onTap={onSelect}

            // --- GOLDEN RULE IMPLEMENTATION START ---
            onDragStart={(e) => {
                console.log("Drag Start:", element.id, "Type:", element.type || element.assetType);
                // 1. Ensure selection
                if (!isSelected) {
                    useSeatEngine.getState().setSelectedIds([element.id]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = useSeatEngine.getState().selectedIds;

                // 2. Identify all nodes to move
                const targetIds = currentSelectedIds.includes(element.id)
                    ? currentSelectedIds
                    : [element.id];

                const allElements = useSeatEngine.getState().elements;

                // 3. Snapshot initial positions (The "Anchor" State)
                stage._draggedNodes = allElements
                    .filter(el => targetIds.includes(el.id))
                    .map(el => ({ id: el.id, x: el.x, y: el.y }));

                // 4. Record where the primary node started (Relative to parent)
                stage._dragStartPos = { x: e.target.x(), y: e.target.y() };
            }}

            onDragMove={(e) => {
                e.evt.preventDefault();
                const stage = e.target.getStage();
                if (!stage._dragStartPos) return;

                // 5. Calculate Delta based on Node position (NOT Pointer)
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                console.log("Dragging:", element.id, "Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) }, "Moving Nodes:", stage._draggedNodes?.length);

                // 6. Move siblings manually. DO NOT move self (Konva does it).
                stage.find('.element-group').forEach(node => {
                    if (node === e.target) return; // Skip the active drag node
                    const stored = stage._draggedNodes?.find(d => d.id === node.id());
                    if (stored) {
                        node.position({ x: stored.x + dx, y: stored.y + dy });
                    }
                });
            }}

            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    // Fallback for click without drag
                    onChange({ x: e.target.x(), y: e.target.y() });
                    return;
                }

                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                console.log("Drag End:", element.id, "Final Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) });

                // 7. Commit to Store ONCE
                stage._draggedNodes?.forEach(d => {
                    useSeatEngine.getState().updateElement(d.id, { x: d.x + dx, y: d.y + dy });
                });

                // Cleanup
                delete stage._draggedNodes;
                delete stage._dragStartPos;
            }}
            // --- GOLDEN RULE IMPLEMENTATION END ---

            onTransformEnd={() => {
                const node = shapeRef.current;
                onChange({
                    x: node.x(), y: node.y(),
                    width: Math.max(20, node.width() * node.scaleX()),
                    height: Math.max(20, node.height() * node.scaleY()),
                    rotation: node.rotation()
                });
                node.scaleX(1); node.scaleY(1);
            }}
        >
            <AssetGraphic element={element} width={element.width} height={element.height} />
        </Group>
    );
}

// Zone component with LOD
// Zone component with LOD
function ZoneElement({ element, isSelected, onSelect, onChange, scale, draggable }) {
    const groupRef = useRef(null);

    // Removed individual transformer logic

    const categories = useSeatEngine.getState().categories;
    const category = categories.find(c => c.id === element.seatConfig?.categoryId);
    const fillColor = category ? category.color : (element.fill || ZONE_FILL_DEFAULT);
    const isLowDetail = scale < LOD_THRESHOLD;

    return (
        <>
            <Group
                id={element.id}
                name="element-group"
                ref={groupRef}
                x={element.x} y={element.y}
                width={element.width} height={element.height}
                rotation={element.rotation || 0}
                draggable={draggable}
                onMouseEnter={(e) => {
                    if (draggable) {
                        const stage = e.target.getStage();
                        stage.container().style.cursor = 'move';
                    }
                }}
                onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    stage.container().style.cursor = 'default';
                }}
                onClick={onSelect} onTap={onSelect}
                onDragStart={(e) => {
                    console.log("Zone Drag Start:", element.id);
                    // Seamless drag: if not selected, select it first
                    if (!isSelected) {
                        useSeatEngine.getState().setSelectedIds([element.id]);
                    }
                    const stage = e.target.getStage();
                    const currentSelectedIds = useSeatEngine.getState().selectedIds;
                    const allElements = useSeatEngine.getState().elements;
                    const targetIds = currentSelectedIds.includes(element.id)
                        ? currentSelectedIds
                        : [element.id];

                    stage._draggedNodes = allElements
                        .filter(el => targetIds.includes(el.id))
                        .map(el => ({ id: el.id, x: el.x, y: el.y }));
                    stage._dragStartPos = { x: e.target.x(), y: e.target.y() };
                }}
                onDragMove={(e) => {
                    e.evt.preventDefault();
                    const stage = e.target.getStage();
                    if (!stage._dragStartPos) return;
                    const dx = e.target.x() - stage._dragStartPos.x;
                    const dy = e.target.y() - stage._dragStartPos.y;

                    console.log("Zone Dragging:", element.id, "Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) });

                    stage.find('.element-group').forEach(node => {
                        if (node === e.target) return;
                        const stored = stage._draggedNodes?.find(d => d.id === node.id());
                        if (stored) node.position({ x: stored.x + dx, y: stored.y + dy });
                    });
                }}
                onDragEnd={(e) => {
                    const stage = e.target.getStage();
                    if (!stage._dragStartPos) {
                        onChange({ x: e.target.x(), y: e.target.y() });
                        return;
                    }
                    const dx = e.target.x() - stage._dragStartPos.x;
                    const dy = e.target.y() - stage._dragStartPos.y;

                    console.log("Zone Drag End:", element.id, "Final Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) });

                    stage._draggedNodes?.forEach(d => {
                        useSeatEngine.getState().updateElement(d.id, { x: d.x + dx, y: d.y + dy });
                    });
                    delete stage._draggedNodes;
                    delete stage._dragStartPos;
                }}
                onTransformEnd={() => {
                    const node = groupRef.current;
                    onChange({
                        x: node.x(), y: node.y(),
                        width: Math.max(20, node.width() * node.scaleX()),
                        height: Math.max(20, node.height() * node.scaleY()),
                        rotation: node.rotation()
                    });
                    node.scaleX(1); node.scaleY(1);
                }}
            >
                <Rect
                    width={element.width} height={element.height}
                    fill={fillColor}
                    opacity={isLowDetail ? LOD_OPACITY : ZONE_OPACITY}
                    cornerRadius={isLowDetail ? 4 : 8}
                    stroke={isSelected ? "#D4AF37" : fillColor}
                    strokeWidth={isSelected ? 3 : 1}
                />

                {isLowDetail && (
                    <Text
                        text={element.name?.toUpperCase() || "ZONE"}
                        width={element.width} height={element.height}
                        fontSize={Math.min(element.width, element.height) / 4}
                        fontStyle="bold" fill="white" align="center" verticalAlign="middle" listening={false}
                    />
                )}

                {!isLowDetail && (
                    <>
                        {element.name && (
                            <Text x={0} y={5} width={element.width} text={element.name} fontSize={12} fontStyle="bold" fill={isSelected ? "#fff" : fillColor} align="center" listening={false} />
                        )}
                        {renderSeats(element, scale)}
                    </>
                )}
            </Group>
        </>
    );
}

// Circle element
function CircleElement({ element, isSelected, onSelect, onChange, draggable }) {
    const shapeRef = useRef(null);
    const fillColor = element.fill || ZONE_FILL_DEFAULT;
    return (
        <Group
            id={element.id}
            name="element-group"
            ref={shapeRef} x={element.x} y={element.y}
            draggable={draggable}
            onMouseEnter={(e) => {
                if (draggable) {
                    const stage = e.target.getStage();
                    stage.container().style.cursor = 'move';
                }
            }}
            onMouseLeave={(e) => {
                const stage = e.target.getStage();
                stage.container().style.cursor = 'default';
            }}
            onClick={onSelect}
            onDragStart={(e) => {
                console.log("Circle Drag Start:", element.id);
                if (!isSelected) {
                    useSeatEngine.getState().setSelectedIds([element.id]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = useSeatEngine.getState().selectedIds;
                const allElements = useSeatEngine.getState().elements;
                const targetIds = currentSelectedIds.includes(element.id)
                    ? currentSelectedIds
                    : [element.id];
                stage._draggedNodes = allElements
                    .filter(el => targetIds.includes(el.id))
                    .map(el => ({ id: el.id, x: el.x, y: el.y }));
                stage._dragStartPos = { x: e.target.x(), y: e.target.y() };
            }}
            onDragMove={(e) => {
                e.evt.preventDefault();
                const stage = e.target.getStage();
                if (!stage._dragStartPos) return;
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                console.log("Circle Dragging:", element.id, "Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) });

                stage.find('.element-group').forEach(node => {
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find(d => d.id === node.id());
                    if (stored) node.position({ x: stored.x + dx, y: stored.y + dy });
                });
            }}
            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    onChange({ x: e.target.x(), y: e.target.y() });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                console.log("Circle Drag End:", element.id, "Final Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) });

                stage._draggedNodes?.forEach(d => {
                    useSeatEngine.getState().updateElement(d.id, { x: d.x + dx, y: d.y + dy });
                });
                delete stage._draggedNodes;
                delete stage._dragStartPos;
            }}
            onTransformEnd={() => {
                const node = shapeRef.current;
                const scale = Math.max(node.scaleX(), node.scaleY());
                onChange({ x: node.x(), y: node.y(), width: element.width * scale, height: element.height * scale });
                node.scaleX(1); node.scaleY(1);
            }}
        >
            <Circle x={element.width / 2} y={element.height / 2} radius={element.width / 2} fill={fillColor} opacity={ZONE_OPACITY} stroke={isSelected ? "#D4AF37" : fillColor} strokeWidth={isSelected ? 2 : 1} />
        </Group>
    );
}

function PolygonElement({ element, isSelected, onSelect, onChange, draggable }) {
    const shapeRef = useRef(null);
    const fillColor = element.fill || ZONE_FILL_DEFAULT;
    return (
        <Group
            id={element.id}
            name="element-group"
            ref={shapeRef} x={element.x} y={element.y}
            draggable={draggable}
            onMouseEnter={(e) => {
                if (draggable) {
                    const stage = e.target.getStage();
                    stage.container().style.cursor = 'move';
                }
            }}
            onMouseLeave={(e) => {
                const stage = e.target.getStage();
                stage.container().style.cursor = 'default';
            }}
            onClick={onSelect}
            onDragStart={(e) => {
                console.log("Polygon Drag Start:", element.id);
                if (!isSelected) {
                    useSeatEngine.getState().setSelectedIds([element.id]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = useSeatEngine.getState().selectedIds;
                const allElements = useSeatEngine.getState().elements;
                const targetIds = currentSelectedIds.includes(element.id)
                    ? currentSelectedIds
                    : [element.id];
                stage._draggedNodes = allElements
                    .filter(el => targetIds.includes(el.id))
                    .map(el => ({ id: el.id, x: el.x, y: el.y }));
                stage._dragStartPos = { x: e.target.x(), y: e.target.y() };
            }}
            onDragMove={(e) => {
                e.evt.preventDefault();
                const stage = e.target.getStage();
                if (!stage._dragStartPos) return;
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                console.log("Polygon Dragging:", element.id, "Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) });

                stage.find('.element-group').forEach(node => {
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find(d => d.id === node.id());
                    if (stored) node.position({ x: stored.x + dx, y: stored.y + dy });
                });
            }}
            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    onChange({ x: e.target.x(), y: e.target.y() });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                console.log("Polygon Drag End:", element.id, "Final Delta:", { dx: dx.toFixed(2), dy: dy.toFixed(2) });

                stage._draggedNodes?.forEach(d => {
                    useSeatEngine.getState().updateElement(d.id, { x: d.x + dx, y: d.y + dy });
                });
                delete stage._draggedNodes;
                delete stage._dragStartPos;
            }}
        >
            <Line points={element.points || []} closed fill={fillColor} opacity={ZONE_OPACITY} stroke={isSelected ? "#D4AF37" : fillColor} strokeWidth={2} />
            {element.name && (
                <Text
                    text={element.name.toUpperCase()}
                    x={element.points ? (Math.min(...element.points.filter((_, i) => i % 2 === 0)) + Math.max(...element.points.filter((_, i) => i % 2 === 0))) / 2 - 50 : 0}
                    y={element.points ? (Math.min(...element.points.filter((_, i) => i % 2 === 1)) + Math.max(...element.points.filter((_, i) => i % 2 === 1))) / 2 - 10 : 0}
                    width={100}
                    align="center"
                    fontSize={14} fontStyle="bold"
                    fill={fillColor} opacity={0.6} letterSpacing={1}
                    listening={false}
                />
            )}
        </Group>
    );
}


export default function CanvasStage() {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const {
        stageConfig, setStageSize, setStagePosition, tool, setTool, elements, addElement, updateElement,
        selectedIds, setSelectedIds, toggleSelection, clearSelection, deleteSelectedElement, canvasSettings
    } = useSeatEngine();

    const [isDrawing, setIsDrawing] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
    const [newElement, setNewElement] = useState(null);
    const [polyPoints, setPolyPoints] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Ghost Preview State
    const [draggingAsset, setDraggingAsset] = useState(null);
    const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });

    // Debugging Overlay State
    const [debugStats, setDebugStats] = useState({
        rawX: 0, rawY: 0,
        virtX: 0, virtY: 0,
        stageX: 0, stageY: 0,
        zoom: 1
    });

    useEffect(() => {
        const updateSize = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            setStageSize(width, height);
        };
        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        updateSize();
        return () => resizeObserver.disconnect();
    }, [setStageSize]);

    // Integrated Keyboard Shortcuts
    useSeatHotkeys();

    const getRelativePos = () => {
        const stage = stageRef.current;
        if (!stage) return null;
        const pointer = stage.getPointerPosition();
        if (!pointer) return null;
        return { x: (pointer.x - stage.x()) / stage.scaleX(), y: (pointer.y - stage.y()) / stage.scaleY() };
    };

    const handleWheel = useCallback((e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        const oldScale = stageConfig.scale;
        const pointer = stage.getPointerPosition();
        const mousePointTo = { x: (pointer.x - stageConfig.x) / oldScale, y: (pointer.y - stageConfig.y) / oldScale };
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * (e.evt.deltaY > 0 ? 1 / SCALE_FACTOR : SCALE_FACTOR)));
        setStagePosition(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale, newScale);
    }, [stageConfig, setStagePosition]);

    const handleMouseDown = (e) => {
        if (tool === TOOL_TYPES.SELECT) {
            if (e.target === e.target.getStage()) {
                clearSelection();
                // Start selection box
                const pos = getRelativePos();
                if (pos) {
                    setIsSelecting(true);
                    setSelectionBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
                }
            }
            return;
        }
        if (tool === TOOL_TYPES.POLYGON) return;
        const pos = getRelativePos();
        if (!pos) return;
        setIsDrawing(true);
        setDrawStart(pos);

        // Handle explicit asset tools
        const isAssetTool = tool === "STAGE" || tool === "EXIT";
        const finalToolType = isAssetTool ? TOOL_TYPES.IMAGE : tool;
        const assetType = isAssetTool ? tool : null;

        setNewElement({
            type: finalToolType,
            x: pos.x, y: pos.y,
            width: 0, height: 0,
            fill: ZONE_FILL_DEFAULT,
            name: tool === TOOL_TYPES.RECTANGLE ? "New Section" : (isAssetTool ? tool : "Asset"),
            assetType
        });
    };

    const handleMouseMove = (e) => {
        const stage = stageRef.current;
        if (!stage) return;

        // 1. Get raw pointer position
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // 2. Get relative (virtual) position
        const pos = stage.getRelativePointerPosition();
        if (!pos) return;

        setMousePos(pos);

        // 3. Update Debug Stats
        setDebugStats({
            rawX: pointer.x, rawY: pointer.y,
            virtX: pos.x, virtY: pos.y,
            stageX: stage.x(), stageY: stage.y(),
            zoom: stage.scaleX()
        });

        if (isSelecting) {
            setSelectionBox(prev => ({ ...prev, x2: pos.x, y2: pos.y }));
            return;
        }

        if (!isDrawing || !newElement || tool === TOOL_TYPES.POLYGON) return;

        const width = pos.x - drawStart.x;
        const height = pos.y - drawStart.y;

        // Asset types usually maintain aspect ratio or have minimum size for preview
        const absWidth = Math.max(isDrawing && newElement.type === TOOL_TYPES.IMAGE ? 50 : 0, Math.abs(width));
        const absHeight = Math.max(isDrawing && newElement.type === TOOL_TYPES.IMAGE ? 30 : 0, Math.abs(height));

        setNewElement(prev => ({
            ...prev,
            width: absWidth,
            height: absHeight,
            x: width < 0 ? pos.x : drawStart.x,
            y: height < 0 ? pos.y : drawStart.y
        }));
    };

    const handleMouseUp = () => {
        if (isSelecting) {
            setIsSelecting(false);
            // Find intersect elements
            const x = Math.min(selectionBox.x1, selectionBox.x2);
            const y = Math.min(selectionBox.y1, selectionBox.y2);
            const w = Math.abs(selectionBox.x1 - selectionBox.x2);
            const h = Math.abs(selectionBox.y1 - selectionBox.y2);

            if (w > 5 && h > 5) {
                const intersectIds = elements.filter(el => {
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
                }).map(el => el.id);

                if (intersectIds.length > 0) {
                    setSelectedIds(intersectIds);
                }
            }
            return;
        }

        if (!isDrawing || tool === TOOL_TYPES.POLYGON) return;
        if (newElement && (newElement.width > 20 || tool === TOOL_TYPES.IMAGE)) {
            addElement(newElement);
        }
        setIsDrawing(false); setNewElement(null);
    };

    const handleStageClick = () => {
        if (tool !== TOOL_TYPES.POLYGON) return;
        const pos = getRelativePos();
        if (!pos) return;
        if (polyPoints.length >= 6) {
            const dist = Math.sqrt(Math.pow(pos.x - polyPoints[0], 2) + Math.pow(pos.y - polyPoints[1], 2));
            if (dist < SNAP_RADIUS) {
                addElement({ type: TOOL_TYPES.POLYGON, name: "Standing Area", points: polyPoints, fill: "#ef4444", x: 0, y: 0, width: 10, height: 10 });
                setPolyPoints([]); return;
            }
        }
        setPolyPoints(prev => [...prev, pos.x, pos.y]);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage || !containerRef.current) return;

        // 1. Get exact position of the Canvas on screen (Handles Sidebar offset)
        const stageRect = containerRef.current.getBoundingClientRect();

        // 2. Calculate Pointer relative to the Canvas DIV
        const pointerX = e.clientX - stageRect.left;
        const pointerY = e.clientY - stageRect.top;

        // 3. Convert to Virtual Coordinates (Account for Zoom/Pan)
        const finalX = (pointerX - stage.x()) / stage.scaleX();
        const finalY = (pointerY - stage.y()) / stage.scaleY();

        // 4. Register Asset Data
        const assetJson = e.dataTransfer.getData("asset");
        if (!assetJson) return;

        try {
            const asset = JSON.parse(assetJson);

            // 5. Apply Snap (n8n Style)
            const snappedX = Math.round(finalX / SNAP_SIZE) * SNAP_SIZE;
            const snappedY = Math.round(finalY / SNAP_SIZE) * SNAP_SIZE;

            // 6. Add Element
            const assetW = asset.width || 100;
            const assetH = asset.height || 100;

            addElement({
                type: TOOL_TYPES.ASSET,
                x: snappedX,
                y: snappedY,
                width: assetW,
                height: assetH,
                rotation: 0,
                name: asset.label || "Asset",
                assetType: asset.type,
                assetConfig: asset
            });

            // Switch to Select tool
            if (setTool) setTool(TOOL_TYPES.SELECT);
            else useSeatEngine.getState().setTool(TOOL_TYPES.SELECT);
        } catch (err) {
            console.error("Drop refinement failed:", err);
        } finally {
            setDraggingAsset(null);
        }
    };

    const handleDragEnter = (e) => {
        const assetJson = e.dataTransfer.getData("asset");
        if (assetJson) {
            try {
                setDraggingAsset(JSON.parse(assetJson));
            } catch (err) {
                console.error("DragEnter parse failed:", err);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage || !containerRef.current) return;

        // 1. Sync Ghost using same math as handleDrop
        const stageRect = containerRef.current.getBoundingClientRect();
        const pointerX = e.clientX - stageRect.left;
        const pointerY = e.clientY - stageRect.top;

        const virtX = (pointerX - stage.x()) / stage.scaleX();
        const virtY = (pointerY - stage.y()) / stage.scaleY();

        // 2. Apply Snap to Ghost Preview
        const snappedX = Math.round(virtX / SNAP_SIZE) * SNAP_SIZE;
        const snappedY = Math.round(virtY / SNAP_SIZE) * SNAP_SIZE;

        setGhostPos({ x: snappedX, y: snappedY });
    };

    const handleDragLeave = () => {
        setDraggingAsset(null);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-zinc-950 overflow-hidden"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ touchAction: 'none' }}
        >
            {/* Grid */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `radial-gradient(circle, rgba(212, 175, 55, 0.15) 1px, transparent 1px)`,
                backgroundSize: `${20 * stageConfig.scale}px ${20 * stageConfig.scale}px`,
                backgroundPosition: `${stageConfig.x}px ${stageConfig.y}px`,
                pointerEvents: "none"
            }} />

            <Stage
                ref={stageRef}
                width={stageConfig.width} height={stageConfig.height}
                x={stageConfig.x} y={stageConfig.y}
                scaleX={stageConfig.scale} scaleY={stageConfig.scale}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleStageClick}
                draggable={tool === TOOL_TYPES.SELECT && selectedIds.length === 0}
                onDragEnd={(e) => setStagePosition(e.target.x(), e.target.y(), stageConfig.scale)}
                style={{ cursor: tool === TOOL_TYPES.SELECT ? "default" : "crosshair" }}
            >
                <Layer>
                    {elements.map(el => {
                        const isSelected = selectedIds.includes(el.id);
                        const handleSelect = (e) => {
                            // If shift is pressed, toggle selection
                            if (e.evt.shiftKey) {
                                toggleSelection(el.id);
                            } else {
                                // Otherwise, single selection (unless already part of a multi-selection)
                                if (!isSelected) {
                                    setSelectedIds([el.id]);
                                }
                            }
                        };

                        const isDraggable = tool === TOOL_TYPES.SELECT;

                        if (el.type === TOOL_TYPES.RECTANGLE || el.type === TOOL_TYPES.CURVE)
                            return <ZoneElement key={el.id} element={el} isSelected={isSelected} onSelect={handleSelect} onChange={u => updateElement(el.id, u)} scale={stageConfig.scale} draggable={isDraggable} />;
                        if (el.type === TOOL_TYPES.CIRCLE)
                            return <CircleElement key={el.id} element={el} isSelected={isSelected} onSelect={handleSelect} onChange={u => updateElement(el.id, u)} draggable={isDraggable} />;
                        if (el.type === TOOL_TYPES.POLYGON)
                            return <PolygonElement key={el.id} element={el} isSelected={isSelected} onSelect={handleSelect} onChange={u => updateElement(el.id, u)} draggable={isDraggable} />;
                        if (el.type === TOOL_TYPES.IMAGE || el.type === TOOL_TYPES.ASSET)
                            return <AssetElement key={el.id} element={el} isSelected={isSelected} onSelect={handleSelect} onChange={u => updateElement(el.id, u)} draggable={isDraggable} />;
                        return null;
                    })}

                    {/* Ghost Asset Preview */}
                    {draggingAsset && (
                        <Group
                            x={ghostPos.x}
                            y={ghostPos.y}
                            opacity={0.5}
                            listening={false}
                        >
                            <AssetGraphic
                                element={{
                                    assetConfig: draggingAsset,
                                    assetType: draggingAsset.type,
                                    fill: draggingAsset.color
                                }}
                                width={draggingAsset.width || 100}
                                height={draggingAsset.height || 100}
                            />
                        </Group>
                    )}

                    {/* Multi-Select Transformer */}
                    <MultiTransformer selectedIds={selectedIds} />

                    {/* Selection Box */}
                    {isSelecting && (
                        <Rect
                            x={Math.min(selectionBox.x1, selectionBox.x2)}
                            y={Math.min(selectionBox.y1, selectionBox.y2)}
                            width={Math.abs(selectionBox.x1 - selectionBox.x2)}
                            height={Math.abs(selectionBox.y1 - selectionBox.y2)}
                            fill="rgba(212, 175, 55, 0.1)"
                            stroke="#D4AF37"
                            strokeWidth={1}
                            dash={[4, 2]}
                        />
                    )}

                    {isDrawing && newElement && (
                        <Rect x={newElement.x} y={newElement.y} width={newElement.width} height={newElement.height} fill={ZONE_FILL_DEFAULT} opacity={0.3} stroke="#D4AF37" strokeWidth={1} dash={[5, 5]} />
                    )}

                    {tool === TOOL_TYPES.POLYGON && polyPoints.length > 0 && (
                        <>
                            <Line points={polyPoints} stroke="#D4AF37" strokeWidth={2} />
                            <Line points={[polyPoints[polyPoints.length - 2], polyPoints[polyPoints.length - 1], mousePos.x, mousePos.y]} stroke="#D4AF37" strokeWidth={1} dash={[5, 2]} />
                            <Circle x={polyPoints[0]} y={polyPoints[1]} radius={5} fill="#D4AF37" />
                        </>
                    )}
                </Layer>
            </Stage>
            <div className="absolute bottom-4 left-4 text-[10px] text-zinc-600 font-mono">SCALE: {Math.round(stageConfig.scale * 100)}% | LOD: {stageConfig.scale < LOD_THRESHOLD ? "LOW" : "HIGH"}</div>

            {/* LIVE COORDINATE DEBUGGER UI */}
            <div className="absolute top-4 right-4 bg-zinc-900/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none z-50 font-mono text-[10px] space-y-2 min-w-[200px]">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-amber-500 font-bold uppercase tracking-widest">Live Dev Debugger</span>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                        <span>MOUSE RAW (SCREEN)</span>
                        <span className="text-white">[{Math.round(debugStats.rawX)}, {Math.round(debugStats.rawY)}]</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                        <span>MOUSE VIRT (CANVAS)</span>
                        <span className="text-amber-400 font-bold">[{Math.round(debugStats.virtX)}, {Math.round(debugStats.virtY)}]</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                    <div className="flex justify-between text-zinc-500">
                        <span>STAGE PAN</span>
                        <span className="text-white">[{Math.round(debugStats.stageX)}, {Math.round(debugStats.stageY)}]</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                        <span>ZOOM LEVEL</span>
                        <span className="text-white">{(debugStats.zoom * 100).toFixed(0)}%</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/5 text-[9px] text-zinc-600 text-center italic">
                    Industry Standard Konva Sync Active
                </div>
            </div>
        </div>
    );
}
