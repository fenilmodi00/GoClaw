"use client";

import { useState } from "react";
import { Search, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * Billing Page
 * Manage credits and machines
 */

const creditPacks = [
    { amount: "$10", credits: "1,000 credits", value: 10, popular: false },
    { amount: "$25", credits: "2,500 credits", value: 25, popular: true },
    { amount: "$50", credits: "5,000 credits", value: 50, popular: false },
    { amount: "$100", credits: "10,000 credits", value: 100, popular: false },
];

const machinePlans = [
    {
        name: "Starter",
        specs: "2 vCPU · 2GB · 30GB",
        creditsPerMonth: "$15",
        price: "$49",
        popular: false,
    },
    {
        name: "Professional",
        specs: "2 vCPU · 4GB · 50GB",
        creditsPerMonth: "$25",
        price: "$99",
        popular: true,
    },
    {
        name: "Enterprise",
        specs: "4 vCPU · 8GB · 100GB",
        creditsPerMonth: "$50",
        price: "$200",
        popular: false,
    },
];

const planFeatures = [
    {
        name: "Starter",
        color: "text-orange-500",
        features: ["All models", "All integrations", "$15 monthly credits", "Web browsing"],
    },
    {
        name: "Professional",
        color: "text-blue-400",
        features: ["All models", "All integrations", "$25 monthly credits", "Priority support"],
    },
    {
        name: "Enterprise",
        color: "text-red-400",
        features: ["All models", "All integrations", "$50 monthly credits", "Dedicated support"],
    },
];

export default function BillingPage() {
    const [selectedPack, setSelectedPack] = useState<number | null>(null);
    const [promoCode, setPromoCode] = useState("");
    const [quantities, setQuantities] = useState<Record<string, number>>({
        Starter: 1,
        Professional: 1,
        Enterprise: 1,
    });

    const updateQuantity = (plan: string, delta: number) => {
        setQuantities((prev) => ({
            ...prev,
            [plan]: Math.max(1, (prev[plan] || 1) + delta),
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Billing</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage credits and machines
                </p>
            </div>

            {/* Credits Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">Credits</h2>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">$0.00</p>
                        <p className="text-xs text-gray-500">available</p>
                    </div>
                </div>

                {/* Credit Packs */}
                <div className="grid grid-cols-4 gap-3">
                    {creditPacks.map((pack) => (
                        <button
                            key={pack.value}
                            onClick={() => setSelectedPack(pack.value)}
                            className={`relative rounded-xl border p-4 text-center transition-all ${selectedPack === pack.value
                                ? "border-orange-500/50 bg-orange-500/5"
                                : "border-white/[0.06] bg-[#111214] hover:border-white/[0.12]"
                                }`}
                        >
                            {pack.popular && (
                                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-2 py-0 h-4">
                                    POPULAR
                                </Badge>
                            )}
                            <p className="text-lg font-bold text-white">{pack.amount}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{pack.credits}</p>
                        </button>
                    ))}
                </div>

                {/* Promo Code */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-sm text-white placeholder:text-gray-500 rounded-lg"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] text-xs h-9 px-4"
                    >
                        Apply
                    </Button>
                </div>

                {/* Select Credit Pack Button */}
                <Button
                    disabled={selectedPack === null}
                    className="bg-white/[0.06] text-gray-300 hover:bg-white/[0.08] text-sm h-9 px-5 rounded-lg disabled:opacity-50"
                >
                    Select a credit pack
                </Button>

                {/* Credits Info */}
                <p className="text-xs text-gray-500">
                    Credits are used for AI requests. 1 credit = $0.01
                </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Machines Section */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-white">Machines</h2>

                {/* Machines Table */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111214] overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1.5fr] px-5 py-3 border-b border-white/[0.04] text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        <span>Plan</span>
                        <span>Specs</span>
                        <span>Credits/Mo</span>
                        <span>Price</span>
                        <span className="text-right">Quantity</span>
                    </div>

                    {/* Table Rows */}
                    {machinePlans.map((plan) => (
                        <div
                            key={plan.name}
                            className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1.5fr] px-5 py-3.5 border-b border-white/[0.04] last:border-b-0 items-center"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">
                                    {plan.name}
                                </span>
                                {plan.popular && (
                                    <Badge className="bg-orange-500/15 text-orange-400 text-[10px] px-1.5 py-0 h-4 border-0">
                                        POPULAR
                                    </Badge>
                                )}
                            </div>
                            <span className="text-sm text-gray-400">{plan.specs}</span>
                            <span className="text-sm text-gray-400">
                                {plan.creditsPerMonth}
                            </span>
                            <span className="text-sm font-medium text-orange-400">
                                {plan.price}
                                <span className="text-gray-500 font-normal">/mo</span>
                            </span>
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => updateQuantity(plan.name, -1)}
                                    className="w-7 h-7 rounded-md border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm text-white">
                                    {quantities[plan.name]}
                                </span>
                                <button
                                    onClick={() => updateQuantity(plan.name, 1)}
                                    className="w-7 h-7 rounded-md border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                                <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-4 rounded-md"
                                >
                                    Buy
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan Features Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {planFeatures.map((plan) => (
                    <div key={plan.name}>
                        <h3 className={`text-sm font-semibold ${plan.color} mb-3`}>
                            {plan.name}
                        </h3>
                        <ul className="space-y-2">
                            {plan.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-center gap-2 text-sm text-gray-400"
                                >
                                    <Check className={`h-3.5 w-3.5 ${plan.color} flex-shrink-0`} />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
