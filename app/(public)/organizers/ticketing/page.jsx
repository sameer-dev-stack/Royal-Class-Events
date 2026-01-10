"use client";

import React from "react";
import { motion } from "framer-motion";
import MarketingLayout from "../components/marketing-layout";
import {
    Box,
    Target,
    TrendingUp,
    ArrowRight,
    ShieldCheck,
    MousePointer2,
    Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function TicketingSolutionsPage() {
    return (
        <MarketingLayout activeSlug="ticketing">
            {/* Hero */}
            <section className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
                            <Box className="w-3 h-3" />
                            The Core Engine
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] italic">
                            The Royal <br />
                            <span className="text-gradient-gold">Seat Engine.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
                            Our proprietary venue builder represents the pinnacle of event architecture.
                            Real-time mapping, dynamic tiers, and absolute reliability.
                        </p>
                        <div className="pt-4">
                            <Button asChild className="h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-sm group">
                                <Link href="/create-event">
                                    Start Building
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/10 group shadow-3xl"
                    >
                        <Image
                            src="/hero_image.jpeg"
                            alt="Venue Builder"
                            fill
                            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <div className="bg-black/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-4 max-w-sm text-center">
                                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mx-auto animate-pulse">
                                    <MousePointer2 className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold tracking-tight">Interactive Plotting</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Drag, drop, and configure thousands of seats in real-time.
                                    What you see is what your customers experience.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-32 px-6 bg-zinc-900/10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tight">Standard-Defining Features.</h2>
                        <p className="text-muted-foreground font-light">Precision tools for precision events.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "Sniper Guard",
                                desc: "Our millisecond-locked locking mechanism ensures zero double bookings, even during stadium-scale traffic spikes."
                            },
                            {
                                icon: TrendingUp,
                                title: "Dynamic Pricing",
                                desc: "Automatically adjust seat prices based on demand markers, time remaining, or section popularity."
                            },
                            {
                                icon: Layers,
                                title: "Multi-Tier Logic",
                                desc: "Create complex ticket hierarchies (VIP, Early Bird, Table Service) with customizable perks and access rules."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                {...fadeIn}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[3rem] bg-zinc-900 border border-white/5 space-y-6 hover:bg-zinc-900/50 transition-all border-b-4 border-b-transparent hover:border-b-amber-500"
                            >
                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black italic">{item.title}</h3>
                                <p className="text-muted-foreground font-light leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration Showcase */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto text-center space-y-16">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tight">Seamless Flow.</h2>
                        <p className="text-muted-foreground font-light max-w-xl mx-auto text-lg leading-relaxed">
                            From the moment an organizer plots a seat to the instant an attendee scans in,
                            the Royal Ecosystem maintains continuous data integrity.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        <div className="flex flex-col items-center gap-4 group">
                            <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/20 transition-all duration-500">
                                <Box className="w-10 h-10 text-amber-500/50" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Drafting</span>
                        </div>
                        <ArrowRight className="hidden md:block w-8 h-8 text-white/10" />
                        <div className="flex flex-col items-center gap-4 group">
                            <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/20 transition-all duration-500">
                                <TrendingUp className="w-10 h-10 text-amber-500/50" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sale Phase</span>
                        </div>
                        <ArrowRight className="hidden md:block w-8 h-8 text-white/10" />
                        <div className="flex flex-col items-center gap-4 group">
                            <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/20 transition-all duration-500">
                                <ShieldCheck className="w-10 h-10 text-amber-500" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-white">Full Occupancy</span>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
