"use client";

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

const CanvasStage = forwardRef(({
    shapes = [],
    tool = 'select',
    selectedId = null,
    backgroundConfig = null, // { url, x, y, scale, opacity }
    onSelect,
    onShapeChange,
    onShapeAdd,
    readOnly = false
}, ref) => {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);

    // Viewport State
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [stageScale, setStageScale] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Drawing State
    const [isDrawing, setIsDrawing] = useState(false);
    const [newShape, setNewShape] = useState(null); // Ghost shape

    // Expose helpers
    useImperativeHandle(ref, () => ({
        getStage: () => stageRef.current,
        getRelativePointerPosition: () => getRelativePointerPosition(stageRef.current)
    }));

    // Helper: Get pointer pos relative to stage (Math)
    const getRelativePointerPosition = (node) => {
        if (!node) return { x: 0, y: 0 };
        const transform = node.getAbsoluteTransform().copy();
        transform.invert();
        const pos = node.getStage().getPointerPosition();
        return transform.point(pos);
    };

    // 1. Responsive Canvas
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 2. Transformer Logic (Selection)
    useEffect(() => {
        if (!transformerRef.current || readOnly) return;

        const stage = stageRef.current;
        if (selectedId) {
            const selectedNode = stage.findOne('#' + selectedId);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            } else {
                transformerRef.current.nodes([]);
            }
        } else {
            transformerRef.current.nodes([]);
        }
    }, [selectedId, shapes, readOnly]);

    // 3. Zoom Logic
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / 1.1 : oldScale * 1.1;
        const clampedScale = Math.max(0.1, Math.min(newScale, 5));

        setStagePos({
            x: pointer.x - mousePointTo.x * clampedScale,
            y: pointer.y - mousePointTo.y * clampedScale,
        });
        setStageScale(clampedScale);
    };

    // 4. Interaction Logic
    const handleMouseDown = (e) => {
        // A. Pan (Hand Tool)
        if (tool === 'hand') return; // Handled by draggable prop

        // B. Select (Click on Stage Deselects)
        if (tool === 'select') {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
                onSelect && onSelect(null);
            }
            return;
        }

        // C. Draw (Rect / Circle)
        const pos = getRelativePointerPosition(stageRef.current);
        setIsDrawing(true);
        setNewShape({
            id: `ghost-${Date.now()}`,
            type: tool,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            fill: '#3B82F6', // Royal Blue
            rotation: 0,
            isGhost: true
        });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || !newShape) return;

        const pos = getRelativePointerPosition(stageRef.current);

        setNewShape(prev => ({
            ...prev,
            width: pos.x - prev.x,
            height: pos.y - prev.y
        }));
    };

    const handleMouseUp = () => {
        if (isDrawing && newShape) {
            // Commit shape if large enough
            if (Math.abs(newShape.width) > 5 || Math.abs(newShape.height) > 5) {
                const finalShape = {
                    ...newShape,
                    id: crypto.randomUUID(), // Standard UUID
                    // Normalize negative width/height
                    x: newShape.width < 0 ? newShape.x + newShape.width : newShape.x,
                    y: newShape.height < 0 ? newShape.y + newShape.height : newShape.y,
                    width: Math.abs(newShape.width),
                    height: Math.abs(newShape.height),
                    isGhost: false
                };
                onShapeAdd && onShapeAdd(finalShape);
            }
        }
        setIsDrawing(false);
        setNewShape(null);
    };

    // Cursor Style
    const getCursor = () => {
        if (tool === 'hand') return 'grab';
        if (tool === 'rect' || tool === 'circle') return 'crosshair';
        return 'default';
    };

    return (
        <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            draggable={tool === 'hand'}
            x={stagePos.x}
            y={stagePos.y}
            scaleX={stageScale}
            scaleY={stageScale}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: getCursor() }}
        >
            {/* Layer 0: Background Blueprint */}
            <Layer>
                <URLImage imageConfig={backgroundConfig} />
            </Layer>

            {/* Layer 1: Shapes */}
            <Layer>
                {/* Main Shapes */}
                {shapes.map((shape) => (
                    <ShapeComponent
                        key={shape.id}
                        shape={shape}
                        isSelected={selectedId === shape.id}
                        isDraggable={tool === 'select' && !readOnly}
                        onSelect={() => {
                            if (tool === 'select') onSelect(shape.id);
                        }}
                        onChange={(newAttrs) => {
                            onShapeChange && onShapeChange(shape.id, newAttrs);
                        }}
                    />
                ))}

                {/* Ghost Shape (Drawing) */}
                {newShape && (
                    <ShapeComponent
                        shape={newShape}
                        isSelected={false}
                        isDraggable={false}
                        isGhost={true}
                    />
                )}

                {/* Transformer (Handles) */}
                <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Limit minimum size
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    anchorSize={8}
                    anchorFill="#fac529"
                    anchorStroke="#111"
                    borderStroke="#fac529"
                />
            </Layer>
        </Stage>
    );
});

