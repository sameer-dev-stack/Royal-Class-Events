"use client";

import React from "react";
import { motion } from "framer-motion";
import MarketingLayout from "../components/marketing-layout";
import {
    Megaphone,
    Mail,
    MessageSquare,
    TrendingUp,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function MarketingServicesPage() {
    return (
        <MarketingLayout activeSlug="marketing">
            {/* Hero */}
            <section className="pt-32 pb-24 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-#D4AF37/10 border border-#D4AF37/20 text-#D4AF37 text-xs font-bold uppercase tracking-widest mb-6">
                            Growth & Reach
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 italic">
                            Amplify Your <br />
                            <span className="text-gradient-gold">Event Status.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                            Professional marketing tools to ensure your event finds its
                            rightful elite audience.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="pt-8"
                    >
                        <Button asChild className="h-16 px-12 rounded-2xl bg-#D4AF37 hover:bg-#8C7326 text-black font-black uppercase tracking-widest text-lg group">
                            <Link href="/create-event">
                                Request Growth Plan
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Stats Proof */}
            <section className="py-20 border-y border-white/5 bg-zinc-900/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { val: "2X", label: "Faster Sell-out Rate" },
                            { val: "45%", label: "Average ROAS for Partners" },
                            { val: "1.2M", label: "Active Elite Attendee DB" }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-5xl md:text-7xl font-black text-#D4AF37 italic">{stat.val}</p>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Breakdown */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-black italic tracking-tight">Multi-Channel <br /> Spotlight.</h2>
                                <p className="text-lg text-muted-foreground font-light leading-relaxed">
                                    We leverage our global reach to place your event in front of high-intent buyers
                                    across the Royal network.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    {
                                        icon: Globe,
                                        title: "Homepage Spotlights",
                                        desc: "Prime placement on the Royal Class homepage for maximum visibility."
                                    },
                                    {
                                        icon: Mail,
                                        title: "Curated Email Blasts",
                                        desc: "Direct communication to our database of verified luxury event attendees."
                                    },
                                    {
                                        icon: MessageSquare,
                                        title: "Elite SMS Alerts",
                                        desc: "Instant notifications for VIP early-bird releases and last-call tickets."
                                    }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        {...fadeIn}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-8 group"
                                    >
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center text-#D4AF37 group-hover:bg-#D4AF37 group-hover:text-black transition-all">
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black italic">{item.title}</h3>
                                            <p className="text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative z-10 p-1 bg-gradient-to-br from-#D4AF37/20 to-transparent rounded-[3rem]">
                                <div className="bg-zinc-900 rounded-[2.9rem] p-12 space-y-8 border border-white/5">
                                    <h3 className="text-2xl font-black italic">The Marketing Vault</h3>
                                    <div className="space-y-6">
                                        {[
                                            "Dedicated Account Strategist",
                                            "Social Media Management",
                                            "Influencer Partnerships",
                                            "Performance Analytics Report",
                                            "Professional Content Mastery"
                                        ].map((text, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <CheckCircle2 className="w-5 h-5 text-#D4AF37" />
                                                <span className="font-bold text-sm uppercase tracking-widest text-zinc-400">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="w-full h-14 rounded-2xl bg-#D4AF37 hover:bg-#8C7326 text-black font-black uppercase tracking-widest text-xs">
                                        Unlock Full Suite
                                    </Button>
                                </div>
                            </div>

                            {/* Decorative */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-#D4AF37/5 blur-[120px] rounded-full pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Quote */}
            <section className="py-32 px-6 bg-zinc-900/30 overflow-hidden">
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 relative">
                    <Sparkles className="w-12 h-12 text-#D4AF37 animate-pulse" />
                    <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-zinc-200">
                        "Royal Class marketing didn't just sell out our event; it elevated our
                        brand reputation globaly. We reached audiences we didn't even know existed."
                    </p>
                    <div className="space-y-1">
                        <p className="font-bold text-white uppercase tracking-widest text-xs">Alexander Thorne</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">CEO, Elite Festivals</p>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}

