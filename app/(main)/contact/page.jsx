"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success("Message sent successfully!");
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative py-12 px-4 sm:px-6">

            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                {/* Left Column: Info & Text */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
                            Get in <span className="text-amber-500">Touch</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                            Have questions about hosting an event or need support? Our dedicated team is here to assist you with royal service.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <ContactItem
                            icon={<MapPin className="w-6 h-6 text-amber-500" />}
                            title="Visit Us"
                            content="Gulshan Avenue, Dhaka 1212, Bangladesh"
                            label="Our Headquarters"
                        />
                        <ContactItem
                            icon={<Mail className="w-6 h-6 text-amber-500" />}
                            title="Email Us"
                            content="support@royalclassevents.com"
                            label="24/7 Support"
                            isLink
                            href="mailto:support@royalclassevents.com"
                        />
                        <ContactItem
                            icon={<Phone className="w-6 h-6 text-amber-500" />}
                            title="Call Us"
                            content="+880 1711 000000"
                            label="Mon-Fri, 9am - 6pm"
                            isLink
                            href="tel:+8801711000000"
                        />
                    </div>
                </div>

                {/* Right Column: Contact Form */}
                <div className="relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full opacity-20 blur-2xl animate-pulse" />

                    <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                        <CardContent className="p-8 sm:p-10">
                            {!isSuccess ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold">Send a Message</h3>
                                        <p className="text-sm text-gray-400">We usually respond within 2 hours.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium ml-1">Full Name</label>
                                            <Input
                                                placeholder="John Doe"
                                                required
                                                className="bg-background/50 border-white/10 focus:border-amber-500/50 h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium ml-1">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="john@example.com"
                                                required
                                                className="bg-background/50 border-white/10 focus:border-amber-500/50 h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium ml-1">Message</label>
                                            <Textarea
                                                placeholder="How can we help you?"
                                                required
                                                className="bg-background/50 border-white/10 focus:border-amber-500/50 min-h-[150px] resize-none"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                                        <p className="text-gray-400 max-w-xs mx-auto">
                                            Thank you for reaching out. Our team will get back to you shortly via email.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSuccess(false)}
                                        className="mt-4 border-white/10 text-amber-500 hover:text-amber-400 hover:bg-white/5"
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ContactItem({ icon, title, content, label, isLink, href }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
            <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors border border-amber-500/10">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-amber-500 mb-1">{label}</p>
                <h4 className="text-xl font-bold text-foreground">
                    {isLink ? (
                        <a href={href} className="hover:text-amber-400 transition-colors">
                            {content}
                        </a>
                    ) : (
                        content
                    )}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{title}</p>
            </div>
        </div>
    );
}
