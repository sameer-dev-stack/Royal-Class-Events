"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Zap,
    Crown,
    ShieldCheck,
    Wind,
    Code,
    Paintbrush,
    Briefcase,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const ValueCard = ({ icon: Icon, title, desc }) => (
    <motion.div
        {...fadeIn}
        className="p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-all group"
    >
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-muted-foreground font-light leading-relaxed">{desc}</p>
    </motion.div>
);

const JobCard = ({ title, dept, type, location }) => (
    <motion.div
        {...fadeIn}
        className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-900/50 transition-all border-l-4 border-l-transparent hover:border-l-amber-500"
    >
        <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span className="text-amber-500/80">{dept}</span>
                <span>•</span>
                <span>{type}</span>
                <span>•</span>
                <span>{location}</span>
            </div>
        </div>
        <Button
            onClick={() => window.location.href = "mailto:careers@royalclass.com"}
            className="bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl h-11 px-8 group"
        >
            Apply Now
            <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Button>
    </motion.div>
);

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-32">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                            Now Hiring
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                            Join the <br />
                            <span className="text-gradient-gold">Royal Court.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                            We're looking for visionary architects, engineers, and creatives to help us
                            build the futuro of luxury event technology.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-6 bg-zinc-900/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-4 text-center">Our Core Values</div>
                    <h2 className="text-4xl md:text-5xl font-black mb-16 text-center italic">What defines us</h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ValueCard
                            icon={Zap}
                            title="Innovation"
                            desc="We don't follow trends; we create the architectural blueprints for the next generation of SaaS."
                        />
                        <ValueCard
                            icon={Crown}
                            title="Luxury"
                            desc="Quality is our minimum requirement. We build for the elite, where every pixel reflects prestige."
                        />
                        <ValueCard
                            icon={ShieldCheck}
                            title="Integrity"
                            desc="Trust is the currency of events. We maintain the highest standards of security and transparency."
                        />
                        <ValueCard
                            icon={Wind}
                            title="Speed"
                            desc="In the world of high-stakes events, milliseconds matter. We optimize for elite performance."
                        />
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tight">Open Castles</h2>
                            <p className="text-muted-foreground font-light">Find your seat at the table.</p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500 font-bold bg-amber-500/10 px-4 py-2 rounded-xl text-sm border border-amber-500/20">
                            <Briefcase className="w-4 h-4" />
                            6 Opportunities
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">Product & Engineering</div>
                        <JobCard title="Senior Frontend Architect" dept="Engineering" type="Full-time" location="Remote / Dubai" />
                        <JobCard title="Backend Systems Lead" dept="Engineering" type="Full-time" location="Remote / London" />
                        <JobCard title="Product Designer (UX/UI)" dept="Design" type="Full-time" location="Dubai" />
                    </div>

                    <div className="space-y-4 pt-10">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">Operations & Strategy</div>
                        <JobCard title="Global Partnerships Manager" dept="Growth" type="Full-time" location="NYC / Remote" />
                        <JobCard title="Event Success Consultant" dept="Support" type="Contract" location="Remote" />
                        <JobCard title="Legal Counsel (FinTech)" dept="Legal" type="Full-time" location="London" />
                    </div>

                    <div className="text-center pt-20 border-t border-white/5">
                        <h3 className="text-xl font-bold mb-4">Don't see your role?</h3>
                        <p className="text-muted-foreground font-light mb-8 max-w-sm mx-auto">
                            We're always looking for exceptional talent. Send us your portfolio and let's talk.
                        </p>
                        <Button
                            variant="outline"
                            className="h-14 px-10 rounded-2xl border-white/10 hover:bg-white/5 text-white font-bold"
                            onClick={() => window.location.href = "mailto:talent@royalclass.com"}
                        >
                            General Application
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
