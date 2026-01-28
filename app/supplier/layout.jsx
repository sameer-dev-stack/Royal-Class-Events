"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    User,
    Settings,
    Store,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/messages", label: "Leads & Messages", icon: MessageSquare },
    { href: "/supplier/calendar", label: "Calendar", icon: Calendar },
    { href: "/supplier/services", label: "Services", icon: Sparkles }, // Added Services
    { href: "/supplier/profile", label: "My Profile", icon: User },
    { href: "/supplier/settings", label: "Settings", icon: Settings },
];

export default function SupplierLayout({ children }) {
    const pathname = usePathname();
    const { isAuthenticated, user, token } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    // Check if user is a supplier via Convex
    const supplierProfile = useQuery(
        api.suppliers.getMyProfile,
        isAuthenticated && token ? { token } : "skip"
    );
    const isVendor = !!supplierProfile;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 1. Wait for Hydration
    if (!isMounted) return null;

    // 2. Allow Public Access to Join Page (CRITICAL FIX)
    if (pathname === "/supplier/join") {
        return <>{children}</>;
    }

    // 3. Auth Check (For other pages)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Store className="w-16 h-16 mx-auto text-[#D4AF37]" />
                    <h1 className="text-2xl font-bold text-foreground">Vendor Area</h1>
                    <p className="text-muted-foreground">Please sign in to access your vendor dashboard.</p>
                    <Link
                        href="/sign-in"
                        className="inline-block px-6 py-3 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-bold rounded-xl transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // 4. Not a Supplier Check
    if (!isVendor) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <Store className="w-16 h-16 mx-auto text-[#D4AF37]" />
                    <h1 className="text-2xl font-bold text-foreground">Become a Vendor</h1>
                    <p className="text-muted-foreground">
                        You're not registered as a vendor yet. Join our marketplace to showcase your services.
                    </p>
                    <Link
                        href="/supplier/join"
                        className="inline-block px-6 py-3 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-bold rounded-xl transition-colors"
                    >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Join as Vendor
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/10 fixed h-full left-0 top-0 pt-20 z-40">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                            <Store className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider">
                                Vendor Mode
                            </p>
                            <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                                {supplierProfile?.name || "Loading..."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[#D4AF37]/10 text-[#8C7326] dark:text-[#F7E08B] border border-[#D4AF37]/30"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {link.label}
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <Link
                        href={`/marketplace/vendor/${supplierProfile?._id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-[#8C7326] dark:hover:text-[#F7E08B] hover:bg-muted/50 transition-colors"
                    >
                        <Store className="w-5 h-5" />
                        View Public Profile
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 lg:pl-64 pt-20 p-6">{children}</main>
        </div>
    );
}
