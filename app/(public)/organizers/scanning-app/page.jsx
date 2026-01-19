"use client";

import React from "react";
import { motion } from "framer-motion";
import MarketingLayout from "../components/marketing-layout";
import {
    Smartphone,
    WifiOff,
    Zap,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Apple,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function ScanningAppPage() {
    return (
        <MarketingLayout activeSlug="scanning-app">
            {/* Hero */}
            <section className="pt-32 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-#D4AF37/10 border border-#D4AF37/20 text-#D4AF37 text-xs font-bold uppercase tracking-widest">
                            <Smartphone className="w-3 h-3" />
                            Hardware & Softare
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] italic">
                            The <br />
                            <span className="text-gradient-gold">Gatekeeper.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
                            Turn any smartphone into a professional-grade scanner.
                            Process thousands of guests with fortress-level security and zero latency.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button className="h-14 px-8 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white font-bold text-sm gap-3">
                                <Apple className="w-5 h-5" />
                                App Store
                            </Button>
                            <Button className="h-14 px-8 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white font-bold text-sm gap-3">
                                <Play className="w-5 h-5 fill-white" />
                                Google Play
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 relative"
                    >
                        <div className="relative w-full aspect-[4/5] max-w-sm mx-auto bg-zinc-900 rounded-[3rem] border border-white/10 p-4 shadow-3xl">
                            <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-8 space-y-8">
                                {/* Mock Scanner Screens */}
                                <div className="w-full space-y-4">
                                    <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Verified</p>
                                            <p className="text-sm font-bold">VIP Floor Access</p>
                                        </div>
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between opacity-50 grayscale">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Denied</p>
                                            <p className="text-sm font-bold">Duplicate Ticket</p>
                                        </div>
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                </div>

                                <div className="w-full aspect-square rounded-3xl border-2 border-dashed border-#D4AF37/20 flex items-center justify-center relative">
                                    <Zap className="w-12 h-12 text-#D4AF37 animate-pulse" />
                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-#D4AF37 to-transparent animate-scan" />
                                </div>

                                <div className="text-center space-y-1">
                                    <p className="text-xs font-black text-#D4AF37 uppercase tracking-widest">Scanning...</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">892 / 1200 Guests In</p>
                                </div>
                            </div>

                            {/* Floating Glow */}
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-#D4AF37/5 blur-[120px] rounded-full pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-32 px-6 bg-zinc-900/20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <motion.div {...fadeIn} className="space-y-6">
                            <div className="w-16 h-16 bg-#D4AF37/10 rounded-2xl flex items-center justify-center text-#D4AF37">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black italic">Speed Matters.</h3>
                            <p className="text-muted-foreground font-light leading-relaxed">
                                Process up to 2 guests per second across multiple entry points.
                                Real-time cloud sync ensures zero friction for VIP arrivals.
                            </p>
                        </motion.div>

                        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="space-y-6">
                            <div className="w-16 h-16 bg-#D4AF37/10 rounded-2xl flex items-center justify-center text-#D4AF37">
                                <WifiOff className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black italic">Offline Mode.</h3>
                            <p className="text-muted-foreground font-light leading-relaxed">
                                Local database caching allows scanning to continue even if the venue's
                                internet connectivity is compromised. Everything syncs when you're back.
                            </p>
                        </motion.div>

                        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="space-y-6">
                            <div className="w-16 h-16 bg-#D4AF37/10 rounded-2xl flex items-center justify-center text-#D4AF37">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black italic">Fraud Prevention.</h3>
                            <p className="text-muted-foreground font-light leading-relaxed">
                                Instantly flag duplicate or fake tickets. Our Gatekeeper app
                                uses biometric-level security protocols for every scan.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Breakdown */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="p-12 md:p-20 rounded-[4rem] bg-zinc-900 border border-white/5 grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tight">Perform Under Pressure.</h2>
                            <div className="space-y-4">
                                {[
                                    "Process 1,000 guests in 10 minutes",
                                    "Unlimited staff device connections",
                                    "Real-time headcount monitoring",
                                    "Instant ticket list exports"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <CheckCircle2 className="w-5 h-5 text-#D4AF37" />
                                        <span className="font-bold text-sm uppercase tracking-widest text-zinc-400">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center md:text-right space-y-4">
                            <div className="text-7xl md:text-9xl font-black italic text-#D4AF37 opacity-20">2.5M</div>
                            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground">Successful Scans in 2025</p>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}

