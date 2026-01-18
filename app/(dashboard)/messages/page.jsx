"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import {
    MessageSquare,
    Calendar,
    ChevronRight,
    Inbox,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
    const { token, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const conversations = useQuery(
        api.messages.getConversations,
        token ? { token } : "skip"
    );

    // Initial loading or server render
    if (!mounted) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Sign in to view messages</h1>
                    <p className="text-muted-foreground max-w-md">
                        Connect with vendors and manage your event inquiries in one place.
                    </p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Loading
    if (conversations === undefined) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading your messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="border-b border-zinc-800/50 bg-zinc-900/30">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
                            <p className="text-muted-foreground text-sm">
                                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversation List */}
            <div className="max-w-4xl mx-auto px-6 py-6">
                {conversations.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 space-y-4"
                    >
                        <div className="w-20 h-20 mx-auto bg-zinc-800/50 rounded-2xl flex items-center justify-center">
                            <Inbox className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">No messages yet</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Start connecting with vendors! Browse our marketplace and request quotes to begin conversations.
                        </p>
                        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black mt-4">
                            <Link href="/marketplace">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Browse Vendors
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((conv, index) => (
                            <motion.div
                                key={conv.leadId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/messages/${conv.leadId}`}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-amber-500/30 hover:bg-zinc-800/50 transition-all group"
                                >
                                    {/* Avatar */}
                                    <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {conv.otherParty?.image ? (
                                            <Image
                                                src={conv.otherParty.image}
                                                alt={conv.otherParty.name}
                                                width={56}
                                                height={56}
                                                className="rounded-xl"
                                            />
                                        ) : (
                                            <span className="text-lg font-bold text-zinc-400">
                                                {conv.otherParty?.name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-foreground truncate group-hover:text-amber-400 transition-colors">
                                                {conv.otherParty?.name}
                                            </h3>
                                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                                {formatDistanceToNow(conv.lastMessageAt, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate mb-2">
                                            {conv.lastMessage}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                conv.status === "new" && "bg-blue-500/20 text-blue-400",
                                                conv.status === "contacted" && "bg-amber-500/20 text-amber-400",
                                                conv.status === "quoted" && "bg-purple-500/20 text-purple-400",
                                                conv.status === "booked" && "bg-green-500/20 text-green-400"
                                            )}>
                                                {conv.status}
                                            </span>
                                            {conv.eventDate && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(conv.eventDate), "MMM d")}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {conv.isClient ? "You're the client" : "You're the vendor"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
