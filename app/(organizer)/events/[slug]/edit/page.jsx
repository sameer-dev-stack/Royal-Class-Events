"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { State, City, Country } from "country-state-city";
import { CalendarIcon, Loader2, Crown, Upload, Image as ImageIcon, Sparkles, ArrowLeft } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { useUserRoles } from "@/hooks/use-user-roles";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import UnsplashImagePicker from "@/components/unsplash-image-picker";
import { CATEGORIES } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
    title: z.string().min(1, "Event Name is required").min(3, "Title must be at least 3 characters"),
    description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Please select a category"),
    startDate: z.date({ required_error: "Start Date is required" }),
    endDate: z.date({ required_error: "End Date is required" }),
    startTime: z.string().min(1, "Start Time is required").regex(timeRegex, "Invalid time format"),
    endTime: z.string().min(1, "End Time is required").regex(timeRegex, "Invalid time format"),
    locationType: z.enum(["physical", "online"]).default("physical"),
    venue: z.string().optional(),
    address: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    ticketType: z.enum(["free", "paid"]).default("free"),
    ticketPrice: z.number().optional(),
    coverImage: z.string().optional(),
    themeColor: z.string().default("#d97706"),
    seatingMode: z.enum(["GENERAL", "RESERVED"]).default("GENERAL"),
});

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;
    const fileInputRef = useRef(null);

    const [showImagePicker, setShowImagePicker] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { token } = useAuthStore();
    const { isOrganizer, isAdmin, isLoading: isRoleLoading } = useUserRoles();

    const { data: event, isLoading: isEventLoading } = useConvexQuery(api.events.getEventBySlug, { slug });
    const { mutate: updateEvent, isLoading: isUpdating } = useConvexMutation(api.events.updateEvent);
    const { mutate: generateUploadUrl } = useConvexMutation(api.files.generateUploadUrl);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(eventSchema),
    });

    // Pre-fill form data when event is loaded
    useEffect(() => {
        if (event) {
            const startDateTime = new Date(event.timeConfiguration?.startDateTime || event.startDate);
            const endDateTime = new Date(event.timeConfiguration?.endDateTime || event.endDate);

            reset({
                title: event.title?.en || event.title,
                description: event.description?.en || event.description,
                category: event.eventSubType || event.category,
                startDate: startDateTime,
                endDate: endDateTime,
                startTime: format(startDateTime, "HH:mm"),
                endTime: format(endDateTime, "HH:mm"),
                locationType: event.locationConfig?.type === "virtual" ? "online" : "physical",
                venue: event.metadata?.legacyProps?.venueName || event.venue,
                address: event.address,
                country: "BD", // Default or map from event.country
                city: event.metadata?.legacyProps?.city || event.city,
                state: event.metadata?.legacyProps?.state || event.state,
                capacity: event.capacityConfig?.totalCapacity || event.capacity,
                ticketType: event.financials?.pricingModel || event.ticketType,
                ticketPrice: event.metadata?.legacyProps?.ticketPrice || 0,
                coverImage: event.content?.coverImage?.url || event.coverImage,
                themeColor: event.metadata?.legacyProps?.themeColor || "#d97706",
                seatingMode: (event.seatingMode === "RESERVED" || event.seatingMode === "RESERVED_SEATING") ? "RESERVED" : "GENERAL",
            });

            if (event.content?.coverImage?.url || event.coverImage) {
                setImagePreview(event.content?.coverImage?.url || event.coverImage);
            }
        }
    }, [event, reset]);

    const countries = useMemo(() => Country.getAllCountries(), []);
    const selectedCountry = watch("country");
    const startDate = watch("startDate");
    const endDate = watch("endDate");
    const ticketType = watch("ticketType");

    const availableCities = useMemo(() => {
        if (selectedCountry === "BD") {
            return [
                { name: "Dhaka" }, { name: "Chittagong" }, { name: "Sylhet" },
                { name: "Cox's Bazar" }, { name: "Rajshahi" }, { name: "Khulna" },
                { name: "Barisal" }, { name: "Rangpur" }
            ];
        }
        return selectedCountry ? City.getCitiesOfCountry(selectedCountry) : [];
    }, [selectedCountry]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            setValue("coverImage", storageId);
            setImagePreview(URL.createObjectURL(file));
            toast.success("Image uploaded!");
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const combineDateTime = (date, time) => {
        if (!date || !time) return null;
        const [hh, mm] = time.split(":").map(Number);
        const d = new Date(date);
        d.setHours(hh, mm, 0, 0);
        return d;
    };

    const onSubmit = async (data) => {
        try {
            const start = combineDateTime(data.startDate, data.startTime);
            const end = combineDateTime(data.endDate, data.endTime);

            if (end.getTime() <= start.getTime()) {
                toast.error("End date must be after start date.");
                return;
            }

            await updateEvent({
                eventId: event._id,
                title: data.title,
                description: data.description,
                category: data.category,
                startDate: start.getTime(),
                endDate: end.getTime(),
                locationType: data.locationType,
                venue: data.venue,
                address: data.address,
                city: data.city,
                state: data.state,
                country: countries.find(c => c.isoCode === data.country)?.name || data.country,
                capacity: data.capacity,
                ticketType: data.ticketType,
                ticketPrice: data.ticketPrice,
                coverImage: data.coverImage,
                seatingMode: data.seatingMode,
                token,
            });

            toast.success("Event updated successfully! 🎉");
            router.push(`/my-events/${event._id}`);
        } catch (error) {
            toast.error(error.message || "Failed to update event");
        }
    };

    if (isEventLoading || isRoleLoading) {
        return <div className="flex h-screen items-center justify-center font-bold">Loading Event...</div>;
    }

    if (!event) return <div className="p-12 text-center font-bold">Event not found</div>;

    return (
        <div className="min-h-screen bg-background px-6 py-8">
            <div className="max-w-6xl mx-auto mb-8 pt-16">
                <Link href={`/my-events/${event._id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    <Crown className="w-8 h-8 text-[#D4AF37]" />
                    <h1 className="text-4xl font-bold">Edit Event</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-[320px_1fr] gap-10">
                <div className="space-y-6">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 group hover:border-[#D4AF37]/50 transition-all">
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Cover" fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground text-sm">Update Cover Image</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload from PC"}
                            </Button>
                            <Button variant="outline" size="sm" className="text-white" onClick={() => setShowImagePicker(true)}>
                                <Sparkles className="w-4 h-4 mr-2" /> Library
                            </Button>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl shadow-black/10">
                    <div>
                        <Input {...register("title")} placeholder="Event Name" className="text-4xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 h-auto" />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                        <div className="h-px w-full bg-border mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Start</Label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {startDate ? format(startDate, "PPP") : "Pick date"}
                                            <CalendarIcon className="w-4 h-4 opacity-60" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Calendar mode="single" selected={startDate} onSelect={(date) => setValue("startDate", date)} />
                                    </PopoverContent>
                                </Popover>
                                <Input type="time" {...register("startTime")} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">End</Label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {endDate ? format(endDate, "PPP") : "Pick date"}
                                            <CalendarIcon className="w-4 h-4 opacity-60" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Calendar mode="single" selected={endDate} onSelect={(date) => setValue("endDate", date)} />
                                    </PopoverContent>
                                </Popover>
                                <Input type="time" {...register("endTime")} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Category</Label>
                        <Controller
                            control={control}
                            name="category"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-muted-foreground">Location</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                control={control}
                                name="country"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={(val) => { field.onChange(val); setValue("city", ""); }}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Country" /></SelectTrigger>
                                        <SelectContent>
                                            {countries.map((c) => (<SelectItem key={c.isoCode} value={c.isoCode}>{c.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <Controller
                                control={control}
                                name="city"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCountry}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="City" /></SelectTrigger>
                                        <SelectContent>
                                            {availableCities.map((c) => (<SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <Input {...register("venue")} placeholder="Venue Name" />
                        <Input {...register("address")} placeholder="Full address" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Description</Label>
                        <Textarea {...register("description")} placeholder="Details..." rows={4} className="resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-muted-foreground">Ticket Type</Label>
                            <div className="flex items-center gap-6">
                                <Label className="flex items-center gap-2 cursor-pointer font-normal">
                                    <input type="radio" value="free" {...register("ticketType")} className="accent-[#D4AF37]" /> Free
                                </Label>
                                <Label className="flex items-center gap-2 cursor-pointer font-normal">
                                    <input type="radio" value="paid" {...register("ticketType")} className="accent-[#D4AF37]" /> Paid
                                </Label>
                            </div>
                            {ticketType === "paid" && (
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
                                    <Input type="number" placeholder="Price" {...register("ticketPrice", { valueAsNumber: true })} className="pl-8" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Capacity</Label>
                            <Input type="number" {...register("capacity", { valueAsNumber: true })} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-muted-foreground">Seating Mode</Label>
                        <div className="bg-muted/30 p-4 rounded-xl border border-border flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Enable Reserved Seat Map</Label>
                                <p className="text-xs text-muted-foreground">Turn on for stadium/theater style seating.</p>
                            </div>
                            <Controller
                                control={control}
                                name="seatingMode"
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value === "RESERVED"}
                                        onCheckedChange={(checked) => field.onChange(checked ? "RESERVED" : "GENERAL")}
                                        className="data-[state=checked]:bg-[#D4AF37]"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={isUpdating} className="flex-1 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-bold h-12">
                            {isUpdating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>

            {showImagePicker && (
                <UnsplashImagePicker
                    isOpen={showImagePicker}
                    onClose={() => setShowImagePicker(false)}
                    onSelect={(url) => {
                        setValue("coverImage", url);
                        setImagePreview(url);
                        setShowImagePicker(false);
                    }}
                />
            )}
        </div>
    );
}
