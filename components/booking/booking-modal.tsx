"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import CheckoutSidebar from "./checkout-sidebar";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import useBookingStore from "@/hooks/use-booking-store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MapPin, Armchair, X } from "lucide-react";

// Dynamic Load for Performance
const SeatViewer = dynamic(() => import("@/components/seat-engine/SeatViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
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
    eventLayout: any; // Using any for complex layout object to avoid strict typing issues
}

export default function BookingModal({ open, onOpenChange, eventId, eventTitle, eventLayout }: BookingModalProps) {
    const { cartItems } = useBookingStore();
    const [isMobileCheckoutOpen, setIsMobileCheckoutOpen] = useState(false);
    const [mapEnabled, setMapEnabled] = useState(false);

    // Fetch live data for sold seats
    const { data: soldSeatIds } = useConvexQuery(
        api.registrations.getSoldSeats,
        eventId ? { eventId } : "skip"
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100vw] w-screen h-screen sm:max-w-[95vw] sm:h-[90vh] sm:rounded-2xl p-0 gap-0 border-none sm:border sm:border-zinc-800 bg-zinc-950 flex flex-col shadow-2xl overflow-hidden focus:outline-none !transform-none !top-0 !left-0 !translate-x-0 !translate-y-0 sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] [&>button:last-child]:hidden">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0 flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-md text-xs uppercase tracking-wider font-bold shadow-sm border border-amber-500/20">
                            Booking
                        </span>
                        <span className="truncate">{eventTitle || "Select Your Seats"}</span>
                    </DialogTitle>

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
                    {/* Seat Map Area */}
                    <div className="flex-1 relative bg-zinc-950 overflow-hidden">
                        {eventLayout ? (
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
                                        <div className="bg-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl transform transition-transform group-active:scale-95 flex items-center gap-2">
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
                                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                                        <Armchair className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white">No Seat Layout</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            This event needs a seating layout. Set up reserved seating in the Venue Builder.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-2">
                                        <MapPin className="w-3 h-3" />
                                        <span>General Admission may be available</span>
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
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-zinc-800 bg-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
                    <Button
                        onClick={() => setIsMobileCheckoutOpen(true)}
                        className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black font-black text-lg rounded-2xl shadow-xl active:scale-[0.98] transition-all"
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

                {/* Vertical Spacer for Fixed Button (Mobile Only) */}
                <div className="lg:hidden h-24 shrink-0" />

                {/* Mobile Checkout Sheet */}
                <Sheet open={isMobileCheckoutOpen} onOpenChange={setIsMobileCheckoutOpen}>
                    <SheetContent side="bottom" className="p-0 h-[80vh] bg-zinc-900 border-zinc-800 text-white rounded-t-2xl">
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
