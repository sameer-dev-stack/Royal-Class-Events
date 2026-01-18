"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useBookingStore from "@/hooks/use-booking-store";
import { X, CreditCard, ShoppingCart } from "lucide-react";
// Removed missing formatCurrency import since formatMoney is defined locally
import { PaymentModal } from "./payment-modal";
import { toast } from "sonner";

import useAuthStore from "@/hooks/use-auth-store";

export default function CheckoutSidebar({ eventId, isOpen, onClose }) {
    const { cartItems, removeFromCart, totalAmount } = useBookingStore();
    const { user, token } = useAuthStore(); // Grab user and token
    const [showPayment, setShowPayment] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm({
        mode: "onChange",
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.profile?.mobilePhone?.number || ""
        }
    });

    const [guestDetails, setGuestDetails] = useState(null);

    const onSubmit = (data) => {
        if (cartItems.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }
        setGuestDetails(data);
        setShowPayment(true);
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
    };

    if (!isOpen) return null;

    return (
        <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col h-full w-full bg-zinc-900 shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-amber-500" />
                    Your Cart
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="md:hidden p-2 hover:bg-zinc-800 rounded-full text-zinc-400"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Seat List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                    <div className="text-center text-zinc-500 py-12">
                        <p className="text-lg">No seats selected.</p>
                        <p className="text-sm mt-2">Click on the map to add seats.</p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <div>
                                <p className="font-medium text-white">{item.label}</p>
                                <p className="text-xs text-zinc-400 capitalize">{item.category} • {formatMoney(item.price)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="text-zinc-500 hover:text-red-500 transition-colors p-2"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Checkout Form Content */}
            <div className="p-6 bg-zinc-950 border-t border-zinc-800 shrink-0">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Guest Details</h3>
                <div className="space-y-3">
                    <div>
                        <input
                            {...register("name", { required: "Name is required" })}
                            placeholder="Full Name"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors text-white"
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>
                    <div>
                        <input
                            {...register("email", {
                                required: "Email is required",
                                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                            })}
                            placeholder="Email Address"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors text-white"
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                    </div>
                    <div>
                        <input
                            {...register("phone", { required: "Phone is required" })}
                            placeholder="Phone Number"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors text-white"
                        />
                        {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900 shrink-0 pb-10 md:pb-6">
                <div className="flex justify-between items-center mb-5">
                    <span className="text-zinc-400 text-lg">Total</span>
                    <span className="text-3xl font-bold text-amber-500">{formatMoney(totalAmount())}</span>
                </div>

                <button
                    type="submit"
                    disabled={cartItems.length === 0 || !isValid}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-black text-lg rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
                >
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                </button>
            </div>

            {/* Payment Modal */}
            {showPayment && guestDetails && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    eventId={eventId}
                    amount={totalAmount()}
                    guestDetails={guestDetails}
                    seatIds={cartItems.map(i => i.id)}
                    token={token}
                />
            )}
        </form>
    );
}
