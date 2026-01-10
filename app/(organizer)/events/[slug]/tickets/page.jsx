"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useUserRoles } from "@/hooks/use-user-roles";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, AlertCircle, Armchair, Ticket, ExternalLink, ArrowLeft, ShieldAlert } from "lucide-react";

export default function TicketConfigPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const [seatingMode, setSeatingMode] = useState("GENERAL_ADMISSION");
    const [isSaving, setIsSaving] = useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const { isAdmin, isLoading: isRoleLoading } = useUserRoles();

    // Fetch event data
    const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, {
        slug: unwrappedParams.slug,
    });

    // Fetch ticket tiers (implementation placeholder - assuming existing or simple list for now)
    const { data: ticketTiers } = useConvexQuery(api.tickets.getTicketTiers,
        event?._id ? { eventId: event._id } : "skip"
    );

    // Mutation to update seating mode
    const { mutate: updateSeatingMode } = useConvexMutation(api.events_seating.updateSeatingMode);

    useEffect(() => {
        if (event?.seatingMode) {
            setSeatingMode(event.seatingMode);
        }
    }, [event]);

    const handleModeChange = async (value) => {
        setSeatingMode(value);
        // Auto-save on change? Or wait for explicit save? 
        // Plan suggests explicit save or confirmation if switching to simpler mode
    };

    const handleSaveMode = async () => {
        if (!event?._id) return;

        if (seatingMode === "GENERAL_ADMISSION" && event.seatingMode !== "GENERAL_ADMISSION" && event.venueLayout) {
            // Warn about data loss
            if (!confirm("Switching to General Admission will delete your current venue layout. Are you sure?")) {
                setSeatingMode(event.seatingMode);
                return;
            }
        }

        setIsSaving(true);
        try {
            await updateSeatingMode({
                eventId: event._id,
                seatingMode: seatingMode
            });
            toast.success("Seating mode updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update seating mode");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isRoleLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FBB03B]" />
            </div>
        );
    }

    if (!event) return <div className="p-8 text-white">Event not found</div>;

    // Authorization Guard
    const isOwner = isAuthenticated && user?._id && event.ownerId && user._id === event.ownerId;
    const canManage = isOwner || isAdmin;

    if (!canManage) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-8 text-center">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
                <p className="text-gray-400 mb-6">You do not have permission to configure tickets for this event.</p>
                <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Ticket Configuration</h1>
                        <p className="text-gray-400">Configure how attendees purchase tickets for {event.title?.en || (typeof event.title === "string" ? event.title : "Untitled Event")}</p>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Seating Mode Selection */}
                <Card className="bg-[#18181b] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Armchair className="w-5 h-5 text-[#FBB03B]" /> Seating Mode
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Choose how tickets are allocated to attendees.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={seatingMode} onValueChange={handleModeChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* General Admission Option */}
                            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${seatingMode === "GENERAL_ADMISSION" ? "border-[#FBB03B] bg-[#FBB03B]/5" : "border-white/10 hover:border-white/20"}`}>
                                <RadioGroupItem value="GENERAL_ADMISSION" id="ga" className="sr-only" />
                                <Label htmlFor="ga" className="cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-lg text-white">General Admission</span>
                                        {seatingMode === "GENERAL_ADMISSION" && <Badge className="bg-[#FBB03B] text-black">Selected</Badge>}
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Ticket className="w-8 h-8 text-gray-400 mt-1" />
                                        <div className="text-sm text-gray-400">
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>Simple quantity selection (e.g., "Standard Ticket")</li>
                                                <li>Best for standing concerts, festivals, or simple events</li>
                                                <li>No visual map required</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Label>
                            </div>

                            {/* Reserved Seating Option */}
                            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${seatingMode === "RESERVED_SEATING" ? "border-[#FBB03B] bg-[#FBB03B]/5" : "border-white/10 hover:border-white/20"}`}>
                                <RadioGroupItem value="RESERVED_SEATING" id="rs" className="sr-only" />
                                <Label htmlFor="rs" className="cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-lg text-white">Reserved Seating</span>
                                        {seatingMode === "RESERVED_SEATING" && <Badge className="bg-[#FBB03B] text-black">Selected</Badge>}
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Armchair className="w-8 h-8 text-gray-400 mt-1" />
                                        <div className="text-sm text-gray-400">
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>Attendees pick specific seats from a map</li>
                                                <li>Best for theaters, stadiums, or galas</li>
                                                <li>Requires Venue Builder configuration</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>

                        {seatingMode !== event.seatingMode && (
                            <div className="mt-6 flex items-center justify-end">
                                <Button
                                    onClick={handleSaveMode}
                                    disabled={isSaving}
                                    className="bg-[#FBB03B] text-black hover:bg-[#e09e35]"
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Update Mode
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Venue Builder Access */}
                {(event.seatingMode === "RESERVED_SEATING" || event.seatingMode === "HYBRID") && (
                    <Card className="bg-[#18181b] border-[#FBB03B]/30 border shadow-lg shadow-[#FBB03B]/5">
                        <CardHeader>
                            <CardTitle className="text-white">Venue Configuration</CardTitle>
                            <CardDescription className="text-gray-400">
                                Design your seat map and assign ticket tiers to seats.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/30 p-4 rounded-md border border-white/10 mb-4">
                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Current Layout</h4>
                                <p className="text-xs text-gray-500">
                                    {event.venueLayout ?
                                        `${event.venueLayout.sections?.length || 0} sections configured` :
                                        "No layout configured yet."}
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push(`/events/${unwrappedParams.slug}/venue-builder`)}
                                className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white border border-white/10"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Launch Venue Builder
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Ticket Tier Management (Placeholder for context) */}
                <Card className="bg-[#18181b] border-white/10 opacity-75">
                    <CardHeader>
                        <CardTitle className="text-white">Ticket Tiers</CardTitle>
                        <CardDescription className="text-gray-400">
                            Define the price points aka "Inventory".
                            {seatingMode !== "GENERAL_ADMISSION" && " These will be assigned to seats in the Venue Builder."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {ticketTiers?.map(tier => (
                                <div key={tier._id} className="flex justify-between items-center p-3 rounded bg-black/20 border border-white/5">
                                    <div>
                                        <div className="font-medium text-white">{tier.name}</div>
                                        <div className="text-xs text-gray-400">Price: ৳{tier.price || tier.pricing?.basePrice}</div>
                                    </div>
                                    <Badge variant="outline" className="border-white/20 text-gray-400">
                                        {tier.capacity || tier.inventory?.totalQuantity} units
                                    </Badge>
                                </div>
                            ))}
                            {(!ticketTiers || ticketTiers.length === 0) && (
                                <p className="text-sm text-gray-500 italic">No inventory tiers defined yet.</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                            Manage Inventory Tiers
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}
