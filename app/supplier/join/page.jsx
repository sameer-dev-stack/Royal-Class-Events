"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useUserRoles } from "@/hooks/use-user-roles";
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
    ShieldCheck,
    CreditCard,
    FileText,
    Building2,
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
    { id: 1, title: "Category", description: "Offerings" },
    { id: 2, title: "Details", description: "Business Info" },
    { id: 3, title: "Location", description: "Service Area" },
    { id: 4, title: "Verification", description: "Legal Docs" },
    { id: 5, title: "Financials", description: "Payouts" },
];

export default function SupplierJoinPage() {
    const router = useRouter();
    const { supabase } = useSupabase();
    const { user, isVendor, isLoading: isAuthLoading } = useUserRoles();

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
        license_url: "",
        id_proof_url: "",
        bank_name: "",
        account_number: "",
        account_holder: "",
    });

    // Auto-redirect if already a vendor
    useEffect(() => {
        if (!isAuthLoading && isVendor) {
            router.replace("/supplier/dashboard");
        }
    }, [isVendor, isAuthLoading, router]);

    if (isAuthLoading || (user && isVendor)) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    const handleNext = () => {
        if (isStepValid() && step < 5) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinalSubmit = async () => {
        if (!user) {
            toast.error("You must be logged in to join.");
            return;
        }

        setLoading(true);
        try {
            const slug = formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

            // 1. Create Supplier Profile in Supabase
            const { error: supplierError } = await supabase
                .from('suppliers')
                .insert([{
                    user_id: user.id,
                    name: formData.name,
                    slug,
                    description: formData.description,
                    categories: formData.categories,
                    contact_info: {
                        email: formData.email || user.email,
                        phone: formData.phone,
                        website: formData.website,
                        instagram: formData.instagram,
                    },
                    location: {
                        city: formData.city,
                        country: formData.country,
                        address: formData.address,
                    },
                    license_url: formData.license_url,
                    id_proof_url: formData.id_proof_url,
                    bank_details: {
                        bank_name: formData.bank_name,
                        account_number: formData.account_number,
                        account_holder: formData.account_holder,
                    },
                    status: 'active',
                    verification_status: 'pending'
                }]);

            if (supplierError) throw supplierError;

            // 2. Upgrade User Role to 'vendor'
            const { error: roleError } = await supabase
                .from('profiles')
                .update({ role: 'vendor' })
                .eq('id', user.id);

            if (roleError) throw roleError;

            toast.success("Welcome to the Royal Marketplace! 👑");
            setTimeout(() => {
                window.location.href = "/supplier/dashboard";
            }, 1200);

        } catch (error) {
            console.error("❌ Onboarding Failed:", error);
            toast.error(error.message || "Failed to complete setup.");
            setLoading(false);
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
        switch (step) {
            case 1: return formData.categories.length > 0;
            case 2: return formData.name.trim().length > 0 && formData.phone.trim().length > 0;
            case 3: return formData.city.trim().length > 0 && formData.address.trim().length > 0;
            case 4: return formData.license_url.trim().length > 0 && formData.id_proof_url.trim().length > 0;
            case 5: return formData.bank_name.trim().length > 0 && formData.account_number.trim().length > 0;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-zinc-950 to-zinc-950">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F7E08B] to-[#D4AF37] mb-8 shadow-[0_0_40px_rgba(212,175,55,0.2)] border-4 border-white/10"
                    >
                        <Store className="w-10 h-10 text-black" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 italic tracking-tighter text-center">
                        Seller <span className="bg-gradient-to-r from-[#D4AF37] to-[#F7E08B] bg-clip-text text-transparent">Center</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Complete your professional profile to start selling on Royal Class.
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

                    {/* Steps UI */}
                    <div className="flex justify-between items-center mb-12 relative">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-800 -z-10" />
                        {STEPS.map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-3 relative bg-zinc-900/40 px-2 min-w-[60px]">
                                <motion.div
                                    animate={{
                                        scale: step === s.id ? 1.2 : 1,
                                        backgroundColor: step >= s.id ? "#D4AF37" : "#27272a"
                                    }}
                                    className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all",
                                        step >= s.id ? "text-black shadow-lg shadow-[#D4AF37]/20" : "text-zinc-600"
                                    )}
                                >
                                    {s.id}
                                </motion.div>
                                <span className={cn("text-[8px] font-black uppercase tracking-widest text-center", step >= s.id ? "text-[#D4AF37]" : "text-zinc-700")}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="min-h-[350px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-white mb-2">Primary Specialization</h2>
                                        <p className="text-muted-foreground text-sm">Which categories define your business best?</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={cn(
                                                    "p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                    formData.categories.includes(cat)
                                                        ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-xl shadow-[#D4AF37]/10"
                                                        : "bg-white/5 text-zinc-500 border-white/5 hover:border-[#D4AF37]/30 hover:bg-white/10"
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
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Business Name</Label>
                                            <Input
                                                required
                                                placeholder="e.g. Royal Grand Hall"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="h-14 bg-white/5 border-white/5 rounded-xl px-6 focus:border-[#D4AF37]/50"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Brand Story</Label>
                                            <Textarea
                                                placeholder="Premium event services focusing on..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="bg-white/5 border-white/5 rounded-xl px-6 py-4 focus:border-[#D4AF37]/50 min-h-[120px]"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Official Email</Label>
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/5 rounded-xl px-4"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Business Phone</Label>
                                                <Input
                                                    placeholder="+880"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/5 rounded-xl px-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Primary City</Label>
                                                <Input
                                                    placeholder="Dhaka"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/5 rounded-xl px-6"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Country</Label>
                                                <Input
                                                    disabled
                                                    value={formData.country}
                                                    className="h-14 bg-zinc-800/50 border-white/5 rounded-xl px-4 text-zinc-600 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Full Business Address</Label>
                                            <Textarea
                                                placeholder="Street, Block, Area..."
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="bg-white/5 border-white/5 rounded-xl px-6 py-4 min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                        <ShieldCheck className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                        <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest leading-relaxed">
                                            Tiered verification required for Daraz-style marketplace status. Submit legal proof.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Business License URL *</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="URL to scanned license"
                                                    value={formData.license_url}
                                                    onChange={(e) => setFormData({ ...formData, license_url: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/5 rounded-xl pl-12"
                                                />
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Personal ID (NID/Passport) URL *</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="URL to ID proof"
                                                    value={formData.id_proof_url}
                                                    onChange={(e) => setFormData({ ...formData, id_proof_url: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/5 rounded-xl pl-12"
                                                />
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                        <CreditCard className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                        <p className="text-[10px] text-blue-500/80 font-black uppercase tracking-widest leading-relaxed">
                                            Secured payout node. Funds are held in escrow and released to this account.
                                        </p>
                                    </div>
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Settlement Bank Name</Label>
                                            <Input
                                                placeholder="e.g. City Bank / HSBC"
                                                value={formData.bank_name}
                                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                                className="h-14 bg-white/5 border-white/5 rounded-xl px-6"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Account Number</Label>
                                                <Input
                                                    placeholder="0000-0000-0000"
                                                    value={formData.account_number}
                                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/5 rounded-xl px-4"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="uppercase tracking-widest text-[10px] font-black text-zinc-500 ml-1">Owner Name</Label>
                                                <Input
                                                    placeholder="Must match ID proof"
                                                    value={formData.account_holder}
                                                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/5 rounded-xl px-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                        {step > 1 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                className="text-zinc-500 hover:text-white hover:bg-white/5 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>
                        ) : <div />}

                        {step < 5 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className="bg-white text-black hover:bg-zinc-200 px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all"
                            >
                                Next Step
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="bg-[#D4AF37] hover:bg-[#8C7326] text-black px-12 h-14 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Manifest Profile
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
