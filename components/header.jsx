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

function HeaderContent() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();
  const { isAdmin, isOrganizer } = useUserRoles();

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


  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
          scrolled || mobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border-border py-3"
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* ROYAL CLASS LOGO */}
          <Link href="/" className="flex items-center gap-2 group relative z-[60]">
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
          <div className="flex items-center gap-2 md:gap-4 relative z-[60]">
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "transition-all",
                  pathname?.startsWith("/explore")
                    ? "text-amber-500 font-semibold bg-amber-500/10"
                    : "text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                )}
              >
                <Link href="/explore">Explore</Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "transition-all",
                  pathname?.startsWith("/marketplace")
                    ? "text-amber-500 font-semibold bg-amber-500/10"
                    : "text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                )}
              >
                <Link href="/marketplace">Marketplace</Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "transition-all",
                  pathname === "/about"
                    ? "text-amber-500 font-semibold bg-amber-500/10"
                    : "text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                )}
              >
                <Link href="/about">About</Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "transition-all",
                  pathname === "/contact"
                    ? "text-amber-500 font-semibold bg-amber-500/10"
                    : "text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                )}
              >
                <Link href="/contact">Contact</Link>
              </Button>
            </div>

            <ModeToggle aria-label="Toggle theme" />

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Create Event Button (Gold) - Visible for all logged in, but redirects to upgrade if attendee */}
                  {isAuthenticated && (
                    <Button size="sm" asChild className="hidden sm:flex gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold border-none shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
                      <Link href={(isOrganizer || isAdmin) ? "/create-event" : "/account/profile"}>
                        <Plus className="w-4 h-4" />
                        <span className="hidden md:inline">Create Event</span>
                      </Link>
                    </Button>
                  )}

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
                  <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </>
              )}

              {/* Mobile Menu Removed */}            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer Removed */}
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
        <div className="max-w-7xl mx-auto px-6 h-8" />
      </nav>
    }>
      <HeaderContent />
    </Suspense>
  );
}