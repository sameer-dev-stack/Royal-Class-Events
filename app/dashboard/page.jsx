"use client";

import { useUserRoles } from "@/hooks/use-user-roles";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, DollarSign, Ticket, Calendar, Crown, ShieldAlert, QrCode } from "lucide-react";
import EventList from "@/components/organizer/event-list";
import Link from "next/link";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";

export default function DashboardPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const { isOrganizer, isLoading: isRoleLoading, user } = useUserRoles();

    const { data: statsData } = useConvexQuery(api.events.getOrganizerStats, isOrganizer ? { token } : "skip");
    const stats = statsData || { revenue: 0, ticketsSold: 0, activeEvents: 0 };
    const { data: events } = useConvexQuery(api.events.getOrganizerEvents, isOrganizer ? { token } : "skip");
    const { mutate: deleteEvent } = useConvexMutation(api.events.deleteEvent);
    const { mutate: upgradeToOrganizer, isLoading: isFixingRole } = useConvexMutation(api.users.upgradeToOrganizer);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteEvent({ eventId: id, token });
            toast.success("Event deleted");
        } catch (e) {
            toast.error("Failed to delete event: " + e.message);
        }
    };

    if (isRoleLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-#D4AF37" /></div>;
    }

    if (!isOrganizer) {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center space-y-6 max-w-md mx-auto text-center px-6">
                <div className="p-4 bg-red-500/10 rounded-full">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Access Restricted</h1>
                    <p className="text-muted-foreground">You need an Organizer account to view this page. Your current account is missing the required permissions.</p>
                </div>
                <div className="flex flex-col w-full gap-3">
                    <Button
                        className="w-full bg-#D4AF37 hover:bg-#8C7326 text-black font-bold h-12"
                        onClick={async () => {
                            try {
                                await upgradeToOrganizer({ token });
                                toast.success("Role upgraded! Refreshing...");
                                setTimeout(() => window.location.reload(), 1000);
                            } catch (e) {
                                toast.error("Failed to upgrade role: " + e.message);
                            }
                        }}
                        disabled={isFixingRole}
                    >
                        {isFixingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Fix My Account Role"}
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/">Return Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl animate-in fade-in duration-500 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight">Organizer Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, <span className="text-foreground font-semibold">{user?.name}</span></p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl">
                        <Link href="/organizer/scan">
                            <QrCode className="mr-2 h-5 w-5" /> Launch Scanner
                        </Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-#D4AF37 to-#8C7326 hover:from-#8C7326 hover:to-amber-700 text-black font-bold h-12 px-6 rounded-xl shadow-lg shadow-#D4AF37/20">
                        <Link href="/create-event">
                            <Plus className="mr-2 h-5 w-5" /> Create New Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-card/50 backdrop-blur-sm border-white/5 shadow-sm hover:border-#D4AF37/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-#D4AF37" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">৳{stats.revenue?.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-white/5 shadow-sm hover:border-#D4AF37/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
                        <Ticket className="h-4 w-4 text-#D4AF37" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.ticketsSold ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all events</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-white/5 shadow-sm hover:border-#D4AF37/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
                        <Calendar className="h-4 w-4 text-#D4AF37" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.activeEvents ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently published</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Events */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Recent Events</h2>
                    <Button variant="ghost" className="text-#D4AF37 hover:text-#8C7326 hover:bg-#D4AF37/10" asChild>
                        <Link href="/my-events">View All</Link>
                    </Button>
                </div>
                <EventList events={events ? events.slice(0, 5) : []} onDelete={handleDelete} />
            </div>
        </div>
    );
}

