"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/hooks/use-auth-store";
import Image from "next/image";
import { format } from "date-fns";
import {
  Ticket,
  Calendar,
  MapPin,
  Download,
  Search,
  Filter,
  XCircle,
  Clock,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import QRCode from "react-qr-code";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal State
  const [selectedGroup, setSelectedGroup] = useState(null); // { event, tickets }
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cancelRegistration = useMutation(api.registrations.cancelRegistration);

  // Fetch user's registrations
  const { data: registrations, isLoading } = useConvexQuery(
    api.tickets.getMyTickets,
    { token: token ?? undefined }
  );

  const handleCancelTicket = async (registrationId) => {
    if (!confirm("Are you sure you want to cancel this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      await cancelRegistration({ registrationId, token });
      toast.success("Ticket cancelled successfully");
      // If we are in the modal, we might want to refresh or close it if the last ticket is cancelled
      // For now, simple toast is enough.
    } catch (error) {
      toast.error("Failed to cancel ticket: " + error.message);
    }
  };

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
          <Ticket className="w-10 h-10 text-[#D4AF37]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Your Premium Passes</h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Please sign in to view and manage your exclusive event registrations.
          </p>
        </div>
        <Button
          onClick={() => router.push("/sign-in")}
          className="bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold h-12 px-8 rounded-xl"
        >
          Sign In Now
        </Button>
      </div>
    );
  }

  const now = new Date();

  // 1. Initial filter based on Search and Status Dropdown
  const filteredRegistrations = registrations?.filter((reg) => {
    const title = reg.event?.title?.en || reg.event?.title || "";
    const matchesSearch = title.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const currentStatus = typeof reg.status === "string" ? reg.status : reg.status?.current;
    const matchesDropdown = filterStatus === "all" || currentStatus === filterStatus;

    return matchesSearch && matchesDropdown;
  });

  // 2. Segregate into Active and History based on Tab logic
  const activeRegistrations = filteredRegistrations?.filter(reg => {
    const status = typeof reg.status === "string" ? reg.status : reg.status?.current;
    const endDate = new Date(reg.event?.timeConfiguration?.endDateTime || reg.event?.timeConfiguration?.startDateTime);
    // Active if confirmed AND not in the past
    return status === 'confirmed' && endDate > now;
  });

  const historyRegistrations = filteredRegistrations?.filter(reg => {
    const status = typeof reg.status === "string" ? reg.status : reg.status?.current;
    const endDate = new Date(reg.event?.timeConfiguration?.endDateTime || reg.event?.timeConfiguration?.startDateTime);
    // History if cancelled, refunded, past event, OR used (checked in)
    return status === 'cancelled' || status === 'refunded' || status === 'checked_in' || endDate < now;
  });

  const GroupedEventList = ({ data, emptyTitle, emptyMessage, isHistoryTab }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">{emptyTitle}</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    // Grouping for the UI display
    const grouped = Object.values(data.reduce((acc, reg) => {
      const eventId = reg.event?._id;
      if (!eventId) return acc;
      if (!acc[eventId]) acc[eventId] = { event: reg.event, tickets: [] };
      acc[eventId].tickets.push(reg);
      return acc;
    }, {}));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grouped.map(({ event, tickets }) => (
          <div
            key={event._id}
            onClick={() => {
              setSelectedGroup({ event, tickets });
              setCurrentTicketIndex(0);
            }}
            className={cn(
              "group relative flex flex-col bg-card/40 backdrop-blur-md rounded-3xl border border-white/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer overflow-hidden shadow-xl",
              isHistoryTab && "grayscale-[0.5] opacity-80"
            )}
          >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={event.mediaConfiguration?.coverImage || "/hero_image.jpeg"}
                alt={event.title?.en || event.title || "Event"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

              {/* Status/Ticket Count Badge */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <Badge className="bg-[#D4AF37] text-black font-black px-3 py-1 rounded-full shadow-lg border-none">
                  {tickets.length} {tickets.length > 1 ? "Tickets" : "Ticket"}
                </Badge>
                {tickets.some(t => (typeof t.status === 'string' ? t.status : t.status?.current) === 'checked_in') && (
                  <Badge className="bg-green-600 text-white font-black px-3 py-1 rounded-full shadow-lg border-none animate-pulse">
                    CHECKED IN
                  </Badge>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold line-clamp-1">{event.title?.en || event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                  <Calendar className="w-3 h-3 text-[#D4AF37]" />
                  <span>{event.timeConfiguration?.startDateTime ? format(new Date(event.timeConfiguration.startDateTime), "MMM do, yyyy") : "TBA"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                <span className="line-clamp-1">{event.locationConfiguration?.venueName || "TBA"}</span>
              </div>

              <div className="pt-2">
                <Button className="w-full bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-bold rounded-xl transition-all">
                  Manage Passes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const selectedTicket = selectedGroup?.tickets[currentTicketIndex];
  const totalTickets = selectedGroup?.tickets.length || 0;

  const nextTicket = () => {
    if (currentTicketIndex < totalTickets - 1) {
      setCurrentTicketIndex(currentTicketIndex + 1);
    }
  };

  const prevTicket = () => {
    if (currentTicketIndex > 0) {
      setCurrentTicketIndex(currentTicketIndex - 1);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
            <Ticket className="w-3 h-3" />
            <span>Member Access</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My <span className="text-[#D4AF37]">Tickets</span></h1>
          <p className="text-zinc-400 font-light text-lg">Manage your digital event passes in one place.</p>
        </div>
      </div>

      {/* Control Bar: Tabs + Search/Filter */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by event name..."
              className="pl-12 h-14 bg-card/40 border-white/5 rounded-2xl focus:ring-[#D4AF37]/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-14 px-6 rounded-2xl border-white/5 bg-card/40 gap-2 min-w-[140px]">
                <Filter className="w-5 h-5 text-[#D4AF37]" />
                <span className="capitalize">{filterStatus === 'all' ? 'All Status' : filterStatus}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10">
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("confirmed")}>Confirmed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl inline-flex w-full sm:w-auto mb-10">
            <TabsTrigger
              value="active"
              className="rounded-xl data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold transition-all px-8 h-full"
            >
              Active Passes
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold transition-all px-8 h-full"
            >
              Past Events / Used
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0 focus-visible:outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-3xl" />
                ))}
              </div>
            ) : (
              <GroupedEventList
                data={activeRegistrations}
                emptyTitle="No active tickets"
                emptyMessage="You don't have any upcoming confirmed event registrations."
                isHistoryTab={false}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0 focus-visible:outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-3xl" />
                ))}
              </div>
            ) : (
              <GroupedEventList
                data={historyRegistrations}
                emptyTitle="No history found"
                emptyMessage="You don't have any past, checked-in, or cancelled event registrations."
                isHistoryTab={true}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket Group Modal with Navigation */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 p-0 overflow-hidden outline-none">
          {selectedGroup && selectedTicket && (
            <div className="flex flex-col">
              {/* Top Banner & Header */}
              <div className="relative h-40">
                <Image
                  src={selectedGroup.event?.mediaConfiguration?.coverImage || "/hero_image.jpeg"}
                  alt={selectedGroup.event?.title?.en || selectedGroup.event?.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <Button
                    className="bg-black/40 hover:bg-black/60 backdrop-blur-md border-none text-white h-8 rounded-full text-xs font-bold"
                    size="sm"
                    onClick={() => router.push(`/events/${selectedGroup.event.slug}`)}
                  >
                    <ExternalLink className="w-3 h-3 mr-2 text-[#D4AF37]" />
                    Event Details
                  </Button>

                  {totalTickets > 1 && (
                    <Badge className="bg-[#D4AF37] text-black border-none font-bold">
                      Ticket {currentTicketIndex + 1} of {totalTickets}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Multi-Ticket Navigator (Tabs-like buttons) */}
              <div className="px-8 pb-8 -mt-12 relative z-10 space-y-6">
                <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5 shadow-2xl space-y-6">
                  {/* Navigation for multiple tickets */}
                  {totalTickets > 1 && (
                    <div className="flex items-center justify-between pb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentTicketIndex === 0}
                        onClick={prevTicket}
                        className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>

                      <div className="flex gap-1.5">
                        {selectedGroup.tickets.map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              i === currentTicketIndex ? "bg-[#D4AF37] w-4" : "bg-white/10"
                            )}
                          />
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentTicketIndex === totalTickets - 1}
                        onClick={nextTicket}
                        className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
                  )}

                  <div className="text-center space-y-2">
                    <DialogTitle className="text-2xl font-black text-white leading-tight">
                      {selectedGroup.event?.title?.en || selectedGroup.event?.title}
                    </DialogTitle>
                    <p className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[10px]">Secure Digital Pass</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Date</p>
                      <p className="font-bold text-sm text-white">
                        {format(new Date(selectedGroup.event?.timeConfiguration?.startDateTime), "MMM do, yyyy")}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Ticket ID</p>
                      <p className="font-bold text-sm text-[#D4AF37] font-mono tracking-tighter">
                        {selectedTicket.registrationNumber}
                      </p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Venue & Seat</p>
                      <p className="font-bold text-sm text-white line-clamp-1">
                        {selectedGroup.event?.locationConfiguration?.venueName}
                        {selectedTicket.seatNumber && <span className="text-[#D4AF37] ml-2"> - {selectedTicket.seatNumber}</span>}
                      </p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner">
                    <QRCode
                      value={selectedTicket.registrationNumber}
                      size={160}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>

                  <div className="text-center">
                    <Badge variant="outline" className={cn(
                      "rounded-full px-4 py-1 font-black uppercase text-[10px] tracking-widest",
                      (typeof selectedTicket.status === 'string' ? selectedTicket.status : selectedTicket.status?.current) === "checked_in"
                        ? "bg-green-600 text-white border-none shadow-lg animate-pulse scale-110"
                        : "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20"
                    )}>
                      {(typeof selectedTicket.status === 'string' ? selectedTicket.status : selectedTicket.status?.current) === "checked_in" ? (
                        <><CheckCircle2 className="w-3 h-3 mr-2" /> CHECKED IN</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-2" /> Valid Entry Pass</>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#F7E08B] via-[#D4AF37] to-[#8C7326] hover:brightness-110 text-black font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 border-none">
                    <Download className="w-4 h-4 mr-2" />
                    Download This PDF
                  </Button>

                  {(typeof selectedTicket.status === 'string' ? selectedTicket.status : selectedTicket.status?.current) !== "cancelled" && (
                    <Button
                      variant="ghost"
                      onClick={() => handleCancelTicket(selectedTicket.originalId || selectedTicket._id)}
                      className="w-full h-12 rounded-xl text-red-500/70 hover:text-red-500 hover:bg-red-500/5 font-bold"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Registration
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

