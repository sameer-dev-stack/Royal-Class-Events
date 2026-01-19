"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUserRoles } from "@/hooks/use-user-roles";
import useAuthStore from "@/hooks/use-auth-store";
import { useEffect } from "react";

const eventSchema = z.object({
    title: z.string().min(3, "Title is too short"),
    description: z.string().min(10, "Description is too short"),
    startDate: z.string().min(1, "Start Date is required"),
    location: z.string().min(1, "Location is required"),
});

export default function SimpleCreateEventPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/create-event");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mx-auto" />
                <p className="text-muted-foreground font-medium">Redirecting to event creator...</p>
            </div>
        </div>
    );
}

