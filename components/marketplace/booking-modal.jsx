"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Clock,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    CreditCard,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useSupabase } from "@/components/providers/supabase-provider";
import useAuthStore from "@/hooks/use-auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MarketplaceBookingModal({ isOpen, onClose, service, supplierId }) {
    const { supabase } = useSupabase();
    const { user } = useAuthStore();
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState("10:00");
    const [step, setStep] = useState(1); // 1: Schedule, 2: Review/Pay, 3: Success
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!service) return null;

    const handleBooking = async () => {
        if (!user) {
            toast.error("Please sign in to book a service");
            return;
        }

        setIsSubmitting(true);
        try {
            // Combine date and time
            const [hours, minutes] = time.split(":").map(Number);
            const startDateTime = new Date(date);
            startDateTime.setHours(hours, minutes, 0, 0);

            // Assume 2 hour default duration for now
            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(startDateTime.getHours() + 2);

            // 1. Create Booking in Supabase
            const { data: booking, error: bookingError } = await supabase
                .from('marketplace_bookings')
                .insert([{
                    customer_id: user.id,
                    supplier_id: supplierId,
                    service_id: service.id,
                    status: 'awaiting_payment',
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    total_amount: service.price,
                    escrow_status: 'none'
                }])
                .select()
                .single();

            if (bookingError) throw bookingError;

            // 2. Simulate Payment & Escrow
            // In a real app, we'd call Stripe here.
            const { error: txError } = await supabase
                .from('marketplace_transactions')
                .insert([{
                    booking_id: booking.id,
                    amount: service.price,
                    platform_fee: service.price * 0.15, // 15% commission as per doc
                    vendor_payout: service.price * 0.85,
                    status: 'completed'
                }]);

            if (txError) throw txError;

            // 3. Update Booking Status to Confirmed/Held in Escrow
            await supabase
                .from('marketplace_bookings')
                .update({
                    status: 'confirmed',
                    escrow_status: 'held'
                })
                .eq('id', booking.id);

            setStep(3);
            toast.success("Booking confirmed and funds held in escrow!");

        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Failed to complete booking: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00",
        "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setTimeout(() => setStep(1), 300);
            }
        }}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-[#D4AF37]/20 bg-background/95 backdrop-blur-2xl">

                {step === 1 && (
                    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic tracking-tighter">Schedule Service</DialogTitle>
                            <DialogDescription>Select when you'd like {service.title} to take place.</DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-6">
                            <div className="bg-muted/30 p-2 rounded-2xl border border-border/50">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(d) => d < new Date()}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Available Slots
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {timeSlots.map((ts) => (
                                        <button
                                            key={ts}
                                            onClick={() => setTime(ts)}
                                            className={cn(
                                                "py-2 rounded-lg text-xs font-bold border transition-all",
                                                time === ts
                                                    ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                                                    : "bg-background border-border text-muted-foreground hover:border-[#D4AF37]/50"
                                            )}
                                        >
                                            {ts}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setStep(2)}
                            className="w-full h-14 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest rounded-xl transition-all gap-2"
                        >
                            Next: Review & Pay
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic tracking-tighter">Confirm Booking</DialogTitle>
                            <DialogDescription>Review your order and process payment.</DialogDescription>
                        </DialogHeader>

                        <div className="bg-muted/30 rounded-2xl border border-border/50 overflow-hidden">
                            <div className="p-5 border-b border-border/50 bg-[#D4AF37]/5">
                                <h4 className="font-bold text-foreground">{service.title}</h4>
                                <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mt-1">Service Package</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-bold text-foreground">{format(date, "MMMM do, yyyy")}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time</span>
                                    <span className="font-bold text-foreground">{time}</span>
                                </div>
                                <div className="h-px bg-border/50 w-full" />
                                <div className="flex justify-between items-end">
                                    <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Total to Pay</span>
                                    <span className="text-2xl font-black text-[#D4AF37]">৳ {Number(service.price).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-4">
                            <ShieldCheck className="w-6 h-6 text-rose-500 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Buyer Protection</p>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Your funds will be held in <strong>Escrow</strong> and only released to the vendor after you confirm the service is completed.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleBooking}
                                disabled={isSubmitting}
                                className="w-full h-14 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest rounded-xl shadow-2xl shadow-[#D4AF37]/20 transition-all gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                {isSubmitting ? "Processing..." : "Confirm & Pay"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setStep(1)}
                                className="w-full h-10 text-muted-foreground hover:bg-white/5 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                            >
                                Back to Schedule
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto border-4 border-[#D4AF37]/20">
                            <CheckCircle2 className="w-12 h-12 text-[#D4AF37]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter">Booking Successful!</h2>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Your booking is confirmed. The vendor has been notified and your payment is safely held in escrow.
                            </p>
                        </div>
                        <Button
                            onClick={onClose}
                            className="bg-white text-black hover:bg-zinc-200 px-10 rounded-xl font-bold uppercase tracking-widest text-xs h-12"
                        >
                            Back to Profile
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
