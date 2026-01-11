"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MapPin, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Venue", "Catering", "Photography", "Decor", "Makeup", "Music"];
const CITIES = ["Dhaka", "Chittagong", "Sylhet"];

export default function MarketplacePage() {
    const [search, setSearch] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [priceRange, setPriceRange] = useState([0, 500000]);

    const suppliers = useQuery(api.suppliers.searchSuppliers, {
        query: search || undefined,
        city: selectedCity || undefined,
        category: selectedCategory || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
    });

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 md:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Find the Best <span className="text-amber-500">Event Vendors</span>
                </h1>
                <p className="text-zinc-400">Discover trusted professionals for your big day.</p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="hidden lg:block space-y-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl h-fit sticky top-24">
                    <div>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-amber-500" /> Filters
                        </h3>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search vendors..."
                                className="pl-9 bg-zinc-950 border-zinc-800 focus:ring-amber-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Categories */}
                        <div className="mb-6">
                            <label className="text-sm text-zinc-400 mb-2 block">Category</label>
                            <div className="space-y-2">
                                {CATEGORIES.map(cat => (
                                    <div key={cat} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={cat}
                                            checked={selectedCategory === cat}
                                            onCheckedChange={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                                            className="border-zinc-700 data-[state=checked]:bg-amber-500 data-[state=checked]:text-black"
                                        />
                                        <label htmlFor={cat} className="text-sm text-zinc-300 cursor-pointer">{cat}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cities */}
                        <div className="mb-6">
                            <label className="text-sm text-zinc-400 mb-2 block">City</label>
                            <div className="flex flex-wrap gap-2">
                                {CITIES.map(city => (
                                    <Button
                                        key={city}
                                        variant={selectedCity === city ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCity(selectedCity === city ? "" : city)}
                                        className={selectedCity === city
                                            ? "bg-amber-500 text-black hover:bg-amber-600"
                                            : "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        }
                                    >
                                        {city}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-sm text-zinc-400 mb-4 block">
                                Starting Price: ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}+
                            </label>
                            <Slider
                                defaultValue={[0, 500000]}
                                max={1000000}
                                step={5000}
                                value={priceRange}
                                onValueChange={setPriceRange}
                                className="py-4"
                            />
                        </div>
                    </div>
                </div>

                {/* Vendor Grid */}
                <div className="lg:col-span-3">
                    {suppliers === undefined ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                        </div>
                    ) : suppliers.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
                            <p className="text-zinc-500">No vendors found matching your criteria.</p>
                            <Button
                                variant="link"
                                className="text-amber-500"
                                onClick={() => { setSelectedCategory(""); setSelectedCity(""); setSearch(""); }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {suppliers.map((vendor) => (
                                <Link href={`/marketplace/vendor/${vendor._id}`} key={vendor._id} className="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
                                    {/* Image */}
                                    <div className="h-48 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                        {vendor.coverUrl || vendor.logoUrl ? (
                                            <Image
                                                src={vendor.coverUrl || vendor.logoUrl}
                                                alt={vendor.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                                <span className="text-4xl font-bold text-zinc-700">{vendor.name?.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-amber-500 border border-amber-500/20">
                                            ★ {vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="text-xs text-amber-500 font-medium mb-1 uppercase tracking-wider">
                                            {vendor.categories?.[0] || "Vendor"}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                                            {vendor.name}
                                        </h3>
                                        <div className="flex items-center text-zinc-400 text-sm mb-4">
                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                            {vendor.location?.city || "Bangladesh"}, {vendor.location?.country || "BD"}
                                        </div>

                                        <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-zinc-500">Starts from</p>
                                                <p className="text-white font-bold">
                                                    {vendor.startingPrice
                                                        ? `৳ ${vendor.startingPrice.toLocaleString()}`
                                                        : "Contact"}
                                                </p>
                                            </div>
                                            <span className="text-xs text-zinc-500 border border-zinc-700 px-2 py-1 rounded bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-colors">
                                                View Profile
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
