"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { format } from "date-fns";
import {
  Ticket,
  Calendar,
  MapPin,
  QrCode,
  Download,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MyTicketsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch user's registrations
  const { data: registrations, isLoading } = useConvexQuery(
    api.registrations.getMyRegistrations
  );

  const handleShare = async (event) => {
    const url = `${window.location.origin}/events/${event.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title?.en || event.title,
          text: `Check out this event: ${event.title?.en || event.title}`,
          url: url,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Event link copied!");
    }
  };

  const downloadQRCode = (registration) => {
    // In a real app, you'd generate a proper QR code image
    // For now, we'll just show the QR code value
    toast.success("QR Code: " + registration.checkIn.qrCode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Ticket className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Tickets Yet</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                You haven't registered for any events yet. Explore amazing events and get your tickets!
              </p>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => router.push("/explore")}
              >
                Browse Events
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filter and search registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const event = reg.event;
    if (!event) return false;

    const eventTitle = event.title?.en || event.title || "";
    const matchesSearch = eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "upcoming") {
      const eventDate = event.timeConfiguration?.startDateTime || event.startDate;
      return matchesSearch && eventDate > Date.now();
    }
    if (filterStatus === "past") {
      const eventDate = event.timeConfiguration?.endDateTime || event.endDate;
      return matchesSearch && eventDate < Date.now();
    }
    if (filterStatus === "checked-in") return matchesSearch && reg.checkIn.isCheckedIn;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2">My Tickets</h1>
            <p className="text-muted-foreground text-lg">
              {registrations.length} {registrations.length === 1 ? "ticket" : "tickets"} in your collection
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter((r) => {
                      const eventDate = r.event?.timeConfiguration?.startDateTime || r.event?.startDate;
                      return eventDate > Date.now();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter((r) => r.checkIn.isCheckedIn).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attended</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter((r) => {
                      const eventDate = r.event?.timeConfiguration?.endDateTime || r.event?.endDate;
                      return eventDate < Date.now() && r.checkIn.isCheckedIn;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="space-y-6">
          {filteredRegistrations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No tickets match your search</p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => {
              const event = registration.event;
              if (!event) return null;

              const eventTitle = event.title?.en || event.title;
              const eventCoverImage = event.content?.coverImage?.url || event.coverImage;
              const eventStartDate = event.timeConfiguration?.startDateTime || event.startDate;
              const eventEndDate = event.timeConfiguration?.endDateTime || event.endDate;
              const eventCity = event.metadata?.legacyProps?.city || event.city;
              const eventVenue = event.metadata?.legacyProps?.venueName || event.venue;
              const isUpcoming = eventStartDate > Date.now();
              const isPast = eventEndDate < Date.now();

              return (
                <Card key={registration._id} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-[300px_1fr] gap-0">
                      {/* Event Image */}
                      <div className="relative h-48 md:h-full">
                        {eventCoverImage ? (
                          <Image
                            src={eventCoverImage}
                            alt={eventTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Ticket className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          {registration.checkIn.isCheckedIn ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Checked In
                            </Badge>
                          ) : isUpcoming ? (
                            <Badge className="bg-blue-500 hover:bg-blue-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Upcoming
                            </Badge>
                          ) : isPast ? (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Past Event
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-6 md:p-8 space-y-6">
                        {/* Header */}
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold line-clamp-2">
                            {eventTitle}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{format(eventStartDate, "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{format(eventStartDate, "h:mm a")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{eventCity}</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Ticket Info */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Ticket ID</p>
                            <p className="font-mono text-sm font-bold">
                              {registration.registrationNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Registered</p>
                            <p className="text-sm font-medium">
                              {format(registration.createdAt, "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="text-sm font-medium capitalize">
                              {registration.status.current.replace("_", " ")}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="default"
                            className="gap-2"
                            onClick={() => router.push(`/events/${event.slug}`)}
                          >
                          View Event
                          <ArrowRight className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => downloadQRCode(registration)}
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </Button>

                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleShare(event)}
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>

                        {eventVenue && (
                          <Button
                            variant="ghost"
                            className="gap-2"
                            asChild
                          >
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventVenue + " " + eventCity)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Directions
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                </Card>
        );
            })
          )}
      </div>
    </div>
    </div >
  );
}
