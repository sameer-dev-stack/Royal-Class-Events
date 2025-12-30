"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Loader2 } from "lucide-react";
import "@mezh-hq/react-seat-toolkit/styles";
import "../app/seat-toolkit-theme.css";

// Dynamic import to avoid SSR issues
const SeatToolkit = dynamic(() => import("@mezh-hq/react-seat-toolkit"), {
    ssr: false,
    loading: () => (
        <div className="h-full flex items-center justify-center bg-[#181611]">
            <Loader2 className="w-8 h-8 animate-spin text-[#FBB03B]" />
        </div>
    ),
});

// Fetch existing venue layout
const { data: existingLayout } = useConvexQuery(
    api.events_seating.getVenueLayout, // Should probably pass eventId, but we rely on simple pass-through or parent
    "skip"
);

// Real implementation: layout is passed as prop, but we need booked seats
// The following block is commented out as it will be moved inside the component.
/*
const { data: bookedSeatIds = [] } = useConvexQuery(api.events_seating.getBookedSeats, {
    eventId: venueLayout && ticketTiers && ticketTiers[0] ? ticketTiers[0].eventId : null // We need eventId. 
    // Actually, ReservedSeatingContainer doesn't receive eventId explicitly in props properly in my previous edit?
    // Let's check props. It receives logic from parent.
    // Parent `SeatSelectionModal` has `event`.
});
*/

// We need eventId passed to ReservedSeatingContainer
// But wait, the previous code for ReservedSeatingContainer didn't take eventId.
// I should add eventId prop.

export default function ReservedSeatingContainer({
    venueLayout,
    onProceed,
    ticketTiers,
    eventId // Added eventId prop
}) {
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Fetch booked seats
    const { data: bookedSeatIds } = useConvexQuery(api.events_seating.getBookedSeats,
        eventId ? { eventId } : "skip"
    );

    if (!venueLayout) return <div className="p-8 text-center text-gray-500">No venue layout available.</div>;

    const handleSeatClick = (seat) => {
        // Check if booked via toolkit status (which we will update below) OR bookedSeatIds
        const isBooked = seat.status === "booked" ||
            seat.status === "sold" ||
            (bookedSeatIds && bookedSeatIds.includes(seat.id));

        if (isBooked || seat.status === "reserved" || seat.status === "held") {
            return;
        }

        setSelectedSeats((prev) => {
            const isSelected = prev.find((s) => s.id === seat.id);
            if (isSelected) {
                return prev.filter((s) => s.id !== seat.id);
            } else {
                // Enrich seat with price from category/tier if possible
                // The toolkit seat object usually has category/price if configured in designer
                return [...prev, seat];
            }
        });
    };

    // Prepare data for toolkit (highlight selected seats)
    const toolkitData = {
        ...venueLayout,
        seats: venueLayout.seats?.map(seat => ({
            ...seat,
            status: selectedSeats.find(s => s.id === seat.id) ? "selected" : seat.status || "available"
        })) || []
    };

    const calculateTotal = () => {
        return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full w-full font-['Manrope']">
            {/* Left Column: Interactive Seat Map (66%) */}
            <div className="w-full lg:w-2/3 h-[450px] lg:h-full shrink-0 bg-[#181611] relative border-r border-white/10 overflow-hidden">
                <SeatToolkit
                    mode="user"
                    data={toolkitData}
                    events={{
                        onSeatClick: handleSeatClick,
                    }}
                />
            </div>

            {/* Right Column: Selected Seats Summary (33%) */}
            <div className="w-full lg:w-1/3 flex flex-col bg-[#1f1a0d] border-l border-white/5 relative z-10 h-full">
                {/* Header */}
                <div className="pt-8 pb-4 px-6 border-b border-white/5 bg-[#1f1a0d]">
                    <h2 className="text-white text-[28px] font-extrabold leading-tight tracking-tight">
                        Selected Seats
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                        {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                    </p>
                </div>

                {/* Scrollable list content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                    <div className="p-6 space-y-3">
                        {selectedSeats.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                Click seats on the map to select them
                            </div>
                        ) : (
                            selectedSeats.map((seat) => (
                                <div
                                    key={seat.id}
                                    className="bg-[#27272a] border border-white/10 rounded-lg p-4 hover:border-[#FBB03B]/30 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-semibold">{seat.label || seat.id}</p>
                                            <p className="text-sm text-gray-400">
                                                {seat.category || 'Standard'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#FBB03B] font-bold">
                                                ৳{(seat.price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#16130a] border-t border-[#fac529]/20 p-6 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-white/60 text-sm font-medium">Total Price</span>
                        <span className="text-3xl font-bold text-white tracking-tight">
                            ৳{calculateTotal().toLocaleString()}
                        </span>
                    </div>
                    <button
                        onClick={() => onProceed(selectedSeats)}
                        disabled={selectedSeats.length === 0}
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
