"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { HowItWorks } from "@/components/marketing/HowItWorks"
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

          <HowItWorks />

          <Pricing />

          <div id="deploy" className="mb-16 scroll-section opacity-0 translate-y-8">
            <Card className="bg-black/60 backdrop-blur-sm border-gray-800 max-w-4xl mx-auto">
              <CardContent className="px-6 pb-8 pt-6">
                <DeploymentForm />
              </CardContent>
            </Card>
          </div>

          <FAQ />
        </section>

        <Footer />
      </main>
    </>
  )
}
