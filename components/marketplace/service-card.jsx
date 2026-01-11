"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

/**
 * ServiceCard - Displays a supplier service/package with glassmorphism styling
 * @param {object} props
 * @param {string} props.title - Service title
 * @param {number} props.price - Price in currency units
 * @param {string} props.currency - Currency code (default: "BDT")
 * @param {string} props.description - Service description
 * @param {string[]} props.features - List of included features
 * @param {boolean} props.featured - Whether this is a featured/recommended package
 */
export default function ServiceCard({
    title,
    price,
    currency = "BDT",
    description,
    features = [],
    featured = false,
}) {
    const formatPrice = (amount) => {
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`
                relative group rounded-2xl p-6
                bg-zinc-900/50 backdrop-blur-xl
                border border-zinc-800/50
                hover:border-amber-500/50
                hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]
                transition-all duration-500
                ${featured ? "ring-2 ring-amber-500/30" : ""}
            `}
        >
            {/* Featured Badge */}
            {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    RECOMMENDED
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-amber-400 transition-colors">
                    {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-zinc-800/50">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-amber-500">
                        {formatPrice(price)}
                    </span>
                    <span className="text-muted-foreground text-sm">/package</span>
                </div>
            </div>

            {/* Features List */}
            {features.length > 0 && (
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                            <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-amber-500" />
                            </div>
                            <span className="text-zinc-300">{feature}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
}
