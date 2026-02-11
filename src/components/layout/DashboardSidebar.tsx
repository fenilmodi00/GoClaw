"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
    LayoutDashboard,
    Rocket,
    Store,
    ShoppingBag,
    Heart,
    CreditCard,
    Settings,
    Coins,
    HelpCircle,
    LogOut,
    X,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "New Deployment", href: "/deploy", icon: Rocket },
];

const marketplaceNav = [
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "My Purchases", href: "/purchases", icon: ShoppingBag },
    { label: "My Listings", href: "/listings", icon: Heart },
];

const accountNav = [
    { label: "Billing", href: "/billing", icon: CreditCard },
    { label: "Settings", href: "/settings", icon: Settings },
];

interface DashboardSidebarProps {
    mobileOpen: boolean;
    onMobileClose: () => void;
    collapsed: boolean;
    hovered: boolean;
    onCollapseToggle: () => void;
    onHoverEnter: () => void;
    onHoverLeave: () => void;
}

export function DashboardSidebar({
    mobileOpen,
    onMobileClose,
    collapsed,
    hovered,
    onCollapseToggle,
    onHoverEnter,
    onHoverLeave,
}: DashboardSidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();

    // On desktop: show labels if not collapsed, OR if hovered while collapsed
    const showLabels = !collapsed || hovered;

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    const NavItem = ({
        item,
    }: {
        item: {
            label: string;
            href: string;
            icon: React.ComponentType<{ className?: string }>;
        };
    }) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
            <Link
                href={item.href}
                onClick={onMobileClose}
                title={!showLabels ? item.label : undefined}
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group overflow-hidden whitespace-nowrap",
                    active
                        ? "bg-orange-500/10 text-white font-medium"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
            >
                <Icon
                    className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors",
                        active
                            ? "text-orange-500"
                            : "text-gray-500 group-hover:text-gray-300"
                    )}
                />
                <span
                    className={cn(
                        "transition-opacity duration-200",
                        showLabels ? "opacity-100" : "opacity-0 w-0"
                    )}
                >
                    {item.label}
                </span>
            </Link>
        );
    };

    const SectionLabel = ({ children }: { children: string }) => (
        <p
            className={cn(
                "px-3 mb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap transition-opacity duration-200",
                showLabels ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
            )}
        >
            {children}
        </p>
    );

    return (
        <>
            {/* Backdrop overlay - mobile only */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300",
                    mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onMobileClose}
            />

            {/* Sidebar panel */}
            <aside
                onMouseEnter={onHoverEnter}
                onMouseLeave={onHoverLeave}
                className={cn(
                    "fixed left-0 top-0 bottom-0 bg-[#0e0f11] border-r border-white/[0.06] flex flex-col z-50 transition-[width,transform] duration-300 ease-in-out overflow-hidden",
                    // Mobile state
                    mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
                    // Desktop state (override mobile styles)
                    "lg:translate-x-0",
                    collapsed && !hovered ? "lg:w-[72px]" : "lg:w-64"
                )}
            >
                <div className="flex flex-col h-full w-64">
                    {/* Logo + Close/Collapse */}
                    <div className="px-4 py-5 flex items-center justify-between h-[68px]">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <Image
                                src="/logo/GoClaw.png"
                                alt="GoClaw Logo"
                                width={28}
                                height={28}
                                className="h-7 w-auto object-contain flex-shrink-0"
                            />
                            <span
                                className={cn(
                                    "text-lg font-bold text-white tracking-tight whitespace-nowrap transition-opacity duration-200",
                                    showLabels ? "opacity-100" : "opacity-0"
                                )}
                            >
                                GoClaw
                            </span>
                        </div>
                        {/* Close button - mobile only */}
                        <button
                            onClick={onMobileClose}
                            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden space-y-6 pt-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <div>
                            <SectionLabel>Main</SectionLabel>
                            <div className="space-y-0.5">
                                {mainNav.map((item) => (
                                    <NavItem key={item.href} item={item} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Marketplace</SectionLabel>
                            <div className="space-y-0.5">
                                {marketplaceNav.map((item) => (
                                    <NavItem key={item.href} item={item} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Account</SectionLabel>
                            <div className="space-y-0.5">
                                {accountNav.map((item) => (
                                    <NavItem key={item.href} item={item} />
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* Credits Section */}
                    <div className="px-4 py-3 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between mb-1 h-5 overflow-hidden">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Coins className="h-3.5 w-3.5 text-yellow-500" />
                                <span
                                    className={cn(
                                        "text-xs text-gray-400 transition-opacity duration-200",
                                        showLabels ? "opacity-100" : "opacity-0 w-0"
                                    )}
                                >
                                    Credits
                                </span>
                            </div>
                            <span
                                className={cn(
                                    "text-xs text-gray-500 transition-opacity duration-200",
                                    showLabels ? "opacity-100" : "opacity-0"
                                )}
                            >
                                0 machines
                            </span>
                        </div>
                        <p
                            className={cn(
                                "text-xl font-bold text-white mb-1 transition-all duration-200 origin-left whitespace-nowrap",
                                !showLabels && "scale-75 translate-x-1"
                            )}
                        >
                            $0.00
                        </p>
                        <Link
                            href="/billing"
                            onClick={onMobileClose}
                            className={cn(
                                "text-xs text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 whitespace-nowrap",
                                !showLabels && "scale-0 w-0 opacity-0"
                            )}
                        >
                            Add credits →
                        </Link>
                    </div>

                    {/* Help */}
                    <div className="px-4 py-2 border-t border-white/[0.06]">
                        <button
                            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full overflow-hidden"
                            title={!showLabels ? "Need help?" : undefined}
                        >
                            <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            <span
                                className={cn(
                                    "whitespace-nowrap transition-opacity duration-200",
                                    showLabels ? "opacity-100" : "opacity-0 w-0"
                                )}
                            >
                                Need help? Contact us
                            </span>
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="px-4 py-3 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <UserButton afterSignOutUrl="/" />
                            <div
                                className={cn(
                                    "flex-1 min-w-0 transition-opacity duration-200",
                                    showLabels ? "opacity-100" : "opacity-0 w-0"
                                )}
                            >
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.firstName || "User"} {user?.lastName || ""}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.primaryEmailAddress?.emailAddress || ""}
                                </p>
                            </div>
                            <Link
                                href="/"
                                className={cn(
                                    "text-gray-500 hover:text-gray-300 transition-colors",
                                    showLabels ? "opacity-100" : "opacity-0 w-0"
                                )}
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Collapse toggle - desktop only */}
                    <div className="hidden lg:block px-3 py-3 border-t border-white/[0.06]">
                        <button
                            onClick={onCollapseToggle}
                            className={cn(
                                "flex items-center w-full gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-colors overflow-hidden whitespace-nowrap",
                                !showLabels && "justify-center"
                            )}
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed && !hovered ? (
                                <ChevronsRight className="h-4 w-4 flex-shrink-0" />
                            ) : (
                                <>
                                    <ChevronsLeft className="h-4 w-4 flex-shrink-0" />
                                    <span>Collapse</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
