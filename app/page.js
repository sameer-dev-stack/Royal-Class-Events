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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium backdrop-blur-sm">
              <Crown className="w-4 h-4 fill-[#D4AF37]/20" />
              <span>The #1 Platform for Elite Experiences</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-foreground space-y-2">
              <span className="block">
                Experience the
              </span>
              <span className="block text-gradient-gold relative">
                Exclusive
                {/* Decorative spark */}
                <Sparkles className="absolute -top-4 -right-6 md:-top-6 md:-right-8 w-6 h-6 md:w-8 md:h-8 text-[#F7E08B] rotate-12 animate-pulse" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto sm:mx-0 font-light leading-relaxed">
              From private galas to VIP soirees, we curate unforgettable moments.
              Join the inner circle and book your next premium experience today.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
              <Button size="xl" asChild className="w-full sm:w-auto h-14 px-8 rounded-full bg-gradient-to-r from-[#F7E08B] via-[#D4AF37] to-[#8C7326] hover:brightness-110 text-black font-bold text-lg border-none shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all transform hover:-translate-y-1">
                <Link href="/explore" suppressHydrationWarning>
                  Explore Events
                </Link>
              </Button>

              {mounted && !isAuthenticated && (
                <Button variant="ghost" size="xl" asChild className="hidden sm:flex h-14 px-8 rounded-full text-foreground hover:bg-foreground/10 group cursor-pointer">
                  <Link href="/sign-in" suppressHydrationWarning>
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
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1280&q=80"
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F7E08B] to-[#D4AF37] flex flex-col items-center justify-center text-black font-bold shadow-lg">
                    <span className="text-xs font-medium uppercase opacity-80">Aug</span>
                    <span className="text-xl leading-none">15</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold text-lg">The Royal Gala</h3>
                    <div className="flex items-center gap-2 text-[#F7E08B] text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Selling Fast</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Glow Behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#D4AF37]/10 rounded-full blur-[100px] -z-10" />
          </div>

        </div>
      </section>

      {/* --- INFINITE SCROLL BANNER --- */}
      <InfiniteScrollBanner />

      {/* --- EVENT LIST SECTION (Upcoming Events) --- */}
      <section className="container mx-auto px-6 pb-24 relative z-10">
        <FadeIn delay={0.4}>
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

            <div className="max-w-xl mx-auto">
              {/* Attendee Path */}
              <div className="group relative p-8 rounded-3xl border border-border bg-card/40 backdrop-blur-sm hover:border-[#D4AF37]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl group-hover:bg-[#D4AF37]/10 transition-colors" />
                <div className="relative z-10 space-y-6 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-500 mx-auto sm:mx-0">
                    <Ticket className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">Explore Royal Experiences</h3>
                    <p className="text-muted-foreground leading-relaxed font-light">
                      Discover the most exclusive galas, VIP soirees, and premium events curated for the inner circle.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/sign-up?role=attendee" className="flex-1" suppressHydrationWarning>
                      <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F7E08B] via-[#D4AF37] to-[#8C7326] hover:brightness-110 text-black font-bold border-none shadow-lg transition-all">
                        Sign Up as Attendee
                      </Button>
                    </Link>
                    <Link href="/sign-in" className="flex-1" suppressHydrationWarning>
                      <Button variant="outline" className="w-full h-12 rounded-xl hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border-[#D4AF37]/30 font-bold">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}