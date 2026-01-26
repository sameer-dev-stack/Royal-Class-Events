"use client";

import { useState, useMemo } from "react";
import { Sparkles, Loader2, Check, X, ChevronLeft, Calendar, Users, Ticket, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AIEventCreator({ onEventGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("input"); // "input" or "review"
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    title: true,
    description: true,
    category: true,
    suggestedCapacity: true,
    suggestedTicketType: true,
  });

  const generateEvent = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your event");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setGeneratedData(data);
      setStep("review");
    } catch (error) {
      toast.error("Failed to generate event. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const finalData = {};
    Object.keys(selectedFields).forEach(key => {
      if (selectedFields[key]) {
        finalData[key] = generatedData[key];
      }
    });

    onEventGenerated(finalData);
    toast.success("AI suggestions applied to form!");
    setIsOpen(false);
    setStep("input");
    setPrompt("");
    setGeneratedData(null);
  };

  const toggleField = (field) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getFieldIcon = (field) => {
    switch (field) {
      case 'title': return <Tag className="w-4 h-4" />;
      case 'category': return <Sparkles className="w-4 h-4" />;
      case 'suggestedCapacity': return <Users className="w-4 h-4" />;
      case 'suggestedTicketType': return <Ticket className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setStep("input");
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/20 transition-all group">
          <Sparkles className="w-4 h-4 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
          AI Copilot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] border-[#D4AF37]/20 bg-background/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black italic tracking-tighter">
              <div className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/20 shadow-lg shadow-[#D4AF37]/10">
                <Sparkles className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]/20" />
              </div>
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#8C7326] bg-clip-text text-transparent">
                Event Intelligence
              </span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {step === "input"
                ? "Briefly describe your event and our AI will draft the details."
                : "Review and select which suggestions you'd like to use."}
            </DialogDescription>
          </DialogHeader>

          {step === "input" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A Rooftop Jazz Night for 100 people in Dhaka. VIP tables and catering included..."
                  rows={5}
                  className="resize-none bg-secondary/30 border-[#D4AF37]/10 focus-visible:ring-[#D4AF37]/50 rounded-2xl p-4 font-medium"
                />
                <div className="flex flex-wrap gap-2">
                  {["Tech Summit", "Luxury Wedding", "Music Fest", "Fashion Gala"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setPrompt(prev => prev ? prev + " " + suggestion : "Create a " + suggestion)}
                      className="text-[10px] px-3 py-1.5 rounded-full bg-secondary hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-all border border-border/50 font-black uppercase tracking-widest"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={generateEvent}
                  disabled={loading || !prompt.trim()}
                  className="w-full h-12 gap-2 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#D4AF37]/10 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Manifesting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {/* Review Fields */}
                {[
                  { id: 'title', label: 'Event Title', value: generatedData.title },
                  { id: 'description', label: 'Narrative', value: generatedData.description },
                  { id: 'category', label: 'Category', value: generatedData.category },
                  { id: 'suggestedCapacity', label: 'Capacity', value: generatedData.suggestedCapacity },
                  { id: 'suggestedTicketType', label: 'Pass Type', value: generatedData.suggestedTicketType },
                ].map((field) => (
                  <div
                    key={field.id}
                    onClick={() => toggleField(field.id)}
                    className={cn(
                      "group p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start",
                      selectedFields[field.id]
                        ? "bg-[#D4AF37]/5 border-[#D4AF37]/30 ring-1 ring-[#D4AF37]/20"
                        : "bg-muted/30 border-border/50 opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      selectedFields[field.id] ? "bg-[#D4AF37] border-[#D4AF37]" : "border-muted-foreground"
                    )}>
                      {selectedFields[field.id] && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          {field.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-normal text-foreground">
                        {field.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-border/20">
                <Button
                  variant="ghost"
                  onClick={() => setStep("input")}
                  className="px-6 h-12 gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1 h-12 gap-2 bg-[#D4AF37] hover:bg-[#8C7326] text-black font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#D4AF37]/10 transition-all hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4" />
                  Apply Selections
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

