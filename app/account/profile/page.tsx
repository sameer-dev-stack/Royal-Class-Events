"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    User,
    Mail,
    Briefcase,
    Camera,
    Sparkles,
    RefreshCw,
    Crown,
    ChevronRight,
    ShieldCheck,
    CheckCircle2
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import useAuthStore from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().max(200, "Bio must be under 200 characters").optional(),
});

export default function ProfileSettingsPage() {
    const router = useRouter();
    const { token, user, updateUser, role } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const updateProfile = useMutation(api.users.updateProfile);
    const upgradeToOrganizer = useMutation(api.users.upgradeToOrganizer);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            bio: user?.profile?.bio || "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || "",
                bio: user.profile?.bio || "",
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        if (!token) return;
        setIsSaving(true);
        try {
            const result = await updateProfile({
                token,
                name: data.name,
                bio: data.bio,
            });

            if (result.success) {
                updateUser({ name: data.name, profile: { ...user.profile, bio: data.bio } });
                toast.success("Profile updated successfully", {
                    className: "bg-zinc-900 border-amber-500/50 text-amber-500 font-bold",
                });
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgrade = async () => {
        const currentToken = useAuthStore.getState().token;
        if (!currentToken) {
            toast.error("Authentication session missing. Please sign in again.");
            return;
        }

        setIsUpgrading(true);
        try {
            const result = await upgradeToOrganizer({ token: currentToken });
            if (result.success && result.user) {
                // 1. Instant State Update (Optimistic/Immediate)
                updateUser(result.user);

                toast.success("Account Upgraded to Organizer!", {
                    icon: <Crown className="w-5 h-5 text-amber-500" />,
                    className: "bg-zinc-900 border-amber-500/50 text-amber-500 font-bold",
                });

                // 2. Smooth Redirect to Dashboard
                setTimeout(() => {
                    router.push("/dashboard");
                }, 800);
            } else {
                toast.error(result.message || "Upgrade failed");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            toast.error("Upgrade failed. Please check your connection.");
        } finally {
            setIsUpgrading(false);
        }
    };

    const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "RC";
    const isOrganizer = role === "organizer";
    const roleColor = isOrganizer ? "amber-500" : "blue-500";
    const borderColor = isOrganizer ? "border-amber-500 shadow-amber-500/20" : "border-blue-500 shadow-blue-500/20";

    return (
        <div className="max-w-3xl space-y-10">
            {/* Profile Header Card */}
            <section className="relative overflow-hidden p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 space-y-8 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group/avatar">
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-tr rounded-full blur-xl group-hover/avatar:blur-2xl transition-all",
                            isOrganizer ? "from-amber-500/20 to-white/10" : "from-blue-500/20 to-white/10"
                        )} />
                        <Avatar className={cn(
                            "w-32 h-32 border-4 bg-zinc-800 shadow-2xl relative transition-all duration-500",
                            borderColor
                        )}>
                            <AvatarImage src={user?.image} />
                            <AvatarFallback className={cn(
                                "bg-zinc-800 text-3xl font-black transition-colors",
                                isOrganizer ? "text-amber-500" : "text-blue-500"
                            )}>{initials}</AvatarFallback>
                        </Avatar>
                        <button className={cn(
                            "absolute bottom-0 right-0 w-10 h-10 text-black rounded-xl border-4 border-zinc-900 flex items-center justify-center hover:scale-110 transition-transform",
                            isOrganizer ? "bg-amber-500" : "bg-blue-500"
                        )}>
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-black italic tracking-tight">{user?.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Crown className="w-3 h-3" />
                                {role?.toUpperCase() || "ATTENDEE"}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" />
                                Verified Account
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Form */}
            <Card className="p-8 md:p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-2xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                                    <Input
                                        {...register("name")}
                                        className="h-14 pl-12 rounded-2xl bg-zinc-950 border-white/5 focus:border-amber-500/50 transition-all font-medium"
                                        placeholder="Enter your name"
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</label>
                                <div className="relative opacity-50 cursor-not-allowed">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        value={user?.email || ""}
                                        disabled
                                        className="h-14 pl-12 rounded-2xl bg-black border-white/5 cursor-not-allowed font-medium"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground/60 italic ml-1">* Email cannot be modified for security</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Bio / Narrative</label>
                            <Textarea
                                {...register("bio")}
                                className="min-h-[120px] rounded-2xl bg-zinc-950 border-white/5 focus:border-amber-500/50 transition-all resize-none p-4 font-medium"
                                placeholder="Tell the Royal community about yourself..."
                            />
                            {errors.bio && <p className="text-xs text-red-500 mt-1 ml-1">{errors.bio.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving || !isDirty}
                            className="h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-xs gap-2 group shadow-xl shadow-amber-500/10 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Upgrade Bridge */}
            {role !== "organizer" && (
                <motion.section
                    whileHover={{ scale: 1.01 }}
                    className="relative overflow-hidden p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border border-amber-500/20 shadow-3xl group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Crown className="w-32 h-32 text-amber-500" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="space-y-4 max-w-lg">
                            <h3 className="text-3xl font-black italic tracking-tighter leading-none">
                                Host Your Own <br />
                                <span className="text-amber-500 uppercase">Experiences.</span>
                            </h3>
                            <p className="text-muted-foreground font-light text-sm leading-relaxed">
                                Upgrade to an Organizer account to gain access to our custom venue builder,
                                ticket management system, and marketing spotlights.
                            </p>
                        </div>

                        <Button
                            onClick={handleUpgrade}
                            disabled={isUpgrading}
                            className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-amber-500 font-bold uppercase tracking-widest text-xs gap-3 shadow-2xl transition-all"
                        >
                            {isUpgrading ? "Upgrading..." : "Switch to Organizer"}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </motion.section>
            )}
        </div>
    );
}
