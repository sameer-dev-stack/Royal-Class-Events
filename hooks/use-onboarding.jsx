"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useAuthStore from "@/hooks/use-auth-store";

// Pages that require onboarding (attendee-centered)
const ATTENDEE_PAGES = ["/explore", "/events", "/my-tickets", "/profile"];

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, updateUser, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    // Check if user hasn't completed onboarding in their profile
    const hasCompleted = user?.metadata?.hasCompletedOnboarding === true;

    if (!hasCompleted) {
      const requiresOnboarding = ATTENDEE_PAGES.some((page) =>
        pathname.startsWith(page)
      );

      if (requiresOnboarding) {
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(false);
    }
    setIsLoading(false);
  }, [user, pathname, isAuthenticated]);

  const handleOnboardingComplete = async (data) => {
    setShowOnboarding(false);

    // Logic handled by OnboardingModal component
    // Just update local state if needed
    if (data) {
      updateUser({
        metadata: {
          ...user.metadata,
          hasCompletedOnboarding: true
        }
      });
    }
    router.refresh();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    router.push("/");
  };

  return {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
    needsOnboarding: user && !user.metadata?.has_completed_onboarding,
    isLoading
  };
}

