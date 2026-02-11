"use client";

import { Store } from "lucide-react";

export default function MarketplacePage() {
    return (
        <div className="max-w-2xl mx-auto mt-16 text-center space-y-6">
            <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Store className="h-8 w-8 text-blue-400" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Marketplace</h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Browse and purchase AI agent templates, skills, and integrations from
                the community marketplace.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400">
                Coming soon
            </div>
        </div>
    );
}
