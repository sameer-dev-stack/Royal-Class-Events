"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";
import useBookingStore from "@/hooks/use-booking-store";
// import Confetti from "react-confetti"; // Removed as not installed

export function PaymentModal({ isOpen, onClose, eventId, amount, guestDetails, seatIds, token: propToken }) {
    const [status, setStatus] = useState("processing"); // processing | success | error
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    // Mutation
    const bookSeats = useMutation(api.registrations.bookSeats);

    const { token: storeToken } = useAuthStore(); // Get auth token (hook imported from store not context)
    const { clearCart } = useBookingStore(); // Use global store for cart

    // Resolve token: explicit prop > store > undefined
    const activeToken = propToken || storeToken;

    const paymentInitiated = React.useRef(false);

    useEffect(() => {
        if (isOpen && status === "processing" && !paymentInitiated.current) {
            paymentInitiated.current = true;
            handlePayment();
        }
    }, [isOpen]);

    const handlePayment = async () => {
        // Prevent double submission if already successful or error (unless retry)
        // status starts at 'processing' which is correct for first run

        try {
            // 1. Simulate Gateway Delay (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Call Backend
            const result = await bookSeats({
                eventId,
                seatIds,
                amount,
                token: activeToken || undefined, // Pass token if logged in
                guestName: guestDetails.name,
                guestEmail: guestDetails.email,
                guestPhone: guestDetails.phone
            });

            if (result.success) {
                setStatus("success");
                clearCart(); // Clear the cart immediately on success
                // Redirect after short delay
                setTimeout(() => {
                    onClose();
                    toast.success("Booking Confirmed! Check your email.");
                    router.push("/my-tickets"); // Actually redirect
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            setStatus("error");
            setErrorMsg(err.message || "Payment failed");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden">

                {status === "success" && <div className="absolute inset-0 pointer-events-none"><div className="w-full h-full flex justify-center"><div className="animate-ping bg-green-500/20 absolute w-full h-full rounded-full"></div></div></div>}

                <div className="flex flex-col items-center text-center space-y-4">

                    {/* Icon State */}
                    {status === "processing" && (
                        <div className="w-16 h-16 bg-#D4AF37/10 rounded-full flex items-center justify-center animate-pulse">
                            <Loader2 className="w-8 h-8 text-#D4AF37 animate-spin" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                    )}

                    {/* Text Content */}
                    <div>
                        <h3 className="text-2xl font-bold text-white">
                            {status === "processing" && "Processing Payment..."}
                            {status === "success" && "Payment Successful!"}
                            {status === "error" && "Payment Failed"}
                        </h3>
                        <p className="text-zinc-400 mt-2">
                            {status === "processing" && "Please do not close this window."}
                            {status === "success" && " redirecting you to your tickets..."}
                            {status === "error" && (errorMsg || "Something went wrong. Please try again.")}
                        </p>
                    </div>

                    {/* Actions */}
                    {status === "error" && (
                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                        >
                            Close & Try Again
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
}

