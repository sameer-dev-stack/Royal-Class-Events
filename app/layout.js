export const dynamic = "force-dynamic";
import LayoutWrapper from "@/components/layout-wrapper";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "../components/auth/auth-provider";
import { SessionProvider } from "../components/auth/session-provider";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Royal Class Events",
  description: "Experience the Exclusive World of Elite Events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true}
        className={`${outfit.className} bg-background text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <ConvexClientProvider>
              <AuthProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
                <Analytics />
                <SpeedInsights />
              </AuthProvider>
            </ConvexClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
