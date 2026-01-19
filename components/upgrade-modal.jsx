"use client";

import { Sparkles, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UpgradeModal({ isOpen, onClose, trigger = "limit" }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-[#D4AF37]/20 text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {/* Changed to Gold color for Royal theme */}
            <Crown className="w-6 h-6 text-[#D4AF37]" />
            <DialogTitle className="text-2xl text-[#D4AF37]">Royal Access</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {trigger === "header" && "Unlock exclusive privileges. "}
            {trigger === "limit" && "You've reached your event limit. "}
            {trigger === "color" && "Custom styling is a Royal feature. "}
            Upgrade to curate unlimited premium experiences.
          </DialogDescription>
        </DialogHeader>

        {/* Placeholder for Pricing (Replaces the crashing PricingTable) */}
        <div className="py-6 space-y-4">
          <div className="p-4 rounded-lg bg-card border border-border hover:border-[#D4AF37]/50 transition duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg text-foreground">Royal Membership</span>
              <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs rounded-full border border-[#D4AF37]/20">Recommended</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Unlimited Events
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Priority Support
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Custom Branding
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Advanced Analytics
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Dedicated Account Manager
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-2">Enterprise Pricing</p>
              <p className="text-xs text-muted-foreground">
                Contact us for custom pricing tailored to your organization's needs.
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Get in touch with our team to discuss your requirements.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-border hover:bg-muted hover:text-foreground">
            Dismiss
          </Button>
          <Button className="flex-1 bg-#8C7326 hover:bg-amber-700 text-white border-none">
            Contact Us
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
