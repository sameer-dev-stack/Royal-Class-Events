/* eslint-disable react-hooks/purity */
"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Ticket,
  ExternalLink,
  Loader2,
  CheckCircle,
  Crown,
  Info,
  ArrowRight
} from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import RegisterModal from "./_components/register-modal";
import SeatSelectionModal from "./_components/seat-selection-modal";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fetch event details
  const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, {
    slug: params.slug,
  });

  // Check if user is already registered
  const { data: registration } = useConvexQuery(
    api.registrations.checkRegistration,
    event?._id ? { eventId: event._id } : "skip"
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description.slice(0, 100) + "...",
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegister = () => {
    if (!user) {
      // Redirect to sign-in with return URL
      router.push(`/sign-in?redirect=/events/${params.slug}`);
      return;
    }
    setShowRegisterModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Hero Background Skeleton */}
        <div className="absolute inset-0 h-[60vh] w-full z-0">
          <Skeleton className="w-full h-full bg-zinc-900/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto pt-10 px-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            {/* Left Column Skeleton */}
            <div className="space-y-8">
              {/* Title & Badge */}
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
                  <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
                </div>
                <Skeleton className="h-20 w-3/4 bg-white/10" />
                <div className="flex gap-6">
                  <Skeleton className="h-8 w-48 bg-white/10" />
                  <Skeleton className="h-8 w-48 bg-white/10" />
                </div>
              </div>

              {/* Cover Image Skeleton */}
              <Skeleton className="aspect-video w-full rounded-3xl bg-white/10" />

              {/* Content Sections */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48 bg-white/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-2/3 bg-white/5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48 bg-white/10" />
                  <Skeleton className="h-32 w-full rounded-3xl bg-white/5" />
                </div>
              </div>
            </div>

            {/* Right Column (Sticky Card) Skeleton */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Skeleton className="h-[500px] w-full rounded-3xl bg-card/80 border border-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const eventTitle = event.title?.en || event.title;
  const eventDescription = event.description?.en || event.description;
  const eventCoverImage = event.content?.coverImage?.url || event.coverImage;
  const eventCategory = event.eventSubType || event.category;
  const eventTicketType = event.financials?.pricingModel || event.ticketType;
  const eventTicketPrice = event.metadata?.legacyProps?.ticketPrice || event.ticketPrice;
  const eventStartDate = event.timeConfiguration?.startDateTime || event.startDate;
  const eventEndDate = event.timeConfiguration?.endDateTime || event.endDate;
  const eventVenue = event.metadata?.legacyProps?.venueName || event.venue;
  const eventAddress = event.metadata?.legacyProps?.address || event.address;
  const eventCity = event.metadata?.legacyProps?.city || event.city;
  const eventCapacity = event.capacityConfig?.totalCapacity || event.capacity;
  const eventRegistrations = event.analytics?.registrations || event.registrationCount || 0;
  const eventOrganizerName = event.metadata?.legacyProps?.organizerName || event.organizerName;

  const isEventFull = eventRegistrations >= eventCapacity;
  const isEventPast = eventEndDate < Date.now();
  const isOrganizer = user?.id === event.organizerId || user?.id === event.ownerId;

  return (
    <div className="min-h-screen bg-background text-foreground relative">

      {/* --- IMMERSIVE HERO BACKGROUND --- */}
      <div className="absolute inset-0 h-[60vh] w-full z-0 overflow-hidden">
        {eventCoverImage ? (
          <Image
            src={eventCoverImage}
            alt={eventTitle}
            fill
            className="object-cover opacity-60 blur-sm scale-110"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-10">

        {/* Breadcrumb / Back Navigation can go here */}

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">

          {/* LEFT COLUMN: Main Info */}
          <div className="space-y-8">

            {/* Event Title & Badge */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 py-1.5 px-4 backdrop-blur-md text-sm">
                  {getCategoryIcon(eventCategory)} <span className="ml-2">{getCategoryLabel(eventCategory)}</span>
                </Badge>
                {eventTicketType === "paid" && (
                  <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md">Premium Event</Badge>
                )}
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                {eventTitle}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-lg text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted border border-border">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <span>{format(eventStartDate, "EEEE, MMMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white/5 border border-white/10">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <span>{format(eventStartDate, "h:mm a")} - {format(eventEndDate, "h:mm a")}</span>
                </div>
              </div>
            </div>

            {/* Main Hero Image (Clean Card) */}
            {eventCoverImage && (
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-900/20 group">
                <Image
                  src={eventCoverImage}
                  alt={eventTitle}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            )}

            {/* Content Sections */}
            <div className="space-y-10">
              {/* About */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <div className="h-8 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
                  About This Event
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed bg-card/50 p-8 rounded-3xl border border-border backdrop-blur-sm">
                  <p className="whitespace-pre-wrap">{eventDescription}</p>
                </div>
              </section>

              {/* Location */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-2xl font-bold text-white">
                  <div className="h-8 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
                  Location
                </div>
                <div className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-amber-500/30 transition-colors">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-500 font-medium">
                        <MapPin className="w-5 h-5" />
                        <span>Venue</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{eventVenue || "Private Location"}</p>
                      <p className="text-gray-400">{eventAddress || "Address visible to ticket holders"}, {eventCity}</p>
                    </div>
                    {eventVenue && (
                      <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white shrink-0" asChild>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventVenue + " " + eventCity)}`} target="_blank" rel="noopener noreferrer">
                          View on Map <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </section>

              {/* Host */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <div className="h-8 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
                  Hosted By
                </div>
                <div className="flex items-center gap-5 bg-card/50 p-6 rounded-3xl border border-border backdrop-blur-sm">
                  <Avatar className="w-16 h-16 border-2 border-amber-500/20 shadow-lg">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-xl">
                      {(eventOrganizerName || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-xl text-white mb-1">{eventOrganizerName || "Unknown Organizer"}</p>
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full w-fit border border-green-900/50">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified Organizer</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar - Ticket/Registration */}
          {/* RIGHT COLUMN: Sticky Booking Card */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">

            <Card className="bg-card/80 border-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Golden Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10" />

              <CardContent className="p-8 space-y-8">
                {/* Price Display */}
                {/* Price Display - HIDDEN FOR NOW
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Ticket Price</p>
                  <div className="flex items-baseline gap-2">
                    {eventTicketType === "free" ? (
                      <span className="text-5xl font-bold text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-amber-500">৳</span>
                        <span className="text-5xl font-bold text-white tracking-tight">{eventTicketPrice}</span>
                      </>
                    )}
                  </div>
                  {eventTicketType === "paid" && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" /> Secure Payment
                    </Badge>
                  )}
                </div>
                */}

                <Separator className="bg-white/10" />

                {/* Availability Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Capacity</p>
                    <p className="text-xl font-bold text-white">{eventCapacity}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Sold</p>
                    <p className="text-xl font-bold text-amber-500">{eventRegistrations}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {registration ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        You are going!
                      </div>
                      <Button className="w-full h-12 text-base bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl" onClick={() => router.push("/my-tickets")}>
                        View Ticket
                      </Button>
                    </div>
                  ) : isEventPast ? (
                    <Button className="w-full h-14 text-lg font-bold bg-zinc-800 text-gray-400 cursor-not-allowed rounded-xl" disabled>
                      Event Ended
                    </Button>
                  ) : isEventFull ? (
                    <Button className="w-full h-14 text-lg font-bold bg-red-900/20 text-red-500 border border-red-900/50 cursor-not-allowed rounded-xl" disabled>
                      Sold Out
                    </Button>
                  ) : isOrganizer ? (
                    <Button className="w-full h-14 text-lg font-bold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl" onClick={() => router.push(`/events/${event.slug}/manage`)}>
                      Manage Dashboard
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-16 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all"
                      onClick={handleRegister}
                    >
                      Get Tickets
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  )}

                  <Button variant="ghost" className="w-full hover:bg-white/5 text-gray-400 hover:text-white" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" /> Share Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badge / Extra Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                <Crown className="w-3 h-3 inline-block mr-1 text-amber-500" />
                Royal Class Events Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        event.seatMapConfig ? (
          <SeatSelectionModal
            event={event}
            isOpen={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
          />
        ) : (
          <RegisterModal
            event={event}
            isOpen={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
          />
        )
      )}
    </div>
  );
}