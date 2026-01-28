"use client";

import React from "react";
import useBookingStore from "@/hooks/use-booking-store";
import { X, CreditCard, ShoppingCart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";

export default function CheckoutSidebar({ eventId, isOpen, onClose }) {
    const { cartItems, removeFromCart, totalAmount } = useBookingStore();
    const { user } = useAuthStore();
    const router = useRouter();

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
    };

    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        // Save cart to session storage for the checkout page
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('checkoutTickets', JSON.stringify(cartItems.map(item => ({
                seatId: item.id,
                name: item.label,
                price: item.price,
                quantity: 1,
                category: item.category
            }))));
            sessionStorage.setItem('checkoutSeatIds', JSON.stringify(cartItems.map(item => item.id)));

            // Pre-fill attendee info if user is logged in
            if (user) {
                sessionStorage.setItem('attendeeInfo', JSON.stringify({
                    fullName: user.name || "",
                    email: user.email || "",
                }));
            }
        }

        router.push(`/checkout?eventId=${eventId}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="flex flex-col h-full w-full bg-zinc-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-[#D4AF37]" />
                    Cart Summary
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                    <div className="text-center text-zinc-500 py-12">
                        <p className="text-lg">No seats selected.</p>
                        <p className="text-sm mt-2">Click on the map to add seats.</p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800 group">
                            <div>
                                <p className="font-semibold text-white">{item.label}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">{item.category} • {formatMoney(item.price)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900 shrink-0 pb-10 md:pb-6">
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Items ({cartItems.length})</span>
                        <span className="text-zinc-300 font-medium">{formatMoney(totalAmount())}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                        <span className="text-zinc-400 text-lg">Subtotal</span>
                        <span className="text-3xl font-bold text-[#D4AF37]">{formatMoney(totalAmount())}</span>
                    </div>
                </div>

                <button
                    onClick={handleProceedToCheckout}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-orange-600 hover:from-[#8C7326] hover:to-orange-700 text-black font-black text-lg rounded-xl shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-zinc-500 mt-4 uppercase tracking-tighter">
                    Taxes and fees calculated at checkout
                </p>
            </div>
        </div>
    );
}
