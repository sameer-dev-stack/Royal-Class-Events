"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Zap,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function ServiceLayout({
    heroTitle,
    heroSubtitle,
    heroImage,
    valueProp,
    features,
    hardwareContent, // Optional for Access Control
    analyticsVisual, // Optional for Analytics
    ctaLabel = "Request a Quote",
    ctaLink = "/contact"
}) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-32">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden border-b border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">
                            <Sparkles className="w-3 h-3" />
                            Elite Service
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] italic">
                            {heroTitle} <br />
                            <span className="text-gradient-gold">Experience.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
                            {heroSubtitle}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button asChild className="h-14 px-10 rounded-2xl bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest text-sm shadow-xl shadow-[#D4AF37]/20">
                                <a href={ctaLink}>{ctaLabel}</a>
                            </Button>
                            <Button variant="outline" className="h-14 px-10 rounded-2xl border-white/10 hover:bg-white/5 text-white font-bold text-sm">
                                View Case Studies
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 relative aspect-[4/3] w-full max-w-2xl rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl shadow-[#D4AF37]/5"
                    >
                        <Image
                            src={heroImage || "/hero_image.jpeg"}
                            alt={heroTitle}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                    </motion.div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] -z-0" />
            </section>

            {/* Value Proposition Section */}
            <section className="py-24 px-6 bg-zinc-900/20">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <motion.div {...fadeIn}>
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tight mb-8">
                            {valueProp}
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                {...fadeIn}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-[#D4AF37]/30 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform">
                                    {feature.icon || <CheckCircle2 className="w-6 h-6" />}
                                </div>
                                <h3 className="text-2xl font-black italic mb-4">{feature.title}</h3>
                                <p className="text-muted-foreground font-light leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Custom Content Area (Hardware/Analytics) */}
            {(hardwareContent || analyticsVisual) && (
                <section className="py-24 px-6 bg-zinc-950 border-y border-white/5 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        {hardwareContent}
                        {analyticsVisual}
                    </div>
                </section>
            )}

            {/* Final CTA */}
            <section className="py-32 px-6">
                <motion.div
                    {...fadeIn}
                    className="max-w-5xl mx-auto p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 text-center space-y-10 relative overflow-hidden"
                >
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic">
                            Ready to elevate <br />
                            <span className="text-gradient-gold">your next act?</span>
                        </h2>
                        <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto">
                            Partner with the Royal Guard and ensure your event execution is
                            as flawless as your vision.
                        </p>
                        <div className="pt-8">
                            <Button asChild className="h-16 px-12 rounded-2xl bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest text-lg group">
                                <a href={ctaLink}>
                                    {ctaLabel}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />
                </motion.div>
            </section>
        </div>
    );
}

