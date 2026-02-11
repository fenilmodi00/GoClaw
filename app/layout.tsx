import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { initializeApp } from "@/lib/startup";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClerkProvider>
          {children}
          <Toaster />
          <SpeedInsights />
        </ClerkProvider>
      </body>
    </html>
  );
}
