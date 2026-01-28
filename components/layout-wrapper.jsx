"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "sonner";
import ChatBot from "@/components/chat-bot";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Hammer, ShieldAlert, AlertCircle } from "lucide-react";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const { isAdmin, isLoading: rolesLoading } = useUserRoles();
    const settingsData = useQuery(api.settings.getPublicSettings);

    const isMaintenance = settingsData?.maintenance_mode === true || settingsData?.maintenance_mode === 'true';

    const isPublicPath = useMemo(() => {
        if (!pathname) return true;
        return !pathname.startsWith("/admin");
    }, [pathname]);

    // Safe detection for full-screen tools
    const isFullscreenTool = useMemo(() => {
        if (!pathname) return false;
        return pathname.includes("/seat-builder") ||
            pathname.includes("/venue-builder") ||
            pathname.startsWith("/admin");
    }, [pathname]);

    // Maintenance Guard
    if (isMaintenance && !isAdmin && isPublicPath && !rolesLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white text-center">
                <div className="max-w-md space-y-6">
                    <div className="relative inline-block">
                        <Hammer className="w-20 h-20 text-[#D4AF37] animate-bounce" />
                        <ShieldAlert className="w-8 h-8 text-black absolute -bottom-2 -right-2 bg-[#D4AF37] rounded-full p-1" />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">Platform Refactoring</h1>
                    <p className="text-zinc-500 font-medium">
                        The Royal-Class infrastructure is currently undergoing scheduled maintenance to upgrade security and performance.
                    </p>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 text-left">
                        <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Estimated Uptime: <span className="text-white">Under 2 Hours</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {!isFullscreenTool && <Header />}

            {/* Admin Maintenance Banner */}
            {isMaintenance && isAdmin && (
                <div className="fixed top-0 left-0 w-full bg-[#D4AF37] text-black py-1 px-4 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 z-[9999]">
                    <ShieldAlert className="w-3 h-3" />
                    Maintenance Mode Active - Public Access Restricted
                </div>
            )}

            <main className={isFullscreenTool ? "h-screen w-full overflow-hidden" : "relative min-h-screen container mx-auto pt-24 md:pt-32 pb-12"}>
                {!isFullscreenTool && (
                    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[100px] opacity-40" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#8C7326]/5 rounded-full blur-[120px] opacity-30" />
                    </div>
                )}

                <div className={isFullscreenTool ? "h-full" : "relative z-10"}>
                    {children}
                </div>

                {!isFullscreenTool && <Footer />}
            </main>
            <Toaster position="top-center" richColors />
            <ChatBot />
        </>
    );
}

