"use client";

import { useState, useMemo, useEffect } from "react";
import { MapPin, Heart, ArrowRight, ArrowLeft, Crown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { bdDivisions, bdDistricts } from "@/lib/bd-locations"; // Custom Data
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data";
import useAuthStore from "@/hooks/use-auth-store";

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const { user, updateUser, token } = useAuthStore();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const roleParam = searchParams.get("role");
      if (roleParam === "organizer" || roleParam === "attendee") {
        setSelectedRole(roleParam);
        setStep(2);
        return;
      }

      const pendingRole = localStorage.getItem("pendingRole");
      if (pendingRole === "organizer" || pendingRole === "attendee") {
        setSelectedRole(pendingRole);
        setStep(2);
        localStorage.removeItem("pendingRole");
      }
    }
  }, [isOpen, searchParams]);

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [location, setLocation] = useState({
    state: "", // Will store Division
    city: "", // Will store District
    country: "Bangladesh",
  });

  // Use Custom Data for "States" (Divisions)
  const bangladeshDivisions = useMemo(() => {
    return bdDivisions.map(div => ({ name: div, isoCode: div }));
  }, []);

  // Use Custom Data for "Cities" (Districts)
  const cities = useMemo(() => {
    if (!location.state) return [];
    const districts = bdDistricts[location.state] || [];
    return districts.map(dist => ({ name: dist }));
  }, [location.state]);

  const toggleInterest = (categoryId) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }
    if (step === 2 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (step === 3 && (!location.city || !location.state)) {
      toast.error("Please select both Division and District");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const onboardingData = {
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
        },
        interests: selectedInterests,
        role: selectedRole,
        token: token
      };

      await completeOnboarding(onboardingData);

      updateUser({
        role: selectedRole,
        metadata: {
          ...user?.metadata,
          ...onboardingData,
          hasCompletedOnboarding: true
        }
      });

      toast.success("Welcome to Royal Class Events! 🎉");
      onComplete();
    } catch (error) {
      console.error("Onboarding failed:", error);
      toast.error("Failed to complete onboarding: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-background border-border">
        <DialogHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-1" />
          </div>
          <DialogTitle className="flex items-center gap-2 text-2xl text-foreground">
            {step === 1 ? (
              <>
                <Crown className="w-6 h-6 text-[#D4AF37]" />
                Choose your path
              </>
            ) : step === 2 ? (
              <>
                <Heart className="w-6 h-6 text-[#D4AF37]" />
                What interests you?
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
                Where are you located?
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Select how you'll use Royal Class Events"
              : step === 2
                ? "Select at least 3 categories to personalize your experience"
                : "We'll show you events happening near you"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedRole("attendee")}
                className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${selectedRole === "attendee"
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/20"
                    : "border-border hover:border-[#D4AF37]/50"
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#F7E08B] dark:bg-[#8C7326]/30 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-[#8C7326] dark:text-[#F7E08B]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Discover Events</h3>
                <p className="text-muted-foreground text-sm">
                  I want to browse events, buy tickets, and attend experiences.
                </p>
              </button>

              <button
                onClick={() => setSelectedRole("organizer")}
                className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${selectedRole === "organizer"
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/20"
                    : "border-border hover:border-[#D4AF37]/50"
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#F7E08B] dark:bg-[#8C7326]/30 flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-[#8C7326] dark:text-[#F7E08B]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Host Events</h3>
                <p className="text-muted-foreground text-sm">
                  I want to create events, manage tickets, and track analytics.
                </p>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleInterest(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedInterests.includes(category.id)
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/20"
                        : "border-border hover:border-[#D4AF37]/50"
                      }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium text-foreground">{category.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedInterests.length >= 3 ? "default" : "secondary"
                  }
                >
                  {selectedInterests.length} selected
                </Badge>
                {selectedInterests.length >= 3 && (
                  <span className="text-sm text-green-500">
                    ✓ Ready to continue
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Division</Label>
                  <Select
                    value={location.state}
                    onValueChange={(value) => {
                      setLocation({ ...location, state: value, city: "" });
                    }}
                  >
                    <SelectTrigger id="state" className="h-11 w-full bg-background border-input text-foreground">
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {bangladeshDivisions.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">District</Label>
                  <Select
                    value={location.city}
                    onValueChange={(value) =>
                      setLocation({ ...location, city: value })
                    }
                    disabled={!location.state}
                  >
                    <SelectTrigger id="city" className="h-11 w-full bg-background border-input text-foreground">
                      <SelectValue
                        placeholder={
                          location.state ? "Select District" : "Division first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-cities" disabled>
                          No districts available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {location.city && location.state && (
                <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Your location</p>
                      <p className="text-sm text-muted-foreground">
                        {location.city}, {location.state}, {location.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 gap-2 bg-[#D4AF37] hover:bg-[#8C7326] text-black"
          >
            {isLoading
              ? "Completing..."
              : step === 3
                ? "Complete Setup"
                : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
