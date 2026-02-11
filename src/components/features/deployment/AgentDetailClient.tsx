"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    Copy,
    ExternalLink,
    Globe,
    Loader2,
    MessageCircle,
    RefreshCw,
    Server,
    Wifi,
    WifiOff,
    AlertTriangle,
    Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────
type DeploymentStatus = "pending" | "deploying" | "active" | "failed";

interface StatusData {
    status: DeploymentStatus;
    channel?: string;
    deploymentId?: string;
    leaseId?: string;
    providerUrl?: string;
    errorMessage?: string;
    channelLink?: string;
}

interface AgentDetailClientProps {
    deploymentId: string;
    initialStatus: DeploymentStatus;
    model?: string;
    channel?: string;
    gatewayToken?: string;
}

// ── Status configs ─────────────────────────────────────────────
const statusConfig: Record<
    DeploymentStatus,
    { label: string; desc: string; dot: string; bg: string; text: string; border: string }
> = {
    active: {
        label: "Active",
        desc: "Your bot is live and receiving messages",
        dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
    },
    deploying: {
        label: "Deploying",
        desc: "Creating deployment on Akash Network…",
        dot: "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)] animate-pulse",
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/20",
    },
    pending: {
        label: "Pending",
        desc: "Waiting for payment confirmation…",
        dot: "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)] animate-pulse",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
    },
    failed: {
        label: "Failed",
        desc: "The deployment encountered an error",
        dot: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]",
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
    },
};

const channelMeta: Record<string, { icon: React.ReactNode; label: string }> = {
    telegram: {
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
        ),
        label: "Telegram",
    },
    discord: {
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
            </svg>
        ),
        label: "Discord",
    },
    whatsapp: {
        icon: <MessageCircle className="h-5 w-5" />,
        label: "WhatsApp",
    },
};

const modelNames: Record<string, string> = {
    "claude-opus-4.5": "Claude Opus 4.5",
    "gpt-3.2": "GPT 3.2",
    "gemini-3-flash": "Gemini 3 Flash",
};

// ── Copy helper ────────────────────────────────────────────────
function CopyField({
    label,
    value,
    isLink
}: {
    label: string;
    value: string;
    isLink?: boolean;
}) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="flex gap-2 relative">
                {isLink ? (
                    <a
                        href={value.startsWith('http') ? value : `http://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-xs bg-black/40 border border-white/[0.06] px-3 py-2.5 rounded-lg break-all text-orange-400 hover:text-orange-300 font-mono transition-colors flex items-center gap-1 group"
                    >
                        <span className="truncate">{value}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </a>
                ) : (
                    <code className="flex-1 text-xs bg-black/40 border border-white/[0.06] px-3 py-2.5 rounded-lg break-all text-gray-300 font-mono">
                        {value}
                    </code>
                )}
                <button
                    onClick={copy}
                    className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
                    title="Copy"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────
export function AgentDetailClient({
    deploymentId,
    initialStatus,
    model,
    channel,
    gatewayToken = "2002",
}: AgentDetailClientProps) {
    const [status, setStatus] = useState<DeploymentStatus>(initialStatus);
    const [data, setData] = useState<StatusData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`/api/status?id=${deploymentId}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to fetch status");
            }
            const d: StatusData = await res.json();
            setStatus(d.status);
            setData(d);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        }
    };

    // Initial fetch + polling
    useEffect(() => {
        fetchStatus();
        const id = setInterval(() => {
            if (status !== "active" && status !== "failed") fetchStatus();
        }, 3000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deploymentId, status]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStatus();
        setTimeout(() => setRefreshing(false), 500);
    };

    const cfg = statusConfig[status];
    const ch = channelMeta[channel || data?.channel || ""] || {
        icon: <Globe className="h-5 w-5" />,
        label: channel || data?.channel || "Bot",
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back + Title */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white truncate">
                        {ch.label} Bot
                    </h1>
                    <p className="text-sm text-gray-500">
                        {modelNames[model || ""] || model || "AI Agent"}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] text-xs h-8 gap-1.5"
                >
                    <RefreshCw
                        className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Status Banner */}
            <div
                className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 flex items-center gap-3`}
            >
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <div className="flex-1">
                    <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</p>
                    <p className="text-xs text-gray-400">{cfg.desc}</p>
                </div>
                {status === "deploying" && (
                    <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                )}
                {status === "pending" && (
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                )}
            </div>

            {/* Error message */}
            {status === "failed" && (data?.errorMessage || error) && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-red-400 mb-1">
                            Error Details
                        </p>
                        <p className="text-xs text-red-300/80">
                            {data?.errorMessage || error}
                        </p>
                    </div>
                </div>
            )}

            {/* Two-column detail grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Connect to Bot */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10 text-orange-400">
                            {ch.icon}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">
                                Connect to Your Bot
                            </h3>
                            <p className="text-[11px] text-gray-500">
                                Start chatting via {ch.label}
                            </p>
                        </div>
                    </div>

                    {status === "active" && data?.channelLink && (
                        <>
                            <a
                                href={data.channelLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/15 transition-colors text-sm font-medium"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open in {ch.label}
                            </a>
                            <CopyField label="Connection Link" value={data.channelLink} />
                        </>
                    )}

                    {status !== "active" && (
                        <div className="flex items-center justify-center py-6 text-gray-600">
                            <div className="text-center">
                                <WifiOff className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                                <p className="text-xs">
                                    {status === "failed"
                                        ? "Connection unavailable"
                                        : "Waiting for deployment…"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Gateway Token */}
                    <div className="pt-2 border-t border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                            <Key className="h-3.5 w-3.5" />
                            <span>Gateway Token</span>
                        </div>
                        <CopyField label="Token" value={gatewayToken} />
                    </div>
                </div>

                {/* Deployment Details */}
                <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400">
                            <Server className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">
                                Deployment Details
                            </h3>
                            <p className="text-[11px] text-gray-500">
                                Akash Network deployment info
                            </p>
                        </div>
                    </div>

                    {data?.providerUrl && (
                        <CopyField label="Provider URL" value={data.providerUrl} isLink={true} />
                    )}
                    {data?.deploymentId && (
                        <CopyField label="Deployment ID" value={data.deploymentId} />
                    )}
                    {data?.leaseId && (
                        <CopyField label="Lease ID" value={data.leaseId} />
                    )}
                    {!data?.providerUrl && !data?.deploymentId && !data?.leaseId && (
                        <div className="flex items-center justify-center py-6 text-gray-600">
                            <div className="text-center">
                                <Server className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                                <p className="text-xs">
                                    {status === "failed"
                                        ? "No deployment data"
                                        : "Deployment info will appear here…"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <Wifi className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">24/7 Uptime</p>
                        <p className="text-[11px] text-gray-500">Always running</p>
                    </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <Server className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Isolated Server</p>
                        <p className="text-[11px] text-gray-500">Dedicated VM</p>
                    </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <Globe className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Akash Network</p>
                        <p className="text-[11px] text-gray-500">Decentralized cloud</p>
                    </div>
                </div>
            </div>

            {/* Deployment ID footer */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-4">
                <CopyField label="Internal Deployment ID" value={deploymentId} />
                <p className="text-[10px] text-gray-600 mt-2">
                    Save this ID to reference your deployment later.
                </p>
            </div>
        </div>
    );
}
