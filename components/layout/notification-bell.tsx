"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Bell, Check, ExternalLink, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Using exact schema-specified query names
    const notifications = useQuery(api.notifications.get, {
        token: token || undefined
    });
    const unreadCount = useQuery(api.notifications.getUnreadCount, {
        token: token || undefined
    });
    const markAsRead = useMutation(api.notifications.markRead);
    const markAllRead = useMutation(api.notifications.markAllRead);

    const handleMarkAllRead = async () => {
        try {
            await markAllRead({ token: token || undefined });
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleNotificationClick = async (n: any) => {
        try {
            await markAsRead({ notificationId: n._id, token: token || undefined });
            if (n.link) {
                router.push(n.link);
                setOpen(false);
            }
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted rounded-full transition-all">
                    <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    {unreadCount && unreadCount > 0 ? (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-background">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    ) : null}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-popover border-border shadow-2xl rounded-3xl overflow-hidden" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                    <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Notifications</h3>
                    {unreadCount && unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="h-7 text-[10px] font-black uppercase tracking-tighter text-#D4AF37 hover:text-#8C7326 hover:bg-#D4AF37/10"
                        >
                            <Check className="w-3 h-3 mr-1" /> Mark All
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {!notifications ? (
                        <div className="flex items-center justify-center p-10">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center opacity-40">
                            <Inbox className="w-10 h-10 mb-4 text-muted-foreground" />
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No new notifications</p>
                            <p className="text-[10px] mt-1 italic text-muted-foreground">Everything is up to date.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={cn(
                                        "p-4 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-muted/50",
                                        !n.isRead ? 'bg-#D4AF37/5' : ''
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className={cn(
                                            "text-xs font-black uppercase tracking-tight",
                                            !n.isRead ? 'text-foreground' : 'text-muted-foreground'
                                        )}>
                                            {n.title}
                                        </h4>
                                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-[11px] leading-relaxed",
                                        !n.isRead ? 'text-foreground/80' : 'text-muted-foreground'
                                    )}>
                                        {n.message}
                                    </p>
                                    {n.link && (
                                        <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-#D4AF37 uppercase">
                                            <ExternalLink className="w-2.5 h-2.5" /> View
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-3 border-t border-border bg-muted/30 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Secure Ledger Alpha</p>
                </div>
            </PopoverContent>
        </Popover>
    );
}

