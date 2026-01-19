"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Circle, Group, Transformer, Text, Line } from "react-konva";
import useSeatEngine, { TOOL_TYPES, SEAT_NAMING } from "@/hooks/use-seat-engine";
import useSeatHotkeys from "@/hooks/use-seat-hotkeys";
import { calculateArcPosition, getRectTableSeats } from "@/utils/geometry";
import AssetRenderer from "./renderers/AssetRenderer";

/**
 * Royal Seat Engine - FIXED PERFORMANCE VERSION
 * Fixed: Dragging lag, Coordinate jumping, and Multi-select sync.
 */

const GRID_SIZE = 10;
const MIN_SCALE = 0.05;
const MAX_SCALE = 5;
const SCALE_FACTOR = 1.1;
const LOD_THRESHOLD = 0.4;
const ZONE_FILL_DEFAULT = "#D4AF37";
const ZONE_OPACITY = 0.15;
const SEAT_FILL_DEFAULT = "#52525b";
const TITLE_HEIGHT = 20;
const LABEL_WIDTH = 25;
const ZONE_PADDING = 10;

// Helper to generate row label text
function getRowLabel(index, namingType) {
    if (namingType === SEAT_NAMING.NUMERICAL) return (index + 1).toString();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (index < 26) return letters[index];
    const first = Math.floor(index / 26) - 1;
    const second = index % 26;
    return letters[first] + letters[second];
}

// Seat Rendering Logic
function renderSeats(element, scale) {
    const { seatConfig, width, height, fill } = element;
    if (!seatConfig || scale < LOD_THRESHOLD) return null;

    const { rowCount, colCount, seatNaming, showLabels, curvature = 0, categoryId } = seatConfig;
    const categories = useSeatEngine.getState().categories;
    const category = categories.find(c => c.id === categoryId);
    const seatColor = category ? category.color : (fill || SEAT_FILL_DEFAULT);
    const seats = [];

    if (curvature > 0) {
        const arcWidth = width - (showLabels ? LABEL_WIDTH : 0);
        const centerX = (showLabels ? LABEL_WIDTH : 0) + arcWidth / 2;
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
                seats.push(<Circle key={`s-${row}-${col}`} x={pos.x} y={pos.y} radius={Math.min(8, 80 / colCount)} fill={seatColor} listening={false} />);
            }
        }
        return seats;
    }

    const labelSpace = showLabels ? LABEL_WIDTH : 0;
    const availableWidth = width - ZONE_PADDING * 2 - labelSpace;
    const availableHeight = height - ZONE_PADDING * 2 - TITLE_HEIGHT;
    if (availableWidth <= 0 || availableHeight <= 0) return null;

    const cellWidth = availableWidth / colCount;
    const cellHeight = availableHeight / rowCount;
    const seatRadius = Math.max(2, Math.min(cellWidth, cellHeight) / 3);

    for (let row = 0; row < rowCount; row++) {
        const y = ZONE_PADDING + TITLE_HEIGHT + cellHeight / 2 + row * cellHeight;
        if (showLabels) {
            seats.push(<Text key={`l-${row}`} x={ZONE_PADDING} y={y - 6} text={getRowLabel(row, seatNaming)} fontSize={10} fontStyle="bold" fill={fill || "#D4AF37"} width={LABEL_WIDTH} align="center" listening={false} />);
        }
        for (let col = 0; col < colCount; col++) {
            const x = ZONE_PADDING + labelSpace + cellWidth / 2 + col * cellWidth;
            seats.push(<Circle key={`s-${row}-${col}`} x={x} y={y} radius={seatRadius} fill={seatColor} listening={false} />);
        }
    }
    return seats;
}

// Global Drag Handlers to prevent Jittering and Lag
const handleDragStartGlobal = (e, element, isSelected) => {
    if (!isSelected) {
        useSeatEngine.getState().setSelectedIds([element.id]);
    }
    const stage = e.target.getStage();
    const selectedIds = useSeatEngine.getState().selectedIds;
    const allElements = useSeatEngine.getState().elements;

    // Store starting positions of all selected elements for relative movement
    stage._draggedNodes = allElements
        .filter(el => selectedIds.includes(el.id))
        .map(el => ({ id: el.id, x: el.x, y: el.y }));

    stage._dragStartPos = { x: e.target.x(), y: e.target.y() };
};

