"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    User,
    Settings,
    Store,
    ChevronRight,
    Sparkles,
    Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/messages", label: "Leads & Messages", icon: MessageSquare },
    { href: "/supplier/calendar", label: "Calendar", icon: Calendar },
    { href: "/supplier/services", label: "Services", icon: Briefcase },
    { href: "/supplier/profile", label: "My Profile", icon: User },
    { href: "/supplier/settings", label: "Settings", icon: Settings },
];

export default function SupplierLayout({ children }) {
    const pathname = usePathname();
    const { token, isAuthenticated } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const supplier = useQuery(
        api.suppliers.getMyProfile,
        token ? { token } : "skip"
    );

    // Wait for hydration
    if (!isMounted) {
        return null;
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Store className="w-16 h-16 mx-auto text-amber-500/50" />
                    <h1 className="text-2xl font-bold text-foreground">Vendor Area</h1>
                    <p className="text-muted-foreground">Please sign in to access your vendor dashboard.</p>
                    <Link
                        href="/sign-in"
                        className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Not a supplier
    if (supplier === null) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <Store className="w-16 h-16 mx-auto text-amber-500/50" />
                    <h1 className="text-2xl font-bold text-foreground">Become a Vendor</h1>
                    <p className="text-muted-foreground">
                        You're not registered as a vendor yet. Join our marketplace to showcase your services.
                    </p>
                    <Link
                        href="/supplier/join"
                        className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors"
                    >
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Join as Vendor
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-800/50 bg-zinc-900/30">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <Store className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">
                                Vendor Mode
                            </p>
                            <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                                {supplier?.name || "Loading..."}
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
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                        : "text-zinc-400 hover:text-foreground hover:bg-zinc-800/50"
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
                <div className="p-4 border-t border-zinc-800/50">
                    <Link
                        href={`/marketplace/vendor/${supplier?._id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50 transition-colors"
                    >
                        <Store className="w-5 h-5" />
                        View Public Profile
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">{children}</main>
        </div>
    );
}