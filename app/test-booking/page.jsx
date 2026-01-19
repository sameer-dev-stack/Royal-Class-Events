"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ShoppingCart, Armchair, Ticket, Loader2 } from "lucide-react";
import useBookingStore from "@/hooks/use-booking-store";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet"; // Shadcn Sheet
import { Button } from "@/components/ui/button";

import CheckoutSidebar from "@/components/booking/checkout-sidebar";

// Import Viewer dynamically (No SSR)
const SeatViewer = dynamic(() => import("@/components/seat-engine/SeatViewer"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-zinc-500">Loading Map...</div>
});

const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
};

export default function TestBookingPage() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get("eventId");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { cartItems } = useBookingStore();

    // Calculate total locally for the sticky button
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

    // Fetch Event Data if ID exists
    const event = useQuery(api.events.getById, eventId ? { id: eventId } : "skip");

    // Fetch Sold Seats Real-time
    const soldSeatIds = useQuery(api.registrations.getSoldSeats, eventId ? { eventId } : "skip");

    // Reset cart on mount
    const clearCart = useBookingStore(s => s.clearCart);
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    // Auto-open sidebar on first add (Desktop only)
    useEffect(() => {
        if (cartItems.length > 0 && window.innerWidth >= 768) {
            setIsSidebarOpen(true);
        }
    }, [cartItems.length]);

    return (
        <div className="fixed inset-0 w-screen h-screen flex bg-zinc-950 flex-col md:flex-row">
            {/* Main Viewer Area */}
            <div className="flex-1 relative h-full w-full pb-20 md:pb-0"> {/* Padding bottom for mobile sticky bar */}
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6 pointer-events-none">
                    <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                        {event?.title?.en || "Royal Arena Seating"}
                    </h1>
                    <p className="text-zinc-400 drop-shadow-md text-sm">
                        {eventId ? "Live Booking View" : "Please provide ?eventId=..."}
                    </p>
                </div>

                {eventId && event === undefined ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-50">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                            <p className="text-zinc-500 text-sm">Loading Live Map...</p>
                        </div>
                    </div>
                ) : event && event.venueLayout ? (
                    <SeatViewer initialData={event.venueLayout} soldSeatIds={soldSeatIds || []} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                        {eventId ? "No Layout Found for this Event" : "No Event ID Parameters provided"}
                    </div>
                )}
            </div>

            {/* Desktop Sidebar (Split View) */}
            <div className={`
                hidden md:block z-30 transition-all duration-300 ease-in-out border-l border-zinc-800 bg-zinc-900
                ${isSidebarOpen ? 'w-[400px]' : 'w-0 overflow-hidden'}
            `}>
                <div className="w-[400px] h-full"> {/* Fixed width container to prevent layout shift during transition */}
                    <CheckoutSidebar
                        eventId={eventId}
                        isOpen={true}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>
            </div>

            {/* Mobile Bottom Sheet (Shadcn) */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="bottom" className="p-0 h-[85vh] bg-zinc-900 border-zinc-800 text-white rounded-t-2xl">
                    <CheckoutSidebar
                        eventId={eventId}
                        isOpen={true}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800 md:hidden z-50">
                <Button
                    onClick={() => setIsSidebarOpen(true)}
                    className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-in slide-in-from-bottom-5 duration-300"
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    View Cart • {formatMoney(totalAmount)}
                </Button>
            </div>
        </div>
    );
}
