"use client";

import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    AlertTriangle,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OfferBubbleProps {
    message: {
        _id: string;
        content: string;
        metadata: {
            offerTitle: string;
            offerDescription?: string;
            offerAmount: number;
            offerCurrency: string;
            offerStatus: "pending" | "accepted" | "declined" | "expired" | "paid";
            validUntil: number;
            createdAt: number;
            acceptedAt?: number;
            declinedAt?: number;
            paidAt?: number;
        };
        createdAt: number;
        isSelf: boolean;
    };
    isClient: boolean;
    isSupplier: boolean;
    leadId: string;
    onAccept: (messageId: string) => void;
    onDecline: (messageId: string) => void;
    isAccepting?: boolean;
    isDeclining?: boolean;
}

export function OfferBubble({
    message,
    isClient,
    isSupplier,
    leadId,
    onAccept,
    onDecline,
    isAccepting = false,
    isDeclining = false,
}: OfferBubbleProps) {
    const { metadata, isSelf, createdAt } = message;
    const {
        offerTitle,
        offerDescription,
        offerAmount,
        offerCurrency,
        offerStatus,
        validUntil,
    } = metadata;

    const isExpired = validUntil < Date.now() && offerStatus === "pending";
    const isPending = offerStatus === "pending" && !isExpired;
    const isAccepted = offerStatus === "accepted";
    const isDeclined = offerStatus === "declined";
    const isPaid = offerStatus === "paid";

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: offerCurrency || "BDT",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusConfig = () => {
        if (isPaid) {
            return {
                icon: ShieldCheck,
                text: "Paid & Secured",
                color: "text-amber-500",
                bgColor: "bg-amber-500/10",
                borderColor: "border-amber-500/30",
            };
        }
        if (isExpired) {
            return {
                icon: AlertTriangle,
                text: "Expired",
                color: "text-orange-500",
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-500/30",
            };
        }
        if (isAccepted) {
            return {
                icon: CheckCircle2,
                text: "Accepted",
                color: "text-green-500",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-500/30",
            };
        }
        if (isDeclined) {
            return {
                icon: XCircle,
                text: "Declined",
                color: "text-red-500",
                bgColor: "bg-red-500/10",
                borderColor: "border-red-500/30",
            };
        }
        return {
            icon: Clock,
            text: "Pending",
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30",
        };
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "flex items-end gap-2",
                isSelf ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "w-full max-w-md rounded-2xl border-2 overflow-hidden shadow-xl",
                    statusConfig.borderColor,
                    "bg-card text-card-foreground"
                )}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-b border-amber-500/20 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
                                    Official Offer
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(createdAt, "MMM d, yyyy • h:mm a")}
                                </p>
                            </div>
                        </div>
                        <div
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                                statusConfig.bgColor,
                                statusConfig.color
                            )}
                        >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.text}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <div>
                        <h4 className="text-lg font-bold text-card-foreground">
                            {offerTitle}
                        </h4>
                        {offerDescription && (
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {offerDescription}
                            </p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-card-foreground">
                            {formatPrice(offerAmount)}
                        </span>
                    </div>

                    {/* Validity */}
                    {isPending && (
                        <p className="text-xs text-muted-foreground">
                            Valid until{" "}
                            <span className="text-foreground font-medium">
                                {format(validUntil, "MMM d, yyyy")}
                            </span>{" "}
                            ({formatDistanceToNow(validUntil, { addSuffix: true })})
                        </p>
                    )}
                </div>

                {/* Actions - Only show for client when pending */}
                {isClient && isPending && (
                    <div className="border-t border-border p-4 flex gap-3">
                        <Button
                            onClick={() => onDecline(message._id)}
                            disabled={isDeclining || isAccepting}
                            variant="outline"
                            size="default"
                            className="flex-1 h-12 rounded-xl border-input hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500"
                        >
                            {isDeclining ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => onAccept(message._id)}
                            disabled={isAccepting || isDeclining}
                            variant="default"
                            size="default"
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/20"
                        >
                            {isAccepting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Accept & Pay
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Supplier View - Read Only */}
                {isSupplier && isPending && (
                    <div className="border-t border-border p-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Waiting for client response...
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