const handleDragMoveGlobal = (e) => {
    const stage = e.target.getStage();
    if (!stage._dragStartPos) return;

    const dx = e.target.x() - stage._dragStartPos.x;
    const dy = e.target.y() - stage._dragStartPos.y;

    // Move all other selected nodes visually WITHOUT updating React state yet
    stage.find('.element-group').forEach(node => {
        if (node === e.target) return; // current node moves naturally
        const stored = stage._draggedNodes?.find(d => d.id === node.id());
        if (stored) {
            node.position({ x: stored.x + dx, y: stored.y + dy });
        }
    });
};

const handleDragEndGlobal = (e, updateElement) => {
    const stage = e.target.getStage();
    if (!stage._dragStartPos) return;

    const dx = e.target.x() - stage._dragStartPos.x;
    const dy = e.target.y() - stage._dragStartPos.y;

    // Bulk update state only once at the end of drag
    stage._draggedNodes?.forEach(d => {
        updateElement(d.id, {
            x: Math.round((d.x + dx) / GRID_SIZE) * GRID_SIZE,
            y: Math.round((d.y + dy) / GRID_SIZE) * GRID_SIZE
        });
    });

    delete stage._draggedNodes;
    delete stage._dragStartPos;
};

// Simplified Asset Graphic


// Generic Element Component to avoid code repetition
function SceneElement({ element, isSelected, onSelect, onChange, scale, draggable }) {
    const shapeRef = useRef(null);
    const updateElement = useSeatEngine(state => state.updateElement);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <Group
            id={element.id}
            name="element-group"
            ref={shapeRef}
            x={element.x} y={element.y}
            draggable={draggable}
            dragBoundFunc={(pos) => ({
                x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
                y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE
            })}
            onClick={onSelect}
            onDragStart={(e) => {
                setIsDragging(true);
                handleDragStartGlobal(e, element, isSelected);
            }}
            onDragMove={handleDragMoveGlobal}
            onDragEnd={(e) => {
                setIsDragging(false);
                handleDragEndGlobal(e, updateElement);
            }}
            onTransformEnd={() => {
                const node = shapeRef.current;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                // 1. Reset scale to 1 IMMEDIATELY to prevent child distortion
                node.scaleX(1);
                node.scaleY(1);

                // 2. Calculate new dimensions with min constraints
                const newWidth = Math.max(50, Math.round(node.width() * scaleX));
                const newHeight = Math.max(50, Math.round(node.height() * scaleY));

                // 3. Update store with clean values
                onChange({
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight,
                    rotation: Math.round(node.rotation())
                });
            }}
        >
            {element.type === TOOL_TYPES.RECTANGLE || element.type === TOOL_TYPES.CURVE ? (
                <>
                    <Rect width={element.width} height={element.height} fill={element.fill || ZONE_FILL_DEFAULT} opacity={ZONE_OPACITY} stroke={isSelected ? "#D4AF37" : (element.fill || ZONE_FILL_DEFAULT)} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} />
                    <Text text={element.name?.toUpperCase()} width={element.width} height={TITLE_HEIGHT} y={5} align="center" fontSize={12} fontStyle="bold" fill={element.fill || ZONE_FILL_DEFAULT} opacity={0.8} listening={false} />
                    {renderSeats(element, scale)}
                </>
            ) : element.type === TOOL_TYPES.CIRCLE ? (
                <Circle x={element.width / 2} y={element.height / 2} radius={element.width / 2} fill={element.fill || ZONE_FILL_DEFAULT} opacity={ZONE_OPACITY} stroke={isSelected ? "#D4AF37" : (element.fill || ZONE_FILL_DEFAULT)} strokeWidth={isSelected ? 2 : 1} />
            ) : (
                <AssetRenderer element={element} width={element.width} height={element.height} />
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
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [setStageSize]);

    useSeatHotkeys();

    // Correctly mapped relative position
    const getRelativePos = (evt) => {
        const stage = stageRef.current;
        if (!stage || !containerRef.current) return null;

        const stageBox = containerRef.current.getBoundingClientRect();
        let pointerX, pointerY;

        if (evt && evt.clientX) {
            pointerX = evt.clientX - stageBox.left;
            pointerY = evt.clientY - stageBox.top;
        } else {
            const pointer = stage.getPointerPosition();
            if (!pointer) return null;
            pointerX = pointer.x;
            pointerY = pointer.y;
        }

        const scaleX = stage.scaleX();
        const scaleY = stage.scaleY();

        return {
            x: (pointerX - stage.x()) / scaleX,
            y: (pointerY - stage.y()) / scaleY
        };
    };

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
        const pos = getRelativePos();
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
                    const elX = el.x; const elY = el.y;
                    const elR = el.x + el.width; const elB = el.y + el.height;
                    const selR = x + w; const selB = y + h;
                    return !(selR < elX || selR > elR || selB < elY || y > elB); // Simplified intersection logic
                }).map(el => el.id);

                if (intersectIds.length > 0) setSelectedIds(intersectIds);
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
        const pos = getRelativePos(e);
        if (!pos) return;

        const assetJson = e.dataTransfer.getData("asset");
        if (!assetJson) return;

        try {
            const asset = JSON.parse(assetJson);
            const w = parseFloat(asset.width || assetConfig?.width || 100);
            const h = parseFloat(asset.height || assetConfig?.height || 100);
            const finalX = pos.x - (w / 2);
            const finalY = pos.y - (h / 2);
            const snappedX = Math.round(finalX / 10) * 10;
            const snappedY = Math.round(finalY / 10) * 10;

            addElement({
                type: TOOL_TYPES.ASSET,
                x: snappedX, y: snappedY,
                width: w, height: h,
                rotation: 0,
                name: asset.label || "Asset",
                assetType: asset.type,
                assetConfig: asset
            });
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
        const pos = getRelativePos(e);
        if (!pos) return;

        let w = 100; let h = 100;
        if (draggingAsset) {
            w = parseFloat(draggingAsset.width || 100);
            h = parseFloat(draggingAsset.height || 100);
        }
        const finalX = pos.x - (w / 2);
        const finalY = pos.y - (h / 2);
        const snappedX = Math.round(finalX / 10) * 10;
        const snappedY = Math.round(finalY / 10) * 10;
        setGhostPos({ x: snappedX, y: snappedY });
    };

    const handleDragLeave = () => {
        setDraggingAsset(null);
    };

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * (e.evt.deltaY > 0 ? 1 / SCALE_FACTOR : SCALE_FACTOR)));
        setStagePosition(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale, newScale);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-zinc-950 overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <Stage
                ref={stageRef}
                width={stageConfig.width} height={stageConfig.height}
                x={stageConfig.x} y={stageConfig.y}
                scaleX={stageConfig.scale} scaleY={stageConfig.scale}
                onWheel={handleWheel}
                draggable={tool === TOOL_TYPES.SELECT && selectedIds.length === 0}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleStageClick}
                onDragEnd={(e) => {
                    if (e.target === stageRef.current) setStagePosition(e.target.x(), e.target.y(), stageConfig.scale);
                }}
            >
                <Layer perfectDrawEnabled={false}>
                    {/* Ghost Asset for Drag Over */}
                    {draggingAsset && (
                        <Group x={ghostPos.x} y={ghostPos.y} opacity={0.6}>
                            <AssetRenderer
                                element={{
                                    assetType: draggingAsset.type,
                                    assetConfig: draggingAsset,
                                    name: draggingAsset.label
                                }}
                                width={parseFloat(draggingAsset.width || 100)}
                                height={parseFloat(draggingAsset.height || 100)}
                            />
                        </Group>
                    )}

                    {/* New Element Preview (Drawing) */}
                    {isDrawing && newElement && (
                        <Rect
                            x={newElement.x} y={newElement.y}
                            width={newElement.width} height={newElement.height}
                            fill={ZONE_FILL_DEFAULT} opacity={0.3}
                            stroke="#D4AF37" strokeWidth={1} dash={[5, 5]}
                        />
                    )}

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

                    {/* Polygon Drawing Preview */}
                    {tool === TOOL_TYPES.POLYGON && polyPoints.length > 0 && (
                        <>
                            <Line points={polyPoints} stroke="#D4AF37" strokeWidth={2} />
                            <Line points={[polyPoints[polyPoints.length - 2], polyPoints[polyPoints.length - 1], mousePos.x, mousePos.y]} stroke="#D4AF37" strokeWidth={1} dash={[5, 2]} />
                            <Circle x={polyPoints[0]} y={polyPoints[1]} radius={5} fill="#D4AF37" />
                        </>
                    )}
                    {elements.map(el => (
                        <SceneElement
                            key={el.id}
                            element={el}
                            isSelected={selectedIds.includes(el.id)}
                            scale={stageConfig.scale}
                            draggable={tool === TOOL_TYPES.SELECT}
                            onSelect={(e) => {
                                e.cancelBubble = true;
                                if (e.evt.shiftKey) toggleSelection(el.id);
                                else setSelectedIds([el.id]);
                            }}
                            onChange={(u) => updateElement(el.id, u)}
                        />
                    ))}

                    {selectedIds.length > 0 && (
                        <Transformer
                            nodes={stageRef.current?.find('.element-group').filter(n => selectedIds.includes(n.id()))}
                            rotateEnabled={true}
                            borderStroke="#D4AF37"
                            anchorStroke="#D4AF37"
                            keepRatio={false}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
}
