"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "sonner";
import ChatBot from "@/components/chat-bot";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();

    // Safe detection for full-screen tools
    const isFullscreenTool = React.useMemo(() => {
        if (!pathname) return false;
        return pathname.includes("/seat-builder") ||
            pathname.includes("/venue-builder") ||
            pathname.startsWith("/admin");
    }, [pathname]);

    return (
        <>
            {!isFullscreenTool && <Header />}

            <main className={isFullscreenTool ? "h-screen w-full overflow-hidden" : "relative min-h-screen container mx-auto pt-24 md:pt-32 pb-12"}>
                {!isFullscreenTool && (
                    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] opacity-40" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] opacity-30" />
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
