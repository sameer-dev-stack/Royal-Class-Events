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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          "fixed top-0 left-0 right-0 transition-all duration-300 border-b",
          // Lowered z-index to z-40 so Sheet (z-50) can overlap
          "z-40",
          scrolled || isMenuOpen
            ? "bg-background/95 backdrop-blur-xl border-border py-3 shadow-lg shadow-black/5"
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

          {/* ROYAL CLASS LOGO */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 group relative z-[60] flex-shrink-0 transition-opacity duration-300",
              isMenuOpen ? "opacity-0 invisible lg:opacity-100 lg:visible" : "opacity-100 visible"
            )}
          >
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
              <div className={cn(
                "flex items-center gap-1.5 md:gap-3 transition-opacity duration-300",
                isMenuOpen ? "opacity-0 invisible lg:opacity-100 lg:visible" : "opacity-100 visible"
              )}>
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
              </div>

              {/* Mobile Hamburger Menu */}
              <Sheet onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "lg:hidden h-9 w-9 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all",
                      isMenuOpen && "text-amber-500 bg-amber-500/10 rotate-90"
                    )}
                  >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[350px] bg-zinc-950 border-white/5 p-0 z-[100]">
                  <div className="flex flex-col h-full">
                    {/* Brand in Menu */}
                    <div className="p-8 border-b border-white/5 bg-zinc-900/20">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2.5 rounded-2xl border border-amber-500/20">
                          <Crown className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xl font-black tracking-tighter italic text-white leading-none">Royal-Class</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mt-1">Event Empire</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 py-8 px-6 space-y-2 overflow-y-auto">
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 px-4 mb-6">
                        Navigation Hub
                      </div>
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black uppercase italic tracking-widest transition-all",
                            pathname?.startsWith(link.href)
                              ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                              : "text-zinc-500 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {link.name}
                        </Link>
                      ))}

                      {/* Attendee Promo in Menu */}
                      {isAuthenticated && isAttendee && (
                        <div className="mt-12 p-6 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[2rem] space-y-4 relative overflow-hidden group">
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                          <div className="flex items-center gap-2 text-amber-500 font-black italic text-[11px] uppercase tracking-[0.2em] relative z-10">
                            <Store className="w-4 h-4" />
                            Launch Empire
                          </div>
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed relative z-10">
                            Stop attending, start hosting. Upgrade to an Organizer account and claim your throne.
                          </p>
                          <Button asChild className="w-full bg-white hover:bg-amber-500 hover:text-black text-black font-black uppercase text-[10px] tracking-widest h-11 rounded-xl transition-all relative z-10">
                            <Link href="/account/profile" onClick={() => setIsMenuOpen(false)}>Become an Organizer</Link>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Footer in Menu */}
                    <div className="p-8 border-t border-white/5 bg-zinc-900/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Settings</span>
                      <ModeToggle className="bg-white/5 border-none hover:bg-white/10" />
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