"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Heart, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SupplierCard({ supplier }) {
    const { _id, name, rating, reviewCount, location, startingPrice, coverUrl, categories, serviceImages } = supplier;
    const displayImage = coverUrl || serviceImages?.[0] || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop";

    return (
        <Link href={`/marketplace/vendor/${_id}`} className="group block h-full">
            <div className="relative h-full bg-zinc-900/40 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] hover:-translate-y-1 flex flex-col group border border-white/5 hover:border-amber-500/30">

                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                    <Image
                        src={displayImage}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:saturate-110"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                    {/* Featured / Rating Badge */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                        {rating > 0 && (
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {rating.toFixed(1)} <span className="text-zinc-400 font-normal">({reviewCount})</span>
                            </div>
                        )}
                        {!rating && (
                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border border-amber-500/20 backdrop-blur-md">
                                New Arrival
                            </Badge>
                        )}
                    </div>

                    {/* Like Button */}
                    <button className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors backdrop-blur-md border border-white/10 z-10">
                        <Heart className="w-4 h-4" />
                    </button>

                    {/* Category Overlay */}
                    <div className="absolute bottom-4 left-4 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1 block">
                            {categories?.[0] || "Vendor"}
                        </span>
                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-amber-100 transition-colors">
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow relative">
                    {/* Glow element */}
                    <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-zinc-900/40 to-transparent pointer-events-none" />

                    <div className="flex items-center text-sm text-zinc-400 mt-1 mb-4">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                        <span className="truncate">
                            {location?.city || "Dhaka"}, {location?.country || "Bangladesh"}
                        </span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Starting from</span>
                            <span className="text-lg font-bold text-zinc-200">
                                {startingPrice ? `৳ ${startingPrice.toLocaleString()}` : "Custom Pricing"}
                            </span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
