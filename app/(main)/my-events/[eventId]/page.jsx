"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Trash2,
  QrCode,
  Loader2,
  CheckCircle,
  Download,
  Search,
  Eye,
  Grid3X3,
  Settings,
  Edit3,
  Rocket,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
// Removed unused imports to save bundle size
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { cn } from "@/lib/utils";
import QRScannerModal from "../_components/qr-scanner-modal";
import { AttendeeCard } from "../_components/attendee-card";

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;
  const { token } = useAuthStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);

  // Convex Queries
  const dashboardData = useQuery(
    api.events.getDashboard,
    eventId && token ? { eventId, token } : "skip"
  );

  const registrations = useQuery(
    api.registrations.getEventRegistrations,
    eventId && token ? { eventId, token } : "skip"
  );

  const event = dashboardData?.event;
  const stats = dashboardData?.stats;
  const isLoading = dashboardData === undefined;
  const loadingRegistrations = registrations === undefined;

  const updateEventStatus = useMutation(api.events.updateStatus);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const updateEventMode = useMutation(api.events.updateEvent);

  const eventData = event;

  const {
    eventTitle,
    eventCoverImage,
    eventCategory,
    eventStartDate,
    eventLocationType,
    eventCity,
    eventState,
    eventCountry,
    eventTicketType
  } = useMemo(() => {
    if (!eventData) return {};
    return {
      eventTitle: eventData.title?.en || (typeof eventData.title === 'string' ? eventData.title : "Untitled Event"),
      eventCoverImage: eventData.content?.coverImage?.url || eventData.coverImage || eventData.cover_image || "/hero_placeholder.jpg",
      eventCategory: eventData.category || eventData.eventSubType || "general",
      eventStartDate: eventData.timeConfiguration?.startDateTime || eventData.startDate || eventData.start_date,
      eventLocationType: eventData.locationType || eventData.locationConfig?.type || "physical",
      eventCity: eventData.city || eventData.metadata?.legacyProps?.city || "Unknown",
      eventState: eventData.state || eventData.metadata?.legacyProps?.state || "",
      eventCountry: eventData.country || eventData.metadata?.legacyProps?.country || "Bangladesh",
      eventTicketType: eventData.ticketType || (eventData.ticket_price > 0 ? "paid" : "free")
    };
  }, [eventData]);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Filter registrations based on active tab and search
  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    const searchLower = deferredSearchQuery.toLowerCase();

    return registrations.filter((reg) => {
      const matchesSearch =
        (reg.attendeeName?.toLowerCase() || "").includes(searchLower) ||
        (reg.attendeeEmail?.toLowerCase() || "").includes(searchLower) ||
        (reg.qrCode?.toLowerCase() || "").includes(searchLower);

      if (activeTab === "all") return matchesSearch && reg.status === "confirmed";
      if (activeTab === "checked-in")
        return matchesSearch && reg.checkedIn && reg.status === "confirmed";
      if (activeTab === "pending")
        return matchesSearch && !reg.checkedIn && reg.status === "confirmed";

      return matchesSearch;
    });
  }, [registrations, deferredSearchQuery, activeTab]);

  const handlePublish = async () => {
    const confirmed = window.confirm("Are you sure you want to publish this event? It will become visible to all users.");
    if (!confirmed) return;

    setIsPublishing(true);
    try {
      await updateEventStatus({
        token: token || "",
        eventId: eventId,
        status: 'waiting_approval'
      });

      toast.success("Event submitted for review! An admin will check it shortly. 🚀");
    } catch (error) {
      console.error("Publish Error:", error);
      toast.error(error.message || "Failed to publish event");
    } finally {
      setIsPublishing(false);
    }
  };


  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteEvent({
        token: token || "",
        eventId: eventId
      });

      toast.success("Event deleted successfully");
      router.push("/my-events");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    const csvContent = [
      [
        "Name",
        "Email",
        "Registered At",
        "Checked In",
        "Checked In At",
        "QR Code",
      ],
      ...registrations.map((reg) => [
        reg.attendeeName,
        reg.attendeeEmail,
        new Date(reg.registeredAt).toLocaleString(),
        reg.checkedIn ? "Yes" : "No",
        reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : "-",
        reg.qrCode,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(dashboardData?.event.title?.en || dashboardData?.event.title || "event")}_registrations.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  // Early returns now safely follow all hook declarations
  if (isLoading || loadingRegistrations) {
    return (
      <div className="min-h-screen pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Skeleton */}
          <div className="mb-6 mt-8">
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Event Cover Skeleton */}
          <Skeleton className="h-[350px] w-full rounded-2xl mb-6" />

          {/* Header Skeleton */}
          <div className="flex flex-col gap-5 sm:flex-row items-start justify-between mb-8">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-2/3 max-w-md" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>

          {/* Attendees Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    notFound();
  }

  // No changes needed here, just removing the redundant line if it exists
  // dashboardData check happens above return

  // Safe Date Formatter
  const safeFormat = (dateStr, formatStr) => {
    try {
      if (!dateStr) return "N/A";
      return format(new Date(dateStr), formatStr);
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/my-events")}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Events
          </Button>
        </div>

        {eventCoverImage && (
          <div className="relative h-[350px] rounded-2xl overflow-hidden mb-6">
            <Image
              src={eventCoverImage}
              alt={eventTitle}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Event Header */}
        <div className="flex flex-col gap-5 sm:flex-row items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{eventTitle}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline">
                {getCategoryIcon(eventCategory)}{" "}
                {getCategoryLabel(eventCategory)}
              </Badge>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{safeFormat(eventStartDate, "PPP")}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {(eventLocationType === "virtual" || eventLocationType === "online")
                    ? "Online"
                    : `${eventCity}, ${eventState || eventCountry}`}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {(event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING") ? "Reserved Seating Map" : "General Admission"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* 1. SEATING TOGGLE (Integrated) */}
            <div className={cn(
              "flex items-center gap-2 p-1.5 px-3 rounded-full border transition-all shadow-sm mr-2",
              (event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING")
                ? "bg-[#D4AF37]/10 border-[#D4AF37]/30"
                : "bg-zinc-900 border-white/5"
            )}>
              <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Seat Map</Label>
              <Switch
                checked={event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING"}
                onCheckedChange={async (checked) => {
                  setIsUpdatingMode(true);
                  try {
                    await updateEventMode({
                      eventId: event._id,
                      seatingMode: checked ? "RESERVED" : "GENERAL",
                      token: token || ""
                    });
                    toast.success(`Seating mode changed to ${checked ? "Reserved" : "General"}`);
                  } catch (error) {
                    console.error("Update Seating Error:", error);
                    toast.error(error.message || "Failed to update seating mode");
                  } finally {
                    setIsUpdatingMode(false);
                  }
                }}
                className="h-4 w-7 data-[state=checked]:bg-[#D4AF37]"
                disabled={isUpdatingMode}
              />
            </div>

            {/* 2. PRIMARY ACTIONS */}
            {event.status?.current === "draft" && (
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-[#D4AF37] hover:bg-[#F7E08B] text-black font-bold shadow-lg shadow-[#D4AF37]/20 border-0 rounded-xl px-6 h-10 transition-all hover:scale-105"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                Publish Event
              </Button>
            )}

            {event.status?.current === "waiting_approval" && (
              <Button
                disabled
                className="bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold rounded-lg cursor-not-allowed h-10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Pending Review
              </Button>
            )}

            {event.status?.current === "published" && (
              <Button
                disabled
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold rounded-lg cursor-not-allowed h-10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Event Live
              </Button>
            )}

            <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 p-1 rounded-xl">
              {(event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING") && (
                <Link href={`/seat-builder?eventId=${eventId}`}>
                  <Button
                    className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl px-4 h-10 transition-all font-bold group"
                  >
                    <Grid3X3 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Seat Builder
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/events/${event.slug}/edit`)}
                className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
                title="Edit Details"
              >
                <Edit3 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/events/${event.slug}`)}
                className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                title="View Page"
              >
                <Eye className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/my-events/${eventId}/analytics`)}
                className="h-9 w-9 text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg"
                title="Deep Analytics"
              >
                <TrendingUp className="w-4 h-4" />
              </Button>

              <div className="w-px h-4 bg-white/10 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Show QR Scanner if event is today */}
        {stats.isEventToday && !stats.isEventPast && (
          <Button
            size="lg"
            className="mb-8 w-full gap-2 h-12 bg-zinc-900 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors duration-200 font-bold tracking-widest shadow-lg"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode className="w-5 h-5" />
            OPEN SECURITY SCANNR
          </Button>
        )}

        {/* Glass & Gold Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {/* Capacity */}
          <Card className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-200">
            <CardContent className="p-7 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Users className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <p className="text-4xl font-black text-white tracking-tighter">
                {stats.totalRegistrations}<span className="text-lg text-zinc-500 font-medium ml-1">/{stats.capacity}</span>
              </p>
              <p className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] mt-2">Registration Goal</p>
            </CardContent>
          </Card>

          {/* Check-ins */}
          <Card className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-200">
            <CardContent className="p-7 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-4xl font-black text-white tracking-tighter">
                {stats.checkedInCount}
              </p>
              <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] mt-2">Gate Check-ins</p>
            </CardContent>
          </Card>

          {/* Revenue/Rate */}
          <Card className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-200">
            <CardContent className="p-7 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-4xl font-black text-white tracking-tighter">
                {eventTicketType === "paid" ? `৳${stats.totalRevenue}` : `${stats.checkInRate}%`}
              </p>
              <p className="text-[10px] font-black text-blue-500/70 uppercase tracking-[0.2em] mt-2">
                {eventTicketType === "paid" ? "Event Revenue" : "Presence Rate"}
              </p>
            </CardContent>
          </Card>

          {/* Time Left */}
          <Card className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-200">
            <CardContent className="p-7 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#F7E08B]/10 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#8C7326]" />
              </div>
              <p className="text-4xl font-black text-white tracking-tighter">
                {stats.isEventPast
                  ? "END"
                  : stats.hoursUntilEvent > 24
                    ? `${Math.floor(stats.hoursUntilEvent / 24)}d`
                    : `${stats.hoursUntilEvent}h`}
              </p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">
                {stats.isEventPast ? "Status: Ended" : "Time to Launch"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendee Management */}
        <h2 className="text-2xl font-bold mb-4">Attendee Management</h2>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({stats.totalRegistrations})
            </TabsTrigger>
            <TabsTrigger value="checked-in">
              Checked In ({stats.checkedInCount})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({stats.pendingCount})
            </TabsTrigger>
          </TabsList>

          {/* Search and Actions */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or QR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Attendee List */}
          <TabsContent value={activeTab} className="space-y-3 mt-0">
            {filteredRegistrations && filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((registration) => (
                <AttendeeCard
                  key={registration._id}
                  registration={registration}
                  token={token}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No attendees found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          token={token}
        />
      )}
    </div>
  );
}
