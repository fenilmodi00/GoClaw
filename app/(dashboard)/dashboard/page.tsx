"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Server,
  Clock,
  Gift,
  Copy,
  Share2,
  ExternalLink,
  MessageCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────
interface Deployment {
  id: string;
  model: string;
  channel: string;
  status: string;
  providerUrl: string | null;
  akashDeploymentId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────
const channelMeta: Record<string, { icon: React.ReactNode; label: string }> = {
  telegram: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    label: "Telegram",
  },
  discord: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
      </svg>
    ),
    label: "Discord",
  },
  whatsapp: {
    icon: <MessageCircle className="h-4 w-4" />,
    label: "WhatsApp",
  },
};

const statusConfig: Record<
  string,
  { label: string; dot: string; bg: string; text: string }
> = {
  active: {
    label: "Active",
    dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  deploying: {
    label: "Deploying",
    dot: "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)] animate-pulse",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
  },
  pending: {
    label: "Pending",
    dot: "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)] animate-pulse",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  failed: {
    label: "Failed",
    dot: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]",
    bg: "bg-red-500/10",
    text: "text-red-400",
  },
};

const modelNames: Record<string, string> = {
  "claude-opus-4.5": "Claude Opus 4.5",
  "gpt-3.2": "GPT 3.2",
  "gemini-3-flash": "Gemini 3 Flash",
};

function truncateUrl(url: string, maxLen = 40): string {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    return display.length > maxLen ? display.slice(0, maxLen) + "…" : display;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + "…" : url;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Agent Card ─────────────────────────────────────────────────
function AgentCard({ deployment }: { deployment: Deployment }) {
  const channel = channelMeta[deployment.channel] || {
    icon: <Globe className="h-4 w-4" />,
    label: deployment.channel,
  };
  const status = statusConfig[deployment.status] || statusConfig.pending;

  return (
    <Link
      href={`/status/${deployment.id}`}
      className="group block rounded-xl border border-white/[0.06] bg-[#111214] p-4 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] text-white">
            {channel.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
              {channel.label} Bot
            </p>
            <p className="text-[11px] text-gray-600">
              {modelNames[deployment.model] || deployment.model}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className={`text-[10px] font-medium ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* URL / Info row */}
      <div className="flex items-center justify-between">
        {deployment.providerUrl ? (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 min-w-0">
            <Globe className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{truncateUrl(deployment.providerUrl)}</span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-600 italic">
            {deployment.status === "active" ? "No URL assigned" : "Awaiting deployment…"}
          </span>
        )}
        <span className="text-[10px] text-gray-600 flex-shrink-0 ml-3">
          {timeAgo(deployment.createdAt)}
        </span>
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
function AgentCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111214] p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
          <div>
            <div className="h-3.5 w-24 bg-white/[0.06] rounded" />
            <div className="h-2.5 w-16 bg-white/[0.04] rounded mt-1.5" />
          </div>
        </div>
        <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
      </div>
      <div className="h-3 w-48 bg-white/[0.04] rounded" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good afternoon");
  const [copied, setCopied] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Redirect to home if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, isLoaded, router]);

  // Fetch deployments
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function fetchDeployments() {
      try {
        const res = await fetch("/api/deployments");
        if (res.ok) {
          const data = await res.json();
          setDeployments(data.deployments || []);
        }
      } catch {
        // silently fail — dashboard still usable
      } finally {
        setLoading(false);
      }
    }

    fetchDeployments();
  }, [isLoaded, isSignedIn]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://goclaw.com/invite?ref=" + (user?.id || ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Greeting + License Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {user?.firstName || "there"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your AI deployments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="destructive"
            className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15 px-3 py-1"
          >
            ⚠ No licenses
          </Badge>
          <Link href="/billing">
            <Button
              variant="outline"
              size="sm"
              className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] text-xs h-8 gap-1.5"
            >
              + Buy License
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Agent Cards ─────────────────────────────────────── */}
      {loading ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Your Agents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AgentCardSkeleton />
            <AgentCardSkeleton />
          </div>
        </div>
      ) : deployments.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Your Agents</h2>
            <Link href="/deploy">
              <Button
                variant="outline"
                size="sm"
                className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] text-xs h-7 gap-1.5"
              >
                + New Agent
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deployments.map((d) => (
              <AgentCard key={d.id} deployment={d} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Hero Section — Choose an AI Agent */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-[#111214] p-8 text-center overflow-hidden">
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          {/* Agent Avatars */}
          <div className="flex justify-center -space-x-3 mb-6">
            {[
              { bg: "from-orange-500 to-red-600", icon: "🔥" },
              { bg: "from-cyan-500 to-blue-600", icon: "⚡" },
              { bg: "from-purple-500 to-pink-600", icon: "🧠" },
              { bg: "from-yellow-500 to-orange-500", icon: "🤖" },
              { bg: "from-green-500 to-emerald-600", icon: "🦉" },
            ].map((agent, i) => (
              <div
                key={i}
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${agent.bg} flex items-center justify-center text-2xl ring-4 ring-[#111214] shadow-lg`}
              >
                {agent.icon}
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Choose an AI agent to deploy
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
            Pick from preconfigured AI agents — each with unique skills and
            personality. Deploy to a dedicated cloud server in under 2 minutes.
          </p>

          <Link href="/deploy">
            <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6 h-10 text-sm font-medium gap-2 shadow-lg shadow-white/10">
              <Sparkles className="h-4 w-4" />
              Deploy agent
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: Zap,
            title: "One-click deploy",
            desc: "No config needed",
            color: "text-yellow-500",
          },
          {
            icon: Server,
            title: "Isolated Server",
            desc: "Your data, your VM",
            color: "text-blue-400",
          },
          {
            icon: Clock,
            title: "24/7 Uptime",
            desc: "Always running",
            color: "text-green-400",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111214] px-4 py-3 hover:border-white/[0.12] transition-colors cursor-default"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04]">
              <feature.icon className={`h-4 w-4 ${feature.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{feature.title}</p>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Banner */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#111214] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04]">
            <Gift className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Invite friends, get a free month
            </p>
            <p className="text-xs text-gray-500">
              Share your link — when they deploy a server, you get{" "}
              <span className="text-white font-medium">$50 off</span> your next
              bill. No limit.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] text-xs h-8 gap-1.5"
          >
            <Copy className="h-3 w-3" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] text-xs h-8 gap-1.5"
          >
            <Share2 className="h-3 w-3" />
            Share
          </Button>
          <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors p-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
