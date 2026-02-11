"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [hovered, setHovered] = useState(false);



    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Sidebar */}
            <DashboardSidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
                collapsed={collapsed}
                hovered={hovered}
                onCollapseToggle={() => setCollapsed((c) => !c)}
                onHoverEnter={() => { if (collapsed) setHovered(true); }}
                onHoverLeave={() => setHovered(false)}
            />

            {/* Main Content Area — margin based on collapsed state (not hover) */}
            <div
                className={`min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out ${collapsed ? "lg:ml-[72px]" : "lg:ml-64"
                    }`}
            >
                <DashboardHeader onMenuToggle={() => setMobileOpen(true)} />
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
