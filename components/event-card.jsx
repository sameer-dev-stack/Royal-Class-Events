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
  const eventCity = event.city || event.metadata?.legacyProps?.city || "Gurugram";
  const eventCategory = event.category || event.eventSubType || event.event_type || "general";
  const isFree = (event.financials?.pricingModel === "free") || (event.ticket_price === 0);
  const eventCapacity = event.capacity || 100;
  const eventRegistrations = 0; // Analytics not yet in schema
  const isOnline = event.location_type === "online";

  // List variant
  if (variant === "list") {
    return (
      <FadeIn>
        <Card
          className={cn(
            "py-0 group cursor-pointer border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:border-[#D4AF37]/50",
            className
          )}
          onClick={onClick}
        >
          <CardContent className="p-3 flex gap-3">
            {/* Event Image */}
            <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden relative">
              <Image
                src={displayImage}
                alt={eventTitle}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                {eventTitle}
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                {format(eventStartDate, "EEE, dd MMM, HH:mm")}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <MapPin className="w-3 h-3 text-[#D4AF37]/70" />
                <span className="line-clamp-1">
                  {isOnline ? "Online Event" : eventCity}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  // Grid variant (default - premium vertical card)
  return (
    <FadeIn>
      <ScaleOnHover scale={1.02}>
        <Card
          className={cn(
            "overflow-hidden group pt-0 bg-card/40 backdrop-blur-sm border-border hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-300",
            onClick ? "cursor-pointer hover:border-[#D4AF37]/50" : "",
            className
          )}
          onClick={onClick}
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={displayImage}
              alt={eventTitle}
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              fill
              priority
            />

            {/* Badges/Overlays */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {/* HIDDEN FOR NOW
              <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-white/20">
                {isFree ? "Free" : "Paid"}
              </Badge>
              */}
            </div>
          </div>

          <CardContent className="space-y-4 p-4">
            <div>
              <Badge variant="outline" className="mb-2 text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/5">
                {getCategoryIcon(eventCategory)} <span className="ml-1">{getCategoryLabel(eventCategory)}</span>
              </Badge>
              <h3 className="font-bold text-lg line-clamp-1 leading-tight group-hover:text-[#D4AF37] transition-colors">
                {eventTitle}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]/80" />
                <span className="text-muted-foreground/80">{format(eventStartDate, "PPP")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]/80" />
                <span className="line-clamp-1">
                  {isOnline
                    ? "Online Event"
                    : `${eventCity}, ${event.metadata?.legacyProps?.state || event.state || event.metadata?.legacyProps?.country || event.country}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]/80" />
                <span>
                  {eventRegistrations} / {eventCapacity} registered
                </span>
              </div>
            </div>

            {action && (
              <div className="flex gap-2 pt-2 border-t border-white/10 mt-3">
                {/* Primary button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 hover:bg-[#D4AF37] hover:text-black border-[#D4AF37]/30 text-[#D4AF37]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.(e);
                  }}
                >
                  {action === "event" ? (
                    <>
                      <Eye className="w-4 h-4" />
                      View
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      Show Ticket
                    </>
                  )}
                </Button>

                {/* Secondary button - delete / cancel */}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(event.id || event._id);
                    }}
                  >
                    {action === "event" ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </ScaleOnHover>
    </FadeIn>
  );
}
