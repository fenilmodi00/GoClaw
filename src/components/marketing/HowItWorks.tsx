"use client"

export function HowItWorks() {
    return (
        <div id="how-it-works" className="mb-16 scroll-section opacity-0 translate-y-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                        1
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Enter Credentials</h3>
                    <p className="text-gray-400 text-sm">
                        Provide your Telegram bot token, Akash API key, and LLM provider credentials
                    </p>
                </div>
                <div className="text-center">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                        2
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Complete Payment</h3>
                    <p className="text-gray-400 text-sm">
                        Secure one-time payment of $29 via Stripe
                    </p>
                </div>
                <div className="text-center">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                        3
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Automatic Deployment</h3>
                    <p className="text-gray-400 text-sm">
                        We deploy your OpenClaw bot to Akash Network automatically
                    </p>
                </div>
                <div className="text-center">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/50">
                        4
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Start Chatting</h3>
                    <p className="text-gray-400 text-sm">
                        Your bot is live! Start using it on Telegram immediately
                    </p>
                </div>
            </div>
        </div>
    )
}
