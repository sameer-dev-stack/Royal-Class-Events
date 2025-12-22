"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building, Crown, Plus, Ticket } from "lucide-react";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import { Button } from "@/components/ui/button";
import UpgradeModal from "./upgrade-modal";
import { ModeToggle } from "./mode-toggle";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export default function Header() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { isLoading } = useStoreUser();
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

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
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-border py-3"
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* ROYAL CLASS LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-foreground">
              Royal Class <span className="text-amber-500">Events</span>
            </span>

            {hasPro && (
              <Badge className="bg-amber-500 text-black hover:bg-amber-400 gap-1 ml-2">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            )}
          </Link>

          {/* Search & Location - Desktop Only */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className={cn("transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-90")}>
              <SearchLocationBar />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Show Pro badge or Upgrade button */}
            {!hasPro && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
              >
                Pricing
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <Link href="/explore">Explore</Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <Link href="/contact">Contact</Link>
            </Button>

            <ModeToggle />

            <Authenticated>
              {/* Create Event Button (Gold) */}
              <Button size="sm" asChild className="hidden sm:flex gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold border-none shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
                <Link href="/create-event">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Event</span>
                </Link>
              </Button>

              {/* User Button */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-amber-500/20 hover:ring-amber-500 transition-all",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Tickets"
                    labelIcon={<Ticket size={16} />}
                    href="/my-tickets"
                  />
                  <UserButton.Link
                    label="My Events"
                    labelIcon={<Building size={16} />}
                    href="/my-events"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </Authenticated>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>

        {/* Mobile Search & Location - Below Header */}
        <div className="md:hidden border-t border-border px-4 py-3 bg-background/60 backdrop-blur-md">
          <SearchLocationBar />
        </div>

        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width={"100%"} color="#f59e0b" />
          </div>
        )}
      </nav>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />
    </>
  );
}