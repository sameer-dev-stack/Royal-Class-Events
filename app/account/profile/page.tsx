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
import { useMutation } from "convex/react";
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
    const updateProfile = useMutation(api.users.updateProfile);
    const { user, updateUser, role, token } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.full_name || user?.name || "",
            bio: user?.metadata?.bio || "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.full_name || user.name || "",
                bio: user.metadata?.bio || "",
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: any) => {
        if (!user?._id) return;
        setIsSaving(true);
        try {
            await updateProfile({
                token: token || "",
                name: data.name,
                bio: data.bio,
            });

            updateUser({
                name: data.name,
                metadata: {
                    ...user.metadata,
                    bio: data.bio
                }
            });

            toast.success("Profile updated successfully", {
                className: "bg-zinc-900 border-[#D4AF37]/50 text-[#D4AF37] font-bold",
            });

        } catch (error: any) {
            console.error("Update error:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgrade = () => {
        router.push("/account/organizer-request");
    };

    const initials = (user?.full_name || user?.name || "RC")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    const isOrganizer = role === "organizer";
    const isAdmin = role === "admin" || role === "superuser";

    // Theme Colors
    const roleColor = isAdmin ? "text-red-500" : isOrganizer ? "text-[#D4AF37]" : "text-blue-500";
    const roleBg = isAdmin ? "bg-red-500/10 border-red-500/20" : isOrganizer ? "bg-[#D4AF37]/10 border-[#D4AF37]/20" : "bg-blue-500/10 border-blue-500/20";
    const borderColor = isAdmin ? "border-red-500 shadow-red-500/20" : isOrganizer ? "border-[#D4AF37] shadow-[#D4AF37]/20" : "border-blue-500 shadow-blue-500/20";
    const gradientColor = isAdmin ? "from-red-500/20" : isOrganizer ? "from-[#D4AF37]/20" : "from-blue-500/20";

    return (
        <div className="max-w-3xl space-y-10">
            {/* Profile Header Card */}
            <section className="relative overflow-hidden p-8 rounded-3xl bg-card border border-border space-y-8 group shadow-sm">
                <div className={cn(
                    "absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2",
                    isAdmin ? "bg-red-500/5" : "bg-[#D4AF37]/5"
                )} />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group/avatar">
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-tr rounded-full blur-xl group-hover/avatar:blur-2xl transition-all",
                            gradientColor,
                            "to-white/10"
                        )} />
                        <Avatar className={cn(
                            "w-32 h-32 border-4 bg-muted shadow-2xl relative transition-all duration-500",
                            borderColor
                        )}>
                            <AvatarImage src={user?.avatar_url || user?.image} />
                            <AvatarFallback className={cn(
                                "bg-muted text-3xl font-black transition-colors",
                                roleColor
                            )}>{initials}</AvatarFallback>
                        </Avatar>
                        <button className={cn(
                            "absolute bottom-0 right-0 w-10 h-10 text-primary-foreground rounded-xl border-4 border-card flex items-center justify-center hover:scale-110 transition-transform",
                            isAdmin ? "bg-red-500" : isOrganizer ? "bg-[#D4AF37]" : "bg-blue-500"
                        )}>
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-black italic tracking-tight text-foreground">{user?.full_name || user?.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border",
                                roleColor,
                                roleBg
                            )}>
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
            <Card className="p-8 md:p-10 rounded-3xl bg-card border border-border shadow-md">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className={cn(
                                        "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors",
                                        isAdmin ? "group-focus-within:text-red-500" : "group-focus-within:text-[#D4AF37]"
                                    )} />
                                    <Input
                                        {...register("name")}
                                        className={cn(
                                            "h-14 pl-12 rounded-2xl bg-background border-border transition-all font-medium text-foreground",
                                            isAdmin ? "focus:border-red-500/50" : "focus:border-[#D4AF37]/50"
                                        )}
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
                                        className="h-14 pl-12 rounded-2xl bg-muted border-border cursor-not-allowed font-medium text-muted-foreground"
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
                                className={cn(
                                    "min-h-[120px] rounded-2xl bg-background border-border transition-all resize-none p-4 font-medium text-foreground",
                                    isAdmin ? "focus:border-red-500/50" : "focus:border-[#D4AF37]/50"
                                )}
                                placeholder="Tell the Royal community about yourself..."
                            />
                            {errors.bio && <p className="text-xs text-red-500 mt-1 ml-1">{errors.bio.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving || !isDirty}
                            className={cn(
                                "h-14 px-10 rounded-2xl text-black font-black uppercase tracking-widest text-xs gap-2 group shadow-xl disabled:opacity-50",
                                isAdmin ? "bg-red-500 hover:bg-red-600 shadow-red-500/10 text-white" : "bg-[#D4AF37] hover:bg-[#8C7326] shadow-[#D4AF37]/10"
                            )}
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

            {/* Upgrade Bridge - Only show if not Organizer AND not Admin */}
            {role !== "organizer" && role !== "admin" && (
                <motion.section
                    whileHover={{ scale: 1.01 }}
                    className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#D4AF37]/10 via-card to-card border border-[#D4AF37]/20 shadow-lg group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Crown className="w-32 h-32 text-[#D4AF37]" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="space-y-4 max-w-lg">
                            <h3 className="text-3xl font-black italic tracking-tighter leading-none text-foreground">
                                Host Your Own <br />
                                <span className="text-[#D4AF37] uppercase">Experiences.</span>
                            </h3>
                            <p className="text-muted-foreground font-light text-sm leading-relaxed">
                                Upgrade to an Organizer account to gain access to our custom venue builder,
                                ticket management system, and marketing spotlights.
                            </p>
                        </div>

                        <Button
                            onClick={handleUpgrade}
                            disabled={isUpgrading}
                            className="h-14 px-8 rounded-2xl bg-foreground text-background hover:bg-[#D4AF37] hover:text-white font-bold uppercase tracking-widest text-xs gap-3 shadow-2xl transition-all"
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

