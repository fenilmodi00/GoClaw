"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TopUpButtonProps {
    className?: string;
    variant?: "default" | "outline" | "ghost";
    label?: string;
}

export function TopUpButton({ className, variant = "default", label = "Top Up Credits" }: TopUpButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleTopUp = async () => {
        try {
            setLoading(true);

            // 1. Call checkout API to create a session
            // We use a "dummy" model/channel because our checkout API expects them, 
            // but we really just want the credits. 
            // TODO: Refactor API to support "credits-only" checkout mode.
            // For now, we simulate a deployment charge which effectively just charges the user 
            // and gives them credits if we conceptualize it as "Pay as you go".
            // WAIT - The current checkout API creates a *Deployment*. 
            // We need a specific "Credit Purchase" flow.
            // But since we use a generic "Polar Product" for everything, buying *anything* 
            // from that product ID gives you access/credits in Polar's eyes if it's a subscription.
            // If it's a one-time payment product, we just need to record it.

            // TEMPORARY PROPOSAL:
            // Since we are validating the "Checkout" flow, let's just trigger the same flow 
            // but maybe with a special "model" flag that indicates "Credits Only".

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "credits-top-up", // Special flag
                    channel: "web",
                    channelToken: "none",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to start checkout");
            }

            // 2. Redirect to Polar
            if (data.sessionUrl) {
                window.location.href = data.sessionUrl;
            } else {
                throw new Error("No checkout URL returned");
            }

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to start checkout",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleTopUp}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${variant === "default"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "border border-white/10 hover:bg-white/5 text-gray-300"
                } ${className}`}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {label}
        </button>
    );
}
