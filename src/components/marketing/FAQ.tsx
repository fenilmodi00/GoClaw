"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function FAQ() {
    return (
        <div id="faq" className="max-w-3xl mx-auto scroll-section opacity-0 translate-y-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">What is OpenClaw?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-300">
                            OpenClaw is an AI-powered Telegram bot that can interact with users using various LLM providers. GoClaw makes it easy to deploy your own instance.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">What is Akash Network?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-300">
                            Akash Network is a decentralized cloud computing marketplace where you can deploy containers at competitive prices. Your bot runs on your own Akash account.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Are there any recurring costs?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-300">
                            The $29 GoClaw fee is one-time only. You&apos;ll pay Akash Network directly for hosting (typically a few dollars per month) and your LLM provider for API usage.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Is my data secure?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-300">
                            Yes! All API keys are encrypted using AES-256-GCM encryption before storage. We never store your credentials in plain text.
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
