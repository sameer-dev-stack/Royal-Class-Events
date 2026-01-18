"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Circle, Group, Transformer, Text, Line } from "react-konva";
import useSeatEngine, { TOOL_TYPES, SEAT_NAMING } from "@/hooks/use-seat-engine";
import useSeatHotkeys from "@/hooks/use-seat-hotkeys";
import { calculateArcPosition, getRectTableSeats } from "@/utils/geometry";
import { ASSET_LIBRARY } from "@/constants/seat-engine-assets";

/**
 * Royal Seat Engine - Canvas Stage Component
 * FIXED VERSION - All drag bugs resolved
 */

// Scale constraints
const MIN_SCALE = 0.05;
const MAX_SCALE = 5;
const SCALE_FACTOR = 1.1;

// Colors
const ZONE_FILL_DEFAULT = "#D4AF37";
const ZONE_OPACITY = 0.15;
const LOD_OPACITY = 0.8;
const SEAT_FILL_DEFAULT = "#52525b";

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

    const categories = useSeatEngine.getState().categories;
    const category = categories.find(c => c.id === categoryId);
    const seatColor = category ? category.color : (fill || SEAT_FILL_DEFAULT);

    if (scale < LOD_THRESHOLD) return null;
    if (!rowCount || rowCount <= 0 || !colCount || colCount <= 0) return null;

    const labelSpace = showLabels ? LABEL_WIDTH : 0;

    if (curvature > 0) {
        const arcWidth = width - labelSpace;
        const centerX = labelSpace + arcWidth / 2;
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
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                    return oldBox;
                }
                return newBox;
            }}
        />
    );
}

