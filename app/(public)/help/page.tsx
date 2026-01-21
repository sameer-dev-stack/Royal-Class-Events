"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HELP_CATEGORIES, HELP_CONTENT } from "./help-data";
import { cn } from "@/lib/utils";

export default function HelpPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [searchQuery, setSearchQuery] = useState("");
    const [openItems, setOpenItems] = useState<string[]>([]);

    // Toggle accordion item
    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Filter content based on search
    const filteredCategories = HELP_CATEGORIES.map(cat => {
        const content = HELP_CONTENT[cat.id as keyof typeof HELP_CONTENT];
        const filteredContent = content.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...cat, content: filteredContent };
    }).filter(cat => cat.content.length > 0);

    const displayCategories = searchQuery ? filteredCategories : filteredCategories.filter(c => c.id === activeTab);

    return (
        <div className="min-h-screen bg-background pb-20">

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] -z-10" />

                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium border border-[#D4AF37]/20 mb-6">
                            <HelpCircle className="w-4 h-4" /> Support Center
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                            How can we <span className="text-gradient-gold">help you?</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
                            Browse our knowledge base for answers, guidelines, and platform standards.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative max-w-xl mx-auto"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#F7E08B]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-full shadow-2xl flex items-center px-4 h-14 focus-within:border-[#D4AF37]/50 transition-colors">
                                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search for questions (e.g., 'refunds', 'hosting')..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground/50 h-full w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* TABS NAVIGATION (Hidden on Search) */}
            {!searchQuery && (
                <section className="sticky top-20 z-30 bg-background/80 backdrop-blur-md border-b border-white/5 mb-12">
                    <div className="max-w-4xl mx-auto px-6 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 md:justify-center min-w-max py-4">
                            {HELP_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={cn(
                                        "relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        activeTab === cat.id
                                            ? "text-black bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CONTENT GRID */}
            <section className="max-w-3xl mx-auto px-6">
                <div className="space-y-12">
                    {displayCategories.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">No results found for "{searchQuery}".</p>
                            <button onClick={() => setSearchQuery("")} className="text-[#D4AF37] hover:underline mt-2">Clear search</button>
                        </div>
                    ) : (
                        displayCategories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {(searchQuery || activeTab === cat.id) && (
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                                            <cat.icon className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">{cat.label}</h2>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {cat.content.map((item, idx) => {
                                        const isOpen = openItems.includes(`${cat.id}-${idx}`);
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={false}
                                                className={cn(
                                                    "group rounded-xl border border-border bg-card/40 overflow-hidden transition-colors hover:border-[#D4AF37]/30",
                                                    isOpen && "border-[#D4AF37]/50 bg-card/80"
                                                )}
                                            >
                                                <button
                                                    onClick={() => toggleItem(`${cat.id}-${idx}`)}
                                                    className="w-full flex items-center justify-between p-6 text-left"
                                                >
                                                    <span className={cn("font-medium text-lg pr-4", isOpen ? "text-[#D4AF37]" : "text-foreground")}>
                                                        {item.question}
                                                    </span>
                                                    <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180 text-[#D4AF37]")} />
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <div className="px-6 pb-6 text-muted-foreground leading-relaxed font-light border-t border-white/5 pt-4">
                                                                {item.answer}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="max-w-4xl mx-auto px-6 mt-24">
                <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-background p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] -z-10" />

                    <h3 className="text-2xl font-bold mb-4">Still need assistance?</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Our Royal Concierge team is available 24/7 to help you with any specific inquiries or issues.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button className="h-12 px-8 rounded-full bg-[#D4AF37] text-black hover:bg-[#8C7326] font-bold">
                            <MessageCircle className="w-4 h-4 mr-2" /> Live Chat
                        </Button>
                        <Button variant="outline" className="h-12 px-8 rounded-full border-border hover:bg-white/5">
                            <Mail className="w-4 h-4 mr-2" /> Email Support
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    );
}
