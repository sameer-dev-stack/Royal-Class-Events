"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Heart, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SupplierCard({ supplier }) {
    const { _id: id, name, rating, review_count, location, cover_url, categories, views, contact_info } = supplier;

    // In Postgres schema, starting price might come from a separate service query or a joined field.
    // For now, we'll keep the prop or default to "Custom Pricing".
    const startingPrice = supplier.starting_price || supplier.startingPrice;

    const displayImage = cover_url || supplier.coverUrl || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop";

    return (
        <Link href={`/marketplace/vendor/${id}`} className="group block h-full">
            <div className="relative h-full bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] hover:-translate-y-1 flex flex-col group border border-border hover:border-[#D4AF37]/30">

                {/* Image Section */}
                <div className="relative h-56 overflow-hidden rounded-3xl">
                    <Image
                        src={displayImage}
                        alt={name}
                        fill
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110 group-hover:saturate-150"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                    {/* Featured / Rating Badge */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                        {rating > 0 && (
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                                {Number(rating).toFixed(1)} <span className="text-zinc-400 font-normal">({review_count || 0})</span>
                            </div>
                        )}
                        {!rating && (
                            <Badge variant="secondary" className="bg-[#D4AF37]/20 text-[#F7E08B] border border-[#D4AF37]/20 backdrop-blur-md">
                                New Arrival
                            </Badge>
                        )}
                        {/* Demand Badge */}
                        {((rating >= 4.5) || (views > 50)) && (
                            <div className="bg-rose-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-1">
                                {rating >= 4.8 ? "🏆 Top Rated" : "🔥 High Demand"}
                            </div>
                        )}
                    </div>

                    {/* Like Button */}
                    <button className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors backdrop-blur-md border border-white/10 z-10">
                        <Heart className="w-4 h-4" />
                    </button>

                    {/* Category Overlay */}
                    <div className="absolute bottom-4 left-4 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1 block">
                            {categories?.[0] || "Vendor"}
                        </span>
                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-[#F7E08B] transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow relative">
                    {/* Glow element */}
                    <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />

                    <div className="flex items-center text-sm text-muted-foreground mt-1 mb-4">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        <span className="truncate">
                            {location?.city || "Dhaka"}, {location?.country || "Bangladesh"}
                        </span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Starting from</span>
                            <span className="text-lg font-bold text-foreground">
                                {startingPrice ? `৳ ${Number(startingPrice).toLocaleString()}` : "Custom Pricing"}
                            </span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                            <ArrowUpRight className="w-4 h-4 text-foreground group-hover:text-black" />
                        </div>
                    </div>
                </div>
            </div>
        </Link >
    );
}

