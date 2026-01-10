"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Loader2, ShoppingCart, ArrowRight, X, Ticket } from "lucide-react";
import { toast } from "sonner";

// 🛡️ Technical Requirement 1: Dynamic Import with SSR: false
const SeatViewer = dynamic(() => import("./SeatViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <Loader2 className="w-10 h-10 animate-spin text-[#fac529]" />
        </div>
    )
});

export default function ZoneSelectionModal({ event, isOpen, onClose }) {
    const router = useRouter();
    const [selectedSeats, setSelectedSeats] = useState([]); // Array of seat objects

    // 🛡️ Technical Requirement 2: Real-Time Sold Data
    const { data: soldSeatIds = [] } = useConvexQuery(api.tickets.getSoldSeats, {
        eventId: event._id
    });

    const { data: ticketTiers } = useConvexQuery(api.tickets.getTicketTiers, {
        eventId: event._id,
    });

    // Interaction Handler
    const handleSeatClick = (seat) => {
        setSelectedSeats((prev) => {
            const isAlreadySelected = prev.some(s => s.id === seat.id);
            if (isAlreadySelected) {
                return prev.filter(s => s.id !== seat.id);
            } else {
                // Find matching ticket tier for price if available
                // In SeatViewer, seats might have a tierId or we use zone data
                return [...prev, seat];
            }
        });
    };

    const handleRemoveSeat = (seatId) => {
        setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    };

    const totalPrice = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    }, [selectedSeats]);

    // 🛡️ Technical Requirement 3: Handoff
    const proceedToCheckout = () => {
        if (selectedSeats.length === 0) {
            toast.error("Please select at least one seat");
            return;
        }

        const cartItems = selectedSeats.map(seat => ({
            ticketId: seat.tierId, // Link to DB tier
            name: `${seat.label || seat.id}`,
            price: seat.price,
            quantity: 1,
            seatId: seat.id,
            section: seat.zoneName || "Venue",
            type: "RESERVED_SEATING"
        }));

        // Store precise seat IDs to prevent double booking during checkout
        sessionStorage.setItem("checkoutTickets", JSON.stringify(cartItems));
        sessionStorage.setItem("checkoutSeatIds", JSON.stringify(selectedSeats.map(s => s.id)));
        sessionStorage.setItem("checkoutEventId", event._id);

        router.push(`/checkout?eventId=${event.slug}`);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[100vw] w-screen h-screen p-0 bg-black border-none text-white overflow-hidden flex flex-col z-[9999] rounded-none">
                <DialogTitle className="sr-only">Select Your Seats</DialogTitle>

                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#fac529]/10 rounded-lg">
                            <Ticket className="w-5 h-5 text-[#fac529]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-none">{event.title?.en || event.title}</h2>
                            <p className="text-xs text-zinc-400 mt-1">Select your preferred seats from the map</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left: Seat Viewer (The Map) */}
                    <div className="flex-1 bg-black relative">
                        <SeatViewer
                            data={event.venueLayout}
                            selectedSeatIds={selectedSeats.map(s => s.id)}
                            soldSeatIds={soldSeatIds}
                            onSeatClick={handleSeatClick}
                        />

                        {/* Legend */}
                        <div className="absolute bottom-6 left-6 flex gap-6 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm rounded-full border border-white/10 z-[60]">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#fac529]" />
                                <span className="text-xs font-medium">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                                <span className="text-xs font-medium">Selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                                <span className="text-xs font-medium">Sold</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Cart Summary */}
                    <div className="w-full lg:w-[400px] border-l border-white/10 flex flex-col bg-zinc-950 shrink-0">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <ShoppingCart className="w-5 h-5 text-[#fac529]" />
                                <h3 className="font-bold text-xl">Your Cart</h3>
                            </div>
                            <p className="text-sm text-zinc-400">
                                {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} selected
                            </p>
                        </div>

                        {/* Selected Seats List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {selectedSeats.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <div className="p-4 rounded-full bg-zinc-900">
                                        <ShoppingCart className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <p className="text-sm">Click on seats to add them to your cart</p>
                                </div>
                            ) : (
                                selectedSeats.map((seat) => (
                                    <div
                                        key={seat.id}
                                        className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-[#fac529]/30 transition-all"
                                    >
                                        <div>
                                            <p className="font-bold text-white mb-0.5">{seat.label || seat.id}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                                                {seat.zoneName || "Reserved Seating"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-[#fac529]">
                                                ৳{seat.price?.toLocaleString() || 0}
                                            </p>
                                            <button
                                                onClick={() => handleRemoveSeat(seat.id)}
                                                className="p-1 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Checkout Footer */}
                        <div className="p-6 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Total Amount</p>
                                    <p className="text-3xl font-black text-white tracking-tight">
                                        ৳{totalPrice.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 italic">Inclusive of all taxes</p>
                                </div>
                            </div>

                            <Button
                                onClick={proceedToCheckout}
                                disabled={selectedSeats.length === 0}
                                className="w-full h-14 bg-[#fac529] hover:bg-[#fac529]/90 text-black font-black text-lg rounded-xl shadow-[0_0_30px_rgba(250,197,41,0.2)] flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                            >
                                Confirm & Checkout
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
