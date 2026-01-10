"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

const SeatViewer = ({
    data = {}, // { backgroundConfig, shapes }
    selectedSeatIds = [],
    soldSeatIds = [],
    onSeatClick,
}) => {
    const stageRef = useRef(null);
    const { backgroundConfig = null, shapes = [] } = data || {};

    // Viewport State
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [stageScale, setStageScale] = useState(0.8);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 1. Responsive Canvas
    useEffect(() => {
        const container = document.getElementById('seat-viewer-container');
        if (!container) return;

        const handleResize = () => {
            setDimensions({
                width: container.offsetWidth,
                height: container.offsetHeight
            });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 2. Zoom Logic
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

    return (
        <div id="seat-viewer-container" className="w-full h-full bg-black relative z-50 overflow-hidden">
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                draggable
                x={stagePos.x}
                y={stagePos.y}
                scaleX={stageScale}
                scaleY={stageScale}
                onWheel={handleWheel}
                style={{ cursor: 'grab' }}
            >
                {/* Layer 0: Background Blueprint */}
                <Layer>
                    <URLImage imageConfig={backgroundConfig} />
                </Layer>

                {/* Layer 1: Shapes & Seats */}
                <Layer>
                    {shapes.map((shape) => (
                        <ShapeComponent
                            key={shape.id}
                            shape={shape}
                            selectedSeatIds={selectedSeatIds}
                            soldSeatIds={soldSeatIds}
                            onSeatClick={onSeatClick}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

// Extracted for clean rendering logic
const ShapeComponent = ({ shape, selectedSeatIds, soldSeatIds, onSeatClick }) => {
    // Shared Props
    const groupProps = {
        id: shape.id,
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation || 0,
        opacity: shape.opacity || 1,
        listening: true,
    };

    return (
        <Group {...groupProps}>
            {/* 1. Main Shape Body (Visual Container Only) */}
            {shape.type === 'rect' && (
                <Rect
                    width={shape.width}
                    height={shape.height}
                    fill={shape.fill || '#1f2937'}
                    opacity={0.15}
                    cornerRadius={4}
                    listening={false}
                />
            )}

            {shape.type === 'circle' && (
                <Circle
                    radius={shape.width / 2}
                    x={shape.width / 2}
                    y={shape.height / 2}
                    fill={shape.fill || '#1f2937'}
                    opacity={0.15}
                    listening={false}
                />
            )}

            {/* 2. Label */}
            {shape.name && (
                <Text
                    text={shape.name}
                    x={0}
                    y={-20}
                    width={shape.width}
                    align="center"
                    fill="#fac529"
                    opacity={0.5}
                    fontSize={12}
                    fontStyle="bold"
                    listening={false}
                />
            )}

            {/* 3. Seats (Interactive) */}
            {shape.seats && shape.seats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                const isSold = seat.status === 'sold' || soldSeatIds.includes(seat.id);

                let fill = shape.fill || '#fac529'; // Default to zone color or gold
                if (isSelected) fill = '#22c55e'; // Green
                if (isSold) fill = '#4b5563'; // Grey

                return (
                    <Circle
                        key={seat.id}
                        x={seat.x}
                        y={seat.y}
                        radius={seat.radius || 5}
                        fill={fill}
                        opacity={isSold ? 0.3 : 1}
                        perfectDrawEnabled={false}
                        shadowForStrokeEnabled={false}
                        listening={!isSold}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            if (!isSold) onSeatClick(seat);
                        }}
                        onTap={(e) => {
                            e.cancelBubble = true;
                            if (!isSold) onSeatClick(seat);
                        }}
                        onMouseEnter={(e) => {
                            const stage = e.target.getStage();
                            stage.container().style.cursor = isSold ? 'not-allowed' : 'pointer';
                        }}
                        onMouseLeave={(e) => {
                            const stage = e.target.getStage();
                            stage.container().style.cursor = 'grab';
                        }}
                    />
                );
            })}
        </Group>
    );
};

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
            listening={false}
        />
    );
};

SeatViewer.displayName = "SeatViewer";
export default SeatViewer;
