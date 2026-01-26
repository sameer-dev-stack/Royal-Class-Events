"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
    ShieldCheck,
    CreditCard,
    Smartphone,
    ChevronRight,
    Lock,
    ArrowLeft,
    Info,
    CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PAYMENT_METHODS = [
    { id: "visa", name: "Cards", icon: "💳", types: ["visa", "mastercard", "amex"] },
    { id: "bkash", name: "Mobile Banking", icon: "📱", types: ["bkash", "nagad", "rocket", "upay"] },
    { id: "internet", name: "Net Banking", icon: "🌐", types: ["dbbl", "city", "mtb"] },
];

export default function MockSSLCommerzPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const amount = searchParams.get("amount") || "0";
    const eventId = searchParams.get("eventId");
    const tranId = searchParams.get("tran_id");
    const regId = searchParams.get("regId");
    const orderId = tranId || "SSL-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const [selectedMain, setSelectedMain] = useState("bkash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(1); // 1: Method Select, 2: Process, 3: Success

    const handlePay = async () => {
        setIsProcessing(true);
        setStep(2);

        try {
            // Small artificial delay for "Processing"
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call our success API to validate the payment in Supabase
            const response = await fetch("/api/payment/sslcommerz/success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tran_id: orderId,
                    val_id: `MOCK_VAL_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    status: "SUCCESS"
                })
            });

            if (response.ok) {
                setStep(3);
                // Wait a bit then redirect back to the app confirmation page
                setTimeout(() => {
                    router.push(`/order-confirmation?orderId=${orderId}&registrationId=${regId}&status=success`);
                }, 2000);
            } else {
                alert("Payment failed in mock system. Please try again.");
                setStep(1);
            }
        } catch (error) {
            console.error("Mock Payment Error:", error);
            alert("Something went wrong with the mock payment.");
            setStep(1);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] text-slate-800 font-sans flex flex-col items-center py-10 px-4">
            {/* SSLCommerz Header Mock */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-[#0055A4] text-white p-1.5 rounded font-bold text-xl px-4">
                        SSL<span className="text-white/80">Commerz</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-slate-400 text-sm border-l border-slate-300 ml-2 pl-4">
                        <ShieldCheck className="w-4 h-4" />
                        SECURE PAYMENT GATEWAY
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Merchant</p>
                    <p className="font-bold text-slate-700">Royal Class Events</p>
                </div>
            </div>

            <div className="w-full max-w-4xl grid md:grid-cols-[1fr_320px] gap-6">
                {/* Main Payment Section */}
                <Card className="bg-white border-none shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            {step === 1 && "Choose Payment Method"}
                            {step === 2 && "Processing Payment"}
                            {step === 3 && "Payment Successful"}
                        </h2>
                        <div className="text-slate-400 text-sm">Step {step} of 3</div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {step === 1 && (
                            <>
                                {/* Side tabs */}
                                <div className="w-1/3 bg-slate-50 border-r flex flex-col">
                                    {PAYMENT_METHODS.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMain(method.id)}
                                            className={`p-5 flex items-center justify-between text-left transition-all ${selectedMain === method.id
                                                ? "bg-white border-r-4 border-r-[#0055A4] text-[#0055A4] font-bold"
                                                : "text-slate-500 hover:bg-slate-100"
                                                }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="text-xl">{method.icon}</span>
                                                <span className="text-sm">{method.name}</span>
                                            </span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                        </button>
                                    ))}
                                </div>

                                {/* Method Options */}
                                <div className="flex-1 p-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {/* Mock bKash/Nagad/Visa logos based on selection */}
                                        {selectedMain === "bkash" && (
                                            <>
                                                <div className="mock-payment-btn" onClick={handlePay}>
                                                    <div className="h-12 w-full bg-[#E2126D] rounded flex items-center justify-center text-white font-black text-xl italic">bKash</div>
                                                    <span className="text-xs font-bold mt-2">bKash</span>
                                                </div>
                                                <div className="mock-payment-btn" onClick={handlePay}>
                                                    <div className="h-12 w-full bg-[#ED1C24] rounded flex items-center justify-center text-white font-black text-xl">Nagad</div>
                                                    <span className="text-xs font-bold mt-2">Nagad</span>
                                                </div>
                                                <div className="mock-payment-btn" onClick={handlePay}>
                                                    <div className="h-12 w-full bg-[#8C3494] rounded flex items-center justify-center text-white font-black text-xl italic">Rocket</div>
                                                    <span className="text-xs font-bold mt-2">Rocket</span>
                                                </div>
                                            </>
                                        )}
                                        {selectedMain === "visa" && (
                                            <>
                                                <div className="mock-payment-btn" onClick={handlePay}>
                                                    <div className="h-12 w-full bg-[#1A1F71] rounded flex items-center justify-center text-white font-black text-xl italic">VISA</div>
                                                    <span className="text-xs font-bold mt-2">Visa Card</span>
                                                </div>
                                                <div className="mock-payment-btn" onClick={handlePay}>
                                                    <div className="h-12 w-full bg-[#EB001B] rounded flex items-center justify-center text-white font-black text-lg italic">Mastercard</div>
                                                    <span className="text-xs font-bold mt-2">Mastercard</span>
                                                </div>
                                                <div className="mock-payment-btn" onClick={handlePay}>
                                                    <div className="h-12 w-full bg-[#0070D1] rounded flex items-center justify-center text-white font-black text-xl italic">AMEX</div>
                                                    <span className="text-xs font-bold mt-2">Amex Card</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-12 bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
                                        <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                        <p className="text-xs text-blue-700 leading-tight">
                                            Transaction Fee may apply depending on your payment method. Please check the final amount before confirming.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                    <Lock className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-xl text-slate-700">Verifying Transaction</p>
                                    <p className="text-slate-400 text-sm mt-1">Please do not close this window or click refresh</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6 text-center">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <div>
                                    <p className="font-bold text-2xl text-slate-700">Payment Successful</p>
                                    <p className="text-slate-400 mt-2">Transaction ID: {orderId}</p>
                                </div>
                                <p className="text-slate-500 text-sm">Redirecting you back to Royal Class Events...</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
                        <button className="text-slate-400 text-sm flex items-center gap-2 hover:text-slate-600">
                            <ArrowLeft className="w-4 h-4" /> Cancel Payment
                        </button>
                        <div className="flex gap-4 items-center grayscale opacity-50">
                            <div className="text-[10px] font-bold uppercase text-slate-400">Trusted By</div>
                            <div className="font-black text-slate-500 text-xs italic">Norton</div>
                            <div className="font-black text-slate-500 text-xs italic">VeriSign</div>
                        </div>
                    </div>
                </Card>

                {/* Amount Section */}
                <div className="space-y-4">
                    <Card className="bg-white border-none shadow-sm p-6">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">You are paying</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-bold">BDT</span>
                            <span className="text-5xl font-black">{parseFloat(amount).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400">Invoiced on {format(new Date(), "PP")}</p>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Order ID</span>
                                <span className="font-mono font-bold text-slate-700 text-xs">{orderId}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Currency</span>
                                <span className="font-bold text-slate-700">BDT</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Country</span>
                                <span className="font-bold text-slate-700">Bangladesh</span>
                            </div>
                        </div>
                    </Card>

                    <div className="px-2">
                        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                            By clicking the payment method you agree to the SSLCommerz Terms & Conditions and acknowledge that this is a secure, encrypted transaction.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .mock-payment-btn {
          @apply flex flex-col items-center justify-center p-3 border rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer;
        }
      `}</style>
        </div>
    );
}
