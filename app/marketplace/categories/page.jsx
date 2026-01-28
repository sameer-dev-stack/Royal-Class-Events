"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";

const CATEGORIES = [
    { name: "Venue", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80" },
    { name: "Catering", img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80" },
    { name: "Photography", img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80" },
    { name: "Decor", img: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80" },
    { name: "Entertainment", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80" },
    { name: "Security", img: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=800&q=80" },
];

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Marketplace
                </Link>

                <div className="mb-12">
                    <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Browse All
                    </span>
                    <h1 className="text-4xl font-bold">Service Categories</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.name}
                            href={`/marketplace?category=${cat.name}`}
                            className="group relative h-64 rounded-3xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/50 transition-all"
                        >
                            <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-6 left-6">
                                <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
