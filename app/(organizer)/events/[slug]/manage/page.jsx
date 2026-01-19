"use client";

import { useParams, useRouter } from "next/navigation";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useUserRoles } from "@/hooks/use-user-roles";
import useAuthStore from "@/hooks/use-auth-store";
import {
    Loader2,
    ArrowLeft,
    Settings,
    Users,
    Layout,
    Grid3X3,
    BarChart3,
    ExternalLink,
    ShieldAlert,
    Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function EventManagePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;
    const { isAuthenticated, user } = useAuthStore();
    const { isAdmin, isLoading: isRoleLoading } = useUserRoles();

    const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, { slug });

    if (isLoading || isRoleLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" /></div>;
    }

    if (!event) {
        return <div className="container mx-auto p-12 text-center font-bold">Event not found</div>;
    }

    // Authorization Guard
    const isOwner = isAuthenticated && user?._id && event.ownerId && user._id === event.ownerId;
    const canManage = isOwner || isAdmin;

    if (!canManage) {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center space-y-6 max-w-md mx-auto text-center px-6">
                <div className="p-4 bg-red-500/10 rounded-full">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Access Restricted</h1>
                    <p className="text-muted-foreground">You do not have permission to manage this event. Only the event organizer or an admin can access this page.</p>
                </div>
                <Button onClick={() => router.push("/dashboard")} className="w-full">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const sections = [
        {
            title: "Basic Details",
            description: "Edit title, date, location, and description.",
            icon: Edit3,
            link: `/events/${slug}/edit`,
            color: "text-[#D4AF37]"
        },
        {
            title: "Venue & Layout",
            description: "Design the physical space and zones.",
            icon: Layout,
            link: `/events/${slug}/venue-builder`,
            color: "text-blue-500"
        },
        {
            title: "Seat Designer",
            description: "Arrange seats and set pricing for individual spots.",
            icon: Grid3X3,
            link: `/seat-builder?eventId=${event._id}`,
            color: "text-[#D4AF37]"
        },
        {
            title: "Attendees",
            description: "Manage registrations and check-ins.",
            icon: Users,
            link: `/my-events/${event._id}`,
            color: "text-green-500"
        },
        {
            title: "Analytics",
            description: "Track sales and performance metrics.",
            icon: BarChart3,
            link: `/my-events/${event._id}`, // Shared for now
            color: "text-purple-500"
        }
    ];

    return (
        <div className="container mx-auto p-6 max-w-5xl py-12 space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="-ml-2">
                    <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link>
                </Button>
                <Button variant="outline" asChild size="sm" className="border-white/10">
                    <Link href={`/events/${slug}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" /> View Public Page
                    </Link>
                </Button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black tracking-tight">{event.title?.en || (typeof event.title === "string" ? event.title : "Untitled Event")}</h1>
                    <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">
                        {event.status?.current || 'Draft'}
                    </Badge>
                </div>
                <p className="text-muted-foreground">{event.eventSubType || event.category} • {event.city}, {event.country}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <Card key={section.title} className="bg-card/40 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all group">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className={`p-3 rounded-xl bg-background border border-white/5 ${section.color}`}>
                                <section.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">{section.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-sm">{section.description}</p>
                            <Button asChild className="w-full bg-secondary hover:bg-secondary/80 text-foreground group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                                <Link href={section.link}>Manage {section.title.split(' ')[0]}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
