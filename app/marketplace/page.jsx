"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import MarketplaceHero from "@/components/marketplace/marketplace-hero";
import SupplierCard from "@/components/marketplace/supplier-card";
import { Loader2, ArrowRight, Sparkles, SearchX } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Premium Cyberpunk/Luxury Category Images
const CATEGORY_IMAGES = {
    "Venue": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    "Catering": "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    "Photography": "https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=800&q=80",
    "Cinematography": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    "Decor": "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",
    "Makeup": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80",
    "Music": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    "Attire": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    "Tech & AV": "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
    "Security": "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=800&q=80",
    "Logistics": "https://images.unsplash.com/photo-1586880244406-556ebe35f288?w=800&q=80",
    "Entertainment": "https://images.unsplash.com/photo-1493225255756-d95298119351?w=800&q=80",
};

// Default categories for fallback
const DEFAULT_CATEGORIES = ["Venue", "Catering", "Tech & AV", "Security", "Logistics", "Photography", "Decor", "Entertainment"];

export default function MarketplacePage() {
    const searchParams = useSearchParams();

    // Search Filters
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const query = searchParams.get("query");
    const isSearching = !!(category || city || query);

    // Queries
    const featuredSuppliers = useQuery(api.suppliers.getFeaturedSuppliers, { limit: 6 });
    const searchResults = useQuery(api.suppliers.searchSuppliers, isSearching ? {
        category: category !== "all" ? category : undefined,
        city: city || undefined,
        query: query || undefined,
        limit: 50
    } : "skip");

    const dbCategories = useQuery(api.suppliers.getCategories);
    const cities = useQuery(api.suppliers.getCities) || ["Dhaka", "Chittagong"];

    // Merge DB categories with default categories
    const categories = dbCategories?.length > 0 ? dbCategories : DEFAULT_CATEGORIES;

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500/30">
            {/* 1. Hero Section */}
            <MarketplaceHero categories={categories} cities={cities} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-20 animate-fade-in-up">

                {/* SEARCH RESULTS VIEW */}
                {isSearching ? (
                    <section>
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <span className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-2 block flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Search Results
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-white">
                                    {searchResults?.length || 0} Vendors Found
                                </h2>
                                <div className="flex gap-2 mt-2 text-sm text-zinc-400">
                                    {category && category !== "all" && <span className="bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">Category: {category}</span>}
                                    {city && <span className="bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">City: {city}</span>}
                                    {query && <span className="bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">"{query}"</span>}
                                    <Link href="/marketplace" className="text-amber-500 hover:text-amber-400 underline ml-2 self-center">
                                        Clear Filters
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {searchResults === undefined ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30">
                                <SearchX className="w-16 h-16 text-zinc-700 mb-4" />
                                <h3 className="text-xl font-bold text-zinc-300">No matches found</h3>
                                <p className="text-zinc-500 max-w-sm mt-2">
                                    Try adjusting your search terms or filters. We're constantly onboarding new elite vendors.
                                </p>
                                <Link
                                    href="/marketplace"
                                    className="mt-6 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold transition-colors"
                                >
                                    Browse All
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {searchResults.map((supplier) => (
                                    <div key={supplier._id} className="h-[400px]">
                                        <SupplierCard supplier={supplier} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    /* LANDING VIEW (Categories + Featured) */
                    <>
                        {/* 2. Visual Categories */}
                        <section>
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <span className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-2 block">Curated Collections</span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                                        Service Categories
                                    </h2>
                                </div>
                                <Link href="/marketplace/categories" className="group text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
                                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {categories.slice(0, 6).map((cat) => (
                                    <Link
                                        href={`/marketplace?category=${cat}`}
                                        key={cat}
                                        className="group relative h-64 rounded-2xl overflow-hidden border border-white/5 hover:border-amber-500/50 transition-colors"
                                    >
                                        <Image
                                            src={CATEGORY_IMAGES[cat] || `https://placehold.co/400x600?text=${encodeURIComponent(cat)}`}
                                            alt={cat}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:saturate-150"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:from-amber-950/80 transition-colors duration-500" />

                                        <div className="absolute bottom-0 inset-x-0 p-4">
                                            <span className="block w-8 h-0.5 bg-amber-500 mb-2 transform origin-left group-hover:scale-x-150 transition-transform duration-300" />
                                            <span className="font-bold text-lg text-white group-hover:text-amber-200 transition-colors">
                                                {cat}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* 3. Featured Vendors */}
                        <section>
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <span className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-2 block flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Top Rated
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                                        Featured Vendors
                                    </h2>
                                </div>
                                <Link href="/marketplace?sort=rating" className="group text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
                                    Explore Elite <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {featuredSuppliers === undefined ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {featuredSuppliers.map((supplier) => (
                                        <div key={supplier._id} className="h-[400px]">
                                            <SupplierCard supplier={supplier} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 4. Promotional Section */}
                        <section className="relative rounded-3xl overflow-hidden border border-white/10">
                            <div className="absolute inset-0">
                                <Image
                                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                                    alt="Event Inspiration"
                                    fill
                                    className="object-cover opacity-40"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                            </div>

                            <div className="relative p-8 md:p-16 max-w-2xl">
                                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/20">
                                    Enterprise Ready
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                    Planning a Corporate <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Mega-Event?</span>
                                </h2>
                                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                    Get dedicated support, custom billing, and priority vendor access for large-scale productions.
                                </p>
                                <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-full bg-white text-black px-8 font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                    Contact Sales
                                </Link>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
