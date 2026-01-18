"use client";

import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Info,
  ShieldCheck,
  Clock,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import BookingModal from "@/components/booking/booking-modal";
import useAuthStore from "@/hooks/use-auth-store";
import useBookingStore from "@/hooks/use-booking-store";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const { user, token, isAuthenticated } = useAuthStore();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const clearCart = useBookingStore((state) => state.clearCart);

  const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, { slug });

  // Clear cart on mount to ensure fresh session
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Check if user is already registered
  const { data: registration } = useConvexQuery(
    api.registrations.checkRegistration,
    event?._id ? { eventId: event._id, token } : "skip"
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title?.en || event.title,
          text: (event.description?.en || event.description || "").slice(0, 100) + "...",
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to register for this event");
      router.push(`/sign-in?redirect=/events/${slug}`);
      return;
    }
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 space-y-8">
        <Skeleton className="w-full h-[400px] rounded-3xl" />
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white space-y-4">
        <h1 className="text-4xl font-bold">Event Not Found 😕</h1>
        <p className="text-zinc-400">The event you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push('/explore')} variant="outline" className="text-white border-white/20">
          Explore Events
        </Button>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?._id && event.ownerId && user._id === event.ownerId;
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.roles?.some(r => r.key === "admin"));
  const canManageEvent = isOwner || isAdmin;
  const startDate = event.timeConfiguration?.startDateTime ? new Date(event.timeConfiguration.startDateTime) : new Date();
  const isPast = startDate < new Date();
  const isFull = (event.analytics?.registrations || 0) >= (event.capacityConfig?.totalCapacity || event.capacity || 100);

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden group mb-12 border border-white/10 shadow-2xl">
        <Image
          src={event.mediaConfiguration?.coverImage || "/hero_image.jpeg"}
          alt={event.title?.en || event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-amber-500 text-black font-bold uppercase tracking-wider px-3 py-1">
              {event.type}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              {event.title?.en || event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/80 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>{format(startDate, "EEEE, MMMM do, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>{event.locationConfiguration?.venueName || "Online Event"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="bg-black/20 backdrop-blur-md border-white/20 hover:bg-white/20 text-white rounded-full h-12 w-12"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            {canManageEvent && (
              <Button
                onClick={() => router.push(`/dashboard`)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 h-12 rounded-full"
              >
                Manage Event
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* About Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Info className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">About this <span className="text-gradient-gold">Experience</span></h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed font-light whitespace-pre-wrap">
              {event.description?.en || event.description}
            </p>
          </section>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Timing</h3>
              </div>
              <p className="text-foreground">
                Doors open at {format(startDate, "hh:mm a")}
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Verified Venue</h3>
              </div>
              <p className="text-foreground">
                {event.locationConfiguration?.address || "Location details on ticket"}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / CTA */}
        <div className="space-y-6">
          <div className="sticky top-32 p-8 rounded-3xl border border-amber-500/20 bg-card/60 backdrop-blur-xl shadow-2xl space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Entry Passes</p>
              <div className="flex items-baseline gap-2">
                {event.financials?.pricingModel === "free" ? (
                  <>
                    <span className="text-4xl font-black">Free</span>
                    <span className="text-muted-foreground font-light">/ early access</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-black">৳{event.ticketPrice || event.metadata?.legacyProps?.ticketPrice || 0}</span>
                    <span className="text-muted-foreground font-light">/ per ticket</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4 py-6 border-y border-white/5">
              <div className="flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Remaining Spots</span>
                </div>
                <span className="text-foreground">
                  {Math.max(0, (event.capacityConfig?.totalCapacity || event.capacity || 100) - (event.analytics?.registrations || 0))}
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((event.analytics?.registrations || 0) / (event.capacityConfig?.totalCapacity || event.capacity || 100)) * 100)}%` }}
                />
              </div>
            </div>

            {registration ? (
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/my-tickets')}
                  className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg"
                >
                  View My Ticket
                </Button>

                <Button
                  disabled={isPast || isFull || canManageEvent}
                  onClick={handleRegister}
                  className="w-full h-12 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-bold"
                  variant="outline"
                >
                  Purchase Another Ticket
                </Button>
              </div>
            ) : (
              <Button
                disabled={isPast || isFull || canManageEvent}
                onClick={handleRegister}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg border-none shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_45px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-1"
              >
                {isPast ? "Event Ended" : isFull ? "Sold Out" : canManageEvent ? "Host View" : "Pick Your Seats"}
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground font-light">
              Limited spots available. Secure yours now.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {event && (
        <BookingModal
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          eventId={event._id}
          eventTitle={event.title?.en || event.title}
          eventLayout={event.venueLayout}
          seatingMode={event.seatingMode}
          basePrice={event.ticketPrice || event.metadata?.legacyProps?.ticketPrice || 0}
        />
      )}
    </div>
  );
}
