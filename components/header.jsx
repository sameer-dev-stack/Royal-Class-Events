"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Building, Crown, Plus, Ticket, Menu, X, ArrowRight, Store } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useUserRoles } from "@/hooks/use-user-roles";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import UserButton from "./auth/user-button";
import { NotificationBell } from "./layout/notification-bell";
import useAuthStore from "@/hooks/use-auth-store";

import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

function HeaderContent() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();
  const { isAdmin, isOrganizer, isAttendee } = useUserRoles();

  // Hooks must be called before any returns
  useStoreUser(); // Sync user to Convex on mount/auth change

  const isLoading = false; // Add actual loading state if needed from auth store or queries

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Conditional rendering happens in the return or after hooks
  if (!mounted) return null;

  // Hide header on seat-builder pages - now safe to return after hooks
  if (pathname?.startsWith("/seat-builder")) return null;

  const navLinks = [
    { name: "Explore", href: "/explore" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-border py-3 shadow-lg shadow-black/5"
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

          {/* ROYAL CLASS LOGO */}
          <Link href="/" className="flex items-center gap-2 group relative z-[60] flex-shrink-0">
            <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-foreground">
              Royal Class <span className="text-amber-500">Events</span>
            </span>
          </Link>

          {/* Search & Location - Desktop Only */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <div className={cn("transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-90")}>
              <SearchLocationBar />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4 relative z-[60] flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "transition-all",
                    pathname?.startsWith(link.href)
                      ? "text-amber-500 font-semibold bg-amber-500/10"
                      : "text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                  )}
                >
                  <Link href={link.href}>{link.name}</Link>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 md:gap-3">
              <ModeToggle aria-label="Toggle theme" className="hidden sm:flex" />

              {isAuthenticated ? (
                <>
                  {/* Create Event Button (Gold) */}
                  <Button size="sm" asChild className="hidden sm:flex gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold border-none shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all h-9">
                    <Link href={(isOrganizer || isAdmin) ? "/create-event" : "/account/profile"}>
                      {isAttendee ? <ArrowRight className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span className="hidden xl:inline">
                        {isAttendee ? "Become an Organizer" : "Create Event"}
                      </span>
                    </Link>
                  </Button>

                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* User Button */}
                  <UserButton />
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden sm:flex text-muted-foreground hover:text-amber-400"
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-9">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </>
              )}

              {/* Mobile Hamburger Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-9 w-9 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-xl border-border p-0">
                  <div className="flex flex-col h-full">
                    {/* Brand in Menu */}
                    <div className="p-6 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        <span className="text-xl font-bold tracking-tighter italic">Royal-Class</span>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-4 mb-4">
                        Main Navigation
                      </div>
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold uppercase italic tracking-wider transition-all",
                            pathname?.startsWith(link.href)
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                          )}
                        >
                          {link.name}
                        </Link>
                      ))}

                      {/* Attendee Promo in Menu */}
                      {isAuthenticated && isAttendee && (
                        <div className="mt-8 px-4 py-6 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2 text-amber-500 font-black italic text-xs uppercase tracking-widest">
                            <Store className="w-4 h-4" />
                            Launch Your Empire
                          </div>
                          <p className="text-[11px] text-zinc-400 font-medium">
                            Upgrade to an Organizer account to start hosting events and managing ticket sales.
                          </p>
                          <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-[10px] tracking-widest h-10">
                            <Link href="/account/profile">Become an Organizer</Link>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Footer in Menu */}
                    <div className="p-6 border-t border-border/50 bg-zinc-900/30">
                      <ModeToggle className="w-full justify-start gap-4 h-12" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width={"100%"} color="#f59e0b" />
          </div>
        )}
      </nav>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between">
          <div className="w-32 h-6 bg-zinc-800 rounded animate-pulse" />
          <div className="w-24 h-6 bg-zinc-800 rounded animate-pulse" />
        </div>
      </nav>
    }>
      <HeaderContent />
    </Suspense>
  );
}