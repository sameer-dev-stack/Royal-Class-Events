"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Map, ExternalLink, QrCode, Armchair } from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function EventList({ events, onDelete }) {
    if (!events?.length) {
        return (
            <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card/40">
                <p className="text-muted-foreground">No events found. Start by creating your first event!</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                        <tr className="text-left font-medium text-muted-foreground">
                            <th className="p-4 pl-6">Event</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Sold / Total</th>
                            <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {events.map((event) => (
                            <tr key={event._id} className="hover:bg-muted/5 transition-colors group">
                                <td className="p-4 pl-6 font-medium">
                                    {event.title?.en || event.title}
                                </td>
                                <td className="p-4 text-muted-foreground font-light">
                                    {event.timeConfiguration?.startDateTime
                                        ? format(new Date(event.timeConfiguration.startDateTime), "MMM d, yyyy")
                                        : "Date TBA"}
                                </td>
                                <td className="p-4">
                                    <Badge
                                        variant={event.status?.current === 'published' ? 'default' : 'secondary'}
                                        className={event.status?.current === 'published' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' : ''}
                                    >
                                        {event.status?.current || 'Draft'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    <span className="text-foreground font-medium">{event.analytics?.registrations || 0}</span>
                                    <span className="opacity-50"> / {event.capacityConfig?.totalCapacity || event.capacity || '∞'}</span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                    <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" asChild title="Edit Details">
                                            <Link href={`/events/${event.slug}/edit`}>
                                                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild title="Edit Seat Map">
                                            <Link href={`/seat-builder?eventId=${event._id}`}>
                                                <Armchair className="w-4 h-4 text-blue-500" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild title="Scan Tickets">
                                            <Link href={`/organizer/scan?eventId=${event._id}`}>
                                                <QrCode className="w-4 h-4 text-#D4AF37" />
                                            </Link>
                                        </Button>
                                        {/* Add seat map link if applicable */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            onClick={() => onDelete && onDelete(event._id)}
                                            title="Delete Event"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

