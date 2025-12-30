"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, CheckCircle, Crown } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterModal({ event, isOpen, onClose }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: registerForEvent, isLoading } = useConvexMutation(
    api.registrations.registerForEvent
  );

  // Fetch Convex User to get the real Database ID
  const { data: convexUser } = useConvexQuery(api.users.getCurrentUser);

  const eventTitle = event.title?.en || event.title;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Store attendee info in session/local storage for checkout
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('attendeeInfo', JSON.stringify({
        fullName: name,
        email: email,
      }));
    }

    // Redirect to checkout page with event info
    router.push(`/checkout?eventId=${event.slug || event._id}`);
    onClose();
  };

  const handleViewTicket = () => {
    router.push("/my-tickets");
    onClose();
  };

  // Success state
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* REBRAND: Dark background */}
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-green-900/30 border border-green-800 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-white">You&apos;re All Set!</h2>
              <p className="text-gray-400">
                Your registration is confirmed. Check your Tickets for event
                details and your QR code ticket.
              </p>
            </div>
            <Separator className="bg-white/10" />
            <div className="w-full space-y-2">
              <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={handleViewTicket}>
                <Ticket className="w-4 h-4" />
                View My Ticket
              </Button>
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-gray-300" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Registration form
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* REBRAND: Dark background */}
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <DialogTitle className="text-white">Royal Registration</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Secure your spot for <span className="text-white font-medium">{eventTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Summary */}
          <div className="bg-zinc-900 border border-white/10 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-white">{eventTitle}</p>
            <p className="text-sm text-gray-400">
              {event.ticketType === "free" ? (
                <span className="text-emerald-400 font-medium">Free Entry</span>
              ) : (
                <span>
                  Price: <span className="text-amber-500 font-bold">৳{event.ticketPrice}</span>{" "}
                  <span className="text-xs text-gray-500">(Pay at venue)</span>
                </span>
              )}
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="bg-zinc-900 border-white/10 focus:border-amber-500 text-white placeholder:text-gray-600"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="bg-zinc-900 border-white/10 focus:border-amber-500 text-white placeholder:text-gray-600"
            />
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500">
            By registering, you agree to receive event updates and reminders via
            email.
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 hover:bg-white/5 text-gray-300"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Continue to Checkout
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}