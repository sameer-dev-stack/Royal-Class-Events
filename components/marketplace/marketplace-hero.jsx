"use client";

import { useState } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

// Dark, high-tech concert stage background - more "Cyberpunk"
const HERO_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";

export default function MarketplaceHero({ categories, cities }) {
    const router = useRouter();
    const [selectedCity, setSelectedCity] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        const queryParams = new URLSearchParams();
        if (selectedCity && selectedCity !== "all") queryParams.set("city", selectedCity);
        if (selectedCategory && selectedCategory !== "all") queryParams.set("category", selectedCategory);
        if (searchQuery) queryParams.set("query", searchQuery);
        router.push(`/marketplace?${queryParams.toString()}`);
    };

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden rounded-3xl">
            {/* Background Image with Cinematic Dark Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform hover:scale-105 transition-transform duration-[30s]"
                style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            />
            {/* Gradient Mesh Overlay */}
            {/* Gradient Mesh Overlay - Theme Aware */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950 z-10 dark:from-zinc-950/80 dark:to-zinc-950 from-black/60 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent z-10" />

            {/* Content */}
            <div className="relative z-20 w-full max-w-5xl px-4 text-center">
                <div className="animate-fade-in-up">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-sm shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]">
                        Premium Event Solutions
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                        Curating <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7E08B] via-[#F7E08B] to-[#8C7326] drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]">Extraordinary</span>
                        <br /> Experiences
                    </h1>
                    <p className="text-zinc-300/90 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover elite vendors, venues, and creatives for events that define status.
                    </p>

                    {/* Floating Glass Search Bar */}
                    <div className="group relative bg-card/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-border/50 dark:border-white/10 p-2 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.15)] transition-all duration-500 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto">

                        {/* Search Query Input */}
                        <div className="w-full md:w-[30%] relative border-b md:border-b-0 md:border-r border-white/10">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <Input
                                placeholder="What are you looking for?"
                                className="h-12 bg-transparent border-0 text-white placeholder:text-zinc-400 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="w-full md:w-[25%] relative border-b md:border-b-0 md:border-r border-white/10">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger
                                    className="h-12 bg-transparent border-0 text-zinc-200 focus:ring-0 focus:ring-offset-0 px-4"
                                >
                                    <SelectValue placeholder="Service Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    <SelectItem value="all">All Services</SelectItem>
                                    {categories.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* City Dropdown */}
                        <div className="w-full md:w-[25%] relative">
                            <Select value={selectedCity} onValueChange={setSelectedCity}>
                                <SelectTrigger
                                    className="h-12 bg-transparent border-0 text-zinc-200 focus:ring-0 focus:ring-offset-0 px-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                        <SelectValue placeholder="City" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    <SelectItem value="all">All Cities</SelectItem>
                                    {cities.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Button */}
                        <div className="w-full md:w-[20%] p-1">
                            <Button
                                onClick={handleSearch}
                                className="w-full h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-orange-600 hover:from-[#8C7326] hover:to-orange-700 text-white font-bold tracking-wide shadow-lg hover:shadow-[#D4AF37]/25 transition-all duration-300"
                            >
                                EXPLORE
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Popular Tags - Minimalist Tech */}
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-medium text-zinc-400/80 uppercase tracking-widest">
                    <span className="text-[#D4AF37]/80">Trending:</span>
                    {["Cyberpunk Decor", "Holographic Stage", "Drone Shows", "Molecular Catering"].map(tag => (
                        <button key={tag} className="hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

