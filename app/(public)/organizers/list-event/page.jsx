"use client";

import React from "react";
import { motion } from "framer-motion";
import MarketingLayout from "../components/marketing-layout";
import TestimonialCarousel from "../components/testimonial-carousel";
import {
    Plus,
    Map,
    Rocket,
    ArrowRight,
    ShieldCheck,
    Zap,
    Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const Step = ({ number, icon: Icon, title, desc }) => (
    <motion.div
        {...fadeIn}
        className="relative flex flex-col items-center text-center space-y-6"
    >
        <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-amber-500/10 rounded-[2rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
            <Icon className="w-8 h-8 text-amber-500 relative z-10" />
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-black text-xs font-black rounded-full flex items-center justify-center border-4 border-zinc-950">
                {number}
            </div>
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-black italic">{title}</h3>
            <p className="text-muted-foreground font-light leading-relaxed max-w-[250px]">
                {desc}
            </p>
        </div>
    </motion.div>
);

export default function ListEventPage() {
    return (
        <MarketingLayout activeSlug="list-event">
            {/* Hero */}
            <section className="pt-32 pb-24 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 italic">
                            Turn Your Event <br />
                            <span className="text-gradient-gold">into a Legacy.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                            Join the world's most ambitious organizers. High-stakes tools for events
                            that demand architectural perfection.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="pt-8"
                    >
                        <Button asChild className="h-16 px-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-lg group">
                            <Link href="/create-event">
                                Start Hosting
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-32 px-6 bg-zinc-900/20 border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-20 relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                        <Step
                            number="01"
                            icon={Crown}
                            title="Create Account"
                            desc="Establish your presence on the Royal Court within seconds."
                        />
                        <Step
                            number="02"
                            icon={Map}
                            title="Build Venue"
                            desc="Use our architectural seat engine to draft your masterpiece."
                        />
                        <Step
                            number="03"
                            icon={Rocket}
                            title="Go Live"
                            desc="Release your tokens to the global marketplace and scale."
                        />
                    </div>
                </div>
            </section>

            {/* Why Royal */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-black italic">Why Organizers <br /> Choose Royal.</h2>
                                <p className="text-lg text-muted-foreground font-light leading-relaxed">
                                    Standard ticketing platforms treat events as transactions.
                                    We treat them as milestones.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {[
                                    { icon: ShieldCheck, title: "Sniper Defense", desc: "No double bookings. Ever. Mathematical seat locking." },
                                    { icon: Zap, title: "Zero Latency", desc: "Real-time sync between ground hardware and cloud dashboard." },
                                    { icon: Crown, title: "Prestige Brand", desc: "Associate your event with the world's most elite platform." },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 p-6 rounded-3xl bg-zinc-900 border border-white/5">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white uppercase text-sm tracking-widest">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground font-light">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative aspect-square">
                            <div className="absolute inset-0 bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
                            <TestimonialCarousel />
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Overlay */}
            <section className="py-20 px-6">
                <motion.div
                    {...fadeIn}
                    className="max-w-5xl mx-auto p-12 md:p-20 rounded-[4.5rem] bg-gradient-to-br from-amber-500 to-amber-600 text-black text-center space-y-8 relative overflow-hidden"
                >
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight italic">
                        Ready to set <br /> the stage?
                    </h2>
                    <p className="text-lg md:text-xl font-bold max-w-xl mx-auto opacity-80 leading-relaxed">
                        Join 1,200+ global organizers who trust Royal Class to protect
                        and scale their experiences.
                    </p>
                    <Button asChild size="lg" className="rounded-2xl bg-black text-white px-12 h-16 font-black uppercase tracking-widest hover:bg-zinc-900 border-none">
                        <Link href="/create-event">Initiate Now</Link>
                    </Button>

                    <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-white/20 rounded-full blur-[60px]" />
                </motion.div>
            </section>
        </MarketingLayout>
    );
}
