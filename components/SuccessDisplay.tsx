"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Home, LayoutDashboard, Sparkles } from "lucide-react";
import { DeploymentLoading } from "./DeploymentLoading";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

interface SuccessDisplayProps {
  channel: string;
  channelLink: string;
  providerUrl: string;
  deploymentId: string;
  leaseId: string;
  gatewayToken?: string;
  showLoading?: boolean;
}

function getChannelInfo(channel: string) {
  switch (channel) {
    case "telegram":
      return { name: "Telegram", instructions: "Search for your bot using the username you created with @BotFather", linkLabel: "Open in Telegram" };
    case "discord":
      return { name: "Discord", instructions: "Use the Discord Developer Portal to invite your bot to a server", linkLabel: "Open Discord Developer Portal" };
    case "whatsapp":
      return { name: "WhatsApp", instructions: "Configure your phone number and connect through WhatsApp Business", linkLabel: "Open WhatsApp Business" };
    default:
      return { name: "Bot", instructions: "Follow platform instructions to connect", linkLabel: "Open Platform" };
  }
}

export function SuccessDisplay({ channel, channelLink, providerUrl, deploymentId, leaseId, gatewayToken = "2002", showLoading = false }: SuccessDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(showLoading);
  const { isSignedIn, isLoaded } = useUser();
  const channelInfo = getChannelInfo(channel);

  useEffect(() => {
    if (showLoading) setIsDeploying(true);
  }, [showLoading]);

  if (isDeploying) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
        <DeploymentLoading deploymentId={deploymentId} onComplete={() => setIsDeploying(false)} onError={() => setIsDeploying(false)} />
      </div>
    );
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const CopyableField = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="space-y-1.5">
      <p className="text-xs text-gray-400">{label}</p>
      <div className="flex gap-2">
        <code className="flex-1 text-xs bg-black/60 border border-orange-500/20 px-3 py-2 rounded break-all text-gray-300">{value}</code>
        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(value, field)}>
          {copiedField === field ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-auto">
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="thread" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          {[...Array(12)].map((_, i) => (
            <g key={i}>
              <path id={`path${i}`} d={`M${50 + i * 80} 750 Q${300 + i * 50} ${600 - i * 30} ${600 + i * 40} ${500 - i * 20} T${1200 + i * 50} ${300 - i * 15}`} stroke="url(#thread)" strokeWidth={1.2 - i * 0.06} fill="none" />
              <circle r={2.5 - i * 0.12} fill="url(#pulse)">
                <animateMotion dur={`${4 + i * 0.4}s`} repeatCount="indefinite">
                  <mpath href={`#path${i}`} />
                </animateMotion>
              </circle>
            </g>
          ))}
        </svg>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm border-b border-orange-500/20">
        <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl mx-auto">
          <Link href="/" className="font-bold text-lg text-orange-400">GoClaw</Link>
          <div className="flex gap-2 items-center">
            <Link href="/"><Button variant="ghost" size="sm" className="text-sm"><Home className="h-4 w-4 mr-1.5" /> Home</Button></Link>
            <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-sm"><LayoutDashboard className="h-4 w-4 mr-1.5" /> Dashboard</Button></Link>
            {isLoaded && isSignedIn && <UserButton />}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-3 shadow-lg shadow-green-500/30">
            <Sparkles className="text-white h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">🎉 Deployment Successful!</h1>
          <p className="text-gray-400 text-sm">Your OpenClaw bot is live on Akash Network</p>
        </div>

        {/* Success Banner */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/30">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-400 shrink-0" />
            <div>
              <h3 className="text-green-400 font-semibold text-sm">Ready to Connect</h3>
              <p className="text-gray-400 text-xs">Your bot is running 24/7 and ready to receive messages</p>
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Connect Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-orange-500" />
                Connect to Your Bot
              </CardTitle>
              <CardDescription className="text-xs">Start chatting via {channelInfo.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className="text-xs text-orange-400 mb-1.5 font-medium">{channelInfo.name} Bot</p>
                <a href={channelLink} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline text-xs inline-flex items-center gap-1.5">
                  {channelInfo.linkLabel}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <CopyableField label="Connection Link" value={channelLink} field="link" />
              <CopyableField label="Gateway Token" value={gatewayToken} field="gateway" />
              <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">{channelInfo.instructions}</p>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Copy className="h-4 w-4 text-orange-500" />
                Deployment Details
              </CardTitle>
              <CardDescription className="text-xs">Akash Network deployment info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <CopyableField label="Provider URL" value={providerUrl} field="provider" />
              <CopyableField label="Deployment ID" value={deploymentId} field="deployment" />
              <CopyableField label="Lease ID" value={leaseId} field="lease" />
              <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300">💾 Save these details to manage your deployment</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Next Steps</CardTitle>
            <CardDescription className="text-xs">Get started with your bot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { num: "1", title: "Connect Bot", desc: `Open ${channelInfo.name} link to start chatting` },
                { num: "2", title: "Web Interface", desc: "Use Gateway Token for management" },
                { num: "3", title: "24/7 Active", desc: "Runs with Llama-3.3-70B-Instruct" },
                { num: "4", title: "Monitor", desc: "Manage on Akash Console" },
                { num: "5", title: "Save Credentials", desc: "Keep tokens safe" },
                { num: "6", title: "Dashboard", desc: "View all deployments" },
              ].map((step) => (
                <div key={step.num} className="p-3 rounded-lg border border-orange-500/20 hover:bg-orange-500/5 transition-colors">
                  <div className="flex gap-2">
                    <span className="text-orange-500 font-bold text-base shrink-0">{step.num}</span>
                    <div>
                      <h4 className="font-medium text-white text-xs mb-0.5">{step.title}</h4>
                      <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Link href="/dashboard"><Button size="sm"><LayoutDashboard className="h-4 w-4 mr-1.5" />Dashboard</Button></Link>
          <Link href="/"><Button size="sm" variant="outline"><Home className="h-4 w-4 mr-1.5" />Home</Button></Link>
        </div>
      </main>
    </div>
  );
}
