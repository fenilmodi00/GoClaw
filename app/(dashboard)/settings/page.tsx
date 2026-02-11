"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
    User,
    Gift,
    Shield,
    Bell,
    AlertTriangle,
    Copy,
    Save,
    Link as LinkIcon,

    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Settings Page
 * Tabbed settings with Profile, Referrals, Security, Notifications, Danger Zone
 */

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "referrals", label: "Referrals", icon: Gift },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<TabId>("profile");
    const [displayName, setDisplayName] = useState(
        user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : ""
    );
    const [copied, setCopied] = useState(false);

    const referralLink = `https://goclaw.com/deploy?ref=${user?.id || "aBJM7CEL"}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] pb-0 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${isActive
                                ? "text-white border-orange-500 bg-white/[0.03]"
                                : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.02]"
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="mt-2">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-6 space-y-5 max-w-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <User className="h-4 w-4 text-gray-400" />
                            Profile Information
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Display Name</Label>
                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="h-10 bg-white/[0.04] border-white/[0.08] text-sm text-white rounded-lg focus-visible:ring-orange-500/30 focus-visible:border-orange-500/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Email Address</Label>
                                <div className="relative">
                                    <Input
                                        value={user?.primaryEmailAddress?.emailAddress || ""}
                                        disabled
                                        className="h-10 bg-white/[0.02] border-white/[0.06] text-sm text-gray-500 rounded-lg pr-10"
                                    />
                                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                </div>
                                <p className="text-xs text-gray-600">
                                    Email cannot be changed.
                                </p>
                            </div>
                        </div>

                        <Button className="bg-white/[0.06] text-white hover:bg-white/[0.08] text-sm h-9 px-4 rounded-lg gap-2">
                            <Save className="h-3.5 w-3.5" />
                            Save Changes
                        </Button>
                    </div>
                )}

                {/* Referrals Tab */}
                {activeTab === "referrals" && (
                    <div className="space-y-6">
                        {/* Referral Hero */}
                        <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-8 space-y-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">
                                <Gift className="h-3 w-3" />
                                REFERRAL PROGRAM
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Give a server, get a free month.
                                </h2>
                                <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
                                    For every friend who deploys a server through your link, your
                                    next month is on us. That&apos;s{" "}
                                    <span className="text-white font-semibold">$50 off</span> your
                                    bill — automatically applied.
                                </p>
                            </div>

                            {/* Referral Link */}
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                    Your Referral Link
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 max-w-md">
                                        <Input
                                            value={referralLink}
                                            readOnly
                                            className="h-10 bg-white/[0.04] border-white/[0.08] text-sm text-gray-300 rounded-lg font-mono"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleCopyLink}
                                        className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] text-xs h-10 px-4 gap-1.5"
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 text-green-400" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                        {copied ? "Copied!" : "Copy link"}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <LinkIcon className="h-3 w-3" />
                                    Links to the deploy page — highest conversion rate.
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-5 text-center">
                                <p className="text-2xl font-bold text-white">0</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Free Months Earned
                                </p>
                            </div>
                            <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-5 text-center">
                                <p className="text-2xl font-bold text-green-400">0</p>
                                <p className="text-xs text-gray-500 mt-1">Pending</p>
                            </div>
                            <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-5 text-center">
                                <p className="text-2xl font-bold text-yellow-400">$0</p>
                                <p className="text-xs text-gray-500 mt-1">Total Saved</p>
                            </div>
                        </div>

                        {/* How it Works */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    step: "1",
                                    title: "Share your link",
                                    desc: "Send it to friends, post it on X, or drop it in your community.",
                                    color: "bg-blue-500/15 text-blue-400",
                                },
                                {
                                    step: "2",
                                    title: "They deploy a server",
                                    desc: "Your friend signs up and purchases their own AI server.",
                                    color: "bg-purple-500/15 text-purple-400",
                                },
                                {
                                    step: "3",
                                    title: "Your next month is free",
                                    desc: "$50 is automatically credited to your next invoice. No limit on referrals.",
                                    color: "bg-green-500/15 text-green-400",
                                },
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="rounded-xl border border-white/[0.06] bg-[#111214] p-5 space-y-3"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm font-bold`}
                                    >
                                        {item.step}
                                    </div>
                                    <h3 className="text-sm font-semibold text-white">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                    <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-6 space-y-4 max-w-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <Shield className="h-4 w-4 text-gray-400" />
                            Security Settings
                        </div>
                        <p className="text-sm text-gray-400">
                            Security settings are managed through your Clerk account. Use the
                            profile button in the sidebar to access password, 2FA, and session
                            settings.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400">
                            Managed by Clerk
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                    <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-6 space-y-4 max-w-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <Bell className="h-4 w-4 text-gray-400" />
                            Notification Preferences
                        </div>
                        <p className="text-sm text-gray-400">
                            Configure how and when you receive notifications about your
                            deployments, billing, and account activity.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400">
                            Coming soon
                        </div>
                    </div>
                )}

                {/* Danger Zone Tab */}
                {activeTab === "danger" && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4 max-w-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                            Danger Zone
                        </div>
                        <p className="text-sm text-gray-400">
                            Permanently delete your account and all associated data. This
                            action cannot be undone.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-4"
                        >
                            Delete Account
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
