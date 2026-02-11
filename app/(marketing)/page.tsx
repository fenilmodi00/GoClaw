"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { Pricing } from "@/components/marketing/Pricing"
import { FAQ } from "@/components/marketing/FAQ"
import { Footer } from "@/components/marketing/Footer"
import { DeploymentForm } from "@/components/features/deployment/DeploymentForm"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  useEffect(() => {
    // Smooth scroll animation on page load
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)

    // Observe all scroll sections
    const scrollSections = document.querySelectorAll('.scroll-section')
    scrollSections.forEach((section) => observer.observe(section))

    return () => {
      scrollSections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  return (
    <>
      <Navbar />

      <Hero />

      <main className="relative z-10 text-white bg-[#0a0a0a]">
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <Features />

          <div id="deploy" className="mb-16 scroll-section opacity-0 translate-y-8">
            {/* Hero Text */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
                <span className="text-[11px] font-medium text-white/50 tracking-wide uppercase">
                  Servers available
                </span>
              </div>

              <h2
                className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold mb-5 leading-[1.1] tracking-[-0.03em]"
                style={{
                  background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.6) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Deploy an OpenClaw in 60 seconds.
              </h2>

              <p className="text-[13px] md:text-sm text-white/40 max-w-md mx-auto leading-relaxed">
                Your own OpenClaw on a secure cloud server,<br />
                preconfigured and ready to chat via Telegram or Discord.
              </p>
              {/* <p className="text-[13px] md:text-sm text-white font-semibold mt-2">
                48 hours free + $5 in credits.
              </p> */}
            </div>

            <Card className="bg-black/60 backdrop-blur-sm border-gray-800 max-w-4xl mx-auto">
              <CardContent className="px-6 pb-8 pt-6">
                <DeploymentForm />
              </CardContent>
            </Card>
          </div>

          <Pricing />

          <FAQ />
        </section>

        <Footer />
      </main>
    </>
  )
}
