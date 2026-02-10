"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";

/**
 * Props for the SuccessDisplay component
 */
interface SuccessDisplayProps {
  channel: string;
  channelLink: string;
  providerUrl: string;
  deploymentId: string;
  leaseId: string;
  gatewayToken?: string;
}

/**
 * Get channel-specific display information
 */
function getChannelInfo(channel: string): {
  name: string;
  instructions: string;
  linkLabel: string;
} {
  switch (channel) {
    case "telegram":
      return {
        name: "Telegram",
        instructions:
          "Search for your bot using the username you created with @BotFather",
        linkLabel: "Open in Telegram",
      };
    case "discord":
      return {
        name: "Discord",
        instructions:
          "Access the Discord Developer Portal to get your bot's OAuth2 URL and invite it to your server",
        linkLabel: "Open Discord Developer Portal",
      };
    case "whatsapp":
      return {
        name: "WhatsApp",
        instructions:
          "Configure your phone number and connect through the WhatsApp Business Platform",
        linkLabel: "Open WhatsApp Business",
      };
    default:
      return {
        name: "Bot",
        instructions:
          "Follow the platform-specific instructions to connect to your bot",
        linkLabel: "Open Platform",
      };
  }
}

/**
 * SuccessDisplay Component
 */
export function SuccessDisplay({
  channel,
  channelLink,
  providerUrl,
  deploymentId,
  leaseId,
  gatewayToken = "2002",
}: SuccessDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const channelInfo = getChannelInfo(channel);

  /**
   * Copy text to clipboard and show feedback
   */
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);

      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  /**
   * Copyable field (for tokens & IDs)
   */
  const CopyableField = ({
    label,
    value,
    fieldName,
  }: {
    label: string;
    value: string;
    fieldName: string;
  }) => {
    const isCopied = copiedField === fieldName;

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-muted p-2 rounded block break-all">
            {value}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(value, fieldName)}
            className="shrink-0"
            aria-label={`Copy ${label}`}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Open-link field (for URLs users should click)
   */
  const OpenLinkField = ({
    label,
    url,
  }: {
    label: string;
    url: string;
  }) => {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-muted p-2 rounded block break-all">
            {url}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              window.open(url, "_blank", "noopener,noreferrer")
            }
            className="shrink-0"
            aria-label={`Open ${label}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Success Message Card */}
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-green-500 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Deployment Successful!
          </CardTitle>
          <CardDescription>
            Your OpenClaw bot is now running on Akash Network
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Channel Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Connect to Your Bot</CardTitle>
          <CardDescription>
            Connect via {channelInfo.name} to start using your AI bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{channelInfo.name} Bot</p>
            <a
              href={channelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {channelInfo.linkLabel}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <OpenLinkField label="Connection Link" url={channelLink} />

          <CopyableField
            label="Gateway Token"
            value={gatewayToken}
            fieldName="gateway"
          />

          <p className="text-xs text-muted-foreground">
            {channelInfo.instructions}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Use the Gateway Token to authenticate and access your OpenClaw
            bot&apos;s web interface.
          </p>
        </CardContent>
      </Card>

      {/* Akash Deployment Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Details</CardTitle>
          <CardDescription>
            Your Akash Network deployment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyableField
            label="Provider URL"
            value={providerUrl}
            fieldName="provider"
          />

          <CopyableField
            label="Akash Deployment ID"
            value={deploymentId}
            fieldName="deployment"
          />

          <CopyableField
            label="Akash Lease ID"
            value={leaseId}
            fieldName="lease"
          />

          <p className="text-xs text-muted-foreground">
            Save these details to manage your deployment on Akash Network
          </p>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Open the {channelInfo.name} link above to start chatting
                with your bot
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Use the Gateway Token to access your bot&apos;s web
                interface and management panel
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Your bot is running 24/7 on Akash Network with
                meta-llama/Llama-3.3-70B-Instruct
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Use the deployment details to monitor or manage your bot
                on Akash Console
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Keep your Gateway Token and deployment ID safe for future
                reference
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
