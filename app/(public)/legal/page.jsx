"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Gavel,
    Cookie,
    FileCheck,
    ChevronRight,
    Download,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Section = ({ id, activeId, title, children }) => (
    <motion.div
        id={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: activeId === id ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
            "space-y-8",
            activeId !== id && "hidden"
        )}
    >
        <div className="space-y-2">
            <h2 className="text-4xl font-black italic tracking-tight">{title}</h2>
            <div className="flex items-center gap-4 text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Last Updated: January 2026
                </div>
                <span>•</span>
                <span>Version: 2.1.0</span>
            </div>
        </div>

        <div className="prose prose-invert prose-amber max-w-none text-muted-foreground font-light leading-relaxed text-lg space-y-8">
            {children}
        </div>
    </motion.div>
);

export default function LegalPage() {
    const [activeTab, setActiveTab] = useState("terms");

    const tabs = [
        { id: "terms", label: "Terms of Service", icon: Gavel },
        { id: "privacy", label: "Privacy Policy", icon: Shield },
        { id: "cookie", label: "Cookie Policy", icon: Cookie },
        { id: "compliance", label: "Compliance", icon: FileCheck },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-32">
            {/* Hero */}
            <section className="pt-32 pb-16 px-6 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic">Legal <span className="text-gradient-gold">Vault.</span></h1>
                        <p className="text-muted-foreground text-lg max-w-xl font-light">
                            Our commitment to transparency, security, and elite-grade compliance standards.
                        </p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 gap-2 h-12 font-bold">
                        <Download className="w-4 h-4 text-[#D4AF37]" />
                        Download Full Documentation (PDF)
                    </Button>
                </div>
            </section>

            {/* Main Content Layout */}
            <section className="max-w-7xl mx-auto px-6 pt-12">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Sticky Navigation */}
                    <aside className="lg:w-80 h-fit lg:sticky lg:top-32 space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-4">Legal Framework</div>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "group w-full flex items-center justify-between p-4 rounded-2xl transition-all border border-transparent text-left",
                                        activeTab === tab.id
                                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]"
                                            : "hover:bg-white/5 text-muted-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon className={cn("w-5 h-5 transition-colors", activeTab === tab.id ? "text-[#D4AF37]" : "text-muted-foreground/50")} />
                                        <span className="font-bold">{tab.label}</span>
                                    </div>
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-transform group-hover:translate-x-1",
                                        activeTab === tab.id ? "opacity-100" : "opacity-0"
                                    )} />
                                </button>
                            );
                        })}
                    </aside>

                    {/* Dynamic Content Area */}
                    <main className="flex-1 max-w-4xl">
                        <Section id="terms" activeId={activeTab} title="Terms of Service">
                            <p>
                                Welcome to Royal Class Events. By accessing or using our Global Marketplace, you agree to be bound
                                by these Terms of Service. Please read them carefully.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">1. Organizer Responsibilities</h3>
                            <p>
                                Organizers using the Royal Class platform are responsible for the accuracy of event listings,
                                seat mappings, and the ultimate fulfillment of the event experience. You represent that you
                                hold all necessary rights and permits for the events you list.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">2. Ticket Refunds & Transfers</h3>
                            <p>
                                Refund policies are determined on an event-by-event basis by the respective Organizer. Unless
                                specified otherwise, tickets purchased through Royal Class Events are transferrable but non-refundable
                                if the event occurs as scheduled.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">3. Platform Usage</h3>
                            <p>
                                Our architectural tools are provided for elite event management. Any attempt to bypass ticket
                                limits, scrape marketplace data, or interfere with access control systems will result in immediate
                                account termination.
                            </p>
                        </Section>

                        <Section id="privacy" activeId={activeTab} title="Privacy Policy">
                            <p>
                                At Royal Class Events, we treat your data with the same exclusivity as our VIP events.
                                This policy outlines how your information is collected, used, and protected.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">1. Data Collection</h3>
                            <p>
                                We collect information necessary for ticket verification and platform security, including
                                Verified Names, Email addresses, and Device Identifiers. For Organizers, we may collect
                                additional verification documentation as required by global financial regulations.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">2. Authentication & Tokens</h3>
                            <p>
                                Our platform utilizes secure authentication tokens to manage user sessions. We do not store
                                unencrypted passwords or sensitive payment card data on our servers.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">3. Data Sharing</h3>
                            <p>
                                Your information is shared with Event Organizers solely for the purpose of event entry
                                and security. We never sell attendee datasets to third-party marketing entities.
                            </p>
                        </Section>

                        <Section id="cookie" activeId={activeTab} title="Cookie Policy">
                            <p>
                                Royal Class Events uses cookies to enhance your journey through our marketplace.
                                We use cookies to remember your preferences and ensure secure entry to your dashboard.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">Essential Cookies</h3>
                            <p>
                                These are required for the marketplace to function, specifically for authentication,
                                maintaining your shopping cart state, and preventing fraudulent ticket purchases.
                            </p>

                            <h3 className="text-2xl font-bold text-white italic pt-4">Performance Cookies</h3>
                            <p>
                                We use performance analytics to understand how organizers interact with our seat-mapping tools,
                                allowing us to optimize high-stakes dashboard experiences.
                            </p>
                        </Section>

                        <Section id="compliance" activeId={activeTab} title="Global Compliance">
                            <p>
                                We adhere to the highest international standards for digital commerce and data protection.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                {[
                                    "GDPR (European Union)",
                                    "SOC 2 Type II Certified",
                                    "PCI DSS Level 1 Compliant",
                                    "ISO 27001 Information Security"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-white/5">
                                        <FileCheck className="w-5 h-5 text-[#D4AF37]" />
                                        <span className="text-sm font-bold text-white">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* Support Help */}
                        <div className="mt-20 p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 text-center space-y-6">
                            <h4 className="text-xl font-bold">Have a legal question?</h4>
                            <p className="text-muted-foreground font-light max-w-sm mx-auto">
                                Contact our global legal team for specific inquiries regarding platform policies.
                            </p>
                            <Button className="rounded-full bg-white/5 hover:bg-white/10 text-white font-bold px-10 h-12">
                                Contact Legal Support
                            </Button>
                        </div>
                    </main>
                </div>
            </section>
        </div>
    );
}

