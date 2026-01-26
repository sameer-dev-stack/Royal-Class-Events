"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
    Calendar,
    MapPin,
    Edit,
    Trash2,
    Lock,
    AlertCircle,
    Plus,
    Minus,
    Clock,
    Check,
} from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SessionExpiredModal from "@/components/session-expired-modal";
import "./checkout.css";

const PLATFORM_FEE_PERCENT = 5;
const VAT_PERCENT = 5;
const TIMER_DURATION = 10 * 60; // 10 minutes in seconds

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams.get("eventId");

    // State Management
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
    const [tickets, setTickets] = useState([]);
    const [seatIds, setSeatIds] = useState([]); // Added seatIds state
    const [useUserInfo, setUseUserInfo] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("bkash");
    const [promoCode, setPromoCode] = useState("");
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [showExpiredModal, setShowExpiredModal] = useState(false);

    // Form State
    const [attendeeInfo, setAttendeeInfo] = useState({
        fullName: "",
        email: "",
        mobile: "+880",
    });
    const [errors, setErrors] = useState({});

    const { supabase } = useSupabase();
    const [user, setUser] = useState(null);
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Fetch Auth State
    useEffect(() => {
        async function getAuth() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUser(session.user);
        }
        getAuth();
    }, [supabase]);

    // 2. Fetch Event Data
    useEffect(() => {
        if (!eventId) return;
        async function fetchEvent() {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('slug', eventId)
                    .single();

                if (error) throw error;
                setEvent(data);
            } catch (err) {
                console.error("Checkout event fetch failed:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchEvent();
    }, [eventId, supabase]);


    const eventTitle = event?.title?.en || event?.title || "Sample Event";

    // Load order data from session storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Load Attendee Info
            const storedAttendee = sessionStorage.getItem('attendeeInfo');
            if (storedAttendee) {
                try {
                    const parsed = JSON.parse(storedAttendee);
                    setAttendeeInfo((prev) => ({
                        ...prev,
                        fullName: parsed.fullName || prev.fullName,
                        email: parsed.email || prev.email,
                    }));
                    setUseUserInfo(true);
                } catch (e) {
                    console.error('Failed to parse attendee info:', e);
                }
            }

            // Load Tickets
            const storedTickets = sessionStorage.getItem('checkoutTickets');
            if (storedTickets) {
                try {
                    const parsed = JSON.parse(storedTickets);
                    if (Array.isArray(parsed)) {
                        setTickets(parsed.map((t, idx) => ({
                            id: t.seatId || t.ticketId || idx, // Prefer seatId for uniqueness
                            name: t.name,
                            price: t.price,
                            quantity: t.quantity,
                            details: t // Keep full details
                        })));
                    }
                } catch (e) {
                    console.error('Failed to parse checkout tickets:', e);
                }
            }

            // Load Seat IDs
            const storedSeatIds = sessionStorage.getItem('checkoutSeatIds');
            if (storedSeatIds) {
                try {
                    const parsed = JSON.parse(storedSeatIds);
                    if (Array.isArray(parsed)) {
                        setSeatIds(parsed);
                    }
                } catch (e) {
                    console.error('Failed to parse checkout seat IDs:', e);
                }
            }
        }
    }, [router]);

    // Countdown Timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowExpiredModal(true);
                    toast.error("Your session has expired. Please try again.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Calculate Totals
    const subtotal = tickets.reduce(
        (sum, ticket) => sum + ticket.price * ticket.quantity,
        0
    );
    const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100));
    const vat = Math.round(subtotal * (VAT_PERCENT / 100));
    const discount = Math.round(subtotal * (promoDiscount / 100));
    const total = subtotal + platformFee + vat - discount;

    // Ticket Quantity Handlers
    const updateQuantity = (id, delta) => {
        setTickets((prev) =>
            prev.map((ticket) =>
                ticket.id === id
                    ? { ...ticket, quantity: Math.max(1, ticket.quantity + delta) }
                    : ticket
            )
        );
    };

    const removeTicket = (id) => {
        if (tickets.length === 1) {
            toast.error("You must have at least one ticket");
            return;
        }
        setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    };

    // Promo Code Handler
    const applyPromoCode = () => {
        // Demo promo codes
        const promoCodes = {
            ROYAL10: 10,
            VIP20: 20,
            EARLY15: 15,
        };

        if (promoCodes[promoCode.toUpperCase()]) {
            setPromoDiscount(promoCodes[promoCode.toUpperCase()]);
            toast.success(`Promo code applied! ${promoCodes[promoCode.toUpperCase()]}% discount`);
        } else {
            toast.error("Invalid promo code");
        }
    };

    // Form Validation
    const validateForm = () => {
        const newErrors = {};

        if (!attendeeInfo.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!attendeeInfo.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(attendeeInfo.email)) {
            newErrors.email = "Invalid email format";
        }

        const mobileRegex = /^\+880[0-9]{10}$/;
        if (!attendeeInfo.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!mobileRegex.test(attendeeInfo.mobile)) {
            newErrors.mobile = "Invalid mobile number (must be +880 followed by 10 digits)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Checkout Handler
    const handleCheckout = async () => {
        if (timeLeft <= 0) {
            toast.error("Session expired. Please refresh and try again.");
            return;
        }

        if (!agreeToTerms) {
            toast.error("Please agree to the Terms & Conditions");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        if (!user) {
            toast.error("Please sign in to complete your booking.");
            return;
        }

        if (!event || !event.id) {
            toast.error("Event data not loaded. Please wait or refresh.");
            return;
        }

        if (total <= 0) {
            toast.error("Invalid total amount. Please ensure you have selected tickets.");
            console.error("Checkout Error: Total is 0", { total, tickets });
            return;
        }

        try {
            const response = await fetch("/api/payment/sslcommerz/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: total,
                    eventId: event.id,
                    userId: user.id,
                    attendeeName: attendeeInfo.fullName,
                    attendeeEmail: attendeeInfo.email,
                    ticketQuantity: tickets.reduce((sum, t) => sum + t.quantity, 0),
                    tickets: tickets.map(t => t.details || t),
                    seatIds: seatIds,
                }),
            });

            const data = await response.json();
            toast.dismiss();

            if (data.status === "SUCCESS" && data.gatewayPageURL) {
                toast.success("Redirecting to payment gateway...");
                window.location.href = data.gatewayPageURL;
            } else {
                throw new Error(data.error || "Failed to initialize payment");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            toast.dismiss();

            // Handle Seats Taken Error
            if (error.message.includes("seats") && error.message.includes("sold")) {
                toast.error("One or more selected seats have just been sold. Redirecting you to pick new ones...");
                setTimeout(() => {
                    router.push(`/events/${event.slug}`);
                }, 3000);
            } else {
                toast.error(error.message || "Something went wrong. Please try again.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Format Timer
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isLoading || isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">Review Your Order</h1>

                    {/* Countdown Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 60 ? "bg-red-500/10" : "bg-[#D4AF37]/10"
                        }`}>
                        <Clock className={`w-5 h-5 ${timeLeft < 60 ? "text-red-500" : "text-[#D4AF37]"}`} />
                        <span className={`font-mono font-bold ${timeLeft < 60 ? "text-red-500" : "text-[#D4AF37]"
                            }`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                    {/* LEFT COLUMN: Order Details */}
                    <div className="space-y-6">
                        {/* Event Info Card */}
                        <Card className="p-6 bg-card border-border">
                            <div className="flex gap-4">
                                {event?.cover_image && (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={event.cover_image}
                                            alt={eventTitle}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-foreground mb-2">
                                        {eventTitle}
                                    </h3>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{event?.start_date ? format(new Date(event.start_date), "PPP") : "TBD"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{event?.city || "Dhaka"}, Bangladesh</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[#D4AF37] hover:text-[#D4AF37]/80">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </Card>

                        {/* Ticket Selection */}
                        <Card className="p-6 bg-card border-border">
                            <h3 className="font-semibold text-lg mb-4 text-foreground">Ticket Selection</h3>
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">
                                                {ticket.name}
                                                {ticket.details?.seatId && (
                                                    <span className="ml-2 text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                                                        {ticket.details.name || ticket.details.seatId}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">BDT {ticket.price.toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                                                    onClick={() => updateQuantity(ticket.id, -1)}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="w-8 text-center font-medium text-foreground">
                                                    {ticket.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                                                    onClick={() => updateQuantity(ticket.id, 1)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                onClick={() => removeTicket(ticket.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Attendee Information */}
                        <Card className="p-6 bg-card border-border">
                            <h3 className="font-semibold text-lg mb-4 text-foreground">Attendee Information</h3>

                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useUserInfo}
                                        onChange={(e) => setUseUserInfo(e.target.checked)}
                                        className="w-4 h-4 accent-[#D4AF37]"
                                    />
                                    <span className="text-sm text-foreground">Same as logged-in user</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        value={attendeeInfo.fullName}
                                        onChange={(e) =>
                                            setAttendeeInfo({ ...attendeeInfo, fullName: e.target.value })
                                        }
                                        className="mt-1.5 bg-input border-border text-foreground focus:border-[#D4AF37]"
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={attendeeInfo.email}
                                        onChange={(e) =>
                                            setAttendeeInfo({ ...attendeeInfo, email: e.target.value })
                                        }
                                        className="mt-1.5 bg-input border-border text-foreground focus:border-[#D4AF37]"
                                        placeholder="your.email@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="mobile" className="text-foreground">Mobile Number *</Label>
                                    <Input
                                        id="mobile"
                                        value={attendeeInfo.mobile}
                                        onChange={(e) =>
                                            setAttendeeInfo({ ...attendeeInfo, mobile: e.target.value })
                                        }
                                        className="mt-1.5 bg-input border-border text-foreground focus:border-[#D4AF37]"
                                        placeholder="+8801XXXXXXXXX"
                                        maxLength={14}
                                    />
                                    {errors.mobile && (
                                        <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Payment & Summary (Sticky) */}
                    <div className="lg:sticky lg:top-20 h-fit space-y-6">
                        {/* Order Summary */}
                        <Card className="p-6 bg-card border-border shadow-lg">
                            <h3 className="font-semibold text-lg mb-4 text-foreground">Order Summary</h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">BDT {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                                    <span className="text-foreground">BDT {platformFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">VAT ({VAT_PERCENT}%)</span>
                                    <span className="text-foreground">BDT {vat.toLocaleString()}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-500">
                                        <span>Discount ({promoDiscount}%)</span>
                                        <span>- BDT {discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Promo Code */}
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="Promo code"
                                        className="bg-input border-border text-foreground"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={applyPromoCode}
                                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                                    >
                                        Apply
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Try: ROYAL10, VIP20, EARLY15
                                </p>
                            </div>

                            <Separator className="my-4 bg-border" />

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-bold text-foreground">Total</span>
                                <span className="text-2xl font-bold text-foreground">
                                    BDT {total.toLocaleString()}
                                </span>
                            </div>

                            {/* Payment Methods */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 text-foreground">Payment Method</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {["stripe", "bkash", "nagad"].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setSelectedPayment(method)}
                                            className={`relative p-4 rounded-lg border-2 transition-all ${selectedPayment === method
                                                ? "border-[#D4AF37] bg-[#D4AF37]/5"
                                                : "border-border hover:border-[#D4AF37]/50"
                                                }`}
                                        >
                                            <div className="text-sm font-medium text-foreground capitalize">
                                                {method === "stripe" && "Stripe (International)"}
                                                {method === "bkash" && "bKash"}
                                                {method === "nagad" && "Nagad"}
                                            </div>
                                            {selectedPayment === method && (
                                                <Check className="absolute top-2 right-2 w-4 h-4 text-[#D4AF37]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="mb-4">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreeToTerms}
                                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                                        className="w-4 h-4 mt-0.5 accent-[#D4AF37]"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        I agree to the{" "}
                                        <a href="/terms" className="text-[#D4AF37] hover:underline">
                                            Terms & Conditions
                                        </a>{" "}
                                        and{" "}
                                        <a href="/refund" className="text-[#D4AF37] hover:underline">
                                            Refund Policy
                                        </a>
                                    </span>
                                </label>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                onClick={handleCheckout}
                                disabled={timeLeft <= 0 || !agreeToTerms || total <= 0 || !event}
                                className="w-full py-6 text-lg font-bold bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black border-none"
                            >
                                <Lock className="w-5 h-5 mr-2" />
                                Pay Securely BDT {total.toLocaleString()}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                🔒 100% Secure Payment. Tickets are emailed instantly.
                            </p>

                            {/* Trust Badges */}
                            <div className="flex justify-center items-center gap-4 mt-4 opacity-50">
                                <span className="text-xs text-muted-foreground">SSL</span>
                                <span className="text-xs text-muted-foreground">Visa</span>
                                <span className="text-xs text-muted-foreground">Mastercard</span>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Mobile FAB */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border shadow-lg">
                    <Button
                        onClick={handleCheckout}
                        disabled={timeLeft <= 0 || !agreeToTerms}
                        className="w-full py-6 text-lg font-bold bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black"
                    >
                        <Lock className="w-5 h-5 mr-2" />
                        Pay BDT {total.toLocaleString()}
                    </Button>
                </div>
            </div>

            {/* Session Expired Modal */}
            <SessionExpiredModal
                isOpen={showExpiredModal}
                onClose={() => setShowExpiredModal(false)}
                eventId={eventId}
            />
        </div>
    );
}

