"use client";

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";

/**
 * Helper function to calculate cursor position relative to the stage transformations (zoom/pan)
 * @param {Object} stage - The Konva Stage instance
 * @returns {Object} { x, y } coordinates in the canvas space
 */
export const getRelativePointerPosition = (stage) => {
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
};

const KonvaStage = ({ children, width, height, ...props }) => {
    const stageRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle Zoom (Scroll Wheel)
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const zoomSpeed = 1.1;
        const newScale = e.evt.deltaY > 0 ? oldScale / zoomSpeed : oldScale * zoomSpeed;

        // Clamp zoom
        const clampedScale = Math.max(0.05, Math.min(newScale, 20));

        setScale(clampedScale);
        setPosition({
            x: pointer.x - mousePointTo.x * clampedScale,
            y: pointer.y - mousePointTo.y * clampedScale,
        });
    };

    // Handle Pan (Drag)
    const handleDragEnd = (e) => {
        setPosition({
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-[#0a0a0a] overflow-hidden"
            style={{ cursor: props.draggable ? 'grabbing' : 'default' }}
        >
            {dimensions.width > 0 && (
                <Stage
                    ref={stageRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    scaleX={scale}
                    scaleY={scale}
                    x={position.x}
                    y={position.y}
                    draggable
                    onWheel={handleWheel}
                    onDragEnd={handleDragEnd}
                    {...props}
                >
                    <Layer>
                        {/* Background Grid or Placeholder */}
                        {children}
                    </Layer>
                </Stage>
            )}
        </div>
    );
};

export default KonvaStage;
