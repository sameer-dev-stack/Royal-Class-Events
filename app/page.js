"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Crown, Sparkles, ArrowRight, Building, Ticket } from "lucide-react";
import EventList from "@/components/event-list";
import InfiniteScrollBanner from "@/components/infinite-scroll-banner";
import { FadeIn } from "@/components/ui/motion";
import useAuthStore from "@/hooks/use-auth-store";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-foreground space-y-2">
              <span className="block">
                Experience the
              </span>
              <span className="block text-gradient-gold relative">
                Exclusive
                {/* Decorative spark */}
                <Sparkles className="absolute -top-4 -right-6 md:-top-6 md:-right-8 w-6 h-6 md:w-8 md:h-8 text-amber-400 rotate-12 animate-pulse" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto sm:mx-0 font-light leading-relaxed">
              From private galas to VIP soirees, we curate unforgettable moments.
              Join the inner circle and book your next premium experience today.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
              <Button size="xl" asChild className="w-full sm:w-auto h-14 px-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg border-none shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-1">
                <Link href="/explore">
                  Explore Events
                </Link>
              </Button>

              {mounted && !isAuthenticated && (
                <Button variant="ghost" size="xl" asChild className="hidden sm:flex h-14 px-8 rounded-full text-foreground hover:bg-foreground/10 group cursor-pointer">
                  <Link href="/sign-in">
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
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

      {/* --- INFINITE SCROLL BANNER --- */}
      <InfiniteScrollBanner />

      {/* --- EVENT LIST SECTION (Upcoming Events) --- */}
      <section className="container mx-auto px-6 pb-24 relative z-10">
        <FadeIn delay={0.4}>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Upcoming <span className="text-gradient-gold">Events</span></h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <EventList />
        </FadeIn>
      </section>

      {/* --- CHOOSE YOUR JOURNEY SECTION --- */}
      {mounted && !isAuthenticated && (
        <section className="py-24 bg-background relative overflow-hidden border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your <span className="text-gradient-gold">Journey</span></h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
                Whether you're looking for the next exclusive experience or hosting a high-end gala, we have you covered.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Attendee Path */}
              <div className="group relative p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.1)] overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Ticket className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">Browse as Attendee</h3>
                    <p className="text-muted-foreground leading-relaxed font-light">
                      Browse exclusive events, secure your tickets, and manage your premium passes in one place.
                    </p>
                  </div>
                  <Link href="/explore?role=attendee" className="block">
                    <Button variant="outline" className="w-full h-12 rounded-xl hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all font-bold gap-2">
                      Browse <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Organizer Path */}
              <div className="group relative p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.1)] overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Building className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">Join as Organizer</h3>
                    <p className="text-muted-foreground leading-relaxed font-light">
                      Create luxury events, manage guest lists, and track real-time analytics with your host dashboard.
                    </p>
                  </div>
                  <Link href="/create-event?role=organizer" className="block">
                    <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-amber-900/20 transition-all transform group-hover:-translate-y-1">
                      Start Hosting <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}