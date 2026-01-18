"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    History,
    Target,
    Eye,
    Users,
    Award,
    Globe2,
    ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const TeamMember = ({ name, role, image }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="group relative overflow-hidden rounded-3xl bg-card/50 border border-border p-4 text-center"
    >
        <div className="relative w-full aspect-square mb-6 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
            <Image
                src={image || "/hero_image.jpeg"}
                alt={name}
                fill
                className="object-cover"
            />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
        <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">{role}</p>
    </motion.div>
);

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div {...fadeIn}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                            Our Legacy
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                            Redefining <br />
                            <span className="text-gradient-gold">Elite Events.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                            From local gatherings to global spectacles, we orchestrate the world's most
                            exclusive experiences with architectural precision.
                        </p>
                    </motion.div>
                </div>

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            </section>

            {/* Our Story / Timeline Section */}
            <section className="py-24 px-6 bg-card/20 mx-4 md:mx-6 lg:mx-8 rounded-3xl border border-border">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6">
                                <History className="w-6 h-6" />
                            </div>
                            <h2 className="text-4xl font-black mb-6 tracking-tight italic">Our Story</h2>
                            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg font-light">
                                <p>
                                    What started as a boutique ticketing platform for local luxury galas quickly
                                    transformed into the industry standard for elite event management. We identified
                                    a void in the marketplace where high-stakes organizers lacked the sophisticated
                                    tools required to manage complex seat mappings and VIP access control.
                                </p>
                                <p>
                                    Today, Royal Class Events serves as a Global Marketplace, empowering the world's
                                    most prestigious brands and organizers with a technological footprint that scales
                                    from private auctions to stadium-sized concerts.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl"
                        >
                            <Image
                                src="/hero_image.jpeg"
                                alt="Architecture of Events"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-3xl bg-card/50 border border-border space-y-6"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Target className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black italic">The Mission</h3>
                            <p className="text-xl text-muted-foreground font-light leading-relaxed">
                                "To empower the world's most ambitious organizers with architectural-grade tools,
                                streamling the path from vision to breathtaking execution."
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-10 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-6"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <Eye className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black italic">The Vision</h3>
                            <p className="text-xl text-muted-foreground font-light leading-relaxed">
                                "To become the global standard for luxury event experiences, defined by seamless
                                technology and unparalleled elegance."
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Elite Events", val: "12k+", icon: Award },
                            { label: "Happy Attendees", val: "2.5M", icon: Users },
                            { label: "Global Reach", val: "45+", icon: Globe2 },
                            { label: "Award Wins", val: "18", icon: Award },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-3xl md:text-5xl font-black text-foreground">{stat.val}</p>
                                <p className="text-amber-500/70 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black italic">The Royal Guard</h2>
                        <p className="text-muted-foreground font-light">The architects behind the curtain.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <TeamMember name="Alexander Thorne" role="Chief Executive Officer" />
                        <TeamMember name="Marcus Sterling" role="Chief Technology Officer" />
                        <TeamMember name="Elena Vane" role="Lead Architect" />
                        <TeamMember name="Julian Cross" role="Head of Strategy" />
                    </div>
                </div>
            </section>
        </div>
    );
}
