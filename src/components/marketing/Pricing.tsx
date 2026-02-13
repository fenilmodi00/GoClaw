"use client"

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
// import { useRouter } from "next/navigation";

export function Pricing() {
    const [loading, setLoading] = useState<string | null>(null);
    const { toast } = useToast();
    // const router = useRouter();

    const handleCheckout = async (tier: string) => {
        try {
            setLoading(tier);
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-opus-4.5", // Default model for subscription checkouts
                    channel: "telegram", // Default channel
                    channelToken: "000000:DEFAULT_TOKEN_FOR_SUBSCRIPTION", // Placeholder
                    tier: tier,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 401) {
                    toast({
                        title: "Authentication required",
                        description: "Please sign in to continue",
                        variant: "destructive",
                    });
                    // Redirect to login? Clerk handles this usually via middleware or modal
                    // For now just error
                    return;
                }
                throw new Error(data.error || "Failed to start checkout");
            }

            const data = await response.json();
            if (data.sessionUrl) {
                window.location.href = data.sessionUrl;
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast({
                title: "Error",
                description: "Failed to start checkout. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div id="pricing" className="mb-20 scroll-section opacity-0 translate-y-8">
            {/* Section Header */}
            <div className="text-center mb-12">
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em] mb-4 block">Pricing</span>
                <h2
                    className="text-3xl md:text-4xl font-bold mb-4 leading-[1.1] tracking-[-0.02em]"
                    style={{
                        background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.7) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Simple, transparent pricing
                </h2>
                <p className="text-white/35 text-sm max-w-md mx-auto leading-relaxed">
                    No hidden fees. Every plan includes deployment and monthly<br />AI credits.
                </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">

                {/* Starter Plan */}
                <div className="relative bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
                    <div className="mb-5">
                        <h3 className="text-white/90 text-base font-semibold mb-1">Starter</h3>
                        <p className="text-[11px] text-white/25">Perfect for hobbyists</p>
                    </div>
                    <div className="mb-1">
                        <span className="text-4xl font-bold text-white tracking-tight">$29</span>
                        <span className="text-white/30 text-sm ml-1">/mo</span>
                    </div>
                    <p className="text-[12px] text-emerald-400/70 mb-6">$10 in AI credits included</p>

                    <div className="space-y-3 mb-8 flex-1">
                        {[
                            '1 AI agent deployment',
                            '$10/mo in AI credits',
                            'All integrations included',
                            'Standard support',
                            'Community access',
                        ].map((feature) => (
                            <div key={feature} className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[13px] text-white/45 leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => handleCheckout('starter')}
                        disabled={loading === 'starter'}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading === 'starter' ? 'Processing...' : 'Get started'}
                    </button>
                </div>

                {/* Pro Plan - Popular */}
                <div className="relative bg-[#0e0f11] border border-white/[0.12] rounded-2xl p-6 flex flex-col">
                    {/* Popular Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            Popular
                        </span>
                    </div>

                    <div className="mb-5 mt-1">
                        <h3 className="text-white/90 text-base font-semibold mb-1">Pro</h3>
                        <p className="text-[11px] text-white/25">For power users</p>
                    </div>
                    <div className="mb-1">
                        <span className="text-4xl font-bold text-white tracking-tight">$49</span>
                        <span className="text-white/30 text-sm ml-1">/mo</span>
                    </div>
                    <p className="text-[12px] text-emerald-400/70 mb-6">$20 in AI credits included</p>

                    <div className="space-y-3 mb-8 flex-1">
                        {[
                            '3 AI agent deployments',
                            '$20/mo in AI credits',
                            'Priority support',
                            'Early access to new features',
                            'Higher rate limits',
                        ].map((feature) => (
                            <div key={feature} className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[13px] text-white/45 leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => handleCheckout('pro')}
                        disabled={loading === 'pro'}
                        className="w-full py-2.5 px-4 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-gray-100 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading === 'pro' ? 'Processing...' : 'Get started'}
                    </button>
                </div>

                {/* Business Plan */}
                <div className="relative bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
                    <div className="mb-5">
                        <h3 className="text-white/90 text-base font-semibold mb-1">Business</h3>
                        <p className="text-[11px] text-white/25">Ultimate power and scale</p>
                    </div>
                    <div className="mb-1">
                        <span className="text-4xl font-bold text-white tracking-tight">$99</span>
                        <span className="text-white/30 text-sm ml-1">/mo</span>
                    </div>
                    <p className="text-[12px] text-emerald-400/70 mb-6">$60 in AI credits included</p>

                    <div className="space-y-3 mb-8 flex-1">
                        {[
                            'Unlimited AI agent deployments',
                            '$60/mo in AI credits',
                            'Dedicated support',
                            'Custom integrations',
                            'SLA guarantees',
                        ].map((feature) => (
                            <div key={feature} className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[13px] text-white/45 leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => handleCheckout('business')}
                        disabled={loading === 'business'}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading === 'business' ? 'Processing...' : 'Get started'}
                    </button>
                </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-white/20 text-[12px] mt-8 max-w-lg mx-auto">
                Unused credits roll over to the next month. Each plan includes one automatic cloud deployment.
            </p>
        </div>
    )
}
