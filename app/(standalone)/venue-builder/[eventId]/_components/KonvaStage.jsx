"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Text, Group, Image } from 'react-konva';
import useImage from 'use-image';

/**
 * Helper to get the pointer position relative to the node's transform.
 * Essential for placing objects exactly under the cursor in a zoomed/panned stage.
 */
export const getRelativePointerPosition = (node) => {
    if (!node) return { x: 0, y: 0 };
    const stage = node.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    return transform.point(pointer);
};

const KonvaStage = ({
    shapes = [],
    onSelect,
    selectedId,
    selectedShape,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onShapeChange,
    activeTool = "select",
    backgroundUrl = null,
}) => {
    const [bgImage] = useImage(backgroundUrl);
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const transformerRef = useRef(null);

    // Responsive Dimensions
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Infinite Canvas State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // 1. Responsive Size Logic using ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect) {
                    setDimensions({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height,
                    });
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // 2. Transformer Effect
    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const selectedNode = stageRef.current.findOne('#' + selectedId);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            } else {
                transformerRef.current.nodes([]);
            }
        } else {
            transformerRef.current?.nodes([]);
        }
    }, [selectedId, shapes]);

    // 3. Zooming Logic (Scroll Wheel)
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const scaleBy = 1.1;
        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        const clampedScale = Math.max(0.1, Math.min(newScale, 10));

        setScale(clampedScale);
        setPosition({
            x: pointer.x - mousePointTo.x * clampedScale,
            y: pointer.y - mousePointTo.y * clampedScale,
        });
    };

    const handleStageMouseDown = (e) => {
        // If we click on the stage background
        if (e.target === e.target.getStage()) {
            onSelect && onSelect(null);
        }
        onMouseDown && onMouseDown(e);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-[#181818] overflow-hidden"
        >
            {dimensions.width > 0 && dimensions.height > 0 && (
                <Stage
                    ref={stageRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    draggable={activeTool === "select"}
                    scaleX={scale}
                    scaleY={scale}
                    x={position.x}
                    y={position.y}
                    onWheel={handleWheel}
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                >
                    <Layer>
                        {/* Background Image */}
                        {bgImage && (
                            <Image
                                image={bgImage}
                                listening={false}
                                opacity={0.6}
                                x={0}
                                y={0}
                            />
                        )}

                        {/* Shapes Rendering */}
                        {shapes.map((shape) => {
                            const isSelected = selectedId === shape.id;

                            // Visual properties for the background shape
                            const visualProps = {
                                x: 0,
                                y: 0,
                                width: shape.width,
                                height: shape.height,
                                fill: shape.fill,
                                opacity: shape.opacity,
                                stroke: isSelected ? "#fac529" : "transparent",
                                strokeWidth: isSelected ? 2 : 0,
                                cornerRadius: shape.type === 'rect' ? 4 : 0,
                            };

                            return (
                                <Group
                                    key={shape.id}
                                    id={shape.id}
                                    x={shape.x}
                                    y={shape.y}
                                    rotation={shape.rotation || 0}
                                    draggable={activeTool === "select"}
                                    onClick={(e) => {
                                        e.cancelBubble = true;
                                        onSelect && onSelect(shape.id);
                                    }}
                                    onDragEnd={(e) => {
                                        onShapeChange && onShapeChange(shape.id, {
                                            x: e.target.x(),
                                            y: e.target.y()
                                        });
                                    }}
                                    onTransformEnd={(e) => {
                                        const node = e.target;
                                        onShapeChange && onShapeChange(shape.id, {
                                            x: node.x(),
                                            y: node.y(),
                                            width: Math.max(5, node.width() * node.scaleX()),
                                            height: Math.max(5, node.height() * node.scaleY()),
                                            rotation: node.rotation(),
                                            scaleX: 1,
                                            scaleY: 1
                                        });
                                    }}
                                >
                                    {shape.type === 'rect' && <Rect {...visualProps} />}
                                    {shape.type === 'circle' && (
                                        <Circle
                                            {...visualProps}
                                            radius={Math.min(shape.width, shape.height) / 2}
                                            x={shape.width / 2}
                                            y={shape.height / 2}
                                            width={undefined}
                                            height={undefined}
                                        />
                                    )}

                                    {/* Labels */}
                                    {shape.name && (
                                        <Text
                                            x={0}
                                            y={-15}
                                            text={shape.name}
                                            fontSize={10}
                                            fill="#fac529"
                                            fontStyle="bold"
                                            width={shape.width}
                                            align="center"
                                            listening={false}
                                        />
                                    )}

                                    {/* Seats Grid */}
                                    {shape.seats && shape.seats.map((seat, idx) => (
                                        <Circle
                                            key={`${shape.id}-seat-${idx}`}
                                            x={seat.x}
                                            y={seat.y}
                                            radius={seat.radius || 5}
                                            fill="#fac529"
                                            opacity={0.8}
                                            listening={false}
                                            perfectDrawEnabled={false}
                                            shadowForStrokeEnabled={false}
                                        />
                                    ))}
                                </Group>
                            );
                        })}

                        {/* Transformer Overlay */}
                        {activeTool === "select" && (
                            <Transformer
                                ref={transformerRef}
                                rotateEnabled={true}
                                flipEnabled={false}
                                enabledAnchors={
                                    selectedShape?.type === 'circle'
                                        ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                                        : ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
                                }
                                boundBoxFunc={(oldBox, newBox) => {
                                    // Limit resize
                                    if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
            )}
        </div>
    );
};

export default KonvaStage;
