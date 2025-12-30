"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Building, Crown, Plus, Ticket, Menu, X, ArrowRight } from "lucide-react";
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
import { useSession } from "next-auth/react";

function HeaderContent() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session } = useSession();
  const isAuthenticated = !!session;

  const { isLoading, storeFailed } = useStoreUser();
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();
  const { isAdmin, isOrganizer } = useUserRoles();

  useEffect(() => {
    // Debug logging for user session
    if (session) {
      console.log("Header: NextAuth session active for:", session.user?.email);
    } else {
      console.log("Header: No active NextAuth session.");
    }
  }, [session]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
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
                className="text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
              >
                <Link href="/explore">Explore</Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
              >
                <Link href="/contact">Contact</Link>
              </Button>
            </div>

            <ModeToggle />

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Create Event Button (Gold) - Hidden on smallest mobile */}
                  {(isOrganizer || isAdmin) && (
                    <Button size="sm" asChild className="hidden sm:flex gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold border-none shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
                      <Link href="/create-event">
                        <Plus className="w-4 h-4" />
                        <span className="hidden md:inline">Create Event</span>
                      </Link>
                    </Button>
                  )}

                  {/* User Button - NextAuth */}
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

              {/* Hamburger Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-foreground hover:bg-foreground/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-[60px] bg-black/40 backdrop-blur-sm z-[54] lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-[60px] bottom-0 w-[85vw] max-w-sm bg-background/95 backdrop-blur-xl border-l border-border z-[55] lg:hidden overflow-y-auto shadow-2xl"
              >
                <div className="h-full flex flex-col p-6">

                  <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      Search & Discover
                    </h2>
                    <div className="bg-card/50 border border-border rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                      <SearchLocationBar />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      Quick Actions
                    </h2>
                    <div className="space-y-3">
                      {isAuthenticated && (isOrganizer || isAdmin) && (
                        <Link
                          href="/create-event"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block group"
                        >
                          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-5 shadow-xl group-hover:shadow-2xl transition-all group-active:scale-[0.98]">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-4 relative z-10">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-white mb-0.5">Create Event</h3>
                                <p className="text-sm text-white/80">Host your next experience</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      )}

                      <Link
                        href="/explore"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block group"
                      >
                        <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-2xl p-4 group-hover:border-amber-500/50 group-hover:bg-amber-500/5 transition-all group-active:scale-[0.98]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Ticket className="w-6 h-6 text-amber-500" strokeWidth={2} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-base text-foreground mb-0.5">Explore Events</h3>
                              <p className="text-xs text-muted-foreground">Discover amazing experiences</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <div className="mb-8">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                        My Account
                      </h2>
                      <div className="space-y-1 bg-card/30 backdrop-blur-sm rounded-2xl p-2 border border-border/50">
                        <Link
                          href="/my-tickets"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 transition-all active:scale-[0.98] group"
                        >
                          <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                            <Ticket className="w-5 h-5 text-amber-500" strokeWidth={2} />
                          </div>
                          <span className="font-medium text-foreground flex-1">My Tickets</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Link>
                        <Link
                          href="/my-events"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 transition-all active:scale-[0.98] group"
                        >
                          <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                            <Building className="w-5 h-5 text-amber-500" strokeWidth={2} />
                          </div>
                          <span className="font-medium text-foreground flex-1">My Events</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      Resources
                    </h2>
                    <div className="space-y-1">
                      <Link
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-all active:scale-[0.98] group"
                      >
                        <div className="w-9 h-9 bg-muted/50 rounded-lg flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                          <Crown className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 transition-colors" strokeWidth={2} />
                        </div>
                        <span className="font-medium text-foreground flex-1">Contact Us</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-border/50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-2.5 rounded-xl border border-amber-500/20">
                        <Crown className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        Royal Class <span className="text-amber-500">Events</span>
                      </span>
                    </div>
                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                      © {new Date().getFullYear()} Royal Class Events<br />
                      All rights reserved
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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