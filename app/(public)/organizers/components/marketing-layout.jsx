"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles } from "lucide-react";

/**
 * MarketingLayout provides a focused, high-end container for organizer-facing pages.
 */
export default function MarketingLayout({ children, activeSlug }) {
    const pathname = usePathname();

    const navItems = [
        { name: "List Event", href: "/organizers/list-event", slug: "list-event" },
        { name: "Ticketing", href: "/organizers/ticketing", slug: "ticketing" },
        { name: "Scanning App", href: "/organizers/scanning-app", slug: "scanning-app" },
        { name: "Marketing", href: "/organizers/marketing", slug: "marketing" },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
            {/* Sub-Navigation for Organizers */}
            <div className="sticky top-20 z-40 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.slug}
                                href={item.href}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-widest transition-colors relative h-14 flex items-center whitespace-nowrap",
                                    pathname === item.href || activeSlug === item.slug
                                        ? "text-#D4AF37"
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                {item.name}
                                {(pathname === item.href || activeSlug === item.slug) && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-#D4AF37"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-#D4AF37/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <Sparkles className="w-3 h-3" />
                        Partner with Excellence
                    </div>
                </div>
            </div>

            <main>
                {children}
            </main>
        </div>
    );
}

