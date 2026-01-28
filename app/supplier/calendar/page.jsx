"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Save, Info, Sparkles } from "lucide-react";
import { startOfDay, format } from "date-fns";
import { motion } from "framer-motion";

export default function SupplierCalendarPage() {
    const { token, user } = useAuthStore();

    // Fetch Supplier ID for the current user (assuming 1:1 mapping for now)
    // In a real app, we might get this from the user's profile/session or a separate query
    // For now, we'll try to get it if we can, or rely on the query to resolve it from token if possible.
    // Actually, getSchedule takes supplierId. We need to resolve that first.
    // Let's assume we can get it via a query or if the user object has it.
    // To keep it simple, let's look up the supplier first.

    const mysupplier = useQuery(api.suppliers.getMyProfile, token ? { token } : "skip");

    const [viewDate, setViewDate] = useState(new Date());

    // Calculate start/end of current month view
    const viewStart = startOfDay(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)).getTime();
    const viewEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getTime();

    const schedule = useQuery(api.availability.getSchedule,
        mysupplier ? {
            supplierId: mysupplier._id,
            startDate: viewStart,
            endDate: viewEnd
        } : "skip"
    );

    const addBlock = useMutation(api.availability.addBlock);
    const removeBlock = useMutation(api.availability.removeBlock);

    const [isSaving, setIsSaving] = useState(false);

    // Helper to check if a date has a block
    const getBlockForDate = (date) => {
        if (!schedule?.blocks) return null;
        const t = startOfDay(date).getTime();
        return schedule.blocks.find(b => b.startDateTime === t);
    };

    const handleDateSelect = async (date) => {
        if (!date || !mysupplier || !token) return;
        if (!schedule) return;

        setIsSaving(true);
        try {
            // Check if already blocked
            const existingBlock = getBlockForDate(date);

            if (existingBlock) {
                // Unblock
                await removeBlock({ token, blockId: existingBlock._id });
                toast.success("Date unblocked!");
            } else {
                // Block
                const start = startOfDay(date).getTime();
                const end = start + (24 * 60 * 60 * 1000); // Full day block
                await addBlock({
                    token,
                    startDateTime: start,
                    endDateTime: end,
                    reason: "Manual Block"
                });
                toast.success("Date blocked!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update schedule");
        } finally {
            setIsSaving(false);
        }
    };

    // Prepare modifiers for react-day-picker
    const blockedDays = schedule?.blocks?.map(b => new Date(b.startDateTime)) || [];
    const bookedDays = schedule?.bookings?.map(b => new Date(b.startDateTime)) || [];

    if (mysupplier === undefined || schedule === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    if (mysupplier === null) {
        return <div className="p-10 text-center text-red-500">Supplier profile not found. Please join as a vendor first.</div>;
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Availability Calendar</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage your schedule. Click a date to toggle blocked status.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500/80 rounded-full"></div> Blocked</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500/80 rounded-full"></div> Booked</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Card */}
                <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-zinc-800/50 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                                <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Manage Schedule</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    {isSaving ? "Updating..." : "Tap dates to block/unblock."}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex justify-center">
                        <Calendar
                            mode="single"
                            onSelect={handleDateSelect}
                            onMonthChange={setViewDate}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl"
                            modifiers={{
                                blocked: blockedDays,
                                booked: bookedDays
                            }}
                            modifiersStyles={{
                                blocked: { color: 'white', backgroundColor: '#ef4444' }, // Red
                                booked: { color: 'white', backgroundColor: '#3b82f6', cursor: 'default' } // Blue
                            }}
                            classNames={{
                                day_today: "bg-zinc-800 text-[#D4AF37] font-bold",
                                head_cell: "text-zinc-500 font-bold uppercase text-[10px] tracking-widest",
                                nav_button: "hover:bg-zinc-800 text-zinc-400 transition-colors",
                                caption: "font-semibold text-white",
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Info & Summary Card */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900/50 border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                                Your Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-zinc-500">Upcoming Bookings</h4>
                                {schedule.bookings.length === 0 ? (
                                    <p className="text-sm text-zinc-600 italic">No confirmed bookings this month.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {schedule.bookings.slice(0, 3).map(b => (
                                            <div key={b._id} className="text-sm bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg text-blue-200">
                                                {format(new Date(b.startDateTime), "MMM d")} - {b.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-zinc-500">Blocked Dates</h4>
                                {schedule.blocks.length === 0 ? (
                                    <p className="text-sm text-zinc-600 italic">No manual blocks.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {[...schedule.blocks].sort((a, b) => a.startDateTime - b.startDateTime).slice(0, 5).map(b => (
                                            <span key={b._id} className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded">
                                                {format(new Date(b.startDateTime), "MMM d")}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Global Hover Style override */}
            <style jsx global>{`
                .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_outside) {
                    background-color: #27272a;
                }
            `}</style>
        </div>
    );
}

