"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Unauthenticated } from "convex/react";
// 1. Import the EventList component
import EventList from "@/components/event-list";
import { FadeIn, StaggerContainer } from "@/components/ui/motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-10 sm:pt-20 pb-20 sm:pb-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* Left content */}
          <FadeIn direction="up" className="text-center sm:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium backdrop-blur-sm">
              <Crown className="w-4 h-4 fill-amber-500/20" />
              <span>The #1 Platform for Elite Experiences</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-foreground space-y-2">
              <span className="block">
                Experience the
              </span>
              <span className="block text-gradient-gold relative">
                Exclusive
                {/* Decorative spark */}
                <Sparkles className="absolute -top-6 -right-8 w-8 h-8 text-amber-400 rotate-12 animate-pulse" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto sm:mx-0 font-light leading-relaxed">
              From private galas to VIP soirees, we curate unforgettable moments.
              Join the inner circle and book your next premium experience today.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
              <Link href="/explore">
                <Button size="xl" className="h-14 px-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg border-none shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-1">
                  Explore Events
                </Button>
              </Link>

              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="xl" className="h-14 px-8 rounded-full text-foreground hover:bg-foreground/10 group cursor-pointer">
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignInButton>
              </Unauthenticated>
            </div>
          </FadeIn>

          {/* Right - High-End Event Image Card */}
          <div className="relative block perspective-1000">
            <div className="relative z-20 rounded-3xl border border-border bg-card/60 backdrop-blur-md p-4 shadow-2xl transform rotate-y-[-10deg] hover:rotate-y-0 transition-all duration-700 ease-out animate-float">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src="/hero_image.jpeg"
                  alt="Royal Class Event"
                  width={700}
                  height={875}
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                  priority
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                {/* Floating Ticket Info */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex flex-col items-center justify-center text-black font-bold shadow-lg">
                    <span className="text-xs font-medium uppercase opacity-80">Aug</span>
                    <span className="text-xl leading-none">15</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold text-lg">The Royal Gala</h3>
                    <div className="flex items-center gap-2 text-amber-200 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Selling Fast</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Glow Behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/10 rounded-full blur-[100px] -z-10" />
          </div>

        </div>
      </section>

      {/* --- EVENT LIST SECTION (Categories & Upcoming) --- */}
      <section className="container mx-auto px-6 pb-24 relative z-10">
        <FadeIn delay={0.4}>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Upcoming <span className="text-gradient-gold">Events</span></h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <EventList />
        </FadeIn>
      </section>

    </div>
  );
}