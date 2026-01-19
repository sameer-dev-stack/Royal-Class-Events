"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RFQModal({ isOpen, onClose, supplierId, supplierName }) {
    const { token, user } = useAuthStore();
    const createLead = useMutation(api.leads.createLead);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(null);
    const [guests, setGuests] = useState("");
    const [budget, setBudget] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please login to contact vendors");
            router.push("/sign-in");
            return;
        }
        if (!date) {
            toast.error("Please select an event date");
            return;
        }
        if (!guests || !budget || !message) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const leadId = await createLead({
                supplierId,
                token,
                eventDate: date.toISOString(),
                guestCount: parseInt(guests),
                budget: parseInt(budget),
                message,
            });

            toast.success("Quote Requested Successfully! 🚀");
            onClose();
            // Reset form
            setDate(null);
            setGuests("");
            setBudget("");
            setMessage("");
            // Redirect to Chat (Phase 32)
            router.push(`/messages/${leadId}`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-background border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#D4AF37]">
                        Contact {supplierName}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Fill in your event details to get a custom quote.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label className="text-foreground">Event Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-card border-input hover:bg-muted text-foreground",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-background border-border">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(d) => d < new Date()}
                                    className="text-foreground"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Guests</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 500"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="bg-card border-input text-foreground placeholder:text-muted-foreground"
                                required
                                min="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Budget (BDT)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 50000"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="bg-card border-input text-foreground placeholder:text-muted-foreground"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Message</Label>
                        <textarea
                            placeholder={`Hi ${supplierName}, I love your work! Is this date available?`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-32 px-3 py-2 bg-card border border-input rounded-md text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                            required
                            minLength={10}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-[#D4AF37] to-[#8C7326] hover:from-[#8C7326] hover:to-[#8C7326] text-black font-bold text-base shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                Send Request
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

