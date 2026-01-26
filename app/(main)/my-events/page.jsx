"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUserRoles } from "@/hooks/use-user-roles";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event-card";

export default function MyEventsPage() {
  const router = useRouter();

  // Role Check
  const { isOrganizer, isAdmin, isLoading: isRoleLoading, user } = useUserRoles();

  useEffect(() => {
    if (!isRoleLoading && user && !isOrganizer && !isAdmin) {
      toast.error("You need an Organizer account to view this page.");
      router.push("/");
    }
  }, [isRoleLoading, user, isOrganizer, isAdmin, router]);

  // Supabase State
  const { supabase } = useSupabase();
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Fetch Events
  useEffect(() => {
    if (!user) return; // Wait for role check

    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load events", err);
        toast.error("Could not load your events");
      } finally {
        setIsLoadingEvents(false);
      }
    }
    loadEvents();
  }, [user, supabase]);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success("Event deleted successfully");
      // Optimistic update
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };



  const handleEventClick = (eventId) => {
    router.push(`/my-events/${eventId}`);
  };

  // If loading or not authorized, show loader
  const isAuthorized = user && (isOrganizer || isAdmin);

  if (isLoadingEvents || isRoleLoading || !isAuthorized) {
    return (
      <div className="min-h-screen pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 mt-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">Manage your created events</p>
          </div>
        </div>

        {events?.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-2xl font-bold">No events yet</h2>
              <p className="text-muted-foreground">
                Create your first event and start managing attendees
              </p>
              <Button asChild className="gap-2">
                <Link href="/create-event">
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                action="event"
                onClick={() => handleEventClick(event.id)}
                onDelete={() => handleDelete(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
