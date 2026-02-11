"use client"

export function Pricing() {
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
                        <p className="text-[11px] text-white/25">2 vCPU · 2 GB RAM · 20 GB SSD</p>
                    </div>
                    <div className="mb-1">
                        <span className="text-4xl font-bold text-white tracking-tight">$49</span>
                        <span className="text-white/30 text-sm ml-1">/mo</span>
                    </div>
                    <p className="text-[12px] text-emerald-400/70 mb-6">$15 in AI credits included</p>

                    <div className="space-y-3 mb-8 flex-1">
                        {[
                            '1 AI agent deployment',
                            '$15/mo in AI credits',
                            'All integrations included',
                            'All AI models (Claude, GPT)',
                            'Browser automation & web search',
                            'Cancel Anytime',
                        ].map((feature) => (
                            <div key={feature} className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[13px] text-white/45 leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all duration-200">
                        Get started
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
                        <p className="text-[11px] text-white/25">2 vCPU · 4 GB RAM · 50 GB SSD</p>
                    </div>
                    <div className="mb-1">
                        <span className="text-4xl font-bold text-white tracking-tight">$99</span>
                        <span className="text-white/30 text-sm ml-1">/mo</span>
                    </div>
                    <p className="text-[12px] text-emerald-400/70 mb-6">$25 in AI credits included</p>

                    <div className="space-y-3 mb-8 flex-1">
                        {[
                            '1 AI agent deployment',
                            '$25/mo in AI credits',
                            'All integrations included',
                            'All AI models (Claude, GPT)',
                            'More RAM & storage',
                            'Priority support',
                        ].map((feature) => (
                            <div key={feature} className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[13px] text-white/45 leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-2.5 px-4 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-gray-100 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Get started
                    </button>
                </div>

                {/* Business Plan */}
                <div className="relative bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
                    <div className="mb-5">
                        <h3 className="text-white/90 text-base font-semibold mb-1">Business</h3>
                        <p className="text-[11px] text-white/25">4 vCPU · 8 GB RAM · 100 GB SSD</p>
                    </div>
                    <div className="mb-1">
                        <span className="text-4xl font-bold text-white tracking-tight">$200</span>
                        <span className="text-white/30 text-sm ml-1">/mo</span>
                    </div>
                    <p className="text-[12px] text-emerald-400/70 mb-6">$50 in AI credits included</p>

                    <div className="space-y-3 mb-8 flex-1">
                        {[
                            '1 AI agent deployment',
                            '$50/mo in AI credits',
                            'All integrations included',
                            'All AI models (Claude, GPT)',
                            'High-performance server',
                            'Dedicated support',
                        ].map((feature) => (
                            <div key={feature} className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[13px] text-white/45 leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all duration-200">
                        Get started
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
