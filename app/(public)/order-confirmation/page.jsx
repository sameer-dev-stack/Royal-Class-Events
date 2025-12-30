"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Download, Share2, Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const registrationId = searchParams.get("registrationId");

    // Clear session storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('attendeeInfo');
        }
    }, []);

    // Fetch registration details
    const { data: registration, isLoading } = useConvexQuery(
        api.registrations.getRegistrationById,
        registrationId ? { registrationId } : "skip"
    );

    const eventTitle = registration?.event?.title?.en || registration?.event?.title || "Sample Event";

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My Event Ticket",
                    text: `I'm attending ${eventTitle}!`,
                });
            } catch (error) {
                console.error("Share failed:", error);
            }
        }
    };

    const handleDownload = () => {
        // Download QR code as image
        const svg = document.getElementById("qr-code");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `ticket-${orderId}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FBB03B] mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your ticket...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Your tickets have been sent to your email
                    </p>
                </div>

                {/* Order Summary Card */}
                <Card className="p-8 bg-card border-border mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                            <p className="text-2xl font-bold text-foreground">{orderId || "ORD-XXXXX"}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                    </div>

                    <Separator className="my-6 bg-border" />

                    {/* Event Details */}
                    <div className="space-y-4 mb-6">
                        <h3 className="font-semibold text-lg text-foreground">Event Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <TicketIcon className="w-5 h-5 text-[#FBB03B] mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">
                                        {eventTitle}
                                    </p>
                                    <p className="text-sm text-muted-foreground">General Admission × 1</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-[#FBB03B] mt-0.5" />
                                <div>
                                    <p className="text-sm text-foreground">
                                        {registration?.event?.startDate
                                            ? format(new Date(registration.event.startDate), "EEEE, MMMM dd, yyyy")
                                            : "Date TBA"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {registration?.event?.startDate
                                            ? format(new Date(registration.event.startDate), "h:mm a")
                                            : "Time TBA"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#FBB03B] mt-0.5" />
                                <div>
                                    <p className="text-sm text-foreground">
                                        {registration?.event?.venue || "Venue TBA"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {registration?.event?.city || "Location"}, Bangladesh
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6 bg-border" />

                    {/* QR Code */}
                    <div className="text-center">
                        <h3 className="font-semibold text-lg text-foreground mb-4">Your Ticket</h3>
                        <div className="inline-block p-6 bg-white rounded-2xl">
                            <QRCode
                                id="qr-code"
                                value={registration?.qrCode || orderId || "DEMO-TICKET"}
                                size={200}
                                level="H"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            Show this QR code at the venue for entry
                        </p>
                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            className="mt-4 gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download QR Code
                        </Button>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={() => router.push("/my-tickets")}
                        className="flex-1 bg-[#FBB03B] hover:bg-[#FBB03B]/90 text-black font-bold"
                    >
                        View All My Tickets
                    </Button>
                    <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="flex-1"
                    >
                        Browse More Events
                    </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">What's Next?</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>✓ Confirmation email sent to your inbox</li>
                        <li>✓ QR code ticket attached to email</li>
                        <li>✓ Event reminder 24 hours before</li>
                        <li>✓ Access to exclusive event updates</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
