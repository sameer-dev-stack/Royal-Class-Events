"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/hooks/use-auth-store";
import SignUpForm from "@/components/auth/sign-up-form";

function SignUpContent() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Fix hydration mismatch: wait for mount before checking auth
    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (mounted && isAuthenticated) {
            router.replace("/explore");
        }
    }, [mounted, isAuthenticated, router]);

    // Prevent flash while redirecting (only after mount)
    if (mounted && isAuthenticated) return null;

    return (
        <div className="flex items-center justify-center min-h-screen py-12 px-4">
            <SignUpForm role="attendee" />
        </div>
    );
}

export default function AuthSignUpPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}
