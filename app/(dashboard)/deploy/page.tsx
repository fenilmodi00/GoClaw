"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { DeploymentForm } from "@/components/features/deployment/DeploymentForm";

/**
 * Deploy Page Component
 * 
 * A deployment page with animated hero design that integrates Clerk authentication
 * and displays the GoClaw deployment form in a clean, minimal layout.
 * 
 * Features:
 * - Black background with animated orange flowing wave threads
 * - Clerk authentication integration
 * - Conditional rendering based on auth state
 * - Responsive design across all screen sizes
 * 
 * Requirements: 2.1, 2.2
 */
export default function DeployPage() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="relative min-h-screen bg-[#08090a] text-white overflow-hidden">
      {/* CSS Keyframes for orb animations */}
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(80px, -40px) scale(1.1); }
          50% { transform: translate(-30px, -80px) scale(0.95); }
          75% { transform: translate(50px, 30px) scale(1.05); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-60px, 50px) scale(1.15); }
          66% { transform: translate(40px, -30px) scale(0.9); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(40px, 60px) scale(1.08); }
          40% { transform: translate(-50px, 20px) scale(0.92); }
          60% { transform: translate(20px, -50px) scale(1.12); }
          80% { transform: translate(-30px, -20px) scale(0.96); }
        }
      `}</style>

      {/* Floating Gradient Orbs Background - StartClaw inspired */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Orb 1 - Top right, warm orange */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{
            top: '-10%',
            right: '-5%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.8) 0%, rgba(249,115,22,0) 70%)',
            filter: 'blur(80px)',
            animation: 'orb-float-1 20s ease-in-out infinite',
          }}
        />
        {/* Orb 2 - Center left, deeper orange */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{
            top: '30%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(234,88,12,0.7) 0%, rgba(234,88,12,0) 70%)',
            filter: 'blur(100px)',
            animation: 'orb-float-2 25s ease-in-out infinite',
          }}
        />
        {/* Orb 3 - Bottom center, amber glow */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            bottom: '-5%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(251,146,60,0.6) 0%, rgba(251,146,60,0) 70%)',
            filter: 'blur(70px)',
            animation: 'orb-float-3 18s ease-in-out infinite',
          }}
        />
        {/* Subtle noise/grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/[0.06]" role="banner">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="text-sm font-semibold text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black rounded-sm px-1 tracking-tight"
            aria-label="GoClaw home"
          >
            GoClaw
          </Link>
        </div>

        <nav className="flex items-center space-x-3" role="navigation" aria-label="Main navigation">
          <Link
            href="/"
            className="text-[13px] text-white/40 hover:text-white/70 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black rounded-sm px-2 py-1"
            aria-label="Go to home page"
          >
            Home
          </Link>
          {!isLoaded ? (
            <div className="text-white/30 text-[13px]" role="status" aria-live="polite">Loading...</div>
          ) : isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  className="text-[13px] text-white/40 hover:text-white/70 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black rounded-sm px-2 py-1"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="text-[13px] font-medium bg-white text-black px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Create a new account"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8" role="main">
        {!isLoaded ? (
          // Loading State
          <div className="text-center" role="status" aria-live="polite">
            <div className="text-white/70 text-lg">Loading...</div>
          </div>
        ) : !isSignedIn ? (
          // Unauthenticated State
          <div className="text-center max-w-2xl">
            <h1
              className="text-4xl md:text-6xl font-bold mb-5 leading-[1.1] tracking-[-0.03em]"
              style={{
                background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.6) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Deploy Your OpenClaw Bot
            </h1>

            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Sign in to deploy your OpenClaw AI bot to Akash Network in minutes
            </p>

            <div className="flex gap-3 justify-center" role="group" aria-label="Authentication options">
              <SignInButton mode="modal">
                <button
                  className="text-sm font-medium bg-white text-black px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="text-sm font-medium bg-white/[0.06] text-white/70 border border-white/[0.08] px-6 py-2.5 rounded-xl hover:bg-white/[0.1] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Create a new account"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        ) : (
          // Authenticated State - Deployment Form
          <div className="w-full max-w-4xl">
            <DeploymentForm />
          </div>
        )}
      </main>
    </div>
  );
}
