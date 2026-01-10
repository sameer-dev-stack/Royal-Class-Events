"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Users,
    Printer,
    ShieldCheck,
    BarChart3,
    ArrowRight,
    Sparkles,
    Layers,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const ServiceCard = ({ icon: Icon, title, desc, href, delay }) => (
    <motion.div
        {...fadeIn}
        transition={{ delay }}
        className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent hover:from-amber-500/20 transition-all duration-500"
    >
        <Link href={href}>
            <div className="bg-zinc-900 p-8 rounded-[2.4rem] h-full flex flex-col items-start justify-between gap-8 group-hover:bg-zinc-900/50 transition-colors">
                <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black italic text-white group-hover:text-amber-500 transition-colors">{title}</h3>
                        <p className="text-muted-foreground font-light leading-relaxed">
                            {desc}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-amber-500 font-bold uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                    Explore Service
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </Link>
    </motion.div>
);

export default function ServicesHub() {
    const services = [
        {
            icon: Users,
            title: "Event Staffing",
            desc: "Royal Guards & Concierge. Professional, uniformed staff for elite events including ushers, security, and VIP hosts.",
            href: "/services/staffing",
        },
        {
            icon: Printer,
            title: "Ticket Printing",
            desc: "Physical souvenirs for digital assets. Gold-foil embossed tickets, NFC wristbands, and QR integration.",
            href: "/services/printing",
        },
        {
            icon: ShieldCheck,
            title: "Access Control",
            desc: "Fortress-level entry management with PDA scanners and RFID gates, synced instantly with the Royal Cloud.",
            href: "/services/access-control",
        },
        {
            icon: BarChart3,
            title: "Analytics & Data",
            desc: "Data is the new gold. Real-time revenue charts, heatmaps, and deep audience demographics at your fingertips.",
            href: "/services/analytics",
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-32">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-6">
                            <Layers className="w-3 h-3" />
                            The Ecosystem
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] italic mb-8">
                            Beyond <br />
                            <span className="text-gradient-gold">Ticketing.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                            A 360° event ecosystem designed to empower organizers with
                            architectural-grade tools and on-ground excellence.
                        </p>
                    </motion.div>
                </div>

                {/* Background Decorative Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-500/5 rounded-full -z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-500/10 rounded-full -z-0" />
            </section>

            {/* Services Grid */}
            <section className="px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {services.map((service, i) => (
                            <ServiceCard
                                key={i}
                                {...service}
                                delay={i * 0.1}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Ecosystem Benefit Overlay */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        {...fadeIn}
                        className="relative p-12 md:p-20 rounded-[4rem] bg-zinc-900/50 border border-white/5 overflow-hidden group"
                    >
                        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="space-y-6">
                                <h2 className="text-3xl md:text-5xl font-black italic">Unified Intelligence.</h2>
                                <p className="text-lg text-muted-foreground font-light leading-relaxed">
                                    When you use the full Royal Ecosystem, data flows seamlessly between your
                                    on-ground scanners, physical tickets, and online dashboard. Zero latency,
                                    maximum prestige.
                                </p>
                                <Button variant="outline" className="rounded-full h-12 px-8 border-white/10 hover:bg-amber-500 hover:text-black transition-all font-bold">
                                    Schedule a Demo
                                </Button>
                            </div>
                            <div className="relative aspect-square max-w-[300px] mx-auto lg:ml-auto">
                                <div className="w-full h-full border-2 border-dashed border-amber-500/20 rounded-full animate-spin-slow flex items-center justify-center p-8">
                                    <Sparkles className="w-20 h-20 text-amber-500/40" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-12 h-12 text-amber-500" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