// Asset Graphic Component
const AssetGraphic = ({ element, width, height }) => {
    const { assetConfig } = element;
    const color = element.fill || assetConfig?.color || "#555";

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

// 🔥 FIXED AssetElement Component
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

            onDragStart={(e) => {
                if (!isSelected) {
                    useSeatEngine.getState().setSelectedIds([element.id]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = useSeatEngine.getState().selectedIds;
                const allElements = useSeatEngine.getState().elements;

                const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [element.id];

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

                stage.find('.element-group').forEach(node => {
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find(d => d.id === node.id());
                    if (stored) {
                        node.position({ x: stored.x + dx, y: stored.y + dy });
                    }
                });
            }}

            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    const snappedX = Math.round(e.target.x() / 10) * 10;
                    const snappedY = Math.round(e.target.y() / 10) * 10;
                    onChange({ x: snappedX, y: snappedY });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                stage._draggedNodes?.forEach(d => {
                    const snappedX = Math.round((d.x + dx) / 10) * 10;
                    const snappedY = Math.round((d.y + dy) / 10) * 10;
                    useSeatEngine.getState().updateElement(d.id, { x: snappedX, y: snappedY });
                });

                delete stage._draggedNodes;
                delete stage._dragStartPos;
            }}

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

// 🔥 FIXED ZoneElement Component
function ZoneElement({ element, isSelected, onSelect, onChange, scale, draggable }) {
    const groupRef = useRef(null);

    const categories = useSeatEngine.getState().categories;
    const category = categories.find(c => c.id === element.seatConfig?.categoryId);
    const fillColor = category ? category.color : (element.fill || ZONE_FILL_DEFAULT);
    const isLowDetail = scale < LOD_THRESHOLD;

    return (
        <Group
            id={element.id}
            name="element-group"
            ref={groupRef}
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

            onDragStart={(e) => {
                if (!isSelected) {
                    useSeatEngine.getState().setSelectedIds([element.id]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = useSeatEngine.getState().selectedIds;
                const allElements = useSeatEngine.getState().elements;
                const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [element.id];

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

                stage.find('.element-group').forEach(node => {
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find(d => d.id === node.id());
                    if (stored) node.position({ x: stored.x + dx, y: stored.y + dy });
                });
            }}

            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    const snappedX = Math.round(e.target.x() / 10) * 10;
                    const snappedY = Math.round(e.target.y() / 10) * 10;
                    onChange({ x: snappedX, y: snappedY });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                stage._draggedNodes?.forEach(d => {
                    const snappedX = Math.round((d.x + dx) / 10) * 10;
                    const snappedY = Math.round((d.y + dy) / 10) * 10;
                    useSeatEngine.getState().updateElement(d.id, { x: snappedX, y: snappedY });
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
    );
}

// 🔥 FIXED CircleElement Component
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
                if (draggable) e.target.getStage().container().style.cursor = 'move';
            }}
            onMouseLeave={(e) => {
                e.target.getStage().container().style.cursor = 'default';
            }}
            onClick={onSelect}

            onDragStart={(e) => {
                if (!isSelected) {
                    useSeatEngine.getState().setSelectedIds([element.id]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = useSeatEngine.getState().selectedIds;
                const allElements = useSeatEngine.getState().elements;
                const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [element.id];
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

                stage.find('.element-group').forEach(node => {
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find(d => d.id === node.id());
                    if (stored) node.position({ x: stored.x + dx, y: stored.y + dy });
                });
            }}

            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    const snappedX = Math.round(e.target.x() / 10) * 10;
                    const snappedY = Math.round(e.target.y() / 10) * 10;
                    onChange({ x: snappedX, y: snappedY });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                stage._draggedNodes?.forEach(d => {
                    const snappedX = Math.round((d.x + dx) / 10) * 10;
                    const snappedY = Math.round((d.y + dy) / 10) * 10;
                    useSeatEngine.getState().updateElement(d.id, { x: snappedX, y: snappedY });
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

// 🔥 FIXED PolygonElement Component
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
                if (draggable) e.target.getStage().container().style.cursor = 'move';
            }}
            onMouseLeave={(e) => {
                e.target.getStage().container().style.cursor = 'default';
            }}
            onClick={onSelect}

            onDragStart={(e) => {
                if (!isSelected) {
                    useSeatEngine.getState().setSelectedIds([element.id]);
                }
                const stage = e.target.getStage();
                const currentSelectedIds = useSeatEngine.getState().selectedIds;
                const allElements = useSeatEngine.getState().elements;
                const targetIds = currentSelectedIds.includes(element.id) ? currentSelectedIds : [element.id];
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

                stage.find('.element-group').forEach(node => {
                    if (node === e.target) return;
                    const stored = stage._draggedNodes?.find(d => d.id === node.id());
                    if (stored) node.position({ x: stored.x + dx, y: stored.y + dy });
                });
            }}

            onDragEnd={(e) => {
                const stage = e.target.getStage();
                if (!stage._dragStartPos) {
                    const snappedX = Math.round(e.target.x() / 10) * 10;
                    const snappedY = Math.round(e.target.y() / 10) * 10;
                    onChange({ x: snappedX, y: snappedY });
                    return;
                }
                const dx = e.target.x() - stage._dragStartPos.x;
                const dy = e.target.y() - stage._dragStartPos.y;

                stage._draggedNodes?.forEach(d => {
                    const snappedX = Math.round((d.x + dx) / 10) * 10;
                    const snappedY = Math.round((d.y + dy) / 10) * 10;
                    useSeatEngine.getState().updateElement(d.id, { x: snappedX, y: snappedY });
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

    const [draggingAsset, setDraggingAsset] = useState(null);
    const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });

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

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const pos = stage.getRelativePointerPosition();
        if (!pos) return;

        setMousePos(pos);

        if (isSelecting) {
            setSelectionBox(prev => ({ ...prev, x2: pos.x, y2: pos.y }));
            return;
        }

        if (!isDrawing || !newElement || tool === TOOL_TYPES.POLYGON) return;

        const width = pos.x - drawStart.x;
        const height = pos.y - drawStart.y;

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
            const x = Math.min(selectionBox.x1, selectionBox.x2);
            const y = Math.min(selectionBox.y1, selectionBox.y2);
            const w = Math.abs(selectionBox.x1 - selectionBox.x2);
            const h = Math.abs(selectionBox.y1 - selectionBox.y2);

            if (w > 5 && h > 5) {
                const intersectIds = elements.filter(el => {
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
            if (dist < 15) {
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

        // 1. Get the raw DOM position of the canvas container
        // This accounts for the Sidebar offset automatically
        const stageBox = containerRef.current.getBoundingClientRect();

        // 2. Calculate Mouse Position relative to the Canvas DOM element
        // e.clientX is the mouse position on the user's monitor
        const pointerX = e.clientX - stageBox.left;
        const pointerY = e.clientY - stageBox.top;

        // 3. Apply the "Inverse Transform" to account for Zoom (scale) and Pan (x,y)
        // Formula: (RawMouse - StagePan) / StageScale
        const scaleX = stage.scaleX();
        const scaleY = stage.scaleY();

        const finalX = (pointerX - stage.x()) / scaleX;
        const finalY = (pointerY - stage.y()) / scaleY;

        // 4. Snap to Grid (Optional, but recommended for Seat Maps)
        const snappedX = Math.round(finalX / 10) * 10;
        const snappedY = Math.round(finalY / 10) * 10;

        // 5. Process the Asset Data
        const assetJson = e.dataTransfer.getData("asset");
        if (!assetJson) return;

        try {
            const asset = JSON.parse(assetJson);

            // Add the element at the CALCULATED coordinates
            addElement({
                type: TOOL_TYPES.ASSET,
                x: snappedX,
                y: snappedY,
                width: asset.width || 100,
                height: asset.height || 100,
                rotation: 0,
                name: asset.label || "Asset",
                assetType: asset.type,
                assetConfig: asset
            });

            // Switch to Select tool to allow immediate moving of the new item
            useSeatEngine.getState().setTool(TOOL_TYPES.SELECT);

        } catch (err) {
            console.error("Drop failed:", err);
        } finally {
            setDraggingAsset(null);
        }
    };

    const handleDragEnter = (e) => {
        const assetJson = e.dataTransfer.getData("asset");
        if (assetJson) {
            try {
                setDraggingAsset(JSON.parse(assetJson));
            } catch (err) { }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage || !containerRef.current) return;

        stage.setPointersPositions(e);
        const { x, y } = stage.getRelativePointerPosition();

        const snappedX = Math.round(x / 10) * 10;
        const snappedY = Math.round(y / 10) * 10;

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
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `radial-gradient(circle, rgba(212, 175, 55, 0.15) 1px, transparent 1px)`,
                backgroundSize: `${10 * stageConfig.scale}px ${10 * stageConfig.scale}px`,
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
                            if (e.evt.shiftKey) {
                                toggleSelection(el.id);
                            } else {
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

                    {draggingAsset && (
                        <Group x={ghostPos.x} y={ghostPos.y} opacity={0.5} listening={false}>
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

                    <MultiTransformer selectedIds={selectedIds} />

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
        </div>
    );
}
