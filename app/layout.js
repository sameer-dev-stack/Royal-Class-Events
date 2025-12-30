import Header from "@/components/header";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/footer";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { SessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "sonner";
import { Outfit } from "next/font/google";
import ChatBot from "@/components/chat-bot";

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
              <Header />

              <main className="relative min-h-screen container mx-auto pt-24 md:pt-32 pb-12">
                {/* Premium Background Glow Effect */}
                <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                  <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] opacity-40" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] opacity-30" />
                </div>

                <div className="relative z-10">{children}</div>
                <Footer />
              </main>
              <Toaster position="top-center" richColors />
              <ChatBot />
            </ConvexClientProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}