"use client";

import Link from "next/link";
import { Crown, Heart, Users, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUpLandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                {/* Attendee Card */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
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
                                    Discover Events
                                    <Sparkles className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h2>

                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Browse exclusive events, purchase tickets, and attend unforgettable experiences curated just for you.
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
                                        Personalized recommendations
                                    </li>
                                </ul>

                                <div className="flex items-center gap-2 text-amber-500 font-semibold group-hover:gap-3 transition-all">
                                    Register as Attendee
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Organizer Card */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link href="/sign-up/organizer" className="block group">
                        <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 group-hover:scale-[1.02]">
                            {/* Premium gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                                    <Crown className="w-8 h-8 text-black" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                                    Host Events
                                    <Users className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h2>

                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Create and manage world-class events, sell tickets, and build your audience with powerful organizer tools.
                                </p>

                                <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Create unlimited events
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Advanced analytics dashboard
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Ticket sales & check-in tools
                                    </li>
                                </ul>

                                <div className="flex items-center gap-2 text-amber-500 font-semibold group-hover:gap-3 transition-all">
                                    Register as Organizer
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </Link>
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
