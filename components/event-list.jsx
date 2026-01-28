"use client";

import { CATEGORIES } from "@/lib/data";
import EventCard from "./event-card";
import EventCardSkeleton from "./event-card-skeleton";
import { Loader2, Crown, ArrowRight, CalendarX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function EventList() {
  const router = useRouter();

  // Convex Query  
  const events = useQuery(api.explore.getPopularEvents, { limit: 50 }) || [];
  const isLoading = events === undefined;

  // 2. Loading State
  if (isLoading || !events) {
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
    const cat = event.category || event.event_type; // Match Supabase column naming
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const upcomingEvents = events
    .filter((e) => new Date(e.start_date) > new Date())
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
                href={`/explore?category=${category.id}`}
                key={category.id}
                className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]"
              >
                <div className="mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-[#D4AF37]transition-colors">
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
      {upcomingEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#D4AF37]" />
              <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
            </div>
            <Link href="/explore" className="text-[#D4AF37] hover:text-[#F7E08B] flex items-center gap-2 text-sm font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => router.push(`/events/${event.slug || event.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
