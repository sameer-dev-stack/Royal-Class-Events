"use client";

import { Calendar, MapPin, Users, Trash2, X, QrCode, Eye } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { getCategoryIcon, getCategoryLabel, getMockImage } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeIn, ScaleOnHover } from "@/components/ui/motion";

export default function EventCard({
  event,
  onClick,
  onDelete,
  variant = "grid", // "grid" or "list"
  action = null, // "event" | "ticket" | null
  className = "",
}) {
  const displayImage = event.cover_image || event.content?.coverImage?.url || event.coverImage || getMockImage(event.category || event.event_type);
  const eventTitle = event.title?.en || (typeof event.title === 'string' ? event.title : "Untitled Event");
  const eventStartDate = event.start_date || event.timeConfiguration?.startDateTime || event.startDate || Date.now();
  const eventCity = event.city || event.metadata?.legacyProps?.city || "Unknown";
  const eventCategory = event.category || event.eventSubType || event.event_type || "general";
  const isFree = (event.financials?.pricingModel === "free") || (event.ticket_price === 0);
  const eventPrice = event.ticket_price || event.metadata?.legacyProps?.ticketPrice || 0;
  const eventCapacity = event.capacity || 100;
  const eventRegistrations = event.analytics?.registrations || event.registrationCount || 0;
  const isOnline = event.location_type === "online" || event.locationType === "virtual";

  // List variant (Clean & Compact)
  if (variant === "list") {
    return (
      <FadeIn>
        <Card
          className={cn(
            "py-0 group cursor-pointer border-white/5 bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-900/60 transition-all hover:border-[#D4AF37]/50 overflow-hidden",
            className
          )}
          onClick={onClick}
        >
          <CardContent className="p-3 flex gap-4">
            <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden relative border border-white/5">
              <Image
                src={displayImage}
                alt={eventTitle}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="font-bold text-sm mb-0.5 group-hover:text-[#D4AF37] transition-colors line-clamp-1 uppercase tracking-tight">
                {eventTitle}
              </h3>
              <p className="text-[10px] font-black text-[#D4AF37]/80 uppercase tracking-widest mb-1">
                {format(eventStartDate, "MMM dd")} • {isOnline ? "Online" : eventCity}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-medium">
                  {eventRegistrations}/{eventCapacity} Registered
                </span>
                <span className="text-xs font-bold text-white">
                  {isFree ? "FREE" : `৳${eventPrice}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  // Grid variant (Premium Concert Poster Style)
  return (
    <FadeIn>
      <ScaleOnHover scale={1.03}>
        <Card
          className={cn(
            "group relative aspect-[3/4.2] overflow-hidden rounded-[2rem] border-0 bg-zinc-900 shadow-2xl transition-all duration-500",
            onClick ? "cursor-pointer" : "",
            className
          )}
          onClick={onClick}
        >
          {/* Background Image with Parallax-like effect */}
          <div className="absolute inset-0 z-0">
            <Image
              src={displayImage}
              alt={eventTitle}
              fill
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 brightness-[0.7] group-hover:brightness-[0.4]"
              priority
            />
            {/* Multi-layered Gradients for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Top Badge: Date Pillar */}
          <div className="absolute top-6 left-6 z-20">
            <div className="flex flex-col items-center justify-center w-14 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-tighter pt-1">
                {format(eventStartDate, "MMM")}
              </span>
              <span className="text-2xl font-black text-white leading-none pb-1">
                {format(eventStartDate, "dd")}
              </span>
            </div>
          </div>

          {/* Top Right: Category Pill */}
          <div className="absolute top-6 right-6 z-20">
            <Badge variant="outline" className="backdrop-blur-xl bg-black/40 text-[9px] font-black uppercase tracking-[0.2em] py-1 px-3 text-[#D4AF37] border-[#D4AF37]/40">
              {getCategoryLabel(eventCategory)}
            </Badge>
          </div>

          {/* Content: Poster Info */}
          <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end h-1/2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="space-y-4">
              {/* Location Tag */}
              <div className="flex items-center gap-2 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.3em]">
                <MapPin className="w-3 h-3" />
                <span>{isOnline ? "Digital Mainstage" : eventCity}</span>
              </div>

              {/* Major Title */}
              <h3 className="text-2xl md:text-3xl font-black text-white leading-[0.9] uppercase tracking-tighter line-clamp-2 italic drop-shadow-2xl">
                {eventTitle}
              </h3>

              {/* Details & Pricing Overlay (Expanded on Hover) */}
              <div className="flex items-end justify-between pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    {eventRegistrations} of {eventCapacity} Registered
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-[#D4AF37]" />
                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F7E08B] transition-all duration-1000"
                        style={{ width: `${Math.min(100, (eventRegistrations / eventCapacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest mb-0.5">
                    Starting from
                  </p>
                  <p className="text-2xl font-black text-white leading-none">
                    {isFree ? "FREE" : `৳${eventPrice}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Edge Glow */}
          <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none group-hover:border-[#D4AF37]/30 transition-colors duration-500" />
        </Card>
      </ScaleOnHover>
    </FadeIn>
  );
}
