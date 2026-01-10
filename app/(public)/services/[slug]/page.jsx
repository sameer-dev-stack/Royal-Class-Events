"use client";

import React, { use } from "react";
import ServiceLayout from "../components/service-layout";
import {
    Users,
    ShieldCheck,
    UserCheck,
    Printer,
    ScanLine,
    Smartphone,
    BarChart3,
    PieChart,
    LineChart,
    CheckCircle2
} from "lucide-react";

const SERVICES_DATA = {
    "staffing": {
        heroTitle: "Royal Guards & Concierge",
        heroSubtitle: "Professional, uniformed staff for elite events. We don't just provide ushers; we provide the Royal Guard of Hospitality.",
        heroImage: "/hero_image.jpeg", // Replace with high-contrast staffing image if available
        valueProp: "Excellence on the Ground.",
        features: [
            {
                icon: <UserCheck className="w-6 h-6" />,
                title: "Elite Ushers",
                desc: "Bilingual, professionally trained hosts who manage guest flow with unparalleled elegance."
            },
            {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "VIP Security",
                desc: "Discreet but formidable security personnel trained for high-profile guest requirements."
            },
            {
                icon: <Users className="w-6 h-6" />,
                title: "Event Concierge",
                desc: "Dedicated support desks for resolving attendee inquiries and managing priority lists."
            }
        ]
    },
    "printing": {
        heroTitle: "Physical Souvenirs",
        heroSubtitle: "Transform digital assets into gold-foil embossed tokens of prestige. High-quality ticket printing that reflects your brand.",
        heroImage: "/hero_image.jpeg",
        valueProp: "The Art of the Physical Ticket.",
        features: [
            {
                icon: <Printer className="w-6 h-6" />,
                title: "Gold-Foil Embossing",
                desc: "Premium cardstock with metallic finishes that attendees keep as mementos."
            },
            {
                icon: <ScanLine className="w-6 h-6" />,
                title: "NFC Smart Wristbands",
                desc: "Contactless entry and cashless payment integration in a sleek, wearable format."
            },
            {
                icon: <Smartphone className="w-6 h-6" />,
                title: "QR Syncing",
                desc: "Every physical ticket contains a unique, high-security QR code linked to our cloud."
            }
        ]
    },
    "access-control": {
        heroTitle: "Fortress Entry Management",
        heroSubtitle: "Eliminate queues and prevent fraud with our architectural-grade scanning hardware and RFID solutions.",
        heroImage: "/hero_image.jpeg",
        valueProp: "Zero Latency. Total Control.",
        features: [
            {
                icon: <ScanLine className="w-6 h-6" />,
                title: "PDA Scanners",
                desc: "Rugged, handheld scanners running our proprietary low-latency scanning software."
            },
            {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "RFID Entry Gates",
                desc: "Walk-through authentication for massive crowds with real-time capacity tracking."
            },
            {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Offline Sync",
                desc: "Our hardware continues to function even if local connectivity drops, syncing later."
            }
        ],
        hardwareContent: (
            <div className="space-y-16">
                <div className="text-center space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black italic">The Hardware Suite</h3>
                    <p className="text-muted-foreground font-light max-w-2xl mx-auto">
                        Engineered for high-stakes environments where every second counts.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "PDA-X1 Scanner", desc: "4G/5G Enabled handheld with integrated thermal sensor." },
                        { name: "Gate-Shield RFID", desc: "High-throughput antenna for friction-less VIP entry." },
                        { name: "Royal Turnstile", desc: "Biometric-ready mechanical gates for stadium scaling." }
                    ].map((item, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 text-center space-y-4">
                            <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center">
                                <Smartphone className="w-12 h-12 text-amber-500/20" />
                            </div>
                            <h4 className="text-xl font-bold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    "analytics": {
        heroTitle: "Intelligence in Real-Time",
        heroSubtitle: "Data is the new gold. Gain deep insights into your audience, revenue flows, and event performance.",
        heroImage: "/hero_image.jpeg",
        valueProp: "Visualize Success.",
        features: [
            {
                icon: <LineChart className="w-6 h-6" />,
                title: "Revenue Heatmaps",
                desc: "See exactly when and how your tickets are selling across different price tiers."
            },
            {
                icon: <PieChart className="w-6 h-6" />,
                title: "Demographics",
                desc: "Understand your audience's geography, preferences, and engagement history."
            },
            {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Sales Forecasting",
                desc: "AI-driven predictions to help you optimize marketing spend and capacity."
            }
        ],
        analyticsVisual: (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <h3 className="text-3xl md:text-5xl font-black italic">Architectural <br /> Dashboards.</h3>
                    <p className="text-lg text-muted-foreground font-light leading-relaxed">
                        Our proprietary dashboard doesn't just show numbers; it shows opportunities.
                        Track real-time headcount, monitor ticket scalping patterns, and analyze
                        post-event engagement with mathematical precision.
                    </p>
                    <div className="space-y-4">
                        {["Real-time Headcount", "Audience Demographics", "Revenue Benchmarking"].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                                <span className="font-bold text-sm tracking-widest uppercase">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative aspect-video bg-zinc-900 border border-white/10 rounded-[2rem] p-4 shadow-3xl">
                    <div className="w-full h-full bg-zinc-950 rounded-xl overflow-hidden p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="w-24 h-2 bg-amber-500/20 rounded-full" />
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-end h-[100px]">
                            {[40, 70, 45, 90].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="bg-amber-500/40 rounded-t-md" />
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="w-[75%] h-full bg-amber-500" />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-amber-500/50">
                                <span>Capacity</span>
                                <span>75% Reached</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};

export default function ServicePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { slug } = params;
    const data = SERVICES_DATA[slug];

    if (!data) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-black italic mb-4">Service Not Found</h1>
                <p className="text-muted-foreground mb-8">The requested royal service does not exist.</p>
                <a href="/services" className="text-amber-500 font-bold hover:underline">Return to Hub</a>
            </div>
        );
    }

    return <ServiceLayout {...data} />;
}
