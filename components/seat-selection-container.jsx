"use client";

import { useEffect, useState } from "react";
import UniversalMapViewer from "./universal-map-viewer";
import ZoneTicketList from "./zone-ticket-list";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react"; // Added for the new button icon

export default function SeatSelectionContainer({ seatMapConfig, tickets, onUpdateQuantity, selectedTickets, totalPrice, onProceed }) { // Added new props for the updated functionality
    if (!seatMapConfig) return null;

    return (
        <div className="flex flex-col lg:flex-row h-full w-full font-['Manrope']">
            {/* Left Column: Interactive Map (66%) */}
            <div className="w-full lg:w-2/3 h-[350px] lg:h-full shrink-0 bg-[#181611] relative border-r border-white/10 group overflow-hidden">
                <UniversalMapViewer imageUrl={seatMapConfig.imageUrl} />

                {/* Map Legend/Info Overlay (Matches Snippet) */}
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 z-20">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#fac529] text-sm font-bold">📍</span>
                        <span className="text-white text-sm font-medium">Madison Square Garden, NY</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Ticket Selection (33%) */}
            <div className="w-full lg:w-1/3 flex flex-col bg-[#1f1a0d] border-l border-white/5 relative z-10 h-full">
                {/* Header */}
                <div className="pt-8 pb-4 px-6 border-b border-white/5 bg-[#1f1a0d]">
                    <h2 className="text-white text-[28px] font-extrabold leading-tight tracking-tight">Select Tickets</h2>
                    <p className="text-white/60 text-sm mt-1">Choose your preferred zone below.</p>
                </div>

                {/* Scrollable list content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                    <ZoneTicketList
                        zones={seatMapConfig.zones}
                        tickets={tickets}
                        selectedTickets={selectedTickets}
                        onUpdateQuantity={onUpdateQuantity}
                    />
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#16130a] border-t border-[#fac529]/20 p-6 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-white/60 text-sm font-medium">Total Price</span>
                        <span className="text-3xl font-bold text-white tracking-tight">
                            ৳{totalPrice.toLocaleString()}
                        </span>
                    </div>
                    <button
                        onClick={onProceed}
                        disabled={!selectedTickets || Object.keys(selectedTickets).length === 0}
                        className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#fac529] to-yellow-400 hover:from-yellow-400 hover:to-[#fac529] text-[#181611] font-bold text-lg shadow-lg shadow-[#fac529]/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-black" />
                    </button>
                </div>
            </div>
        </div>
    );
}
