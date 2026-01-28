"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
    Sparkles,
    Wand2,
    TrendingUp,
    Lightbulb,
    Loader2,
    Copy,
    Check,
    X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * AI Copilot for Event Creation
 * Provides AI-powered assistance for writing descriptions and analyzing events
 */
export function EventCopilot({
    eventTitle = "",
    eventCategory = "",
    eventLocation = "",
    eventDate = "",
    ticketPrice = 0,
    capacity = 100,
    onDescriptionGenerated,
    className
}) {
    const { token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [copied, setCopied] = useState(false);

    // Convex actions
    const generateDescription = useAction(api.ai.generateDescription);
    const analyzeEvent = useAction(api.ai.analyzeEvent);

    // Generate premium description
    const handleMagicWrite = async () => {
        if (!eventTitle.trim()) {
            toast.error("Please enter an event title first");
            return;
        }

        setIsGenerating(true);
        setGeneratedContent("");

        try {
            const result = await generateDescription({
                title: eventTitle,
                category: eventCategory,
                location: eventLocation,
                date: eventDate,
                token: token || "",
            });

            if (result.success) {
                setGeneratedContent(result.content);
                toast.success("Description generated! ✨");
            } else {
                toast.error(result.error || "Failed to generate description");
            }
        } catch (error) {
            console.error("AI error:", error);
            toast.error("AI service unavailable. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Analyze event for success prediction
    const handleAnalyze = async () => {
        if (!eventTitle.trim()) {
            toast.error("Please enter an event title first");
            return;
        }

        setIsAnalyzing(true);
        setAnalysis("");

        try {
            const result = await analyzeEvent({
                title: eventTitle,
                category: eventCategory,
                price: ticketPrice,
                capacity: capacity,
                location: eventLocation,
                token: token || "",
            });

            if (result.success) {
                setAnalysis(result.content);
                toast.success("Analysis complete! 📊");
            } else {
                toast.error(result.error || "Failed to analyze event");
            }
        } catch (error) {
            console.error("AI error:", error);
            toast.error("AI service unavailable. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Copy to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    // Use description (callback to parent form)
    const handleUseDescription = () => {
        if (onDescriptionGenerated && generatedContent) {
            onDescriptionGenerated(generatedContent);
            toast.success("Description applied to form! ✅");
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Floating AI Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        className={cn(
                            "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl",
                            "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700",
                            "hover:from-violet-500 hover:via-purple-500 hover:to-indigo-600",
                            "border-2 border-white/20 backdrop-blur-sm",
                            "transition-all duration-300 hover:scale-110 hover:shadow-purple-500/30",
                            className
                        )}
                        size="icon"
                        aria-label="Open AI Copilot"
                    >
                        <Sparkles className="h-6 w-6 text-white" />
                    </Button>
                </SheetTrigger>

                <SheetContent className="w-[400px] sm:w-[540px] bg-zinc-950 border-zinc-800 overflow-y-auto">
                    <SheetHeader className="space-y-1">
                        <SheetTitle className="flex items-center gap-2 text-white">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            Royal AI Copilot
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400">
                            AI-powered assistance for creating premium events
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        {/* Current Event Info */}
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                Current Event
                            </h4>
                            <p className="text-sm font-semibold text-white truncate">
                                {eventTitle || "No title yet"}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                                {eventCategory || "Category"} • ৳{ticketPrice || 0} • {capacity} seats
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Magic Write */}
                            <Button
                                onClick={handleMagicWrite}
                                disabled={isGenerating || !eventTitle}
                                className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Wand2 className="h-5 w-5" />
                                )}
                                <span className="text-xs font-bold uppercase tracking-wide">
                                    Magic Write
                                </span>
                            </Button>

                            {/* Pricing Analysis */}
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !eventTitle}
                                variant="outline"
                                className="h-auto py-4 flex-col gap-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white"
                            >
                                {isAnalyzing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                                )}
                                <span className="text-xs font-bold uppercase tracking-wide">
                                    Pricing Check
                                </span>
                            </Button>
                        </div>

                        {/* Generated Description */}
                        {generatedContent && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                        <Lightbulb className="h-3 w-3 text-amber-400" />
                                        Generated Description
                                    </h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopy}
                                        className="h-7 text-xs text-zinc-400 hover:text-white"
                                    >
                                        {copied ? (
                                            <Check className="h-3 w-3 mr-1 text-green-400" />
                                        ) : (
                                            <Copy className="h-3 w-3 mr-1" />
                                        )}
                                        {copied ? "Copied" : "Copy"}
                                    </Button>
                                </div>
                                <Textarea
                                    value={generatedContent}
                                    onChange={(e) => setGeneratedContent(e.target.value)}
                                    className="min-h-[200px] bg-zinc-900 border-zinc-700 text-white text-sm leading-relaxed resize-none"
                                    placeholder="AI-generated description will appear here..."
                                />
                                {onDescriptionGenerated && (
                                    <Button
                                        onClick={handleUseDescription}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Use This Description
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Event Analysis */}
                        {analysis && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                                    Event Analysis
                                </h4>
                                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700">
                                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                        {analysis}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-900/50">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">
                                💡 Pro Tips
                            </h4>
                            <ul className="text-xs text-zinc-400 space-y-1">
                                <li>• Enter your event title first for best results</li>
                                <li>• Magic Write creates premium, royal-themed copy</li>
                                <li>• Pricing Check analyzes your ticket price for BD market</li>
                            </ul>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

export default EventCopilot;
