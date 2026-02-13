"use client"

import { motion } from "motion/react"
import { LucideIcon, Receipt, Ticket, Bell, Calendar, Mail, FileText, Globe, Terminal, Briefcase, Calculator, Building2, Search, Plane, Users, Newspaper, Bookmark } from "lucide-react"

interface UseCase {
    icon: LucideIcon;
    text: string;
}

const useCases: UseCase[] = [
    { icon: Ticket, text: "Answer support tickets" },
    { icon: FileText, text: "Summarize long documents" },
    { icon: Bell, text: "Notify before a meeting" },
    { icon: Calendar, text: "Schedule meetings from chat" },
    { icon: Mail, text: "Read emails" },
    { icon: Calendar, text: "Plan your week" },
    { icon: FileText, text: "Take meeting notes" },
    { icon: Globe, text: "Sync across time zones" },
    { icon: Calculator, text: "Do your taxes" },
    { icon: Receipt, text: "Track expenses and receipts" },
    { icon: Building2, text: "Compare software" },
    { icon: Bell, text: "Drop alerts" },
    { icon: Search, text: "Compare product specs" },
    { icon: Briefcase, text: "Negotiate deals" },
    { icon: Calculator, text: "Run payroll calculations" },
    { icon: Receipt, text: "Negotiate refunds" },
    { icon: Search, text: "Find competitors" },
    { icon: Users, text: "Screen and prioritize leads" },
    { icon: FileText, text: "Generate invoices" },
    { icon: Briefcase, text: "Create presentations from bullet points" },
    { icon: Plane, text: "Book travel" },
    { icon: FileText, text: "Draft job descriptions" },
    { icon: Users, text: "Run standup summaries" },
    { icon: Terminal, text: "Track OKRs and KPIs" },
    { icon: Newspaper, text: "Monitor news and alerts" },
    { icon: Bookmark, text: "Set and track goals" },
]

export function UseCases() {
    // Split use cases into 3 rows for the marquee effect
    const row1 = useCases.slice(0, 9)
    const row2 = useCases.slice(9, 18)
    const row3 = useCases.slice(18, 26)

    return (
        <section className="py-20 relative overflow-hidden bg-[#0A0A0A]">
            <div className="container px-4 md:px-6 relative z-10 mb-12">
                <div className="text-center space-y-3">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-white tracking-tight"
                    >
                        What can OpenClaw do for you?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/40 font-medium"
                    >
                        One assistant, thousands of use cases
                    </motion.p>
                </div>
            </div>

            <div className="relative flex flex-col gap-4 mask-linear-fade">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 bg-gradient-to-l from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />

                <MarqueeRow items={row1} direction="left" speed={30} />
                <MarqueeRow items={row2} direction="right" speed={35} />
                <MarqueeRow items={row3} direction="left" speed={32} />
            </div>

            <div className="mt-12 text-center relative z-10">
                <p className="text-[13px] text-white/30 italic">
                    PS. You can add as many use cases as you want via natural language
                </p>
            </div>
        </section>
    )
}

function MarqueeRow({ items, direction, speed }: { items: UseCase[], direction: "left" | "right", speed: number }) {
    return (
        <div className="relative flex overflow-hidden group">
            <motion.div
                initial={{ x: direction === "left" ? 0 : "-50%" }}
                animate={{ x: direction === "left" ? "-50%" : 0 }}
                transition={{
                    duration: speed,
                    ease: "linear",
                    repeat: Infinity,
                }}
                className="flex gap-3 flex-nowrap"
            >
                {[...items, ...items, ...items, ...items].map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-default"
                    >
                        <item.icon className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-[13px] font-medium text-white/70 whitespace-nowrap">
                            {item.text}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
