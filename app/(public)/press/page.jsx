"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Download,
    FileText,
    Image as ImageIcon,
    Share2,
    ExternalLink,
    Calendar,
    Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const NewsItem = ({ date, title, source, link }) => (
    <motion.div
        {...fadeIn}
        className="group p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-amber-500/30 transition-all space-y-4"
    >
        <div className="flex items-center gap-3 text-xs font-medium text-amber-500/80 uppercase tracking-widest">
            <Calendar className="w-3 h-3" />
            {date}
        </div>
        <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors leading-tight">{title}</h3>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-sm text-muted-foreground font-medium">{source}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-amber-500/10 hover:text-amber-500">
                <ExternalLink className="w-4 h-4" />
            </Button>
        </div>
    </motion.div>
);

export default function PressCenterPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-32">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                            Press & Media
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                            Media <br />
                            <span className="text-gradient-gold">Center.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                            Official news, brand assets, and media resources from the world's
                            premier luxury event marketplace.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Media Kit Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeIn} className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black italic">The Media Kit</h2>
                                <p className="text-muted-foreground font-light text-lg">
                                    Access our official brand guidelines, high-resolution logos, and executive biographies.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <Button className="h-16 justify-between bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-2xl px-6 text-white group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold">Official Brand Assets (2026)</span>
                                    </div>
                                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-y-1 transition-all" />
                                </Button>

                                <Button className="h-16 justify-between bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-2xl px-6 text-white group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold">Latest Press Release</span>
                                    </div>
                                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-y-1 transition-all" />
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative aspect-square max-w-md mx-auto"
                        >
                            <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full animate-pulse" />
                            <div className="relative z-10 p-1 bg-gradient-to-br from-amber-500/30 to-transparent rounded-[3rem] overflow-hidden shadow-2xl">
                                <div className="bg-zinc-950 p-8 rounded-[2.8rem] aspect-square flex flex-col items-center justify-center text-center space-y-6">
                                    <Newspaper className="w-20 h-20 text-amber-500/50" />
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black italic">Download <br /> Everything</p>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">ZIP • 42MB</p>
                                    </div>
                                    <Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-black font-black px-8">
                                        Get Media Pack
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* News Grid */}
            <section className="py-24 px-6 bg-zinc-900/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black italic">Latest Headlines</h2>
                            <p className="text-muted-foreground font-light">Royal Class Events in the spotlight.</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 font-bold h-12">
                            <Share2 className="w-4 h-4" />
                            Share Center
                        </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <NewsItem
                            date="January 10, 2026"
                            title="Royal Class Events expands technological footprint to MENA region."
                            source="Forbes Business"
                        />
                        <NewsItem
                            date="December 22, 2025"
                            title="How architectural SaaS design is changing the ticketing industry."
                            source="TechCrunch"
                        />
                        <NewsItem
                            date="November 15, 2025"
                            title="Royal Class Events hits 2M verified attendees milestone."
                            source="SaaS Weekly"
                        />
                        <NewsItem
                            date="October 05, 2025"
                            title="Inside the elite marketplace for global luxury events."
                            source="The Wall Street Journal"
                        />
                        <NewsItem
                            date="August 12, 2025"
                            title="Redefining VIP experiences with real-time seat tracking."
                            source="Wired"
                        />
                        <NewsItem
                            date="June 30, 2025"
                            title="The future of event management is architectural."
                            source="Fortune"
                        />
                    </div>
                </div>
            </section>

            {/* Press Contact */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-8 p-12 rounded-[3rem] bg-amber-500/5 border border-amber-500/10">
                    <h3 className="text-2xl font-black">Media Inquiries</h3>
                    <p className="text-muted-foreground font-light text-lg">
                        For interviews, press passes, or media opportunities, please reach out to our global
                        communications team.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Global PR</p>
                            <p className="text-xl font-bold">press@royalclass.com</p>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Office</p>
                            <p className="text-xl font-bold">+971 4 000 0000</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
