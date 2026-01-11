"use client";

import { useState } from "react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Eye, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";

export default function AdminEventsPage() {
    const { token } = useAuthStore();
    const [search, setSearch] = useState("");

    // Fetch all events with admin privileges
    const { data: events, isLoading } = useConvexQuery(api.admin.getAllEvents, {
        limit: 50,
        token: token || undefined
    });

    const { mutate: deleteEvent } = useConvexMutation(api.admin.deleteEventAdmin);

    const handleDelete = async (eventId) => {
        try {
            await deleteEvent({ eventId, token });
            toast.success("Event deleted successfully");
        } catch (error) {
            toast.error("Failed to delete event: " + error.message);
        }
    };

    const renderSafeString = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") {
            return val.en || val.en_US || Object.values(val)[0] || "";
        }
        return String(val);
    };

    // Filter events client-side for simplicity in this version
    const filteredEvents = events?.filter(event =>
        renderSafeString(event.title).toLowerCase().includes(search.toLowerCase()) ||
        renderSafeString(event.location?.city).toLowerCase().includes(search.toLowerCase())
    ) || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'draft': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Event Operations</h1>
                    <p className="text-muted-foreground mt-2">Oversee and moderate platform events</p>
                </div>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events by title or city..."
                            className="pl-10 bg-background/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border/50 overflow-hidden overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border/50">
                                <div className="col-span-5">Event Details</div>
                                <div className="col-span-3">Status & Price</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {isLoading ? (
                                <div className="p-12 flex justify-center text-muted-foreground">
                                    Loading events...
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground">
                                    No events found matching your criteria.
                                </div>
                            ) : (
                                filteredEvents.map((event) => (
                                    <div key={event._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 group">

                                        {/* Event Details */}
                                        <div className="col-span-5">
                                            <p className="font-semibold text-foreground truncate pr-4">{renderSafeString(event.title)}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">
                                                    {renderSafeString(event.location?.venueName)}, {renderSafeString(event.location?.city)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-3">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <Badge variant="outline" className={getStatusColor(event.status?.current)}>
                                                    {event.status?.current?.toUpperCase()}
                                                </Badge>
                                                <span className="text-sm font-medium">
                                                    ৳{event.price?.minPrice || 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {event.date?.startDate ? format(new Date(event.date.startDate), "MMM d, yyyy") : "TBD"}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-400">
                                                <Eye className="w-4 h-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the event
                                                            <span className="font-bold text-foreground"> "{renderSafeString(event.title)}" </span>
                                                            and all associated data.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(event._id)}
                                                            className="bg-red-500 hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
