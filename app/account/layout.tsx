"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    ShieldCheck,
    Bell,
    ChevronRight,
    Settings,
    ArrowLeft,
    Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import useAuthStore from "@/hooks/use-auth-store";

export default function AccountLayout({ children }) {
    const pathname = usePathname();
    const { user } = useAuthStore();

    const baseNavItems = [
        {
            title: "Profile",
            href: "/account/profile",
            icon: User,
            description: "Personal details and bio"
        },
        {
            title: "Security",
            href: "/account/security",
            icon: ShieldCheck,
            description: "Password and authentication"
        },
        {
            title: "Notifications",
            href: "/account/notifications",
            icon: Bell,
            description: "Manage alerts and emails"
        }
    ];

    const navItems = [...baseNavItems];

    if (user?.role === "attendee") {
        navItems.push({
            title: "Become an Organizer",
            href: "/account/organizer-request",
            icon: Crown,
            description: "Host your own events"
        });
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
                            Account <span className="text-gradient-gold uppercase">Settings.</span>
                        </h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[280px_1fr] gap-12">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5"
                                            : "hover:bg-muted text-muted-foreground border border-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-amber-500 text-black" : "bg-muted group-hover:bg-amber-500/20 group-hover:text-amber-500"
                                    )}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{item.title}</p>
                                        <p className="text-[10px] uppercase font-black tracking-widest opacity-60">
                                            {item.description}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute left-0 w-1 h-6 bg-amber-500 rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </aside>

                    {/* Nav - Mobile (Scrollable Tabs) */}
                    <nav className="lg:hidden flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap border font-bold text-sm transition-all",
                                        isActive
                                            ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20"
                                            : "bg-muted border-transparent text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Main Content Area */}
                    <main>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
}
