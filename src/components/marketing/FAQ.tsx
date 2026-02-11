"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "Is my data secure?",
        answer:
            "Yes! All API keys and sensitive data are encrypted using AES-256-GCM encryption before storage. Your deployments run in isolated containers, and we never store your credentials in plain text.",
    },
    {
        question: "Do I need my own API keys?",
        answer:
            "No, you don't need your own API keys to get started. GoClaw provides built-in AI credits that work out of the box. However, you can also bring your own API keys from providers like OpenAI, Anthropic, or others if you prefer.",
    },
    {
        question: "What happens if I cancel?",
        answer:
            "If you cancel your subscription, your active deployments will continue to run until the end of your billing period. After that, your servers will be gracefully shut down. You can export your data at any time.",
    },
    {
        question: "How do AI credits work?",
        answer:
            "AI credits are used for all AI-related requests your agents make. 1 credit equals $0.01. Credits are consumed based on the complexity of the task — simple queries use fewer credits, while complex multi-step tasks use more. You can purchase credit packs from the Billing page.",
    },
    {
        question: "What can my agent actually do?",
        answer:
            "Browse the web, fill forms, extract data, manage emails, handle calendar events, scrape websites, and more. Install skills from the dashboard — each adds a new capability.",
    },
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(4)

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div id="faq" className="max-w-2xl mx-auto scroll-section opacity-0 translate-y-8 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-white">
                Frequently asked questions
            </h2>

            <div className="space-y-2">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index
                    return (
                        <div
                            key={index}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-colors hover:border-white/[0.1]"
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                            >
                                <span className="text-sm font-medium text-white">{faq.question}</span>
                                <ChevronDown
                                    className={`h-4 w-4 text-gray-500 flex-shrink-0 ml-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <div
                                className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
