"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CreditBalanceProps {
    compact?: boolean;
}

export function CreditBalance({ compact }: CreditBalanceProps) {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        async function fetchBalance() {
            try {
                const res = await fetch("/api/user/balance");
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data.balance);
                }
            } catch (error) {
                console.error("Failed to fetch balance", error);
                setBalance(null);
            } finally {
                setLoading(false);
            }
        }

        fetchBalance();
    }, [pathname]);

    if (loading) {
        return compact ? (
            <div className="h-8 w-8 mx-auto bg-white/[0.05] animate-pulse rounded-full" />
        ) : (
            <div className="h-14 w-full bg-white/[0.05] animate-pulse rounded-xl" />
        );
    }

    const displayBalance = balance !== null ? `$${balance.toFixed(2)}` : "--";
    const balanceInt = balance !== null ? Math.floor(balance) : 0;

    if (compact) {
        return (
            <Link href="/billing" title={`Credits: ${displayBalance}`} className="block w-full">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group overflow-hidden whitespace-nowrap">
                    <Zap className="h-4 w-4 flex-shrink-0 text-orange-500" />
                    {/* In compact mode, we want to show the balance number next to the icon, mimicking a label */}
                    <span className="font-bold font-mono text-xs">{balance !== null ? `$${balanceInt}` : "-"}</span>
                </div>
            </Link>
        );
    }

    return (
        <Link href="/billing">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                        <span>Credits</span>
                    </div>
                    <span className="text-xs font-bold text-white font-mono">{displayBalance}</span>
                </div>
                <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, ((balance || 0) / 10) * 100)}%` }}
                    />
                </div>
            </div>
        </Link>
    );
}
