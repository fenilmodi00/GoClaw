"use client";

import {
    Bell,
    Menu,
    Rocket,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardHeaderProps {
    onMenuToggle: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 gap-3">
            {/* Left side: Hamburger + Search */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Search */}
                {/* <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-sm text-white placeholder:text-gray-500 rounded-lg focus-visible:ring-orange-500/30 focus-visible:border-orange-500/30"
                    />
                </div> */}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Credits Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span>0</span>
                </div>

                {/* Notification Bell */}
                <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <Bell className="h-4 w-4" />
                </button>

                {/* New Deployment CTA */}
                <Link href="/deploy">
                    <Button
                        size="sm"
                        className="bg-white text-black hover:bg-gray-100 text-xs font-medium rounded-lg px-3 sm:px-4 h-8 gap-1.5"
                    >
                        <Rocket className="h-3 w-3" />
                        <span className="hidden sm:inline">New Deployment</span>
                        <span className="sm:hidden">Deploy</span>
                    </Button>
                </Link>
            </div>
        </header>
    );
}
