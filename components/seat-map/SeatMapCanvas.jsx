"use client";

import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const SEAT_COLORS = {
    available: "#4CAF50",    // Green
    selected: "#FFC107",     // Amber/Yellow
    held: "#FF9800",         // Orange
    booked: "#F44336",       // Red
    reserved: "#9C27B0",     // Purple
    unavailable: "#263238",  // Dark gray
};

const SEAT_SIZE = 24;

export default function SeatMapCanvas({
    sections = [],
    selectedSeats = [],
    onSeatClick,
    config = {},
    className = "",
}) {
    const [hoveredSeat, setHoveredSeat] = useState(null);

    const defaultConfig = {
        canvasWidth: 1200,
        canvasHeight: 800,
        seatWidth: SEAT_SIZE,
        ...config,
    };

    const handleSeatClick = (seat, section) => {
        if (seat.status === "available" || seat.status === "selected") {
            onSeatClick?.(seat, section);
        }
    };

    const isSeatSelected = (seatId) => {
        return selectedSeats.some((s) => s._id === seatId);
    };

    const getSeatColor = (seat) => {
        if (isSeatSelected(seat._id)) return SEAT_COLORS.selected;
        return SEAT_COLORS[seat.status] || SEAT_COLORS.unavailable;
    };

    return (
        <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                centerOnInit
                wheel={{ step: 0.1 }}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        {/* Controls */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                            <button
                                onClick={() => zoomIn()}
                                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                title="Zoom In"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                            <button
                                onClick={() => zoomOut()}
                                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                title="Zoom Out"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <button
                                onClick={() => resetTransform()}
                                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                title="Reset View"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        <TransformComponent
                            wrapperStyle={{ width: "100%", height: "100%" }}
                            contentStyle={{ width: defaultConfig.canvasWidth, height: defaultConfig.canvasHeight }}
                        >
                            <svg
                                width={defaultConfig.canvasWidth}
                                height={defaultConfig.canvasHeight}
                                className="bg-gray-50 dark:bg-gray-900"
                            >
                                {/* Stage */}
                                {config.stagePosition && (
                                    <g>
                                        <rect
                                            x={config.stagePosition.x}
                                            y={config.stagePosition.y}
                                            width={config.stagePosition.width}
                                            height={config.stagePosition.height}
                                            fill="#1f2937"
                                            stroke="#374151"
                                            strokeWidth="2"
                                        />
                                        <text
                                            x={config.stagePosition.x + config.stagePosition.width / 2}
                                            y={config.stagePosition.y + config.stagePosition.height / 2}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#9ca3af"
                                            fontSize="18"
                                            fontWeight="bold"
                                        >
                                            STAGE
                                        </text>
                                    </g>
                                )}

                                {/* Sections and Seats */}
                                {sections.map((sectionData) => {
                                    const { section, seats = [], priceZone } = sectionData;

                                    return (
                                        <g key={section._id}>
                                            {/* Section Label */}
                                            {seats.length > 0 && (
                                                <text
                                                    x={seats[0].xPosition - 40}
                                                    y={seats[0].yPosition - 20}
                                                    fill="#6b7280"
                                                    fontSize="14"
                                                    fontWeight="600"
                                                >
                                                    {section.name}
                                                </text>
                                            )}

                                            {/* Seats */}
                                            {seats.map((seat) => {
                                                const isHovered = hoveredSeat === seat._id;
                                                const isClickable = seat.status === "available" || isSeatSelected(seat._id);

                                                return (
                                                    <g key={seat._id}>
                                                        <circle
                                                            cx={seat.xPosition}
                                                            cy={seat.yPosition}
                                                            r={defaultConfig.seatWidth / 2}
                                                            fill={getSeatColor(seat)}
                                                            stroke={isHovered ? "#ffffff" : "#1f2937"}
                                                            strokeWidth={isHovered ? 2 : 1}
                                                            opacity={isClickable ? 1 : 0.6}
                                                            className={isClickable ? "cursor-pointer hover:opacity-80 transition" : "cursor-not-allowed"}
                                                            onClick={() => handleSeatClick(seat, section)}
                                                            onMouseEnter={() => setHoveredSeat(seat._id)}
                                                            onMouseLeave={() => setHoveredSeat(null)}
                                                        />
                                                        {/* Seat Label (show on hover or if selected) */}
                                                        {(isHovered || isSeatSelected(seat._id)) && (
                                                            <text
                                                                x={seat.xPosition}
                                                                y={seat.yPosition}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                                fill="#ffffff"
                                                                fontSize="10"
                                                                fontWeight="bold"
                                                                pointerEvents="none"
                                                            >
                                                                {seat.displayLabel || `${seat.rowLabel}${seat.seatNumber}`}
                                                            </text>
                                                        )}
                                                    </g>
                                                );
                                            })}
                                        </g>
                                    );
                                })}
                            </svg>
                        </TransformComponent>

                        {/* Tooltip for hovered seat */}
                        {hoveredSeat && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg z-20">
                                {sections.flatMap(s => s.seats).map(seat => {
                                    if (seat._id === hoveredSeat) {
                                        const section = sections.find(s => s.seats.includes(seat));
                                        return (
                                            <div key={seat._id} className="text-sm">
                                                <p className="font-semibold">{seat.displayLabel || `${seat.rowLabel}-${seat.seatNumber}`}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {section?.section.name} • {section?.priceZone?.currency} {section?.priceZone?.basePrice}
                                                </p>
                                                <p className="text-xs capitalize mt-1 text-gray-500">{seat.status}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </>
                )}
            </TransformWrapper>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-10">
                <div className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Legend</div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SEAT_COLORS).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs capitalize text-gray-700 dark:text-gray-300">{status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
