import React from "react";
import { Group, Rect, Circle, Text, Path, Line } from "react-konva";

/**
 * Royal Seat Engine - Asset Renderer
 * Handles visualization of advanced architectural symbols.
 */
export default function AssetRenderer({ element, width, height }) {
    const type = element.assetType || element.assetConfig?.type || element.type;
    const color = element.fill || element.assetConfig?.color || "#52525b";
    const name = element.name || element.assetConfig?.label || "";

    // 1. Stage Thrust (T-Shape / Convex)
    if (type === 'STAGE_THRUST') {
        // T-Shape Path
        const w = width;
        const h = height;
        // Main stage rect (top 60%) + Thrust (bottom 40%, width 40%)
        const mainH = h * 0.6;
        const thrustW = w * 0.4;
        const thrustX = (w - thrustW) / 2;

        return (
            <Group>
                {/* Main Body */}
                <Rect width={w} height={mainH} fill={color} stroke="#451a03" strokeWidth={2} />
                {/* Thrust */}
                <Rect x={thrustX} y={mainH - 2} width={thrustW} height={h - mainH + 2} fill={color} stroke="#451a03" strokeWidth={2} />
                {/* Clean Joint */}
                <Line points={[thrustX + 2, mainH, thrustX + thrustW - 2, mainH]} stroke={color} strokeWidth={4} />

                <Text text="STAGE" width={w} height={mainH} align="center" verticalAlign="middle" fill="white" fontStyle="bold" fontSize={14} />
            </Group>
        );

    }

    // 1.5 Stage Opera (Curved / Semi-Circle)
    if (type === 'STAGE_OPERA') {
        const pathData = element.pathData || element.assetConfig?.pathData || `M 0 ${height} Q ${width / 2} -${height * 0.5} ${width} ${height} Z`;
        return (
            <Group>
                <Path
                    data={pathData}
                    fill={color}
                    stroke="#451a03" strokeWidth={2}
                    shadowColor="black" shadowBlur={10} shadowOpacity={0.5}
                />
                <Text text="OPERA" width={width} height={height} y={height * 0.3} align="center" verticalAlign="middle" fill="white" fontStyle="bold" fontSize={14} />
            </Group>
        );
    }

    // 2. Mix Position (Crossed Box)
    if (type === 'MIX_POSITION') {
        return (
            <Group>
                <Rect width={width} height={height} fill="#27272a" stroke="white" strokeWidth={2} dash={[5, 5]} />
                <Line points={[0, 0, width, height]} stroke="white" strokeWidth={1} opacity={0.3} dash={[4, 4]} />
                <Line points={[width, 0, 0, height]} stroke="white" strokeWidth={1} opacity={0.3} dash={[4, 4]} />
                <Text text="MIX / FOH" width={width} height={height} align="center" verticalAlign="middle" fill="white" fontStyle="bold" />
            </Group>
        );
    }

    // 3. Vomitory (Trapezoid Tunnel)
    if (type === 'VOMITORY') {
        // Trapezoid shape: Top is narrower than Bottom
        const inset = width * 0.2;
        return (
            <Group>
                <Path
                    data={`M 0 ${height} L ${inset} 0 L ${width - inset} 0 L ${width} ${height} Z`}
                    fill={color}
                    stroke="black"
                    strokeWidth={1}
                    opacity={0.7}
                />
                <Text text="TUNNEL" width={width} height={height} y={height / 2} align="center" verticalAlign="bottom" fill="white" fontSize={10} />
            </Group>
        );
    }

    // 4. Pillar (Obstructed)
    if (type === 'PILLAR' || type === 'OBSTRUCTION') {
        const r = Math.min(width, height) / 2;
        return (
            <Group>
                <Circle x={width / 2} y={height / 2} radius={r} fill="black" opacity={0.5} stroke="red" strokeWidth={2} />
                {/* X Mark */}
                <Line points={[width * 0.2, height * 0.2, width * 0.8, height * 0.8]} stroke="red" strokeWidth={2} />
                <Line points={[width * 0.8, height * 0.2, width * 0.2, height * 0.8]} stroke="red" strokeWidth={2} />
            </Group>
        );
    }

    // 5. Stairs (Step Ladder)
    if (type === 'STAIRS') {
        const steps = 6;
        const stepH = height / steps;
        const lines = [];
        for (let i = 1; i < steps; i++) {
            lines.push(
                <Line key={i} points={[0, i * stepH, width, i * stepH]} stroke="#a1a1aa" strokeWidth={1} />
            );
        }
        return (
            <Group>
                <Rect width={width} height={height} fill={color} />
                {/* Visual steps */}
                {lines}
                {/* Direction Arrow */}
                <Line points={[width / 2, height * 0.1, width / 2, height * 0.9]} stroke="white" strokeWidth={2} />
                <Path data="M -5 -5 L 0 0 L 5 -5" x={width / 2} y={height * 0.9} stroke="white" strokeWidth={2} />
            </Group>
        );
    }

    // 6. Accessible Seat
    if (type === 'ACCESSIBLE_SEAT') {
        return (
            <Group>
                <Rect width={width} height={height} fill={color} cornerRadius={4} />
                {/* Simplified Wheelchair Icon - Head */}
                <Circle x={width * 0.5} y={height * 0.3} radius={width * 0.1} fill="white" />
                {/* Body/Wheel */}
                <Path
                    data={`
                        M ${width * 0.5} ${height * 0.3} 
                        L ${width * 0.5} ${height * 0.6}
                        M ${width * 0.3} ${height * 0.6}
                        A ${width * 0.2} ${width * 0.2} 0 1 0 ${width * 0.7} ${height * 0.6}
                    `}
                    stroke="white"
                    strokeWidth={2}
                    fill="transparent"
                />
            </Group>
        );
    }

    // 7. Standard Table WITH CHAIRS
    if (type === 'TABLE' || type === 'RECT_TABLE') {
        const isRound = type === 'TABLE';
        const capacity = element.seatConfig?.capacity ?? 6;
        const chairRadius = Math.min(width, height) * 0.08;
        const padding = chairRadius + 5;

        // Calculate chair positions
        const chairs = [];

        if (isRound) {
            // Round Table: Chairs in a circle around the table
            const tableRadius = Math.min(width, height) / 2;
            const chairDistance = tableRadius + padding;
            for (let i = 0; i < capacity; i++) {
                const angle = (i / capacity) * Math.PI * 2 - Math.PI / 2;
                const cx = width / 2 + Math.cos(angle) * chairDistance;
                const cy = height / 2 + Math.sin(angle) * chairDistance;
                chairs.push(
                    <Circle key={`chair-${i}`} x={cx} y={cy} radius={chairRadius} fill="#D4AF37" stroke="#451a03" strokeWidth={1} />
                );
            }
        } else {
            // Rectangular Table: Distribute chairs evenly around perimeter
            const perimeter = 2 * (width + height);
            const step = perimeter / capacity;

            for (let i = 0; i < capacity; i++) {
                const d = i * step + (step / 2); // Center of segment
                let cx, cy;

                if (d < width) {
                    // Top edge
                    cx = d;
                    cy = -padding;
                } else if (d < width + height) {
                    // Right edge
                    cx = width + padding;
                    cy = d - width;
                } else if (d < 2 * width + height) {
                    // Bottom edge
                    cx = width - (d - (width + height));
                    cy = height + padding;
                } else {
                    // Left edge
                    cx = -padding;
                    cy = height - (d - (2 * width + height));
                }

                chairs.push(
                    <Circle key={`chair-${i}`} x={cx} y={cy} radius={chairRadius} fill="#D4AF37" stroke="#451a03" strokeWidth={1} />
                );
            }
        }

        return (
            <Group>
                {/* Chairs rendered first (behind table) */}
                {chairs}
                {/* Table Surface */}
                <Rect
                    width={width}
                    height={height}
                    fill={color}
                    cornerRadius={isRound ? width / 2 : 8}
                    stroke="#451a03"
                    strokeWidth={2}
                />
                {/* Decor: Inner rim */}
                <Rect
                    x={width * 0.1} y={height * 0.1}
                    width={width * 0.8} height={height * 0.8}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth={1}
                    cornerRadius={isRound ? width / 2 : 4}
                />
                <Text text={name || "TABLE"} width={width} height={height} align="center" verticalAlign="middle" fill="white" fontStyle="bold" opacity={0.8} />
            </Group>
        );
    }

    // Default Fallback
    return (
        <Group>
            <Rect
                width={width} height={height}
                fill={`${color}40`} // Transparent fill
                stroke={color} strokeWidth={2}
                cornerRadius={4}
                dash={[5, 5]}
            />
            <Text
                text={name || type || "ASSET"}
                width={width} height={height}
                align="center" verticalAlign="middle"
                fill="#fff" fontSize={Math.min(10, width / 5)}
                padding={2}
            />
        </Group>
    );
}
