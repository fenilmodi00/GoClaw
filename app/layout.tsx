import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { initializeApp } from "@/lib/startup";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoClaw - Deploy OpenClaw AI Bots to Akash",
  description: "Deploy OpenClaw AI bots to your Akash Network account with a simple one-time payment",
  icons: {
    icon: '/logo/GoClaw.png',
  },
};

// Initialize application on server startup
if (typeof window === 'undefined') {
  initializeApp();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClerkProvider
          signInFallbackRedirectUrl="/#deploy"
          signUpFallbackRedirectUrl="/#deploy"
        >
          {children}
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
