"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    offerTitle: string;
    onConfirm: () => Promise<void>;
}

export function PaymentModal({
    isOpen,
    onClose,
    amount,
    offerTitle,
    onConfirm,
}: PaymentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            // Simulate processor latency
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await onConfirm();
            toast.success("Payment successful! Funds are held in escrow.");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Payment failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (val: number) => {
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(val);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="bg-background border-border text-foreground max-w-md rounded-[2rem] overflow-hidden p-0 gap-0 shadow-2xl">
                <DialogHeader className="p-8 pb-4 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                        <ShieldCheck className="w-8 h-8 text-amber-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
                        Secure Booking
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-base mt-2">
                        You are paying {formatPrice(amount)}. Funds will be held until the event.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 py-6 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-muted/50 border border-border p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Service</span>
                            <span className="text-foreground font-bold text-sm line-clamp-1 max-w-[200px]">{offerTitle}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-end">
                            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total to Pay</span>
                            <span className="text-3xl font-black text-foreground">{formatPrice(amount)}</span>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Encrypted</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Secure Vault</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-0 flex flex-col gap-4">
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        variant="default"
                        size="lg"
                        className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-lg rounded-2xl shadow-xl shadow-amber-500/10 transition-all active:scale-95"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                Processing...
                            </>
                        ) : (
                            "Confirm Payment"
                        )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground font-medium px-4 leading-relaxed">
                        By clicking "Confirm & Pay", you agree to the Royal Class Escrow terms. This is a simulated transaction for platform testing.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
