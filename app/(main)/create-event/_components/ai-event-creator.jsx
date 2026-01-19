"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

export default function AIEventCreator({ onEventGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

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

      const data = await response.json();
      onEventGenerated(data);
      toast.success("Event details generated! Review and customize below.");
      setIsOpen(false);
      setPrompt("");
    } catch (error) {
      toast.error("Failed to generate event. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-[#D4AF37]/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]/20" />
            <span className="bg-gradient-to-r from-[#D4AF37] to-purple-600 bg-clip-text text-transparent font-bold">
              AI Event Assistant
            </span>
          </DialogTitle>
          <DialogDescription>
            Describe your vision, and we'll craft the perfect event details for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A luxury wine tasting evening in South Mumbai with jazz music..."
              rows={5}
              className="resize-none bg-secondary/30 border-primary/10 focus-visible:ring-[#D4AF37]/50"
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground font-medium mr-1">Try asking for:</span>
              {["Tech Setup", "Music Fest", "Workshop", "Charity Gala"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(prev => prev ? prev + " " + suggestion : "Create a " + suggestion)}
                  className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-[#D4AF37]/10 hover:text-[#8C7326] transition-colors border border-border/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="flex-1 hover:bg-secondary/80"
            >
              Cancel
            </Button>
            <Button
              onClick={generateEvent}
              disabled={loading || !prompt.trim()}
              className="flex-1 gap-2 bg-gradient-to-r from-[#D4AF37] to-purple-600 hover:from-[#8C7326] hover:to-purple-700 text-white border-0 shadow-lg shadow-[#D4AF37]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white/20" />
                  Generate Magic
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

