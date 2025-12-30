"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CATEGORIES } from "@/lib/data";
import EventCard from "./event-card";
import EventCardSkeleton from "./event-card-skeleton";
import { Loader2, Crown, ArrowRight, CalendarX } from "lucide-react";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function EventList() {
  const router = useRouter();
  // 1. Fetch all active events from database
  const events = useQuery(api.events.by_start_date);

  // 2. Loading State
  if (!events) {
    return (
      <div className="space-y-16">
        <section>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </section>

        <section>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // 3. Calculate Real Counts for each Category
  const categoryCounts = events.reduce((acc, event) => {
    const cat = event.eventSubType || event.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // 4. Get Upcoming Events (Top 6)
  const upcomingEvents = events
    .filter((e) => (e.timeConfiguration?.startDateTime || e.startDate) > Date.now())
    .slice(0, 6);

  return (
    <div className="space-y-16">

      {/* --- BROWSE BY CATEGORY SECTION --- */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.filter(cat => (categoryCounts[cat.id] || 0) > 0).map((category) => {
            const count = categoryCounts[category.id] || 0;

            return (
              <Link
                href={`/explore/${category.id}`}
                key={category.id}
                className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
              >
                <div className="mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-amber-500 transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {count} {count === 1 ? "Event" : "Events"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- UPCOMING EVENTS GRID --- */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
          </div>
          <Link href="/explore" className="text-amber-500 hover:text-amber-400 flex items-center gap-2 text-sm font-medium">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() => router.push(`/events/${event.slug || event._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-muted/30">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CalendarX className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400">No upcoming events scheduled yet.</p>
            <Link href="/create-event" className="text-amber-500 hover:underline mt-2 inline-block font-medium">
              Host the first event
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}