"use client";

import React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

const TESTIMONIALS = [
    {
        quote: "The Royal Seat Engine allowed us to map a complex stadium layout in minutes. The accuracy is unmatched.",
        author: "James Sterling",
        role: "Director, Global Tours",
        rating: 5
    },
    {
        quote: "Processing 1,500 VIP guests smoothly was our biggest concern. The Scanning App worked flawlessly even in offline mode.",
        author: "Sarah El-Din",
        role: "Head of Operations, MENA Fashion Week",
        rating: 5
    },
    {
        quote: "We saw a 40% increase in VIP ticket sales after implementing Royal's marketing spotlights.",
        author: "Michael Thorne",
        role: "CEO, Prestige Entertainment",
        rating: 5
    }
];

export default function TestimonialCarousel() {
    return (
        <div className="w-full max-w-4xl mx-auto px-12">
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 5000,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent>
                    {TESTIMONIALS.map((t, i) => (
                        <CarouselItem key={i}>
                            <div className="p-1">
                                <Card className="bg-zinc-900/50 border-white/5 rounded-[3rem] overflow-hidden">
                                    <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                                        <div className="flex gap-1">
                                            {[...Array(t.rating)].map((_, j) => (
                                                <Star key={j} className="w-4 h-4 fill-amber-500 text-amber-500" />
                                            ))}
                                        </div>

                                        <Quote className="w-12 h-12 text-amber-500/20" />

                                        <p className="text-xl md:text-2xl font-light italic leading-relaxed text-zinc-200">
                                            "{t.quote}"
                                        </p>

                                        <div className="space-y-1">
                                            <p className="font-bold text-white uppercase tracking-widest text-xs">{t.author}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">{t.role}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex border-white/10 hover:bg-amber-500 hover:text-black transition-all" />
                <CarouselNext className="hidden md:flex border-white/10 hover:bg-amber-500 hover:text-black transition-all" />
            </Carousel>
        </div>
    );
}
