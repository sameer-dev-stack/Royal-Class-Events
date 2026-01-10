"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { useUserRoles } from "@/hooks/use-user-roles";
import useAuthStore from "@/hooks/use-auth-store";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/event-card";

export default function MyEventsPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  // Role Check
  const { isOrganizer, isAdmin, isLoading: isRoleLoading, user } = useUserRoles();

  useEffect(() => {
    if (!isRoleLoading && user && !isOrganizer && !isAdmin) {
      toast.error("You need an Organizer account to view this page.");
      router.push("/");
    }
  }, [isRoleLoading, user, isOrganizer, isAdmin, router]);

  // If loading or not authorized, show loader (same as data loading below)
  const isAuthorized = user && (isOrganizer || isAdmin);

  const { data: events, isLoading } = useConvexQuery(api.events.getMyEvents, { token });
  const { mutate: deleteEvent } = useConvexMutation(api.events.deleteEvent);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations."
    );

    if (!confirmed) return;

    try {
      await deleteEvent({ eventId, token });
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };



  const handleEventClick = (eventId) => {
    router.push(`/my-events/${eventId}`);
  };

  if (isLoading || isRoleLoading || !isAuthorized) {
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
                key={event._id}
                event={event}
                action="event"
                onClick={() => handleEventClick(event._id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
