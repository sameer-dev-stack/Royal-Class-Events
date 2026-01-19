"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import CheckoutSidebar from "./checkout-sidebar";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import useBookingStore from "@/hooks/use-booking-store";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MapPin, Armchair, X, Minus, Plus, ShoppingCart } from "lucide-react";

// Dynamic Load for Performance
const SeatViewer = dynamic(() => import("@/components/seat-engine/SeatViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mx-auto" />
                <p className="text-zinc-500 font-medium text-sm">Loading Seat Map...</p>
            </div>
        </div>
    )
});

// Define types for Props
interface BookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    eventTitle: string;
    eventLayout: any;
    seatingMode?: string;
    basePrice?: number;
}

export default function BookingModal({
    open,
    onOpenChange,
    eventId,
    eventTitle,
    eventLayout,
    seatingMode = "GENERAL_ADMISSION",
    basePrice = 0
}: BookingModalProps) {
    const { cartItems, addToCart, removeFromCart, clearCart } = useBookingStore();
    const [isMobileCheckoutOpen, setIsMobileCheckoutOpen] = useState(false);
    const [mapEnabled, setMapEnabled] = useState(false);

    // Fetch live data for sold seats
    const { data: soldSeatIds } = useConvexQuery(
        api.registrations.getSoldSeats,
        eventId ? { eventId } : "skip"
    );

    const isGeneral = seatingMode === "GENERAL" || seatingMode === "GENERAL_ADMISSION";
    const generalCount = cartItems.filter(item => item.id.startsWith("general_")).length;

    const updateGeneralQuantity = (newCount: number) => {
        const currentItems = cartItems.filter(item => item.id.startsWith("general_"));
        const currentCount = currentItems.length;

        if (newCount > currentCount) {
            // Add items
            for (let i = currentCount; i < newCount; i++) {
                addToCart({
                    id: `general_${Date.now()}_${i}`,
                    label: `General Admission #${i + 1}`,
                    price: basePrice,
                    category: "General",
                    zone: "GA"
                });
            }
        } else if (newCount < currentCount) {
            // Remove items
            const itemsToRemove = currentItems.slice(newCount);
            itemsToRemove.forEach(item => removeFromCart(item.id));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100vw] w-screen h-screen sm:max-w-[95vw] sm:h-[90vh] sm:rounded-2xl p-0 gap-0 border-none sm:border sm:border-zinc-800 bg-zinc-950 flex flex-col shadow-2xl overflow-hidden focus:outline-none !transform-none !top-0 !left-0 !translate-x-0 !translate-y-0 sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] [&>button:last-child]:hidden">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0 flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-md text-xs uppercase tracking-wider font-bold shadow-sm border border-[#D4AF37]/20">
                            Booking
                        </span>
                        <span className="truncate">{eventTitle || "Select Your Seats"}</span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Select your seats or quantity for {eventTitle} and proceed to checkout.
                    </DialogDescription>

                    {/* Explicit Close Button for Kiosk Feel */}
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close booking modal"
                        onClick={() => onOpenChange(false)}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full h-8 w-8"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </DialogHeader>

                {/* Main Content Area */}
                <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
                    {/* Seat Map / Quantity Selector Area */}
                    <div className="flex-1 relative bg-zinc-950 overflow-hidden">
                        {isGeneral ? (
                            /* General Admission Mode: Quantity Selector */
                            <div className="w-full h-full flex items-center justify-center p-6 sm:p-12">
                                <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8 animate-in fade-in zoom-in duration-300">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <ShoppingCart className="w-8 h-8 text-[#D4AF37]" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">General Admission</h3>
                                        <p className="text-zinc-400">Select the number of tickets you'd like to purchase.</p>
                                    </div>

                                    <div className="flex items-center justify-center gap-8 py-6">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => updateGeneralQuantity(Math.max(0, generalCount - 1))}
                                            className="h-14 w-14 rounded-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
                                        >
                                            <Minus className="w-6 h-6" />
                                        </Button>

                                        <span className="text-5xl font-black text-white w-12 text-center tabular-nums">
                                            {generalCount}
                                        </span>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => updateGeneralQuantity(Math.min(10, generalCount + 1))}
                                            className="h-14 w-14 rounded-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </Button>
                                    </div>

                                    <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800 flex justify-between items-center">
                                        <span className="text-zinc-400 font-medium">Price per ticket</span>
                                        <span className="text-xl font-bold text-[#D4AF37]">৳{basePrice}</span>
                                    </div>

                                    <p className="text-xs text-center text-zinc-500 uppercase tracking-widest font-bold">
                                        Max 10 tickets per order
                                    </p>
                                </div>
                            </div>
                        ) : eventLayout ? (
                            /* Reserved Mode: Seat Map */
                            <div className="w-full h-full relative">
                                <SeatViewer
                                    initialData={eventLayout}
                                    soldSeatIds={soldSeatIds || []}
                                />

                                {/* Map Scroll Shield (Mobile Friction) */}
                                {!mapEnabled && (
                                    <div
                                        onClick={() => setMapEnabled(true)}
                                        className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center lg:hidden cursor-pointer group"
                                    >
                                        <div className="bg-[#D4AF37] text-black px-6 py-3 rounded-full font-bold shadow-2xl transform transition-transform group-active:scale-95 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Tap to Explore Map
                                        </div>
                                        <p className="mt-4 text-white/60 text-xs font-medium uppercase tracking-widest">
                                            Prevents accidental scrolling while navigating
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full p-4">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-sm text-center space-y-4 shadow-lg">
                                    <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto">
                                        <Armchair className="w-8 h-8 text-[#D4AF37]" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white">No Seat Layout</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            This event needs a seating layout. Set up reserved seating in the Venue Builder or switch to General Admission.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Checkout Sidebar - Desktop only */}
                    <div className="hidden lg:block w-[400px] shrink-0 border-l border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-y-auto z-10">
                        <CheckoutSidebar
                            eventId={eventId}
                            isOpen={true}
                            onClose={() => { }}
                        />
                    </div>
                </div>

                {/* Mobile Cart Button - Fixed to Bottom with Safe Area Support */}
                {!isMobileCheckoutOpen && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-zinc-800 bg-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        <Button
                            onClick={() => setIsMobileCheckoutOpen(true)}
                            className="w-full h-14 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black text-lg rounded-2xl shadow-xl active:scale-[0.98] transition-all"
                        >
                            {cartItems.length > 0 ? (
                                <div className="flex items-center justify-between w-full px-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-black/20 px-2 py-0.5 rounded text-sm">{cartItems.length}</span>
                                        <span>View Cart</span>
                                    </div>
                                    <span className="font-mono">
                                        ৳{cartItems.reduce((acc, item) => acc + (item.price || 0), 0)}
                                    </span>
                                </div>
                            ) : "View Cart"}
                        </Button>
                    </div>
                )}

                {/* Vertical Spacer for Fixed Button (Mobile Only) */}
                <div className="lg:hidden h-24 shrink-0" />

                {/* Mobile Checkout Sheet */}
                <Sheet open={isMobileCheckoutOpen} onOpenChange={setIsMobileCheckoutOpen}>
                    <SheetContent side="bottom" className="p-0 h-[80vh] bg-zinc-900 border-zinc-800 text-white rounded-t-2xl">
                        <div className="sr-only">
                            <SheetTitle>Checkout Cart</SheetTitle>
                            <SheetDescription>Review your selected seats and proceed to payment.</SheetDescription>
                        </div>
                        <CheckoutSidebar
                            eventId={eventId}
                            isOpen={true}
                            onClose={() => setIsMobileCheckoutOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
            </DialogContent>
        </Dialog>
    );
}

