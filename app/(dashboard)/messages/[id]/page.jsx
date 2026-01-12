"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { OfferBubble } from "@/components/chat/offer-bubble";
import { CreateOfferModal } from "@/components/chat/create-offer-modal";
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

    // Handle accept offer
    const handleAcceptOffer = async (messageId) => {
        setActiveOfferId(messageId);
        setIsAcceptingOffer(true);
        try {
            await acceptOfferMutation({
                messageId,
                leadId,
                token,
            });
            toast.success("Offer accepted! 🎉");
        } catch (error) {
            console.error("Failed to accept offer:", error);
            toast.error(error.message || "Failed to accept offer");
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
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading conversation...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (!thread || !isValidId) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-foreground">Conversation Not Found</h1>
                    <p className="text-muted-foreground">This conversation doesn't exist or you don't have access.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
                        <Link href="/messages">Back to Messages</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const { lead, supplier, client, messages, isClient, currentUserId } = thread;
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
        <div className="h-screen bg-zinc-950 flex overflow-hidden">
            {/* ============== LEFT SIDEBAR: Conversation List ============== */}
            <div className="hidden lg:flex w-80 flex-col border-r border-zinc-800/50 bg-zinc-900/30">
                <div className="p-4 border-b border-zinc-800/50">
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
                                        ? "bg-amber-500/10 border border-amber-500/30"
                                        : "hover:bg-zinc-800/50"
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {conv.otherParty?.image ? (
                                        <Image
                                            src={conv.otherParty.image}
                                            alt={conv.otherParty.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-zinc-400">
                                            {conv.otherParty?.name?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "font-medium truncate",
                                            conv.leadId === leadId ? "text-amber-400" : "text-foreground"
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
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => router.push("/messages")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {otherParty?.logoUrl || otherParty?.image ? (
                                <Image
                                    src={otherParty.logoUrl || otherParty.image}
                                    alt={otherParty.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <span className="text-sm font-bold text-zinc-400">
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
                    >
                        <Info className="w-5 h-5" />
                    </Button>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {/* Lead Info Card */}
                        <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full text-xs text-muted-foreground">
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
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mb-5">
                                                <span className="text-xs font-bold text-zinc-400">
                                                    {msg.senderName?.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[70%] px-4 py-3 rounded-2xl",
                                                msg.isSelf
                                                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-br-md"
                                                    : "bg-zinc-800 text-foreground rounded-bl-md"
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
                                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mb-5">
                                                <span className="text-xs font-bold text-amber-500">
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
                <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30">
                    <form onSubmit={handleSend} className="flex items-center gap-3 max-w-3xl mx-auto">
                        {/* Create Offer Button - Supplier Only */}
                        {!isClient && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowOfferModal(true)}
                                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Create Offer
                            </Button>
                        )}
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-zinc-800/50 border-zinc-700 focus:border-amber-500/50 text-foreground"
                            disabled={isSending}
                        />
                        <Button
                            type="submit"
                            disabled={!message.trim() || isSending}
                            className="bg-amber-500 hover:bg-amber-600 text-black px-6"
                        >
                            {isSending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </form>
                </div>

                {/* Create Offer Modal */}
                <CreateOfferModal
                    isOpen={showOfferModal}
                    onClose={() => setShowOfferModal(false)}
                    onSubmit={handleSendOffer}
                    clientName={client?.name}
                />
            </div>

            {/* ============== RIGHT SIDEBAR: Deal Details ============== */}
            <div
                className={cn(
                    "w-80 border-l border-zinc-800/50 bg-zinc-900/30 flex-col",
                    "hidden lg:flex",
                    showDetails && "fixed inset-0 z-50 flex lg:static lg:z-auto bg-zinc-950"
                )}
            >
                {/* Mobile Close Button */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800/50">
                    <h3 className="font-bold text-foreground">Deal Details</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
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
                                lead.status === "new" && "bg-blue-500/20 text-blue-400",
                                lead.status === "contacted" && "bg-amber-500/20 text-amber-400",
                                lead.status === "quoted" && "bg-purple-500/20 text-purple-400",
                                lead.status === "booked" && "bg-green-500/20 text-green-400",
                                lead.status === "declined" && "bg-red-500/20 text-red-400"
                            )}>
                                {lead.status}
                            </span>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground">Event Details</h4>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-amber-500" />
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

                                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Guests</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {lead.guestCount || "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-amber-500" />
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
                            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                                    {(otherParty?.logoUrl || otherParty?.image) ? (
                                        <Image
                                            src={otherParty.logoUrl || otherParty.image}
                                            alt={otherParty.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <span className="text-lg font-bold text-zinc-400">
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
                        {!isClient && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
                                <Button
                                    variant="outline"
                                    className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
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
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
