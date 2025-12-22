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
      <DialogContent className="sm:max-w-md bg-background border-amber-500/20 text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {/* Changed to Gold color for Royal theme */}
            <Crown className="w-6 h-6 text-amber-500" />
            <DialogTitle className="text-2xl text-amber-500">Royal Access</DialogTitle>
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
          <div className="p-4 rounded-lg bg-card border border-border hover:border-amber-500/50 transition duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg text-foreground">Royal Membership</span>
              <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-full border border-amber-500/20">Recommended</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Unlimited Events
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Priority Support
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Custom Branding
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground">$29</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment gateway is currently being configured.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-border hover:bg-muted hover:text-foreground">
            Dismiss
          </Button>
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-none">
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}