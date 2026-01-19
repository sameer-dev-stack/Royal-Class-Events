"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, User, Download, Share2, Printer, X } from "lucide-react";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TicketModal({ isOpen, onClose, registration, event }) {
    if (!registration || !event) return null;

    const eventTitle = event.title?.en || event.title;
    const eventStartDate = event.timeConfiguration?.startDateTime || event.startDate;
    const eventLocation = event.metadata?.legacyProps?.venueName || event.venue || event.address || "Online Event";
    const attendeeName = registration.attendeeInfo?.primary?.verifiedName ||
        registration.attendeeInfo?.fullName ||
        registration.attendeeInfo?.name || "Guest";
    const ticketId = registration.registrationNumber || registration.externalId;

    const handleDownload = () => {
        toast.success("Ticket saved to your device!");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="sm:max-w-[380px] p-0 bg-transparent border-none shadow-none text-white overflow-visible">
                <div className="relative w-full">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="w-full flex flex-col drop-shadow-2xl filter">
                        {/* Top Section: Event Info */}
                        <div className="bg-zinc-900 rounded-t-3xl p-6 pb-8 relative border-b border-dashed border-white/20">
                            {/* Brand Watermark (Optional) */}
                            <div className="absolute top-4 right-6 text-[10px] font-bold tracking-widest text-white/20 uppercase">
                                Royal Class
                            </div>

                            {/* Event Title */}
                            <DialogTitle className="text-2xl font-bold text-white mb-2 leading-tight">
                                {eventTitle}
                            </DialogTitle>

                            <div className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium mb-6">
                                <Calendar className="w-4 h-4" />
                                <span>{format(eventStartDate, "EEEE, MMMM do, yyyy")}</span>
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-full shrink-0 text-zinc-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Time</p>
                                        <p className="text-sm font-medium text-zinc-200">{format(eventStartDate, "h:mm a")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-full shrink-0 text-zinc-400">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Location</p>
                                        <p className="text-sm font-medium text-zinc-200 line-clamp-2">{eventLocation}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-full shrink-0 text-zinc-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Attendee</p>
                                        <p className="text-sm font-medium text-zinc-200">{attendeeName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cutout Circles Left/Right */}
                            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-background rounded-full z-10" />
                            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-background rounded-full z-10" />
                        </div>

                        {/* Bottom Section: QR Code */}
                        <div className="bg-white text-black rounded-b-3xl p-6 pt-8 relative flex flex-col items-center">
                            <div className="bg-white p-2 rounded-xl border-4 border-black/5">
                                <QRCode value={ticketId} size={160} level="M" />
                            </div>

                            <p className="text-xs font-mono text-zinc-400 mt-3 tracking-wider">
                                {ticketId}
                            </p>

                            <div className="mt-6 w-full flex gap-3">
                                <Button
                                    className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 h-10 text-xs font-medium"
                                    onClick={handleDownload}
                                >
                                    <Download className="w-3.5 h-3.5 mr-2" />
                                    Save
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-10 text-xs font-medium border-zinc-200"
                                    onClick={() => toast.success("Shared!")}
                                >
                                    <Share2 className="w-3.5 h-3.5 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

