"use client"

import { useToast } from "@/hooks/use-toast";
import { PRICING_TIERS } from "@/config/pricing";
// import { useRouter } from "next/navigation";

export function Pricing() {
    const { toast } = useToast();
    // const router = useRouter();

    const handleCheckout = (tier: string) => {
        // Find deployment form on page
        const deploySection = document.getElementById("deploy");
        if (deploySection) {
            deploySection.scrollIntoView({ behavior: 'smooth' });

            // Proactive: If we can find the form state, pre-select it.
            // Since it's a separate component, we rely on URL params or a shared state if needed.
            // For now, smooth scroll is the "Quick Onboarding" trigger.
            // Optimization: Add a query param to tell the form which tier to select.
            const url = new URL(window.location.href);
            url.searchParams.set('tier', tier);
            window.history.replaceState({}, '', url);

            toast({
                title: `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan selected`,
                description: "Continue configuration below to deploy.",
            });
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
                {(Object.values(PRICING_TIERS) as any[]).map((tier) => (
                    <div
                        key={tier.id}
                        className={`relative bg-[#0e0f11] border rounded-2xl p-6 flex flex-col transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_25px_rgba(249,115,22,0.1)] group ${tier.id === 'pro' ? 'border-white/[0.12]' : 'border-white/[0.06]'}`}
                    >
                        {tier.id === 'pro' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    Popular
                                </span>
                            </div>
                        )}

                        <div className={`mb-5 ${tier.id === 'pro' ? 'mt-1' : ''}`}>
                            <h3 className="text-white/90 text-base font-semibold mb-1">{tier.label}</h3>
                            <p className="text-[11px] text-white/25">{tier.description}</p>
                        </div>
                        <div className="mb-1">
                            <span className="text-4xl font-bold text-white tracking-tight">${tier.price}</span>
                            <span className="text-white/30 text-sm ml-1">/mo</span>
                        </div>
                        <p className="text-[12px] text-emerald-400/70 mb-6">${tier.credits} in AI credits included</p>

                        <div className="space-y-3 mb-8 flex-1">
                            {tier.features.map((feature: string) => (
                                <div key={feature} className="flex items-start gap-2.5">
                                    <svg className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-[13px] text-white/45 leading-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleCheckout(tier.id)}
                            className={`w-full py-2.5 px-4 rounded-xl text-[13px] transition-all duration-200 ${tier.id === 'pro'
                                ? 'bg-white text-black font-semibold hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                : 'bg-white/[0.06] border border-white/[0.08] text-white/60 font-medium hover:bg-white/[0.1] hover:text-white/80'
                                }`}
                        >
                            Get started
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <p className="text-center text-white/20 text-[12px] mt-8 max-w-lg mx-auto">
                Unused credits roll over to the next month. Each plan includes one automatic cloud deployment.
            </p>
        </div>
    )
}
