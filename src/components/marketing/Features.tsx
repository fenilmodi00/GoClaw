"use client"

import { motion } from "motion/react"

export function Features() {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Feature Section 1: Install Skills */}
            <div id="features" className="py-24 scroll-section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
                    {/* Left: Skills Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-5 order-2 md:order-1"
                    >
                        {/* Card Header */}
                        <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.12em] mb-4 block px-1">Skills</span>

                        {/* Skills List */}
                        <div className="space-y-2">
                            {/* Web Scraping - Installed */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <span className="text-[13px] text-white/70 font-medium">Web Scraping</span>
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400/80 font-medium">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Installed
                                </span>
                            </div>

                            {/* Email Management - Installed */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <span className="text-[13px] font-medium" style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Email Management</span>
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400/80 font-medium">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Installed
                                </span>
                            </div>

                            {/* Calendar Sync - Install */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <span className="text-[13px] text-white/70 font-medium">Calendar Sync</span>
                                <button className="text-[11px] text-white/30 font-medium px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/50 transition-all duration-200">
                                    Install
                                </button>
                            </div>

                            {/* File Handling - Install */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <span className="text-[13px] font-medium" style={{ background: 'linear-gradient(90deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>File Handling</span>
                                <button className="text-[11px] text-white/30 font-medium px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/50 transition-all duration-200">
                                    Install
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="order-1 md:order-2"
                    >
                        <h2
                            className="text-2xl md:text-3xl font-bold mb-4 leading-[1.15] tracking-[-0.02em]"
                            style={{
                                background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.7) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Install skills in one click
                        </h2>
                        <p className="text-white/35 text-sm leading-relaxed max-w-sm">
                            Add web scraping, calendar management, email handling,
                            and more from your dashboard. No config files, no
                            terminal commands.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Feature Section 2: Chat Interface */}
            <div className="py-24 scroll-section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2
                            className="text-2xl md:text-3xl font-bold mb-4 leading-[1.15] tracking-[-0.02em]"
                            style={{
                                background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.7) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Chat like you would with a colleague
                        </h2>
                        <p className="text-white/35 text-sm leading-relaxed max-w-sm">
                            Interact through Telegram, Discord, or WhatsApp. Send
                            tasks, get live updates, receive files — from the apps you
                            already use.
                        </p>
                    </motion.div>

                    {/* Right: Mock Telegram Chat */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-5"
                    >
                        {/* Chat Header */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                            <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.12em]">Telegram</span>
                        </div>

                        {/* Chat Messages */}
                        <div className="space-y-3">
                            {/* User message - right aligned */}
                            <div className="flex justify-end">
                                <div className="bg-white/[0.08] border border-white/[0.08] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
                                    <p className="text-[12px] text-white/70 leading-relaxed">
                                        Scrape the top 10 results for &quot;AI agents&quot;
                                    </p>
                                </div>
                            </div>

                            {/* Bot message - left aligned */}
                            <div className="flex justify-start">
                                <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%]">
                                    <p className="text-[12px] text-white/50 leading-relaxed">
                                        On it. Scraping Google now...
                                    </p>
                                </div>
                            </div>

                            {/* Bot message - left aligned */}
                            <div className="flex justify-start">
                                <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
                                    <p className="text-[12px] text-white/50 leading-relaxed">
                                        Done — 10 results saved to <span className="text-white/70 font-medium">results.csv</span>. Want me to email it?
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>


            {/* Feature Section 3: Connect Accounts */}
            <div className="py-24 scroll-section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
                    {/* Left: Connected Accounts Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-5 order-2 md:order-1"
                    >
                        {/* Card Header */}
                        <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.12em] mb-4 block px-1">Connected Accounts</span>

                        {/* Accounts List */}
                        <div className="space-y-2">
                            {/* Google - Connected */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[13px] font-medium" style={{ background: 'linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Google</span>
                                </div>
                                <span className="text-[11px] text-emerald-400/80 font-medium">Connected</span>
                            </div>

                            {/* GitHub - Connected */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[13px] text-white/70 font-medium">GitHub</span>
                                </div>
                                <span className="text-[11px] text-emerald-400/80 font-medium">Connected</span>
                            </div>

                            {/* Slack - Connect */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    <span className="text-[13px] text-white/40 font-medium">Slack</span>
                                </div>
                                <button className="text-[11px] text-white/30 font-medium px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/50 transition-all duration-200">
                                    Connect
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="order-1 md:order-2"
                    >
                        <h2
                            className="text-2xl md:text-3xl font-bold mb-4 leading-[1.15] tracking-[-0.02em]"
                            style={{
                                background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.7) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Connect accounts instantly
                        </h2>
                        <p className="text-white/35 text-sm leading-relaxed max-w-sm">
                            Sign in with Google, link your services, and let your
                            agent access the tools you need — securely and without
                            juggling credentials.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Three Steps Section */}
            <div className="py-24 scroll-section opacity-0 translate-y-8">
                <div className="max-w-5xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2
                            className="text-2xl md:text-3xl font-bold mb-3 leading-[1.15] tracking-[-0.02em]"
                            style={{
                                background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.7) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Three steps. Under a minute.
                        </h2>
                        <p className="text-white/30 text-sm">
                            No servers to configure. No DevOps required.
                        </p>
                    </div>

                    {/* Steps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Step 1 */}
                        <div className="bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-6 text-center">
                            <div className="w-9 h-9 rounded-full border border-white/[0.1] flex items-center justify-center mx-auto mb-4">
                                <span className="text-[13px] text-white/40 font-medium">1</span>
                            </div>
                            <h3 className="text-white/80 text-sm font-semibold mb-2">
                                Get your Telegram Bot Token<br />From @BotFather
                            </h3>
                            <p className="text-white/30 text-[12px] leading-relaxed max-w-[200px] mx-auto">
                                select the LLM provider and Model
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-6 text-center">
                            <div className="w-9 h-9 rounded-full border border-white/[0.1] flex items-center justify-center mx-auto mb-4">
                                <span className="text-[13px] text-white/40 font-medium">2</span>
                            </div>
                            <h3 className="text-white/80 text-sm font-semibold mb-2">
                                Connect a<br />messaging channel
                            </h3>
                            <p className="text-white/30 text-[12px] leading-relaxed max-w-[200px] mx-auto">
                                Link Telegram, Discord, or WhatsApp. Scan a QR code — done.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-[#0e0f11] border border-white/[0.06] rounded-2xl p-6 text-center">
                            <div className="w-9 h-9 rounded-full border border-white/[0.1] flex items-center justify-center mx-auto mb-4">
                                <span className="text-[13px] text-white/40 font-medium">3</span>
                            </div>
                            <h3 className="text-white/80 text-sm font-semibold mb-2">
                                Click Deploy
                            </h3>
                            <p className="text-white/30 text-[12px] leading-relaxed max-w-[200px] mx-auto">
                                Your agent launches in under 60 seconds. Start chatting immediately.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
