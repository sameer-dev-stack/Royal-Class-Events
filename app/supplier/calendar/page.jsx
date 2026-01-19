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
    const { token } = useAuthStore();
    const existingAvailability = useQuery(api.suppliers.getAvailability, token ? { token } : "skip");
    const updateAvailability = useMutation(api.suppliers.updateAvailability);

    const [selectedDates, setSelectedDates] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize state from backend data
    useEffect(() => {
        if (existingAvailability) {
            setSelectedDates(existingAvailability.map(ts => new Date(ts)));
        }
    }, [existingAvailability]);

    const handleDateSelect = (dates) => {
        // react-day-picker returns an array of dates in 'multiple' mode
        setSelectedDates(dates || []);
    };

    const handleSave = async () => {
        if (!token) return;
        setIsSaving(true);
        try {
            // Convert dates to timestamps (start of day)
            const timestamps = selectedDates.map(d => startOfDay(d).getTime());

            await updateAvailability({
                token,
                availability: timestamps
            });

            toast.success("Schedule updated successfully! 🎉");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update schedule.");
        } finally {
            setIsSaving(false);
        }
    };

    if (existingAvailability === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Availability Calendar</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Mark dates when you are unavailable or already booked.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#D4AF37] hover:bg-[#8C7326] text-black font-bold h-12 px-6 rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
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
                                <CardTitle className="text-xl">Manage Dates</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Click dates to toggle your availability state.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex justify-center">
                        <Calendar
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={handleDateSelect}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl"
                            classNames={{
                                day_selected: "bg-[#D4AF37] text-black hover:bg-[#8C7326] focus:bg-[#D4AF37] focus:text-black font-bold pointer-events-auto",
                                day_today: "bg-zinc-800 text-[#D4AF37]",
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
                                <Info className="w-5 h-5 text-[#D4AF37]" />
                                Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                            <p>
                                <strong className="text-white">Marking Busy:</strong> Select dates when you are fully booked or taking time off.
                            </p>
                            <p>
                                <strong className="text-white">Client View:</strong> These dates will appear as "Unavailable" in your public storefront booking widget.
                            </p>
                            <p>
                                <strong className="text-white">Multi-Select:</strong> You can click multiple dates to select or deselect them.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#8C7326]/5 border-[#D4AF37]/20 rounded-3xl overflow-hidden backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-[#D4AF37]">
                                <Sparkles className="w-5 h-5" />
                                Selection Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400 font-medium">Currently Selected</span>
                                    <span className="text-white font-bold px-2 py-1 bg-zinc-800 rounded-lg">
                                        {selectedDates.length} days
                                    </span>
                                </div>

                                <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedDates.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 mt-4">
                                            {[...selectedDates].sort((a, b) => a - b).map((date, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={i}
                                                    className="flex items-center justify-between text-xs py-2 px-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50"
                                                >
                                                    <span className="text-zinc-300">{format(date, "EEEE")}</span>
                                                    <span className="text-white font-mono">{format(date, "MMM dd, yyyy")}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-zinc-600 italic py-8 text-center">
                                            No unavailable dates selected.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Global Hover Style override for the calendar because we're using dark mode */}
            <style jsx global>{`
                .rdp-day:hover:not(.rdp-day_selected) {
                    background-color: #1a1a1a !important;
                    color: white !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

