export const authConfig = {
    pages: {
        signIn: '/sign-in',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnProtectedPath =
                nextUrl.pathname.startsWith('/my-tickets') ||
                nextUrl.pathname.startsWith('/my-events') ||
                nextUrl.pathname.startsWith('/create-event') ||
                nextUrl.pathname.startsWith('/admin');

            if (isOnProtectedPath) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Redirect logged-in users away from auth pages
            if (isLoggedIn && (nextUrl.pathname.startsWith('/sign-in') || nextUrl.pathname.startsWith('/sign-up'))) {
                return Response.redirect(new URL('/explore', nextUrl));
            }

            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
            }
            return token
        }
    },
    providers: [], // Add providers with an empty array for now
}
