"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Menu } from "lucide-react"
import { LineShadowText } from "@/components/line-shadow-text"
import { ShimmerButton } from "@/components/shimmer-button"
import { useState } from "react"
import { DeploymentForm } from "@/components/DeploymentForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  return (
    <>
      {/* Animated Hero Section */}
      <div className="min-h-screen relative overflow-hidden z-10">
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

              {/* Thread 5 - Natural wave */}
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

              {/* Thread 6 - Smooth flow */}
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

              {/* Thread 7 - Organic S-curve */}
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

              {/* Thread 8 - Gentle wave */}
              <path
                id="thread8"
                d="M100 728 Q260 630 420 580 Q580 530 720 560 Q860 590 1000 500 Q1140 410 1320 380"
                stroke="url(#threadFade2)"
                strokeWidth="1.4"
                fill="none"
                opacity="0.7"
              />
              <circle r="3" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.8s" repeatCount="indefinite">
                  <mpath href="#thread8" />
                </animateMotion>
              </circle>

              {/* Thread 9 - Thin flowing curve */}
              <path
                id="thread9"
                d="M30 722 Q170 595 310 545 Q450 495 590 525 Q730 555 870 465 Q1010 375 1180 345"
                stroke="url(#threadFade3)"
                strokeWidth="0.5"
                fill="none"
                opacity="0.6"
              />
              <circle r="1.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="6s" repeatCount="indefinite">
                  <mpath href="#thread9" />
                </animateMotion>
              </circle>

              {/* Thread 10 - Medium thick wave */}
              <path
                id="thread10"
                d="M90 732 Q240 625 390 575 Q540 525 680 555 Q820 585 960 495 Q1100 405 1300 375"
                stroke="url(#threadFade1)"
                strokeWidth="1.1"
                fill="none"
                opacity="0.8"
              />
              <circle r="2.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.3s" repeatCount="indefinite">
                  <mpath href="#thread10" />
                </animateMotion>
              </circle>

              {/* Thread 11 - Very thin thread */}
              <path
                id="thread11"
                d="M70 727 Q210 605 360 555 Q510 505 650 535 Q790 565 930 475 Q1070 385 1260 355"
                stroke="url(#threadFade2)"
                strokeWidth="0.4"
                fill="none"
                opacity="0.5"
              />
              <circle r="1" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.7s" repeatCount="indefinite">
                  <mpath href="#thread11" />
                </animateMotion>
              </circle>

              {/* Thread 12 - Thick flowing line */}
              <path
                id="thread12"
                d="M110 738 Q270 645 430 595 Q590 545 730 575 Q870 605 1010 515 Q1150 425 1380 395"
                stroke="url(#threadFade3)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.7"
              />
              <circle r="3.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.7s" repeatCount="indefinite">
                  <mpath href="#thread12" />
                </animateMotion>
              </circle>

              {/* Thread 13 - Thin organic curve */}
              <path
                id="thread13"
                d="M45 718 Q185 588 325 538 Q465 488 605 518 Q745 548 885 458 Q1025 368 1220 338"
                stroke="url(#threadFade1)"
                strokeWidth="0.7"
                fill="none"
                opacity="0.6"
              />
              <circle r="1.8" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.3s" repeatCount="indefinite">
                  <mpath href="#thread13" />
                </animateMotion>
              </circle>

              {/* Thread 14 - Medium wave */}
              <path
                id="thread14"
                d="M130 721 Q290 630 460 580 Q630 530 770 560 Q910 590 1050 500 Q1190 410 1350 380"
                stroke="url(#threadFade2)"
                strokeWidth="1.0"
                fill="none"
                opacity="0.8"
              />
              <circle r="2.3" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.9s" repeatCount="indefinite">
                  <mpath href="#thread14" />
                </animateMotion>
              </circle>

              {/* Thread 15 - Very thin delicate line */}
              <path
                id="thread15"
                d="M25 713 Q165 583 305 533 Q445 483 585 513 Q725 543 865 453 Q1005 363 1200 333"
                stroke="url(#threadFade3)"
                strokeWidth="0.3"
                fill="none"
                opacity="0.4"
              />
              <circle r="0.8" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="6.2s" repeatCount="indefinite">
                  <mpath href="#thread15" />
                </animateMotion>
              </circle>

              {/* Thread 16 - Thick prominent thread */}
              <path
                id="thread16"
                d="M85 719 Q235 605 385 555 Q535 505 675 535 Q815 565 955 475 Q1095 385 1320 355"
                stroke="url(#threadFade1)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.9"
              />
              <circle r="3.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.1s" repeatCount="indefinite">
                  <mpath href="#thread16" />
                </animateMotion>
              </circle>

              {/* Thread 17 */}
              <path
                id="thread17"
                d="M50 720 Q180 660 320 620 Q460 580 600 600 Q740 620 880 560 Q1020 500 1200 340"
                stroke="url(#threadFade2)"
                strokeWidth="0.6"
                fill="none"
                opacity="0.5"
              />
              <circle r="1.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.1s" repeatCount="indefinite">
                  <mpath href="#thread17" />
                </animateMotion>
              </circle>

              {/* Thread 18 */}
              <path
                id="thread18"
                d="M50 720 Q200 680 350 640 Q500 600 650 620 Q800 640 950 580 Q1100 520 1200 340"
                stroke="url(#threadFade3)"
                strokeWidth="1.2"
                fill="none"
                opacity="0.7"
              />
              <circle r="2.8" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.6s" repeatCount="indefinite">
                  <mpath href="#thread18" />
                </animateMotion>
              </circle>

              {/* Thread 19 */}
              <path
                id="thread19"
                d="M50 720 Q160 670 280 630 Q400 590 540 610 Q680 630 820 570 Q960 510 1200 340"
                stroke="url(#threadFade1)"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
              <circle r="2" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.4s" repeatCount="indefinite">
                  <mpath href="#thread19" />
                </animateMotion>
              </circle>

              {/* Thread 20 */}
              <path
                id="thread20"
                d="M50 720 Q220 690 380 650 Q540 610 680 630 Q820 650 960 590 Q1100 530 1200 340"
                stroke="url(#threadFade2)"
                strokeWidth="1.4"
                fill="none"
                opacity="0.8"
              />
              <circle r="3" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.4s" repeatCount="indefinite">
                  <mpath href="#thread20" />
                </animateMotion>
              </circle>

              {/* Thread 21 */}
              <path
                id="thread21"
                d="M50 720 Q170 675 300 635 Q430 595 570 615 Q710 635 850 575 Q990 515 1200 340"
                stroke="url(#threadFade3)"
                strokeWidth="0.5"
                fill="none"
                opacity="0.4"
              />
              <circle r="1.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.9s" repeatCount="indefinite">
                  <mpath href="#thread21" />
                </animateMotion>
              </circle>

              {/* Thread 22 */}
              <path
                id="thread22"
                d="M50 720 Q190 745 340 705 Q490 665 630 685 Q770 705 910 645 Q1050 585 1200 340"
                stroke="url(#threadFade1)"
                strokeWidth="1.1"
                fill="none"
                opacity="0.7"
              />
              <circle r="2.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.8s" repeatCount="indefinite">
                  <mpath href="#thread22" />
                </animateMotion>
              </circle>

              {/* Thread 23 */}
              <path
                id="thread23"
                d="M50 720 Q150 725 270 685 Q390 645 530 665 Q670 685 810 625 Q950 565 1200 340"
                stroke="url(#threadFade2)"
                strokeWidth="0.9"
                fill="none"
                opacity="0.6"
              />
              <circle r="2.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.2s" repeatCount="indefinite">
                  <mpath href="#thread23" />
                </animateMotion>
              </circle>

              {/* Thread 24 */}
              <path
                id="thread24"
                d="M50 720 Q210 755 370 715 Q530 675 670 695 Q810 715 950 655 Q1090 595 1200 340"
                stroke="url(#threadFade3)"
                strokeWidth="1.3"
                fill="none"
                opacity="0.8"
              />
              <circle r="2.9" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.2s" repeatCount="indefinite">
                  <mpath href="#thread24" />
                </animateMotion>
              </circle>

              {/* Thread 25 */}
              <path
                id="thread25"
                d="M50 720 Q165 730 290 690 Q415 650 555 670 Q695 690 835 630 Q975 570 1200 340"
                stroke="url(#threadFade1)"
                strokeWidth="0.7"
                fill="none"
                opacity="0.5"
              />
              <circle r="1.8" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.6s" repeatCount="indefinite">
                  <mpath href="#thread25" />
                </animateMotion>
              </circle>

              {/* Thread 26 */}
              <path
                id="thread26"
                d="M50 720 Q230 760 390 720 Q550 680 690 700 Q830 720 970 660 Q1110 600 1200 340"
                stroke="url(#threadFade2)"
                strokeWidth="1.0"
                fill="none"
                opacity="0.7"
              />
              <circle r="2.4" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.7s" repeatCount="indefinite">
                  <mpath href="#thread26" />
                </animateMotion>
              </circle>

              {/* Thread 27 */}
              <path
                id="thread27"
                d="M50 720 Q175 740 310 700 Q445 660 585 680 Q725 700 865 640 Q1005 580 1200 340"
                stroke="url(#threadFade3)"
                strokeWidth="0.4"
                fill="none"
                opacity="0.4"
              />
              <circle r="1" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="6.1s" repeatCount="indefinite">
                  <mpath href="#thread27" />
                </animateMotion>
              </circle>

              {/* Thread 28 */}
              <path
                id="thread28"
                d="M50 720 Q195 750 350 710 Q505 670 645 690 Q785 710 925 650 Q1065 590 1200 340"
                stroke="url(#threadFade1)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.9"
              />
              <circle r="3.1" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.3s" repeatCount="indefinite">
                  <mpath href="#thread28" />
                </animateMotion>
              </circle>

              {/* Thread 29 */}
              <path
                id="thread29"
                d="M50 720 Q155 735 285 695 Q415 655 555 675 Q695 695 835 635 Q975 575 1200 340"
                stroke="url(#threadFade2)"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
              <circle r="2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.3s" repeatCount="indefinite">
                  <mpath href="#thread29" />
                </animateMotion>
              </circle>

              {/* Thread 30 */}
              <path
                id="thread30"
                d="M50 720 Q215 765 375 725 Q535 685 675 705 Q815 725 955 665 Q1095 605 1200 340"
                stroke="url(#threadFade3)"
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
              />
              <circle r="2.7" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.5s" repeatCount="indefinite">
                  <mpath href="#thread30" />
                </animateMotion>
              </circle>

              {/* Thread 31 */}
              <path
                id="thread31"
                d="M50 720 Q185 745 325 705 Q465 665 605 685 Q745 705 885 645 Q1025 585 1200 340"
                stroke="url(#threadFade1)"
                strokeWidth="0.6"
                fill="none"
                opacity="0.5"
              />
              <circle r="1.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.8s" repeatCount="indefinite">
                  <mpath href="#thread31" />
                </animateMotion>
              </circle>

              {/* Thread 32 */}
              <path
                id="thread32"
                d="M50 720 Q205 755 365 715 Q525 675 665 695 Q805 715 945 655 Q1085 595 1200 340"
                stroke="url(#threadFade2)"
                strokeWidth="1.4"
                fill="none"
                opacity="0.8"
              />
              <circle r="3" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.1s" repeatCount="indefinite">
                  <mpath href="#thread32" />
                </animateMotion>
              </circle>

              {/* Thread 33 */}
              <path
                id="thread33"
                d="M50 720 Q160 730 295 690 Q430 650 570 670 Q710 690 850 630 Q990 570 1200 340"
                stroke="url(#threadFade3)"
                strokeWidth="0.9"
                fill="none"
                opacity="0.6"
              />
              <circle r="2.1" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="5.1s" repeatCount="indefinite">
                  <mpath href="#thread33" />
                </animateMotion>
              </circle>

              {/* Thread 34 */}
              <path
                id="thread34"
                d="M50 720 Q225 770 385 730 Q545 690 685 710 Q825 730 965 670 Q1105 610 1200 340"
                stroke="url(#threadFade1)"
                strokeWidth="1.1"
                fill="none"
                opacity="0.7"
              />
              <circle r="2.6" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.9s" repeatCount="indefinite">
                  <mpath href="#thread34" />
                </animateMotion>
              </circle>

              {/* Thread 35 */}
              <path
                id="thread35"
                d="M50 720 Q170 740 305 700 Q440 660 580 680 Q720 700 860 640 Q1000 580 1200 340"
                stroke="url(#threadFade2)"
                strokeWidth="0.3"
                fill="none"
                opacity="0.4"
              />
              <circle r="0.8" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="6.3s" repeatCount="indefinite">
                  <mpath href="#thread35" />
                </animateMotion>
              </circle>

              {/* Thread 36 */}
              <path
                id="thread36"
                d="M50 720 Q240 715 400 675 Q560 635 700 655 Q840 675 980 615 Q1120 555 1200 340"
                stroke="url(#threadFade3)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.9"
              />
              <circle r="3.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                <animateMotion dur="4.0s" repeatCount="indefinite">
                  <mpath href="#thread36" />
                </animateMotion>
              </circle>
            </g>
          </svg>
        </div>
      </div>

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

        @keyframes pulse1 {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulse2 {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes pulse3 {
          0%, 100% { opacity: 0.5; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

      {/* Header Navigation */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 lg:px-12">
        <div className="flex items-center space-x-2 pl-3 sm:pl-6 lg:pl-12">
          <h1 className="text-2xl font-bold text-white">SimpleClaw</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {isSignedIn && (
            <a href="/dashboard" className="text-white/80 hover:text-white transition-colors text-sm lg:text-base font-medium">
              Dashboard
            </a>
          )}
          <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
            Features
          </a>
          <a href="#pricing" className="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
            Pricing
          </a>
          <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
            How It Works
          </a>
          <a href="#faq" className="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
            FAQ
          </a>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-4">
          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>

          {!isLoaded ? (
            <div className="w-8 h-8 animate-pulse bg-gray-700 rounded-full" />
          ) : isSignedIn ? (
            <UserButton />
          ) : (
            <SignUpButton mode="modal">
              <ShimmerButton className="hidden md:flex bg-orange-500 hover:bg-orange-600 text-white px-4 lg:px-6 py-2 rounded-xl text-sm lg:text-base font-medium shadow-lg">
                Deploy Now
              </ShimmerButton>
            </SignUpButton>
          )}
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-white/10 z-20">
          <nav className="flex flex-col space-y-4 px-6 py-6">
            {isSignedIn && (
              <a href="/dashboard" className="text-white/80 hover:text-white transition-colors font-medium">
                Dashboard
              </a>
            )}
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#faq" className="text-white/80 hover:text-white transition-colors">
              FAQ
            </a>
            {!isSignedIn && (
              <SignUpButton mode="modal">
                <ShimmerButton className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg w-fit">
                  Deploy Now
                </ShimmerButton>
              </SignUpButton>
            )}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-start justify-start sm:justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-12 max-w-6xl pt-4 sm:-mt-12 lg:-mt-24 pl-6 sm:pl-12 lg:pl-20">
        {/* Trial Badge */}
        <div className="mb-4 sm:mb-8">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-2">
            <span className="text-white text-xs md:text-xs">Try 14 days trial free</span>
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
              Get Started - $29
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

      {/* SimpleClaw Content Sections */}
      <main className="min-h-screen relative z-10 text-white bg-black">
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Features Grid */}
            <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">🚀 Simple Deployment</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Fill out one form with your API credentials and we&apos;ll deploy your OpenClaw bot to Akash Network automatically.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">💰 One-Time Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Pay just $29 once. No subscriptions, no hidden fees. You own your deployment on your Akash account.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">🔒 Your Credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    Use your own Telegram, Akash, and LLM provider credentials. Your keys are encrypted and secure.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="mb-16">
              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-600/30 backdrop-blur-sm border-orange-500/50 max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-white mb-2">Simple Pricing</CardTitle>
                  <CardDescription className="text-gray-200 text-lg">
                    Everything you need to deploy your OpenClaw bot
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-6xl font-bold text-white">$29</span>
                    <span className="text-xl text-gray-300 ml-2">one-time</span>
                  </div>
                  <ul className="text-left space-y-3 mb-6 max-w-md mx-auto">
                    <li className="flex items-start text-gray-200">
                      <span className="mr-2">✓</span>
                      <span>Automated deployment to Akash Network</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <span className="mr-2">✓</span>
                      <span>Support for OpenAI, Google, Claude, and AkashML</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <span className="mr-2">✓</span>
                      <span>Real-time deployment status tracking</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <span className="mr-2">✓</span>
                      <span>Secure credential encryption</span>
                    </li>
                    <li className="flex items-start text-gray-200">
                      <span className="mr-2">✓</span>
                      <span>Instant Telegram bot activation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Deployment Form Section */}
            <div id="deploy" className="mb-16">
              <Card className="bg-black/60 backdrop-blur-sm border-gray-800 max-w-4xl mx-auto">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl text-white mb-2">Deploy Your Bot</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your AI assistant in just a few clicks
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                  <DeploymentForm />
                </CardContent>
              </Card>
            </div>

            {/* How It Works Section */}
            <div id="how-it-works" className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                    1
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Enter Credentials</h3>
                  <p className="text-gray-400 text-sm">
                    Provide your Telegram bot token, Akash API key, and LLM provider credentials
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                    2
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Complete Payment</h3>
                  <p className="text-gray-400 text-sm">
                    Secure one-time payment of $29 via Stripe
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                    3
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Automatic Deployment</h3>
                  <p className="text-gray-400 text-sm">
                    We deploy your OpenClaw bot to Akash Network automatically
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                    4
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Start Chatting</h3>
                  <p className="text-gray-400 text-sm">
                    Your bot is live! Start using it on Telegram immediately
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div id="faq" className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">What is OpenClaw?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      OpenClaw is an AI-powered Telegram bot that can interact with users using various LLM providers. SimpleClaw makes it easy to deploy your own instance.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">What is Akash Network?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      Akash Network is a decentralized cloud computing marketplace where you can deploy containers at competitive prices. Your bot runs on your own Akash account.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Are there any recurring costs?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      The $29 SimpleClaw fee is one-time only. You&apos;ll pay Akash Network directly for hosting (typically a few dollars per month) and your LLM provider for API usage.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Is my data secure?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      Yes! All API keys are encrypted using AES-256-GCM encryption before storage. We never store your credentials in plain text.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-orange-500/20 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
            <p>© 2024 SimpleClaw. Deploy OpenClaw bots with ease.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
