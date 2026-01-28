"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    ArrowLeft,
    Calendar,
    Users,
    DollarSign,
    Info,
    MessageSquare,
    Loader2,
    CheckCircle2,
    Clock,
    X,
    FileText,
    Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { OfferBubble } from "@/components/chat/offer-bubble";
import { CreateOfferModal } from "@/components/chat/create-offer-modal";
import { PaymentModal } from "@/components/chat/payment-modal";
import ReviewModal from "@/components/marketplace/review-modal";
import { toast } from "sonner";

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const leadId = params?.id;
    const { token, user } = useAuthStore();

    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);
    const [isDecliningOffer, setIsDecliningOffer] = useState(false);
    const [activeOfferId, setActiveOfferId] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Validate leadId
    const isValidId = leadId && /^[a-zA-Z0-9]+$/.test(leadId) && leadId.length > 10;

    // Queries
    const thread = useQuery(
        api.messages.getThread,
        isValidId && token ? { leadId, token } : "skip"
    );

    const conversations = useQuery(
        api.messages.getConversations,
        token ? { token } : "skip"
    );

    // Mutations
    const sendMessageMutation = useMutation(api.messages.sendMessage);
    const sendOfferMutation = useMutation(api.leads.sendOffer);
    const acceptOfferMutation = useMutation(api.leads.acceptOffer);
    const declineOfferMutation = useMutation(api.leads.declineOffer);
    const initiateOfferPaymentAction = useAction(api.payments.initiateOfferPayment);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [thread?.messages]);

    // Handle send message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessageMutation({
                leadId,
                text: message.trim(),
                token,
            });
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Handle send offer
    const handleSendOffer = async (values) => {
        try {
            await sendOfferMutation({
                leadId,
                token,
                title: values.title,
                description: values.description,
                price: values.price,
                validForDays: values.validForDays,
            });
            toast.success("Offer sent successfully!");
        } catch (error) {
            console.error("Failed to send offer:", error);
            toast.error(error.message || "Failed to send offer");
            throw error;
        }
    };

    // Handle accept offer - NOW OPENS PAYMENT MODAL
    const handleAcceptOffer = async (messageId) => {
        const targetMessage = thread?.messages.find(m => m._id === messageId);
        if (!targetMessage) return;

        setSelectedOffer({
            id: messageId,
            title: targetMessage.metadata?.offerTitle || "Services",
            amount: targetMessage.metadata?.offerAmount || 0
        });
        setIsPaymentModalOpen(true);
    };

    // Handle process payment
    const handleConfirmPayment = async () => {
        if (!selectedOffer) return;

        setActiveOfferId(selectedOffer.id);
        setIsAcceptingOffer(true);
        try {
            const result = await initiateOfferPaymentAction({
                messageId: selectedOffer.id,
                leadId,
                amount: selectedOffer.amount,
                token,
                success_url: `${window.location.origin}/messages/${leadId}?payment=success`,
                failure_url: `${window.location.origin}/messages/${leadId}?payment=failed`,
            });

            return result; // Result is handled by PaymentModal redirect
        } catch (error) {
            console.error("Payment failed:", error);
            throw error; // Let PaymentModal handle the error toast
        } finally {
            setIsAcceptingOffer(false);
            setActiveOfferId(null);
        }
    };

    // Handle decline offer
    const handleDeclineOffer = async (messageId) => {
        setActiveOfferId(messageId);
        setIsDecliningOffer(true);
        try {
            await declineOfferMutation({
                messageId,
                leadId,
                token,
            });
            toast.success("Offer declined");
        } catch (error) {
            console.error("Failed to decline offer:", error);
            toast.error(error.message || "Failed to decline offer");
        } finally {
            setIsDecliningOffer(false);
            setActiveOfferId(null);
        }
    };

    // Loading state
    if (thread === undefined) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading conversation...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (!thread || !isValidId) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-foreground">Conversation Not Found</h1>
                    <p className="text-muted-foreground">This conversation doesn't exist or you don't have access.</p>
                    <Button asChild className="bg-[#D4AF37] hover:bg-[#8C7326] text-black">
                        <Link href="/messages">Back to Messages</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const { lead, supplier, client, messages, isClient } = thread;
    const otherParty = isClient ? supplier : client;

    const formatPrice = (amount) => {
        if (!amount) return "Not specified";
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            {/* ============== LEFT SIDEBAR: Conversation List ============== */}
            <div className="hidden lg:flex w-80 flex-col border-r border-border bg-card/30">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground">Messages</h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {conversations?.map((conv) => (
                            <Link
                                key={conv.leadId}
                                href={`/messages/${conv.leadId}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl transition-colors",
                                    conv.leadId === leadId
                                        ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30"
                                        : "hover:bg-muted"
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {conv.otherParty?.image ? (
                                        <Image
                                            src={conv.otherParty.image}
                                            alt={conv.otherParty.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-muted-foreground">
                                            {conv.otherParty?.name?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "font-medium truncate",
                                            conv.leadId === leadId ? "text-[#8C7326] dark:text-[#F7E08B]" : "text-foreground"
                                        )}>
                                            {conv.otherParty?.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(conv.lastMessageAt, { addSuffix: false })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </Link>
                        ))}
                        {conversations?.length === 0 && (
                            <p className="text-center text-muted-foreground py-8 text-sm">
                                No conversations yet
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* ============== CENTER: Chat Window ============== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => router.push("/messages")}
                            aria-label="Back to Messages"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {otherParty?.logoUrl || otherParty?.image ? (
                                <Image
                                    src={otherParty.logoUrl || otherParty.image}
                                    alt={otherParty.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <span className="text-sm font-bold text-muted-foreground">
                                    {otherParty?.name?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{otherParty?.name}</h3>
                            <p className="text-xs text-muted-foreground">
                                {isClient ? "Vendor" : "Client"} • {lead.status}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDetails(!showDetails)}
                        className="lg:hidden"
                        aria-label="Toggle Details"
                    >
                        <Info className="w-5 h-5" />
                    </Button>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {/* Lead Info Card */}
                        <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                Lead created {format(lead.createdAt, "MMM d, yyyy")}
                            </div>
                        </div>

                        {/* Messages */}
                        <AnimatePresence>
                            {messages.map((msg, index) => {
                                // Render offer messages differently
                                if (msg.type === "offer") {
                                    return (
                                        <OfferBubble
                                            key={msg._id}
                                            message={msg}
                                            isClient={isClient}
                                            isSupplier={!isClient}
                                            leadId={leadId}
                                            onAccept={handleAcceptOffer}
                                            onDecline={handleDeclineOffer}
                                            isAccepting={isAcceptingOffer && activeOfferId === msg._id}
                                            isDeclining={isDecliningOffer && activeOfferId === msg._id}
                                        />
                                    );
                                }

                                // Regular text messages
                                return (
                                    <motion.div
                                        key={msg._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex items-end gap-2",
                                            msg.isSelf ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {!msg.isSelf && (
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mb-5">
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {msg.senderName?.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[70%] px-4 py-3 rounded-2xl",
                                                msg.isSelf
                                                    ? "bg-gradient-to-r from-[#D4AF37] to-[#8C7326] text-black rounded-br-md"
                                                    : "bg-muted text-foreground rounded-bl-md"
                                            )}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-[10px] mt-1",
                                                    msg.isSelf ? "text-black/60" : "text-muted-foreground"
                                                )}
                                            >
                                                {format(msg.createdAt, "h:mm a")}
                                            </p>
                                        </div>
                                        {msg.isSelf && (
                                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 mb-5">
                                                <span className="text-xs font-bold text-[#D4AF37]">
                                                    {user?.name?.charAt(0) || "Y"}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card/30">
                    <form onSubmit={handleSend} className="flex items-center gap-3 max-w-3xl mx-auto">
                        {/* Create Offer Button - Supplier Only */}
                        {!isClient && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowOfferModal(true)}
                                className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Create Offer
                            </Button>
                        )}
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-muted/50 border-input focus:border-[#D4AF37]/50 text-foreground"
                            disabled={isSending}
                        />
                        <Button
                            type="submit"
                            disabled={!message.trim() || isSending}
                            className="bg-[#D4AF37] hover:bg-[#8C7326] text-black px-6"
                            aria-label="Send Message"
                        >
                            {isSending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </form>
                </div>

                {/* Modals */}
                <CreateOfferModal
                    isOpen={showOfferModal}
                    onClose={() => setShowOfferModal(false)}
                    onSubmit={handleSendOffer}
                    clientName={client?.name}
                />

                {selectedOffer && (
                    <PaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        amount={selectedOffer.amount}
                        offerTitle={selectedOffer.title}
                        onConfirm={handleConfirmPayment}
                    />
                )}

                {/* Review Modal */}
                {isClient && supplier && (
                    <ReviewModal
                        open={isReviewOpen}
                        onOpenChange={setIsReviewOpen}
                        supplierId={supplier._id}
                        supplierName={supplier.name}
                    />
                )}
            </div>

            {/* ============== RIGHT SIDEBAR: Deal Details ============== */}
            <div
                className={cn(
                    "w-80 border-l border-border bg-card/30 flex-col",
                    "hidden lg:flex",
                    showDetails && "fixed inset-0 z-50 flex lg:static lg:z-auto bg-background"
                )}
            >
                {/* Mobile Close Button */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-bold text-foreground">Deal Details</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)} aria-label="Close Details">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                lead.status === "new" && "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
                                lead.status === "contacted" && "bg-[#D4AF37]/10 text-[#8C7326] dark:bg-[#D4AF37]/20 dark:text-[#F7E08B]",
                                lead.status === "quoted" && "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
                                lead.status === "booked" && "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
                                lead.status === "declined" && "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                            )}>
                                {lead.status}
                            </span>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground">Event Details</h4>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Event Date</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {lead.eventDate
                                                ? format(new Date(lead.eventDate), "MMM d, yyyy")
                                                : "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Guests</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {lead.guestCount || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Budget</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {formatPrice(lead.budget)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Other Party Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground">
                                {isClient ? "Vendor" : "Client"}
                            </h4>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {(otherParty?.logoUrl || otherParty?.image) ? (
                                        <Image
                                            src={otherParty.logoUrl || otherParty.image}
                                            alt={otherParty.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <span className="text-lg font-bold text-muted-foreground">
                                            {otherParty?.name?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{otherParty?.name}</p>
                                    {isClient && supplier?.categories && (
                                        <p className="text-xs text-muted-foreground">
                                            {supplier.categories.slice(0, 2).join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {!isClient ? (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
                                <Button
                                    variant="outline"
                                    className="w-full border-[#D4AF37]/30 text-[#F7E08B] hover:bg-[#D4AF37]/10"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Mark as Quoted
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Mark as Booked
                                </Button>
                            </div>
                        ) : (
                            /* Client Actions */
                            (lead.status === "booked" || lead.status === "completed") && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Actions</h4>
                                    <Button
                                        onClick={() => setIsReviewOpen(true)}
                                        className="w-full bg-gradient-to-r from-[#D4AF37] to-orange-600 hover:from-[#8C7326] hover:to-orange-700 text-white"
                                    >
                                        <Star className="w-4 h-4 mr-2 fill-current" />
                                        Leave a Review
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
