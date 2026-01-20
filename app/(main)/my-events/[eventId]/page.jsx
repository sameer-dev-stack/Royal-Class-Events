"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
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

import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { cn } from "@/lib/utils";
import QRScannerModal from "../_components/qr-scanner-modal";
import { AttendeeCard } from "../_components/attendee-card";

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { token } = useAuthStore();

  // Fetch event dashboard data
  const { data: dashboardData, isLoading } = useConvexQuery(
    api.dashboard.getEventDashboard,
    { eventId, token }
  );

  // Fetch registrations
  const { data: registrations, isLoading: loadingRegistrations } =
    useConvexQuery(api.registrations.getEventRegistrations, { eventId, token });

  // Delete event mutation
  const { mutate: deleteEvent, isLoading: isDeleting } = useConvexMutation(
    api.dashboard.deleteEvent
  );

  // Update seating mode mutation
  const { mutate: updateSeatingMode } = useConvexMutation(
    api.events_seating.updateSeatingMode
  );

  // Publish event mutation
  const { mutate: publishEvent, isLoading: isPublishing } = useConvexMutation(api.events.publishEvent);

  const handlePublish = async () => {
    const confirmed = window.confirm("Are you sure you want to publish this event? It will become visible to all users.");
    if (!confirmed) return;

    try {
      await publishEvent({ eventId, token });
      toast.success("Event Published Successfully! 🚀");
      // Optional: Refresh or reload to update status UI
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Failed to publish event");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations."
    );

    if (!confirmed) return;

    try {
      await deleteEvent({ eventId, token });
      toast.success("Event deleted successfully");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
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

  const { event, stats } = dashboardData;
  const eventTitle = event.title?.en || (typeof event.title === "string" ? event.title : "Untitled Event");
  const eventCoverImage = event.content?.coverImage?.url || event.coverImage;
  const eventCategory = event.eventSubType || event.category;
  const eventStartDate = event.timeConfiguration?.startDateTime || event.startDate;
  const eventLocationType = event.locationConfig?.type || event.locationType;
  const eventCity = event.metadata?.legacyProps?.city || event.city;
  const eventState = event.metadata?.legacyProps?.state || event.state;
  const eventCountry = event.metadata?.legacyProps?.country || event.country;
  const eventTicketType = event.financials?.pricingModel || event.ticketType;

  // Filter registrations based on active tab and search
  const filteredRegistrations = registrations?.filter((reg) => {
    const matchesSearch =
      (reg.attendeeName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (reg.attendeeEmail?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (reg.qrCode?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && reg.status === "confirmed";
    if (activeTab === "checked-in")
      return matchesSearch && reg.checkedIn && reg.status === "confirmed";
    if (activeTab === "pending")
      return matchesSearch && !reg.checkedIn && reg.status === "confirmed";

    return matchesSearch;
  });

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
                <span>{format(eventStartDate, "PPP")}</span>
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

          <div className="flex gap-2 w-full sm:w-auto">
            {event.status?.current === "draft" && (
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20 border-0 rounded-lg animate-pulse"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                Publish Event
              </Button>
            )}
            <Link href={`/seat-builder?eventId=${eventId}`}>
              <Button className="bg-[linear-gradient(135deg,#fac529,#eab308)] text-black font-bold shadow-lg hover:shadow-[#D4AF37]/25 border-0 rounded-lg">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Configure Seating
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/events/${event.slug}/edit`)}
              className="gap-2 flex-1"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/events/${event.slug}`)}
              className="gap-2 flex-1"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/my-events/${eventId}/analytics`)}
              className="gap-2 flex-1 bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 gap-2 flex-1"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {/* Quick Actions - Show QR Scanner if event is today */}
        {stats.isEventToday && !stats.isEventPast && (
          <Button
            size="lg"
            // variant="outline"
            className="mb-8 w-full gap-2 h-10 bg-linear-to-r from-orange-500 via-pink-500 to-red-500 text-white hover:scale-[1.02]"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode className="w-6 h-6" />
            Scan QR Code to Check-In
          </Button>
        )}

        {/* Seating Mode Controller */}
        <Card className="mb-8 border-[#D4AF37]/20 bg-[#D4AF37]/5 shadow-sm ring-1 ring-[#D4AF37]/10">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#D4AF37]/10 rounded-lg shrink-0">
                <Settings className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-foreground">Enable Seat Map</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Turn on for stadium/theater style seating. Turn off for standing/open events.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 p-2 px-3 rounded-full border border-white/5">
              <span className={cn("text-xs font-bold uppercase tracking-wider", !(event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING") ? "text-[#D4AF37]" : "text-muted-foreground")}>General</span>
              <Switch
                checked={event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING"}
                onCheckedChange={async (checked) => {
                  try {
                    await updateSeatingMode({
                      eventId,
                      seatingMode: checked ? "RESERVED" : "GENERAL",
                      token
                    });
                    toast.success(`Seating mode changed to ${checked ? "Reserved" : "General"}`);
                  } catch (error) {
                    toast.error(error.message || "Failed to update seating mode");
                  }
                }}
                className="data-[state=checked]:bg-[#D4AF37]"
              />
              <span className={cn("text-xs font-bold uppercase tracking-wider", (event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING") ? "text-[#D4AF37]" : "text-muted-foreground")}>Reserved</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="py-0">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalRegistrations}/{stats.capacity}
                </p>
                <p className="text-sm text-muted-foreground">Capacity</p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.checkedInCount}</p>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </div>
            </CardContent>
          </Card>

          {eventTicketType === "paid" ? (
            <Card className="py-0">
              <CardContent className="p-6 flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">৳{stats.totalRevenue}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="py-0">
              <CardContent className="p-6 flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.checkInRate}%</p>
                  <p className="text-sm text-muted-foreground">Check-in Rate</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="py-0">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-3 bg-[#F7E08B] rounded-lg">
                <Clock className="w-6 h-6 text-[#8C7326]" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.isEventPast
                    ? "Ended"
                    : stats.hoursUntilEvent > 24
                      ? `${Math.floor(stats.hoursUntilEvent / 24)}d`
                      : `${stats.hoursUntilEvent}h`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.isEventPast ? "Event Over" : "Time Left"}
                </p>
              </div>
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
