"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    MapPin,
    Star,
    Phone,
    Mail,
    Globe,
    Instagram,
    MessageSquare,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Clock,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/marketplace/service-card";
import RFQModal from "@/components/marketplace/rfq-modal";

export default function VendorProfilePage() {
    const params = useParams();
    const supplierId = params?.id;
    const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);

    // Validate that supplierId looks like a valid Convex ID (alphanumeric, no special chars)
    const isValidId = supplierId && /^[a-zA-Z0-9]+$/.test(supplierId) && supplierId.length > 10;

    // Fetch supplier profile with services and reviews
    const profile = useQuery(
        api.suppliers.getProfile,
        isValidId ? { supplierId } : "skip"
    );

    // Loading State
    if (profile === undefined) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading vendor profile...</p>
                </div>
            </div>
        );
    }

    // Not Found State (or invalid ID)
    if (profile === null || !isValidId) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Vendor Not Found</h1>
                    <p className="text-muted-foreground">
                        This vendor profile doesn't exist or is no longer available.
                    </p>
                    <Button asChild className="bg-[#D4AF37] hover:bg-[#8C7326] text-black">
                        <Link href="/marketplace">Browse Vendors</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const {
        name,
        description,
        categories,
        location,
        contact,
        logoUrl,
        coverUrl,
        rating,
        reviewCount,
        verified,
        portfolios,
        services,
        reviews,
        startingPrice,
    } = profile;

    const formatPrice = (amount) => {
        if (!amount) return "Contact for pricing";
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <div className="min-h-screen bg-background text-foreground">
                {/* ============== HERO SECTION ============== */}
                <section className="relative h-[400px] md:h-[500px] overflow-hidden rounded-3xl mx-4 md:mx-6 lg:mx-12 mt-6 shadow-2xl">
                    {/* Cover Image */}
                    <div className="absolute inset-0">
                        {coverUrl ? (
                            <Image
                                src={coverUrl}
                                alt={`${name} cover`}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800" />
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                    </div>

                    {/* Hero Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                        <div className="max-w-7xl mx-auto flex items-end gap-6">
                            {/* Avatar */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative flex-shrink-0"
                            >
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-zinc-800 border-4 border-zinc-950 shadow-2xl overflow-hidden">
                                    {logoUrl ? (
                                        <Image
                                            src={logoUrl}
                                            alt={name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#8C7326] flex items-center justify-center">
                                            <span className="text-3xl md:text-4xl font-black text-black">
                                                {name?.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {verified && (
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center border-2 border-background">
                                        <CheckCircle2 className="w-4 h-4 text-black" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                    <h1 className="text-2xl md:text-4xl font-black text-foreground truncate">
                                        {name}
                                    </h1>
                                    {verified && (
                                        <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#F7E08B] text-xs font-bold rounded-full">
                                            VERIFIED
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                        {location?.city}, {location?.country}
                                    </span>
                                    {rating > 0 && (
                                        <span className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                            {rating.toFixed(1)} ({reviewCount} reviews)
                                        </span>
                                    )}
                                </div>

                                {/* Categories */}
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    {categories?.slice(0, 4).map((cat) => (
                                        <span
                                            key={cat}
                                            className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full border border-border"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============== MAIN CONTENT ============== */}
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                        {/* ===== LEFT COLUMN (Main Content) ===== */}
                        <div className="space-y-12">
                            {/* About Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                                    About
                                </h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {description || "No description provided yet."}
                                </p>
                            </motion.div>

                            {/* Portfolio Section */}
                            {portfolios && portfolios.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-[#D4AF37]" />
                                        Portfolio
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {portfolios.slice(0, 6).map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 * index }}
                                                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                                            >
                                                {item.type === "video" ? (
                                                    <video
                                                        src={item.url}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        loop
                                                        playsInline
                                                    />
                                                ) : (
                                                    <Image
                                                        src={item.url}
                                                        alt={item.caption || `Portfolio ${index + 1}`}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                    {item.caption && (
                                                        <p className="text-white text-sm font-medium">
                                                            {item.caption}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Services Section */}
                            {services && services.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#D4AF37]" />
                                        Services & Packages
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {services.map((service, index) => (
                                            <ServiceCard
                                                key={service._id}
                                                title={service.name}
                                                price={service.price}
                                                currency={service.currency}
                                                description={service.description}
                                                features={service.features}
                                                featured={index === 0}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Reviews Section */}
                            {reviews && reviews.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-[#D4AF37]" />
                                        Recent Reviews
                                    </h2>
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div
                                                key={review._id}
                                                className="p-5 bg-card/50 rounded-xl border border-border"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                        {review.reviewerImage ? (
                                                            <Image
                                                                src={review.reviewerImage}
                                                                alt={review.reviewerName}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-bold text-zinc-400">
                                                                {review.reviewerName?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-semibold text-foreground">
                                                                {review.reviewerName}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating
                                                                            ? "text-[#D4AF37] fill-[#D4AF37]"
                                                                            : "text-zinc-700"
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                                            {review.comment}
                                                        </p>
                                                        {review.response && (
                                                            <div className="mt-3 pl-4 border-l-2 border-[#D4AF37]/30">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    Vendor Response:
                                                                </p>
                                                                <p className="text-sm text-zinc-300">
                                                                    {review.response}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* ===== RIGHT COLUMN (Sidebar) ===== */}
                        <div className="lg:sticky lg:top-24 h-fit">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl"
                            >
                                {/* Starting Price */}
                                <div className="mb-6 pb-6 border-b border-border/50">
                                    <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                                    <p className="text-3xl font-black text-[#D4AF37]">
                                        {formatPrice(startingPrice)}
                                    </p>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4 mb-6">
                                    {contact?.email && (
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="flex items-center gap-3 text-muted-foreground hover:text-[#D4AF37] transition-colors"
                                        >
                                            <Mail className="w-5 h-5 text-muted-foreground" />
                                            <span className="text-sm truncate">{contact.email}</span>
                                        </a>
                                    )}
                                    {contact?.phone && (
                                        <a
                                            href={`tel:${contact.phone}`}
                                            className="flex items-center gap-3 text-muted-foreground hover:text-[#D4AF37] transition-colors"
                                        >
                                            <Phone className="w-5 h-5 text-muted-foreground" />
                                            <span className="text-sm">{contact.phone}</span>
                                        </a>
                                    )}
                                    {contact?.website && (
                                        <a
                                            href={contact.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-muted-foreground hover:text-[#D4AF37] transition-colors"
                                        >
                                            <Globe className="w-5 h-5 text-muted-foreground" />
                                            <span className="text-sm truncate">{contact.website}</span>
                                        </a>
                                    )}
                                    {contact?.instagram && (
                                        <a
                                            href={`https://instagram.com/${contact.instagram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-muted-foreground hover:text-[#D4AF37] transition-colors"
                                        >
                                            <Instagram className="w-5 h-5 text-muted-foreground" />
                                            <span className="text-sm">@{contact.instagram}</span>
                                        </a>
                                    )}
                                </div>

                                {/* CTA Button */}
                                <Button
                                    onClick={() => setIsRFQModalOpen(true)}
                                    className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#8C7326] hover:from-[#8C7326] hover:to-amber-700 text-black font-bold text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] transition-all rounded-xl"
                                >
                                    <MessageSquare className="w-5 h-5 mr-2" />
                                    Request Quote
                                </Button>

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Typically responds within 24 hours
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>

            {/* RFQ Modal */}
            <RFQModal
                isOpen={isRFQModalOpen}
                onClose={() => setIsRFQModalOpen(false)}
                supplierId={supplierId}
                supplierName={name}
            />
        </>
    );
}
