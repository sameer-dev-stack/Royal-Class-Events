"use client";

import { useConvexQuery } from "@/hooks/use-convex-query";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import useAuthStore from "@/hooks/use-auth-store";

export default function RegisterModal({ isOpen, onClose, event }) {
  const { user, token } = useAuthStore();
  const registerMutation = useMutation(api.registrations.registerForEvent);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerMutation({
        eventId: event._id,
        attendeeName: name,
        attendeeEmail: email,
        token,
      });
      setIsSuccess(true);
      toast.success("Successfully registered!");
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl">You're In!</DialogTitle>
              <DialogDescription>
                Your registration for {event.title?.en || event.title} is confirmed.
              </DialogDescription>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Register for Event</DialogTitle>
              <DialogDescription>
                {event.title?.en || event.title} • {event.locationConfiguration?.venueName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Confirm Registration"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}