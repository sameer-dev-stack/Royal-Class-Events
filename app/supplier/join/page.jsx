"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { motion, AnimatePresence } from "framer-motion";
import {
    Store,
    MapPin,
    Mail,
    Phone,
    Instagram,
    Globe,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Categories
const CATEGORIES = [
    "Venue",
    "Catering",
    "Photography",
    "Cinematography",
    "Decor",
    "Planning",
    "Makeup",
    "Music",
    "Transportation",
    "Attire",
];

const STEPS = [
    { id: 1, title: "Category", description: "What services do you offer?" },
    { id: 2, title: "Details", description: "Tell us about your business" },
    { id: 3, title: "Location", description: "Where are you based?" },
];

export default function SupplierJoinPage() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const onboardMutation = useMutation(api.suppliers.onboard);

    // Skip query if no token
    const existingSupplier = useQuery(api.suppliers.getMyProfile, token ? { token } : "skip");

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        categories: [],
        description: "",
        email: "",
        phone: "",
        website: "",
        instagram: "",
        city: "",
        country: "Bangladesh",
        address: "",
    });

    // Auto-redirect if already a supplier
    useEffect(() => {
        if (existingSupplier) {
            router.replace("/supplier/dashboard");
        }
    }, [existingSupplier, router]);

    if (existingSupplier) {
        return null;
    }

    const handleNext = () => {
        if (isStepValid() && step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Separate Submit Function
    const triggerSubmit = async () => {
        console.log("🚀 Triggering Submit...");

        if (!token) {
            console.error("❌ No Token Found!");
            toast.error("Please log in to join.");
            return;
        }

        setLoading(true);
        try {
            console.log("📦 Payload:", formData);

            const slug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

            await onboardMutation({
                token,
                name: formData.name,
                slug,
                categories: formData.categories,
                description: formData.description,
                contact: {
                    email: formData.email || user?.email || "",
                    phone: formData.phone,
                    website: formData.website,
                    instagram: formData.instagram,
                },
                location: {
                    city: formData.city,
                    country: formData.country,
                    address: formData.address,
                },
            });

            toast.success("Welcome to the Royal Marketplace! 👑");
            // Small delay for toast
            setTimeout(() => {
                window.location.href = "/supplier/dashboard";
            }, 1000);

        } catch (error) {
            console.error("❌ Onboarding Error:", error);
            toast.error(error.message || "Failed to join.");
            setLoading(false); // Only stop loading on error
        }
    };

    const toggleCategory = (cat) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter((c) => c !== cat)
                : [...prev.categories, cat],
        }));
    };

    const isStepValid = () => {
        if (step === 1) return formData.categories.length > 0;
        if (step === 2) return formData.name.trim().length > 0 && formData.phone.trim().length > 0;
        if (step === 3) return formData.city.trim().length > 0 && formData.address.trim().length > 0;
        return false;
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-6 shadow-lg shadow-amber-500/20">
                        <Store className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Join the <span className="text-amber-500">Royal Marketplace</span>
                    </h1>
                    <p className="text-zinc-400">
                        Grow your business with premium clients.
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl backdrop-blur-sm">
                    {/* Steps UI */}
                    <div className="flex justify-between items-center mb-8 px-4">
                        {STEPS.map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                        step >= s.id
                                            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                                            : "bg-zinc-800 text-zinc-500"
                                    )}
                                >
                                    {s.id}
                                </div>
                                <span className={cn("text-xs font-medium", step >= s.id ? "text-amber-500" : "text-zinc-600")}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-semibold text-white">Select your Services</h2>
                                        <p className="text-sm text-zinc-400">Choose all that apply</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button" // Explicitly button
                                                onClick={() => toggleCategory(cat)}
                                                className={cn(
                                                    "p-3 rounded-xl border text-sm font-medium transition-all",
                                                    formData.categories.includes(cat)
                                                        ? "bg-amber-500 text-black border-amber-500"
                                                        : "bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:border-zinc-600"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label>Business Name *</Label>
                                            <Input
                                                required
                                                placeholder="e.g. Royal Photography"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-zinc-950 border-zinc-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                placeholder="Short bio..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="bg-zinc-950 border-zinc-800"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Business Email</Label>
                                                <Input
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="bg-zinc-950 border-zinc-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phone Number *</Label>
                                                <Input
                                                    required
                                                    placeholder="+880..."
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="bg-zinc-950 border-zinc-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>City *</Label>
                                                <Input
                                                    required
                                                    placeholder="Dhaka"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="bg-zinc-950 border-zinc-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Country</Label>
                                                <Input
                                                    disabled
                                                    value={formData.country}
                                                    className="bg-zinc-950 border-zinc-800 text-zinc-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Full Address *</Label>
                                            <Textarea
                                                required
                                                placeholder="Office Address..."
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="bg-zinc-950 border-zinc-800"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
                        {step > 1 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                className="text-zinc-400 hover:text-white"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        ) : <div />}

                        {step < 3 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className="bg-amber-500 hover:bg-amber-600 text-black px-8"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button" // CHANGED from submit to button to force onClick
                                onClick={triggerSubmit} // Direct Handler
                                disabled={!isStepValid() || loading}
                                className="bg-amber-500 hover:bg-amber-600 text-black px-8 font-bold"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Complete Setup
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}