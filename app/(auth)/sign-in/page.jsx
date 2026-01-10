"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "@/components/auth/sign-in-form";
import useAuthStore from "@/hooks/use-auth-store";

export default function SignInPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/explore");
        }
    }, [isAuthenticated, router]);

    return (
        <div className="flex items-center justify-center min-h-screen py-12 px-4">
            <SignInForm />
        </div>
    );
}
