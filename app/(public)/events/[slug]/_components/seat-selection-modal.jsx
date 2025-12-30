<<<<<<< HEAD
=======
"use client";

>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Loader2, ShoppingCart, ArrowRight } from "lucide-react";
import SeatSelectionContainer from "@/components/seat-selection-container";
<<<<<<< HEAD
import ReservedSeatingContainer from "@/components/reserved-seating-container";
=======
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
import { useStoreUser } from "@/hooks/use-store-user";
import { toast } from "sonner";

export default function SeatSelectionModal({ event, isOpen, onClose }) {
    const router = useRouter();
    const { userId } = useStoreUser();
<<<<<<< HEAD
    const [selectedTickets, setSelectedTickets] = useState({}); // { ticketId: quantity } -> Only used for GA
=======
    const [selectedTickets, setSelectedTickets] = useState({}); // { ticketId: quantity }
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5

    // Fetch ticket tiers for this event
    const { data: ticketTiers, isLoading } = useConvexQuery(api.tickets.getTicketTiers, {
        eventId: event._id,
    });

<<<<<<< HEAD
    // GENERAL ADMISSION HANDLERS
=======
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
    const handleUpdateQuantity = (ticketId, delta) => {
        setSelectedTickets((prev) => {
            const current = prev[ticketId] || 0;
            const newQty = Math.max(0, current + delta);
            if (newQty === 0) {
                const { [ticketId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [ticketId]: newQty };
        });
    };

    const calculateTotal = () => {
        if (!ticketTiers) return 0;
        return Object.entries(selectedTickets).reduce((total, [id, qty]) => {
<<<<<<< HEAD
=======
            // Find ticket matching the ID (assuming zone.id matches ticketTier.id for now)
            // Or find by name match if IDs are different? 
            // Ideally, seatMapConfig.zones[i].id === ticketTier._id
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
            const ticket = ticketTiers.find(t => t._id === id || t.name === id);
            return total + (ticket?.price || 0) * qty;
        }, 0);
    };

<<<<<<< HEAD
    // SHARED CHECKOUT HANDLER
    const proceedToCheckout = (items) => {
        if (!items || items.length === 0) {
            toast.error("Please select at least one ticket");
            return;
        }

        sessionStorage.setItem("checkoutTickets", JSON.stringify(items));
        sessionStorage.setItem("checkoutEventId", event._id);

        router.push(`/checkout?eventId=${event.slug}`);
        onClose();
    };

    const handleGAProceed = () => {
=======
    const handleProceed = () => {
        // Here we would normally add to a server-side cart or local storage cart
        // For this MVP flow, we'll store in sessionStorage and go to checkout

>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
        const cartItems = Object.entries(selectedTickets).map(([id, qty]) => {
            const ticket = ticketTiers.find(t => t._id === id || t.name === id);
            return {
                ticketId: ticket?._id,
                name: ticket?.name,
                price: ticket?.price,
<<<<<<< HEAD
                quantity: qty,
                type: "GENERAL_ADMISSION"
            }
        }).filter(item => item.ticketId);

        proceedToCheckout(cartItems);
    };

    const handleReservedProceed = (selectedSeats) => {
        // Map selected seats to cart items
        // Each seat is an item
        const cartItems = selectedSeats.map(seat => ({
            ticketId: seat.tierId || seat.category, // Fallback if needed
            name: `${seat.category || 'Standard'} - ${seat.label || seat.id}`,
            price: seat.price,
            quantity: 1,
            seatId: seat.id,
            section: seat.section,
            type: "RESERVED_SEATING"
        }));

        proceedToCheckout(cartItems);
    };

    // Merge ticket tiers with their selected quantities for the GA list view
    const ticketsWithQty = ticketTiers?.map(tier => ({
        ...tier,
        id: tier._id,
        quantity: selectedTickets[tier._id] || selectedTickets[tier.name] || 0
    })) || [];

    const isReserved = event.seatingMode === "RESERVED_SEATING" || event.seatingMode === "HYBRID";

=======
                quantity: qty
            }
        }).filter(item => item.ticketId); // Ensure valid items

        if (cartItems.length === 0) {
            toast.error("Please select at least one ticket");
            return;
        }

        sessionStorage.setItem("checkoutTickets", JSON.stringify(cartItems));
        sessionStorage.setItem("checkoutEventId", event._id);

        router.push(`/checkout?eventId=${event.slug}`);
        onClose();
    };

    // Merge ticket tiers with their selected quantities for the list view
    const ticketsWithQty = ticketTiers?.map(tier => ({
        ...tier,
        id: tier._id, // normalizing id
        quantity: selectedTickets[tier._id] || selectedTickets[tier.name] || 0
    })) || [];

>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Inject Fonts directly as requested */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Noto+Sans:wght@300..700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
            `}} />

            <DialogContent className="max-w-6xl p-0 bg-[#231e0f] border-white/10 text-white overflow-hidden flex flex-col h-[650px] shadow-2xl rounded-xl font-['Manrope']">
                <DialogTitle className="sr-only">Select Seats</DialogTitle>
<<<<<<< HEAD

                {isReserved ? (
                    <ReservedSeatingContainer
                        venueLayout={event.venueLayout}
                        ticketTiers={ticketTiers}
                        onProceed={handleReservedProceed}
                        eventId={event._id}
                    />
                ) : (
                    <SeatSelectionContainer
                        seatMapConfig={event.seatMapConfig}
                        tickets={ticketsWithQty}
                        selectedTickets={selectedTickets}
                        onUpdateQuantity={handleUpdateQuantity}
                        totalPrice={calculateTotal()}
                        onProceed={handleGAProceed}
                    />
                )}
=======
                <SeatSelectionContainer
                    seatMapConfig={event.seatMapConfig}
                    tickets={ticketsWithQty}
                    selectedTickets={selectedTickets}
                    onUpdateQuantity={handleUpdateQuantity}
                    totalPrice={calculateTotal()}
                    onProceed={handleProceed}
                />
>>>>>>> cb4158069d9f1bd3710882ab55b9222d8a7291f5
            </DialogContent>
        </Dialog>
    );
}
