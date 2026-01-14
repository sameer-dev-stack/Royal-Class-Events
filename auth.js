import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";

// Initialize Convex Client for server-side auth calls
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

if (!convexUrl) {
    console.warn("NEXT_PUBLIC_CONVEX_URL is not defined in auth.js. Server-side Convex calls will fail.");
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    try {
                        if (!convex) {
                            console.error("Convex Client not initialized");
                            return null;
                        }

                        // Call the unified login mutation in Convex
                        const result = await convex.mutation(api.users.login, {
                            email,
                            password,
                        });

                        if (result.success) {
                            return {
                                id: result.userId,
                                name: result.name,
                                email: result.email,
                                role: result.role,
                                token: result.token, // Convex session token
                            };
                        }
                    } catch (error) {
                        console.error('NextAuth: Convex Authorization failed', error);
                        return null;
                    }
                }

                console.log('Invalid credentials or format');
                return null;
            },
        }),
    ],
});
