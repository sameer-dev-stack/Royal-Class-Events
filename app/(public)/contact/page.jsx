"use client";

import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(5, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

const ContactInfoItem = ({ icon: Icon, title, content, subContent }) => (
    <div className="flex gap-6 group">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
            <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
            <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">{title}</h4>
            <p className="text-xl font-bold text-foreground">{content}</p>
            <p className="text-sm text-muted-foreground font-light">{subContent}</p>
        </div>
    </div>
);

export default function ContactPage() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data) => {
        // Mock API call
        console.log("Form Data:", data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Message received! Our global team will be in touch shortly.");
        reset();
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-6">
                            Connect with Us
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                            Reach the <br />
                            <span className="text-gradient-gold">Royal Guard.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                            Whether you're an organizer or an elite attendee, we're here to assist
                            with your high-stakes event requirements.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 lg:items-start">

                    {/* Left Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-16"
                    >
                        <div className="space-y-12">
                            <ContactInfoItem
                                icon={Mail}
                                title="Global Support"
                                content="support@royalclass.com"
                                subContent="Average response time: 4 hours"
                            />
                            <ContactInfoItem
                                icon={Phone}
                                title="Executive Hotline"
                                content="+971 4 000 0000"
                                subContent="Available 24/7 for Enterprise Plan"
                            />
                            <ContactInfoItem
                                icon={MapPin}
                                title="Headquarters"
                                content="Royal Square, Level 42"
                                subContent="DIFC, Dubai, UAE"
                            />
                        </div>

                        <div className="space-y-6 pt-10 border-t border-border">
                            <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] opacity-50">Global Network</h4>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                    <button key={i} className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all">
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative p-1 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-3xl"
                    >
                        <div className="bg-card p-8 md:p-12 rounded-3xl shadow-2xl space-y-8 border border-border">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black italic">Send a Dispatch</h3>
                                <p className="text-muted-foreground font-light">Complete the form below to initiate communication.</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest pl-2">Full Name</label>
                                        <Input
                                            {...register("name")}
                                            placeholder="e.g. Alexander Thorne"
                                            className={cn(
                                                "h-14 bg-background border-border rounded-2xl focus:ring-[#D4AF37]/50",
                                                errors.name && "border-red-500/50"
                                            )}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs pl-2">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest pl-2">Email Identity</label>
                                        <Input
                                            {...register("email")}
                                            placeholder="e.g. alex@company.com"
                                            className={cn(
                                                "h-14 bg-background border-border rounded-2xl focus:ring-[#D4AF37]/50",
                                                errors.email && "border-red-500/50"
                                            )}
                                        />
                                        {errors.email && <p className="text-red-500 text-xs pl-2">{errors.email.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest pl-2">Subject of Inquiry</label>
                                    <Input
                                        {...register("subject")}
                                        placeholder="What is this regarding?"
                                        className={cn(
                                            "h-14 bg-background border-border rounded-2xl focus:ring-[#D4AF37]/50",
                                            errors.subject && "border-red-500/50"
                                        )}
                                    />
                                    {errors.subject && <p className="text-red-500 text-xs pl-2">{errors.subject.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest pl-2">Your Message</label>
                                    <Textarea
                                        {...register("message")}
                                        placeholder="Describe your requirements in detail..."
                                        className={cn(
                                            "min-h-[160px] bg-background border-border rounded-3xl focus:ring-[#D4AF37]/50 pt-4",
                                            errors.message && "border-red-500/50"
                                        )}
                                    />
                                    {errors.message && <p className="text-red-500 text-xs pl-2">{errors.message.message}</p>}
                                </div>

                                <Button
                                    disabled={isSubmitting}
                                    className="w-full h-16 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#D4AF37]/10 group transition-all"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Global Presence Map Placeholder */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative h-[400px] w-full bg-card border border-border rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="inline-flex p-4 rounded-3xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] mb-4 animate-bounce">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter">Global Operation Map</h3>
                                <p className="text-muted-foreground font-light max-w-sm mx-auto">
                                    Our nodes are distributed across Dubai, London, New York & Singapore.
                                </p>
                            </div>
                        </div>

                        {/* Decorative dots for nodes */}
                        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-[#D4AF37] rounded-full blur-[2px] animate-pulse" />
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#D4AF37] rounded-full blur-[2px] animate-pulse delay-700" />
                        <div className="absolute bottom-1/2 left-1/2 w-4 h-4 bg-[#D4AF37]/50 rounded-full blur-[4px] animate-ping" />
                    </div>
                </div>
            </section>
        </div>
    );
}

