"use client";

import React from "react";
import { Crown, Star } from "lucide-react";

export default function InfiniteScrollBanner() {
    const items = [
        "ROYAL CLASS EVENTS",
        "EXCLUSIVE ACCESS",
        "VIP EXPERIENCE",
        "PREMIUM NETWORKING",
        "LUXURY VENUES",
        "ELITE GATHERINGS",
    ];

    return (
        <div className="w-full overflow-hidden bg-[#D4AF37]/5 border-y border-[#D4AF37]/10 py-4 md:py-6 backdrop-blur-sm relative z-20">
            <div className="flex w-fit animate-scroll hover:[animation-play-state:paused]">
                {/* First Set */}
                <div className="flex items-center flex-nowrap shrink-0 gap-10 md:gap-16 px-4 md:px-8">
                    {items.map((item, index) => (
                        <div key={`a-${index}`} className="flex items-center gap-4 md:gap-6 whitespace-nowrap">
                            <span className="text-xl md:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#8C7326]/40 to-[#F7E08B]/40">
                                {item}
                            </span>
                            <Star className="w-3 h-3 md:w-5 md:h-5 text-[#D4AF37]/30" />
                        </div>
                    ))}
                </div>

                {/* Duplicate Set for Seamless Loop */}
                <div className="flex items-center flex-nowrap shrink-0 gap-10 md:gap-16 px-4 md:px-8">
                    {items.map((item, index) => (
                        <div key={`b-${index}`} className="flex items-center gap-4 md:gap-6 whitespace-nowrap">
                            <span className="text-xl md:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#8C7326]/40 to-[#F7E08B]/40">
                                {item}
                            </span>
                            <Star className="w-3 h-3 md:w-5 md:h-5 text-[#D4AF37]/30" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

