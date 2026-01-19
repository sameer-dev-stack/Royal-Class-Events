"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

function MockPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const tranId = searchParams.get("tran_id");
    const amount = searchParams.get("amount");
    const storeId = searchParams.get("store_id");
    const signature = searchParams.get("signature_key"); // Mock validation check

    const [isLoading, setIsLoading] = useState(false);

    // Validate that we have necessary params
    if (!tranId || !amount) {
        return <div className="p-10 text-center text-red-500">Invalid Payment Session</div>;
    }

    const handlePayment = async (status) => {
        setIsLoading(true);

        try {
            if (status === "SUCCESS") {
                // Simulate processing delay
                await new Promise(r => setTimeout(r, 1500));

                // In a real scenario, SSL Commerz would POST to our IPN.
                // Here, we simulate the redirect to our Success URL.
                // We act as the gateway redirecting the user back.

                // We can pass a mock "val_id" (validation ID)
                const mockValId = `val_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                // Redirect to OUR backend success route (which will validate and update DB)
                // Usually SSL Commerz posts to success_url.
                // Let's assume the success_url is /api/sslcommerz/success

                window.location.href = `/api/sslcommerz/success?tran_id=${tranId}&val_id=${mockValId}&amount=${amount}&currency=BDT&store_id=${storeId}`;

            } else if (status === "FAILED") {
                window.location.href = `/api/sslcommerz/fail?tran_id=${tranId}`;
            } else {
                window.location.href = `/api/sslcommerz/cancel?tran_id=${tranId}`;
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-t-8 border-t-#D4AF37">
                <CardHeader className="text-center border-b bg-white pb-6">
                    <div className="mx-auto w-32 h-12 mb-4 relative">
                        {/* Imagine an SSL Commerz Logo here, using text for now */}
                        <div className="flex items-center justify-center h-full text-2xl font-bold italic text-blue-600">
                            <span className="text-black">SSL</span>COMMERZ
                        </div>
                        <div className="absolute -right-2 -bottom-2 bg-yellow-300 text-[10px] px-1 rounded text-black font-bold">MOCK</div>
                    </div>
                    <CardTitle className="text-xl">Payment Gateway</CardTitle>
                    <CardDescription>Royal Class Events - Secure Checkout</CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-blue-900 font-medium">Merchant:</span>
                        <span className="font-bold text-blue-900">Royal Class Events</span>
                    </div>

                    <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono font-medium text-sm">{tranId}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg border-b pb-4">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-2xl text-green-600">৳{amount}</span>
                    </div>

                    <div className="space-y-3 pt-2">
                        <p className="text-center text-sm text-gray-500 mb-2">Select an action to simulate:</p>

                        <Button
                            variant="default"
                            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg gap-2"
                            onClick={() => handlePayment("SUCCESS")}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                            Simulate Success
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="destructive"
                                className="w-full gap-2"
                                onClick={() => handlePayment("FAILED")}
                                disabled={isLoading}
                            >
                                <XCircle className="w-4 h-4" /> Fail
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full gap-2 border"
                                onClick={() => handlePayment("CANCEL")}
                                disabled={isLoading}
                            >
                                <AlertCircle className="w-4 h-4" /> Cancel
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <div className="bg-gray-100 p-3 text-center text-xs text-gray-500 rounded-b-xl">
                    This is a MOCK payment page for testing purposes only.
                </div>
            </Card>
        </div>
    );
}

export default function MockPaymentGateway() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-#D4AF37" />
            </div>
        }>
            <MockPaymentContent />
        </Suspense>
    );
}

