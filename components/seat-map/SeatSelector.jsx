"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import SeatMapCanvas from "./SeatMapCanvas";

export default function SeatSelector({ eventId, venueId, onSeatsSelected }) {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [holdId, setHoldId] = useState(null);
    const [holdTimeRemaining, setHoldTimeRemaining] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [preferences, setPreferences] = useState({
        quantity: 1,
        maxPrice: undefined,
        viewPriority: "medium",
        keepTogether: true,
    });

    // Fetch seat map
    const seatMapData = useQuery(api.seatMaps.getSeatMap, { venueId });

    // Mutations
    const holdSeats = useMutation(api.seatMaps.holdSeats);
    const releaseSeats = useMutation(api.seatMaps.releaseSeats);
    const recommendSeats = useQuery(
        showRecommendations
            ? api.seatRecommendations.recommendSeats
            : undefined,
        showRecommendations
            ? { eventId, venueId, preferences }
            : "skip"
    );

    // Generate session ID
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Hold timer countdown
    useEffect(() => {
        if (!holdTimeRemaining) return;

        const interval = setInterval(() => {
            const remaining = holdTimeRemaining - Date.now();
            if (remaining <= 0) {
                setHoldTimeRemaining(null);
                setHoldId(null);
                setSelectedSeats([]);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [holdTimeRemaining]);

    const handleSeatClick = async (seat, section) => {
        const isSelected = selectedSeats.some((s) => s._id === seat._id);

        if (isSelected) {
            // Deselect seat
            const newSelectedSeats = selectedSeats.filter(s => s._id !== seat._id);
            setSelectedSeats(newSelectedSeats);

            // If no seats selected, release hold
            if (newSelectedSeats.length === 0 && holdId) {
                await releaseSeats({ holdId });
                setHoldId(null);
                setHoldTimeRemaining(null);
            }
        } else {
            // Select seat
            if (selectedSeats.length >= preferences.quantity) {
                alert(`You can only select ${preferences.quantity} seat(s)`);
                return;
            }

            const newSelectedSeats = [...selectedSeats, { ...seat, section }];
            setSelectedSeats(newSelectedSeats);

            // Create hold if this is the first seat or hold expired
            if (!holdId || !holdTimeRemaining || holdTimeRemaining < Date.now()) {
                try {
                    const result = await holdSeats({
                        eventId,
                        seatIds: newSelectedSeats.map(s => s._id),
                        sessionId,
                    });
                    setHoldId(result.holdId);
                    setHoldTimeRemaining(result.expiresAt);
                } catch (error) {
                    console.error("Failed to hold seats:", error);
                    alert("These seats are no longer available");
                    setSelectedSeats([]);
                }
            }
        }
    };

    const handleConfirmSelection = () => {
        if (selectedSeats.length === 0) {
            alert("Please select at least one seat");
            return;
        }

        onSeatsSelected?.({
            seats: selectedSeats,
            holdId,
            totalPrice: selectedSeats.reduce((sum, seat) => {
                const section = seatMapData?.sections.find(s => s._id === seat.section._id);
                return sum + (section?.priceZone?.basePrice || 0);
            }, 0),
        });
    };

    const handleApplyRecommendation = (recommendation) => {
        setSelectedSeats(recommendation.seats.map((seat, idx) => ({
            ...seat,
            section: seatMapData?.sections.find(s => s.name === recommendation.section)?.section || {},
        })));
        setShowRecommendations(false);

        // Create hold for recommended seats
        holdSeats({
            eventId,
            seatIds: recommendation.seatIds,
            sessionId,
        }).then(result => {
            setHoldId(result.holdId);
            setHoldTimeRemaining(result.expiresAt);
        });
    };

    if (!seatMapData) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading seat map...</p>
                </div>
            </div>
        );
    }

    if (!seatMapData.venue?.seatMapEnabled) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-800 dark:text-amber-200 font-medium">Seat map not available for this venue</p>
                <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">Please select ticket quantity instead</p>
            </div>
        );
    }

    const totalPrice = selectedSeats.reduce((sum, seat) => {
        const sectionData = seatMapData.sections.find(s =>
            s.seats.some(st => st._id === seat._id)
        );
        return sum + (sectionData?.priceZone?.basePrice || 0);
    }, 0);

    const timeRemaining = holdTimeRemaining ? Math.max(0, Math.floor((holdTimeRemaining - Date.now()) / 1000)) : null;
    const minutes = timeRemaining ? Math.floor(timeRemaining / 60) : 0;
    const seconds = timeRemaining ? timeRemaining % 60 : 0;

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Select Your Seats</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Click on available seats to select</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Recommendations
                    </button>

                    {selectedSeats.length > 0 && (
                        <button
                            onClick={() => {
                                if (holdId) releaseSeats({ holdId });
                                setSelectedSeats([]);
                                setHoldId(null);
                                setHoldTimeRemaining(null);
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Clear Selection
                        </button>
                    )}
                </div>
            </div>

            {/* Recommendations Panel */}
            {showRecommendations && recommendSeats && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Recommended Seats</h4>

                    {/* Preference Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={preferences.quantity}
                                onChange={(e) => setPreferences({ ...preferences, quantity: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Max Price</label>
                            <input
                                type="number"
                                placeholder="Any price"
                                value={preferences.maxPrice || ""}
                                onChange={(e) => setPreferences({ ...preferences, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">View Priority</label>
                            <select
                                value={preferences.viewPriority}
                                onChange={(e) => setPreferences({ ...preferences, viewPriority: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="low">Low (Budget)</option>
                                <option value="medium">Medium</option>
                                <option value="high">High (Best View)</option>
                            </select>
                        </div>
                    </div>

                    {/* Recommendation Results */}
                    <div className="space-y-3">
                        {recommendSeats.recommendations?.map((rec, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🎯</span>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {rec.section} • {rec.seats.length} seat{rec.seats.length > 1 ? 's' : ''}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{rec.reason}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                AI Score: {rec.aiScore}/100 • View: {Math.round(rec.scoreBreakdown.viewQuality)}/100
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">BDT {rec.totalPrice}</p>
                                    <button
                                        onClick={() => handleApplyRecommendation(rec)}
                                        className="mt-2 px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                    >
                                        Select These
                                    </button>
                                </div>
                            </div>
                        ))}
                        {recommendSeats.recommendations?.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No recommendations found with current preferences
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Seat Map */}
            <div className="relative">
                <SeatMapCanvas
                    sections={seatMapData.sections}
                    selectedSeats={selectedSeats}
                    onSeatClick={handleSeatClick}
                    config={seatMapData.config}
                    className="h-[600px]"
                />
            </div>

            {/* Selection Summary */}
            {selectedSeats.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-500 dark:border-blue-400 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Selected: {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
                            </h4>
                            <div className="mt-2 space-y-1">
                                {selectedSeats.map((seat, idx) => {
                                    const sectionData = seatMapData.sections.find(s =>
                                        s.seats.some(st => st._id === seat._id)
                                    );
                                    return (
                                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                            {seat.displayLabel || `${seat.rowLabel}-${seat.seatNumber}`} • {sectionData?.section.name} • BDT {sectionData?.priceZone?.basePrice}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>

                        {timeRemaining !== null && (
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Time remaining</div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {minutes}:{seconds.toString().padStart(2, '0')}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">BDT {totalPrice.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Price</p>
                        </div>

                        <button
                            onClick={handleConfirmSelection}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
                        >
                            Continue to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
