/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { State, City, Country } from "country-state-city";
import { CalendarIcon, Loader2, Sparkles, Crown, Upload, Image as ImageIcon } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { useUserRoles } from "@/hooks/use-user-roles";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import AIEventCreator from "./_components/ai-event-creator";
import AIIntelligencePanel from "@/components/ai-intelligence-panel";
import { CATEGORIES } from "@/lib/data";
import Image from "next/image";

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
  venueType: z.enum(["manual", "existing", "template", "custom"]).default("manual"),
  venueDesignId: z.string().optional(),
  seatingMode: z.enum(["GENERAL", "RESERVED"]).default("GENERAL"),
});

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // AI Intelligence State
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);

  // TODO: Implement Pro subscription check with Supabase/Stripe
  const hasPro = false;

  // Role Check
  const { token } = useAuthStore();
  const { isOrganizer, isAdmin, isLoading: isRoleLoading, user } = useUserRoles();

  const { mutate: createEvent, isLoading: isCreating } = useConvexMutation(api.events.createEvent);
  const { mutate: generateUploadUrl } = useConvexMutation(api.files.generateUploadUrl);
  const { mutate: createVenueDesign } = useConvexMutation(api.venueDesigns.create);
  const { mutate: upgradeToOrganizer, isLoading: isUpgrading } = useConvexMutation(api.users.upgradeToOrganizer);

  const currentUser = user; // Alias for existing code compatibility

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      themeColor: "#d97706",
      category: "",
      country: "BD",
      state: "",
      city: "Dhaka",
      startTime: "",
      endTime: "",
      venueType: "manual",
      seatingMode: "GENERAL",
    },
  });

  const { data: templates } = useConvexQuery(api.venueDesigns.listTemplates, { token });
  const { data: myDesigns } = useConvexQuery(api.venueDesigns.listMyDesigns, { token });

  const themeColor = watch("themeColor");
  const ticketType = watch("ticketType");
  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const coverImage = watch("coverImage");

  const countries = useMemo(() => Country.getAllCountries(), []);
  const availableStates = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry);
  }, [selectedCountry]);

  const availableCities = useMemo(() => {
    if (!selectedCountry) return [];

    // Custom curated list for Bangladesh
    if (selectedCountry === "BD") {
      return [
        { name: "Dhaka" },
        { name: "Chittagong" },
        { name: "Sylhet" },
        { name: "Cox's Bazar" },
        { name: "Rajshahi" },
        { name: "Khulna" },
        { name: "Barisal" },
        { name: "Rangpur" }
      ];
    }

    const cities = !selectedState
      ? City.getCitiesOfCountry(selectedCountry)
      : City.getCitiesOfState(selectedCountry, selectedState);

    // Remove duplicates by city name
    const uniqueCities = cities.filter((city, index, self) =>
      index === self.findIndex((c) => c.name === city.name)
    );

    return uniqueCities;
  }, [selectedCountry, selectedState]);

  // Determine if user is authorized
  const isAuthorized = isOrganizer || isAdmin;

  // Pre-emptive Auth Guard for Guests
  useEffect(() => {
    if (!isRoleLoading && !user) {
      router.push(`/sign-in?redirect=${encodeURIComponent("/create-event")}`);
    }
  }, [isRoleLoading, user, router]);

  // If loading or not logged in (redirecting), show loader
  if (isRoleLoading || !user) {
    return null; // Don't render anything while redirecting or loading
  }

  // If logged in but not an organizer, show message instead of redirecting immediately
  if (user && !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37]/10 rounded-full">
            <Crown className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Organizer Account Required</h2>
            <p className="text-muted-foreground">
              You are currently signed in as an Attendee. To host events, you need to upgrade to an Organizer account.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={async () => {
                try {
                  await upgradeToOrganizer({ token });
                  toast.success("Account upgraded! Redirecting...");
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } catch (e) {
                  toast.error("Failed to upgrade: " + e.message);
                }
              }}
              disabled={isUpgrading}
              className="h-12 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-bold"
            >
              {isUpgrading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Switch to Organizer Account
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const colorPresets = [
    "#d97706", "#09090b", "#1e3a8a",
    ...(hasPro ? ["#7f1d1d", "#065f46", "#831843", "#4c1d95"] : []),
  ];

  const handleColorClick = (color) => {
    setValue("themeColor", color);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
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

      if (!start || !end) {
        toast.error("Please select both date and time.");
        return;
      }
      if (end.getTime() <= start.getTime()) {
        toast.error("End date/time must be after start date/time.");
        return;
      }

      await createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        tags: [data.category],
        startDate: start.getTime(),
        endDate: end.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationType: data.locationType,
        venue: data.venue || undefined,
        address: data.address || undefined,
        city: data.city,
        state: data.state || undefined,
        country: countries.find(c => c.isoCode === data.country)?.name || data.country,
        capacity: data.capacity,
        ticketType: data.ticketType,
        ticketPrice: data.ticketPrice || undefined,
        coverImage: data.coverImage || undefined,
        themeColor: data.themeColor,
        venueDesignId: undefined, // Venue design is handled later from dashboard
        seatingMode: data.seatingMode,
        hasPro,
        token,
      });

      toast.success("Event created successfully! 🎉");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to create event");
    }
  };

  const handleAIGenerate = (generatedData) => {
    setValue("title", generatedData.title);
    setValue("description", generatedData.description);
    setValue("category", generatedData.category);
    setValue("capacity", generatedData.suggestedCapacity);
    setValue("ticketType", generatedData.suggestedTicketType);
    toast.success("Event details filled!");
  };

  // --- ERROR HANDLER FOR DEBUGGING ---
  const onError = (errors) => {
    console.log("Form Validation Errors:", errors);
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      toast.error(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} to continue.`);
    }
  };

  // --- AI INTELLIGENCE HANDLERS ---
  const handleCheckAI = async () => {
    const country = watch("country");
    const category = watch("category");
    const city = watch("city");
    const capacity = watch("capacity");
    const ticketType = watch("ticketType");

    if (!category || !country || !city || !capacity || !startDate) {
      toast.error("Please fill in Category, Location (Country & City), Capacity, and Start Date first");
      return;
    }

    setIsCheckingAI(true);
    setAiPrediction(null);

    try {
      const response = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          location: `${city}, ${country}`,
          start_date: startDate.toISOString(),
          capacity,
          ticket_type: ticketType,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get analysis');
      }

      setAiPrediction({
        success: true,
        ...result.data,
      });

      toast.success(`AI Analysis Complete! Demand Score: ${result.data.demandScore}/100`);

    } catch (error) {
      console.error('AI analysis error:', error);
      setAiPrediction({
        success: false,
        error: error.message,
      });
      toast.error(error.message || 'Failed to get AI analysis');
    } finally {
      setIsCheckingAI(false);
    }
  };

  const handleUseAIPrice = (price) => {
    setValue("ticketPrice", price);
    setValue("ticketType", "paid");
    toast.success(`Price set to ৳${price}`);
  };

  const handleSaveAndBuild = async () => {
    const title = watch("title");
    const startDate = watch("startDate");
    const seatingMode = watch("seatingMode");

    if (!title || !startDate) {
      toast.error("Please provide at least a Title and Start Date to save a draft.");
      return;
    }

    try {
      const draftStart = startDate.getTime();
      // Default to 2 hours duration for draft
      const draftEnd = draftStart + (2 * 60 * 60 * 1000);

      const eventId = await createEvent({
        title: title,
        description: watch("description") || "Draft Event Description",
        category: watch("category") || "music", // Default category
        tags: ["draft"],
        startDate: draftStart,
        endDate: draftEnd,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationType: watch("locationType") || "physical",
        venue: watch("venue"),
        address: watch("address"),
        city: watch("city") || "Dhaka",
        state: watch("state"),
        country: watch("country") || "Bangladesh",
        capacity: watch("capacity") || 100,
        ticketType: watch("ticketType") || "free",
        ticketPrice: watch("ticketPrice"),
        themeColor: watch("themeColor") || "#d97706",
        seatingMode: "RESERVED", // Explicitly set for this flow
        token,
        hasPro,
      });

      toast.success("Draft saved! Opening Seat Builder...");
      // Redirect to seat builder with the new event ID
      router.push(`/seat-builder?eventId=${eventId}`);
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft. Please ensure you are logged in as an Organizer.");
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300 px-6 py-8 -mt-6 md:-mt-16 lg:-mt-5 lg:rounded-md bg-background"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-5 md:flex-row justify-between mb-10 pt-16 md:pt-20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-foreground/90" />
            <h1 className="text-4xl font-bold text-foreground">Host an Event</h1>
          </div>
          <p className="text-muted-foreground">Curate an exclusive experience.</p>
        </div>
        <AIEventCreator onEventGenerated={handleAIGenerate} />
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-[320px_1fr] gap-10">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 backdrop-blur-sm group hover:border-foreground/20 transition-colors">
            {imagePreview || coverImage ? (
              <Image src={imagePreview || coverImage} alt="Cover" className="w-full h-full object-cover" width={500} height={500} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm font-medium">Add Cover Image</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload from PC
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-white border-white/20 hover:bg-white/10" onClick={() => setShowImagePicker(true)}>
                <Sparkles className="w-4 h-4" /> Choose from Library
              </Button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>


        </div>

        {/* RIGHT: Form */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 bg-card p-8 rounded-2xl border border-border">
          <div>
            <Input {...register("title")} placeholder="Event Name" className="text-4xl font-bold bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/40 px-0 h-auto" />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            <div className="h-px w-full bg-border mt-2" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Start</Label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                      <CalendarIcon className="w-4 h-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-popover border-border text-popover-foreground">
                    <Calendar mode="single" selected={startDate} onSelect={(date) => setValue("startDate", date)} className="bg-popover text-popover-foreground" />
                  </PopoverContent>
                </Popover>
                <Input type="time" {...register("startTime")} className="bg-background border-input text-foreground" />
              </div>
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
              {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">End</Label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                      {endDate ? format(endDate, "PPP") : "Pick date"}
                      <CalendarIcon className="w-4 h-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-popover border-border text-popover-foreground">
                    <Calendar mode="single" selected={endDate} onSelect={(date) => setValue("endDate", date)} disabled={(date) => date < (startDate || new Date())} className="bg-popover text-popover-foreground" />
                  </PopoverContent>
                </Popover>
                <Input type="time" {...register("endTime")} className="bg-background border-input text-foreground" />
              </div>
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
              {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-background border-input text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-muted-foreground">Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val) => { field.onChange(val); setValue("state", ""); setValue("city", ""); }}>
                    <SelectTrigger className="w-full bg-background border-input text-foreground"><SelectValue placeholder="Country" /></SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground max-h-[300px]">
                      {countries.map((c, idx) => (<SelectItem key={`${c.isoCode}-${idx}`} value={c.isoCode}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCountry}>
                    <SelectTrigger className="w-full bg-background border-input text-foreground disabled:opacity-50"><SelectValue placeholder="City" /></SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground max-h-[300px]">
                      {availableCities.map((c) => (<SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            <Input {...register("venue")} placeholder="Venue Name / Google Maps Link" className="bg-background border-input text-foreground placeholder:text-muted-foreground" />
            <Input {...register("address")} placeholder="Full address" className="bg-background border-input text-foreground placeholder:text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea {...register("description")} placeholder="Details..." rows={4} className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none" />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-muted-foreground">Tickets</Label>
              <div className="flex items-center gap-6 text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="free" {...register("ticketType")} className="accent-[#D4AF37] w-4 h-4" /> Free
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="paid" {...register("ticketType")} className="accent-[#D4AF37] w-4 h-4" /> Paid
                </label>
              </div>
              {ticketType === "paid" && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input type="number" placeholder="Price" {...register("ticketPrice", { valueAsNumber: true })} className="pl-8 bg-background border-input text-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Capacity</Label>
              <Input type="number" {...register("capacity", { valueAsNumber: true })} placeholder="100" className="bg-background border-input text-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-muted-foreground">Seating Mode</Label>
            <div className="bg-muted/30 p-4 rounded-xl border border-border flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-foreground">Enable Reserved Seat Map</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Turn on for stadium/theater style seating. Turn off for standing/open events.
                </p>
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

            {watch("seatingMode") === "RESERVED" && (
              <div className="mt-4 p-4 border border-[#D4AF37]/30 bg-[#D4AF37]/10 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[#D4AF37] font-bold">Venue Layout Required</h4>
                    <p className="text-xs text-zinc-400">You need to design the seating map before publishing.</p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSaveAndBuild}
                    disabled={isCreating}
                    className="bg-[#D4AF37] text-black hover:bg-[#8C7326] font-bold"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save & Open Builder 🏗️"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <AIIntelligencePanel
            prediction={aiPrediction}
            loading={isCheckingAI}
            onCheckScore={handleCheckAI}
            onUsePrice={handleUseAIPrice}
          />

          <Button type="submit" disabled={isCreating} className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8C7326] hover:from-[#8C7326] hover:to-[#8C7326] text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all border-none">
            {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : "Publish Event"}
          </Button>
        </form>
      </div>

      {showImagePicker && (
        <UnsplashImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={(url) => {
            setValue("coverImage", url);
            setShowImagePicker(false);
          }}
        />
      )
      }
    </div >
  );
}
