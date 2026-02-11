"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { LineShadowText } from "@/components/ui/line-shadow-text"
import { SignUpButton, useUser } from "@clerk/nextjs"

export function Hero() {
    const { isSignedIn } = useUser()

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 bg-black">
                {/* Flowing wave rays overlay */}
                <div className="absolute inset-0">
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 1200 800"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <radialGradient id="neonPulse1" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                                <stop offset="30%" stopColor="rgba(251,146,60,1)" />
                                <stop offset="70%" stopColor="rgba(249,115,22,0.8)" />
                                <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                            </radialGradient>
                            <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                                <stop offset="25%" stopColor="rgba(251,146,60,0.9)" />
                                <stop offset="60%" stopColor="rgba(234,88,12,0.7)" />
                                <stop offset="100%" stopColor="rgba(234,88,12,0)" />
                            </radialGradient>
                            <radialGradient id="neonPulse3" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                                <stop offset="35%" stopColor="rgba(251,146,60,1)" />
                                <stop offset="75%" stopColor="rgba(234,88,12,0.6)" />
                                <stop offset="100%" stopColor="rgba(234,88,12,0)" />
                            </radialGradient>
                            {/* Adding hero text background gradients and filters */}
                            <radialGradient id="heroTextBg" cx="30%" cy="50%" r="70%">
                                <stop offset="0%" stopColor="rgba(249,115,22,0.15)" />
                                <stop offset="40%" stopColor="rgba(251,146,60,0.08)" />
                                <stop offset="80%" stopColor="rgba(234,88,12,0.05)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                            </radialGradient>
                            <filter id="heroTextBlur" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="12" result="blur" />
                                <feTurbulence baseFrequency="0.7" numOctaves="4" result="noise" />
                                <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
                                <feComponentTransfer in="monoNoise" result="alphaAdjustedNoise">
                                    <feFuncA type="discrete" tableValues="0.03 0.06 0.09 0.12" />
                                </feComponentTransfer>
                                <feComposite in="blur" in2="alphaAdjustedNoise" operator="multiply" result="noisyBlur" />
                                <feMerge>
                                    <feMergeNode in="noisyBlur" />
                                </feMerge>
                            </filter>
                            <linearGradient id="backgroundFade1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="20%" stopColor="rgba(249,115,22,0.15)" />
                                <stop offset="80%" stopColor="rgba(249,115,22,0.15)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                            </linearGradient>
                            <linearGradient id="backgroundFade2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="15%" stopColor="rgba(251,146,60,0.12)" />
                                <stop offset="85%" stopColor="rgba(251,146,60,0.12)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                            </linearGradient>
                            <linearGradient id="backgroundFade3" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="25%" stopColor="rgba(234,88,12,0.18)" />
                                <stop offset="75%" stopColor="rgba(234,88,12,0.18)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                            </linearGradient>
                            <linearGradient id="threadFade1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                                <stop offset="15%" stopColor="rgba(249,115,22,0.8)" />
                                <stop offset="85%" stopColor="rgba(249,115,22,0.8)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
                            </linearGradient>
                            <linearGradient id="threadFade2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                                <stop offset="12%" stopColor="rgba(251,146,60,0.7)" />
                                <stop offset="88%" stopColor="rgba(251,146,60,0.7)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
                            </linearGradient>
                            <linearGradient id="threadFade3" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                                <stop offset="18%" stopColor="rgba(234,88,12,0.8)" />
                                <stop offset="82%" stopColor="rgba(234,88,12,0.8)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,1)" />
                            </linearGradient>
                            <filter id="backgroundBlur" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="8" result="blur" />
                                <feTurbulence baseFrequency="0.9" numOctaves="3" result="noise" />
                                <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
                                <feComponentTransfer in="monoNoise" result="alphaAdjustedNoise">
                                    <feFuncA type="discrete" tableValues="0.05 0.1 0.15 0.2" />
                                </feComponentTransfer>
                                <feComposite in="blur" in2="alphaAdjustedNoise" operator="multiply" result="noisyBlur" />
                                <feMerge>
                                    <feMergeNode in="noisyBlur" />
                                </feMerge>
                            </filter>
                            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <g>
                            {/* Adding hero text background shape */}
                            <ellipse
                                cx="300"
                                cy="350"
                                rx="400"
                                ry="200"
                                fill="url(#heroTextBg)"
                                filter="url(#heroTextBlur)"
                                opacity="0.6"
                            />
                            <ellipse
                                cx="350"
                                cy="320"
                                rx="500"
                                ry="250"
                                fill="url(#heroTextBg)"
                                filter="url(#heroTextBlur)"
                                opacity="0.4"
                            />
                            <ellipse
                                cx="400"
                                cy="300"
                                rx="600"
                                ry="300"
                                fill="url(#heroTextBg)"
                                filter="url(#heroTextBlur)"
                                opacity="0.2"
                            />

                            {/* Thread 1 - Smooth S-curve from bottom-left to right */}
                            <path
                                id="thread1"
                                d="M50 720 Q200 590 350 540 Q500 490 650 520 Q800 550 950 460 Q1100 370 1200 340"
                                stroke="url(#threadFade1)"
                                strokeWidth="0.8"
                                fill="none"
                                opacity="0.8"
                            />
                            <circle r="2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                                <animateMotion dur="4s" repeatCount="indefinite">
                                    <mpath href="#thread1" />
                                </animateMotion>
                            </circle>

                            {/* Thread 2 - Gentle wave flow */}
                            <path
                                id="thread2"
                                d="M80 730 Q250 620 400 570 Q550 520 700 550 Q850 580 1000 490 Q1150 400 1300 370"
                                stroke="url(#threadFade2)"
                                strokeWidth="1.5"
                                fill="none"
                                opacity="0.7"
                            />
                            <circle r="3" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                                <animateMotion dur="5s" repeatCount="indefinite">
                                    <mpath href="#thread2" />
                                </animateMotion>
                            </circle>

                            {/* Thread 3 - Organic curve */}
                            <path
                                id="thread3"
                                d="M20 710 Q180 580 320 530 Q460 480 600 510 Q740 540 880 450 Q1020 360 1200 330"
                                stroke="url(#threadFade3)"
                                strokeWidth="1.2"
                                fill="none"
                                opacity="0.8"
                            />
                            <circle r="2.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                                <animateMotion dur="4.5s" repeatCount="indefinite">
                                    <mpath href="#thread3" />
                                </animateMotion>
                            </circle>

                            {/* Thread 4 - Flowing curve */}
                            <path
                                id="thread4"
                                d="M120 740 Q280 640 450 590 Q620 540 770 570 Q920 600 1070 510 Q1220 420 1350 390"
                                stroke="url(#threadFade1)"
                                strokeWidth="0.6"
                                fill="none"
                                opacity="0.6"
                            />
                            <circle r="1.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                                <animateMotion dur="5.5s" repeatCount="indefinite">
                                    <mpath href="#thread4" />
                                </animateMotion>
                            </circle>

                            <path
                                id="thread5"
                                d="M60 725 Q220 600 380 550 Q540 500 680 530 Q820 560 960 470 Q1100 380 1280 350"
                                stroke="url(#threadFade2)"
                                strokeWidth="1.0"
                                fill="none"
                                opacity="0.7"
                            />
                            <circle r="2.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                                <animateMotion dur="4.2s" repeatCount="indefinite">
                                    <mpath href="#thread5" />
                                </animateMotion>
                            </circle>

                            <path
                                id="thread6"
                                d="M150 735 Q300 660 480 610 Q660 560 800 590 Q940 620 1080 530 Q1220 440 1400 410"
                                stroke="url(#threadFade3)"
                                strokeWidth="1.3"
                                fill="none"
                                opacity="0.6"
                            />
                            <circle r="2.8" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                                <animateMotion dur="5.2s" repeatCount="indefinite">
                                    <mpath href="#thread6" />
                                </animateMotion>
                            </circle>

                            <path
                                id="thread7"
                                d="M40 715 Q190 585 340 535 Q490 485 630 515 Q770 545 910 455 Q1050 365 1250 335"
                                stroke="url(#threadFade1)"
                                strokeWidth="0.9"
                                fill="none"
                                opacity="0.8"
                            />
                            <circle r="2" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                                <animateMotion dur="4.8s" repeatCount="indefinite">
                                    <mpath href="#thread7" />
                                </animateMotion>
                            </circle>
                        </g>
                    </svg>
                </div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10">
                <style jsx>{`
          @keyframes flow {
            0%, 100% {
              opacity: 0.3;
              stroke-dasharray: 0 100;
              stroke-dashoffset: 0;
            }
            50% {
              opacity: 0.8;
              stroke-dasharray: 50 50;
              stroke-dashoffset: -25;
            }
          }
        `}</style>

                {/* Main Content */}
                <main className="relative z-10 flex flex-col items-start justify-start sm:justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-12 max-w-6xl pt-24 sm:pt-32 lg:pt-40 pl-6 sm:pl-12 lg:pl-20">
                    {/* Trial Badge */}
                    <div className="mb-4 sm:mb-8">
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-2">
                            <span className="text-white text-xs md:text-xs">3 Day&apos;s MoneyBack Guarantee 💸 </span>
                        </div>
                    </div>

                    <h1 className="text-white text-4xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-8xl font-bold leading-tight mb-4 sm:mb-6 text-balance">
                        Deploy OpenClaw
                        <br />
                        in{" "}
                        <LineShadowText className="italic font-light" shadowColor="white">
                            Minutes
                        </LineShadowText>
                    </h1>

                    <p className="text-white/70 text-sm sm:text-base md:text-sm lg:text-2xl mb-6 sm:mb-8 max-w-2xl text-pretty">
                        AI-powered Telegram bots on Akash Network.
                        <br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>
                        Simple setup. Your credentials. Your deployment.
                    </p>

                    {isSignedIn ? (
                        <a href="#deploy">
                            <Button className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-xs lg:text-lg font-semibold flex items-center gap-2 backdrop-blur-sm border border-orange-400/30 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
                                Deploy Now
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-rotate-12 transition-transform duration-300" />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Button>
                        </a>
                    ) : (
                        <SignUpButton mode="modal">
                            <Button className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-xs lg:text-lg font-semibold flex items-center gap-2 backdrop-blur-sm border border-orange-400/30 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
                                Get Started - $29
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-rotate-12 transition-transform duration-300" />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Button>
                        </SignUpButton>
                    )}
                </main>
            </div>
        </div>
    )
}
