"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Loader2, MapPin, Crown, CalendarX } from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { CATEGORIES } from "@/lib/data";
import { parseLocationSlug } from "@/lib/location-utils";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/event-card";

export default function DynamicExplorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  // 1. CHECK: Is this URL a Category?
  const categoryInfo = CATEGORIES.find((cat) => cat.id === slug);
  const isCategory = !!categoryInfo;

  // 2. CHECK: If not a category, is it a valid Location?
  const { city, state, isValid } = !isCategory
    ? parseLocationSlug(slug)
    : { city: null, state: null, isValid: true };

  if (!isCategory && !isValid && !slug) {
    notFound();
  }

  // 3. FETCH DATA (FIXED)
  // We must destructure { data } because useConvexQuery returns an object.
  const { data: allEvents, isLoading } = useConvexQuery(api.events.by_start_date);

  // 4. LOADING STATE
  // We show the loader if it is loading OR if the data hasn't arrived yet
  if (isLoading || !allEvents) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  // 5. FILTER DATA LOCALLY
  // Now 'allEvents' is definitely an array, so .filter() will work.
  const filteredEvents = allEvents.filter((event) => {
    if (isCategory) {
      return event.category?.toLowerCase() === slug?.toLowerCase();
    } else {
      // Location Search Logic
      const searchSlug = slug.replace(/-/g, " ").toLowerCase();
      const eventLocation = `${event.city || ""} ${event.state || ""} ${event.country || ""}`.toLowerCase();
      
      return eventLocation.includes(searchSlug) || searchSlug.includes((event.city || "").toLowerCase());
    }
  });

  const handleEventClick = (eventSlug) => {
    router.push(`/events/${eventSlug}`);
  };

  // --- RENDER: CATEGORY VIEW ---
  if (isCategory) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-white/10 pb-6">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-6xl">{categoryInfo.icon}</span>
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white">
                        {categoryInfo.label}
                    </h1>
                    <p className="text-lg text-gray-400 mt-2">
                        {categoryInfo.description}
                    </p>
                </div>
             </div>
             {filteredEvents.length > 0 && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">
                  {filteredEvents.length} Exclusive Event{filteredEvents.length !== 1 ? "s" : ""}
                </Badge>
             )}
          </div>

          {/* Grid or Empty State */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => handleEventClick(event.slug)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message={`No exclusive ${categoryInfo.label} events found right now.`} />
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: LOCATION VIEW ---
  const displayCity = city || slug.split("-")[0].replace(/%20/g, " ");
  const displayState = state || "Bangladesh"; 

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6 text-amber-500" />
                <span className="text-amber-500 font-medium tracking-wide uppercase text-sm">
                    Exclusive Selection
                </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white capitalize">
                    Events in <span className="text-amber-500">{displayCity}</span>
                </h1>
                <Badge variant="secondary" className="w-fit gap-2 bg-zinc-800 text-gray-300">
                    <MapPin className="w-3 h-3" />
                    {displayState}
                </Badge>
            </div>
        </div>

        {/* Grid or Empty State */}
        {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
                <EventCard
                key={event._id}
                event={event}
                onClick={() => handleEventClick(event.slug)}
                />
            ))}
            </div>
        ) : (
            <EmptyState message={`We are currently curating exclusive experiences for ${displayCity}.`} />
        )}
      </div>
    </div>
  );
}

// Helper Component for "No Events"
function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/30">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-black">
                <CalendarX className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
                No Events Currently
            </h2>
            <p className="text-gray-400 max-w-md">
                {message} <br/>
                Please check back later or host your own private event.
            </p>
        </div>
    );
}