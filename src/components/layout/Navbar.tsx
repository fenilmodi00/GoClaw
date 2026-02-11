"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { SignUpButton, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress for first half of the page
      const windowHeight = window.innerHeight
      const halfPageHeight = windowHeight / 2
      const scrollY = window.scrollY

      // Progress from 0 to 1 as user scrolls through first half of viewport
      const progress = Math.min(scrollY / halfPageHeight, 1)
      setScrollProgress(progress)
    }

    handleScroll() // Initial call
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    }
  }

  // Calculate width based on scroll progress
  // Start at 80vw, shrink to ~52vw (30% increase from original compact size)
  const navbarWidth = 80 - (scrollProgress * 28) // 80vw -> 52vw
  const navbarScale = 1 - (scrollProgress * 0.05) // Subtle scale effect
  const topPosition = 24 - (scrollProgress * 8) // Move from top-6 (24px) to top-4 (16px)

  return (
    <>
      {/* Desktop Floating Navbar */}
      <nav
        className="fixed left-1/2 -translate-x-1/2 z-50 hidden md:block"
        style={{
          top: `${topPosition}px`,
          transition: 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 backdrop-blur-xl bg-black/40 shadow-2xl"
          style={{
            width: `${navbarWidth}vw`,
            transform: `scale(${navbarScale})`,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
            boxShadow: scrollProgress > 0.1
              ? '0 25px 50px -12px rgba(249, 115, 22, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Logo/Brand */}
          <Link href="/" className="mr-2 flex-shrink-0 flex items-center gap-2">
            <Image
              src="/logo/GoClaw.png"
              alt="GoClaw Logo"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
              style={{
                height: `${2.5 - (scrollProgress * 0.3)}rem`,
                transition: 'height 0.3s ease',
              }}
            />
            <span
              className="font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent whitespace-nowrap text-xl"
              style={{
                fontSize: `${1.5 - (scrollProgress * 0.15)}rem`,
                transition: 'font-size 0.3s ease',
              }}
            >
              GoClaw
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("features")}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 transition-all whitespace-nowrap text-base"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("pricing")}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 transition-all whitespace-nowrap text-base"
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("how-it-works")}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 transition-all whitespace-nowrap text-base"
            >
              How It Works
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("faq")}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 transition-all whitespace-nowrap text-base"
            >
              FAQ
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-2 flex-shrink-0" />

          {/* Auth Buttons */}
          {isLoaded && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSignedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-8 shadow-lg shadow-orange-500/30 transition-all whitespace-nowrap text-base"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 transition-all whitespace-nowrap text-base"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <ShimmerButton className="text-base">
                      Deploy Now
                    </ShimmerButton>
                  </SignUpButton>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Floating Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 py-3 rounded-full border border-white/10 backdrop-blur-xl bg-black/40 shadow-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/GoClaw.png"
              alt="GoClaw Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              GoClaw
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/10 rounded-full p-2"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 p-4 rounded-3xl border border-white/10 backdrop-blur-xl bg-black/40 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => scrollToSection("features")}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full justify-start text-base"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("pricing")}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full justify-start text-base"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("how-it-works")}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full justify-start text-base"
              >
                How It Works
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("faq")}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full justify-start text-base"
              >
                FAQ
              </Button>

              <div className="h-px bg-white/20 my-2" />

              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <div className="flex flex-col gap-2">
                      <Link href="/dashboard">
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg shadow-orange-500/30 text-base">
                          Dashboard
                        </Button>
                      </Link>
                      <div className="flex justify-center pt-2">
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <SignInButton mode="modal">
                        <Button
                          variant="ghost"
                          className="w-full text-white/80 hover:text-white hover:bg-white/10 rounded-full justify-start text-base"
                        >
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <ShimmerButton className="w-full text-base">
                          Deploy Now
                        </ShimmerButton>
                      </SignUpButton>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
