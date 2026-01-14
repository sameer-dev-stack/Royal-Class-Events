"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAdminStore } from "@/hooks/use-admin-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const loginMutation = useMutation(api.users.login);
    const { setVerified } = useAdminStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        try {
            const result = await loginMutation({ email, password });

            if (result.success) {
                // Critical check: Is this user actually an admin?
                if (result.role === "admin") {
                    setVerified(result.userId);
                    toast.success("Admin access granted");
                    router.push("/admin");
                } else {
                    setError("Access Denied: You do not have administrator privileges.");
                    toast.error("Unauthorized Access");
                }
            }
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
            toast.error("Login Failed");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-zinc-950 px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent -z-10" />

            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl shadow-black">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 mb-2">
                        <Lock className="w-6 h-6 text-amber-500" />
                    </div>
                    <CardTitle className="text-2xl font-black text-white tracking-tight uppercase">Admin Verification</CardTitle>
                    <CardDescription className="text-zinc-500">
                        Please re-authenticate to access the secure admin portal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Administrator Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@royalclass.com"
                                    className="bg-zinc-800 border-zinc-700 text-white pl-10 h-11 focus:ring-amber-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Secure Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-zinc-800 border-zinc-700 text-white pl-10 h-11 focus:ring-amber-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3 text-red-400 text-sm animate-shake">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg shadow-lg shadow-amber-900/20 transition-all active:scale-[0.98]"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    Verify Identity
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
