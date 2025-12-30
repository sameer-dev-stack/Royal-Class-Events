import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

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

                    // MOCK for Dev - Replace with real DB check later
                    if (email === 'test@example.com' && password === 'password123') {
                        return {
                            id: 'mock-user-id-12345',
                            name: 'Test User',
                            email: email,
                        };
                    }
                }
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
