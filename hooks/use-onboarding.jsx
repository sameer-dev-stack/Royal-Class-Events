"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import useAuthStore from "@/hooks/use-auth-store";

// Pages that require onboarding (attendee-centered)
const ATTENDEE_PAGES = ["/explore", "/events", "/my-tickets", "/profile"];

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { supabase } = useSupabase();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    // Check if user hasn't completed onboarding in their profile
    // Note: In Supabase, this is stored in public.profiles.metadata OR a dedicated column
    // For now, checking user.metadata from our Auth Store hydration

    // Explicitly check for true string or boolean in both metadata sources
    const hasCompleted =
      user?.metadata?.has_completed_onboarding === true ||
      user?.metadata?.has_completed_onboarding === "true" ||
      user?.profile?.metadata?.has_completed_onboarding === true ||
      user?.profile?.metadata?.has_completed_onboarding === "true";

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

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);

    // 1. Update Local Store Immediately (Optimistic)
    const newMetadata = { ...user.metadata, has_completed_onboarding: true };
    updateUser({ metadata: newMetadata });

    // 2. Update Supabase profile
    const { error } = await supabase
      .from('profiles')
      .update({
        metadata: newMetadata
      })
      .eq('id', user.id);

    if (error) console.error("Failed to update onboarding status:", error);

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

