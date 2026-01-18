"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Heart, Users, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "@/hooks/use-auth-store";

export default function SignUpLandingPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/explore");
        }
    }, [isAuthenticated, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* ... rest of the component remains the same ... */}
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="bg-amber-500/10 p-3 rounded-full border border-amber-500/20">
                        <Crown className="w-8 h-8 text-amber-500" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Join <span className="text-amber-500">Royal Class</span> Events
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Choose how you want to experience the world of elite events
                </p>
            </motion.div>

            {/* Role Selection - Center Single Card */}
            <div className="max-w-md w-full">
                {/* Attendee Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link href="/sign-up/attendee" className="block group">
                        <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 group-hover:scale-[1.02]">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Heart className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                                    Get Started
                                    <Sparkles className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h2>

                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Join Royal Class to discover exclusive events, book VIP seats, and enjoy a world of elite experiences.
                                </p>

                                <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Access to all public events
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Secure ticket purchases
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        VIP seat selection tools
                                    </li>
                                </ul>

                                <div className="flex items-center gap-2 text-amber-500 font-semibold group-hover:gap-3 transition-all">
                                    Create Free Account
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Info Note about Organizers */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-6 p-4 rounded-2xl border border-border bg-muted/30 text-center"
                >
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <Crown className="w-3 h-3 text-amber-500" />
                        Want to host events? Register as attendee first, then apply for an upgrade from your profile.
                    </p>
                </motion.div>
            </div>

            {/* Already have an account */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 text-muted-foreground"
            >
                Already have an account?{" "}
                <Link href="/sign-in" className="text-amber-500 hover:text-amber-400 font-medium hover:underline">
                    Sign in
                </Link>
            </motion.p>
        </div>
    );
}