// Extracted for clean rendering logic
const ShapeComponent = ({ shape, isSelected, isDraggable, onSelect, onChange, isGhost }) => {
    // Shared Props
    const groupProps = {
        id: shape.id,
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation || 0,
        opacity: isGhost ? 0.5 : (shape.opacity || 1),
        draggable: isDraggable,
        onClick: (e) => {
            if (isGhost) return;
            e.cancelBubble = true;
            onSelect && onSelect();
        },
        onDragEnd: (e) => {
            onChange && onChange({ x: e.target.x(), y: e.target.y() });
        },
        onTransformEnd: (e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Reset scale to 1 and update width/height
            node.scaleX(1);
            node.scaleY(1);

            onChange && onChange({
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                rotation: node.rotation(),
                is_zone: shape.is_zone // Pass flag to trigger re-grid
            });
        }
    };

    // Visual selection state
    const strokeProps = {
        stroke: isSelected ? "#fac529" : null,
        strokeWidth: isSelected ? 2 : 0,
    };

    return (
        <Group {...groupProps}>
            {/* 1. Main Shape Body */}
            {shape.type === 'rect' && (
                <Rect
                    width={shape.width}
                    height={shape.height}
                    fill={shape.fill || '#3B82F6'}
                    cornerRadius={4}
                    {...strokeProps}
                />
            )}

            {shape.type === 'circle' && (
                <Circle
                    radius={shape.width / 2}
                    x={shape.width / 2} // Center in Group
                    y={shape.height / 2}
                    fill={shape.fill || '#3B82F6'}
                    {...strokeProps}
                />
            )}

            {/* 2. Label (Centered) */}
            {shape.name && !isGhost && (
                <Text
                    text={shape.name}
                    x={0}
                    y={-20} // Just above the shape
                    width={shape.width}
                    align="center"
                    fill="#fac529"
                    fontSize={12}
                    fontStyle="bold"
                    listening={false} // Click through to shape
                />
            )}

            {/* 3. Seats (Grid) */}
            {shape.seats && shape.seats.map((seat, i) => (
                <Circle
                    key={seat.id || i}
                    x={seat.x}
                    y={seat.y}
                    radius={seat.radius || 5}
                    fill={seat.status === 'booked' ? '#ef4444' : '#fac529'}
                    opacity={0.8}
                    perfectDrawEnabled={false} // Performance
                    shadowForStrokeEnabled={false} // Performance
                    listening={false} // Parent group handles interaction for now
                />
            ))}
        </Group>
    );
};

// Sub-component for Image Loading to avoid hooks in loops or conditional issues
const URLImage = ({ imageConfig }) => {
    const [image] = useImage(imageConfig?.url || '', 'anonymous');

    if (!imageConfig || !image) return null;

    return (
        <KonvaImage
            image={image}
            x={imageConfig.x || 0}
            y={imageConfig.y || 0}
            scaleX={imageConfig.scale || 1}
            scaleY={imageConfig.scale || 1}
            opacity={imageConfig.opacity || 0.5}
            listening={false} // Ignore clicks, pure visual
        />
    );
};

CanvasStage.displayName = "CanvasStage";
export default CanvasStage;
