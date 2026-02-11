"use client";

import { useForm } from "@tanstack/react-form";
import { valibotValidator } from "@tanstack/valibot-form-adapter";
import * as v from "valibot";
import { useState } from "react";
import { useUser, GoogleOneTap } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { ChannelSelector } from "./ChannelSelector";
import { UserProfile } from "./UserProfile";
import { TelegramConnectDialog } from "../telegram/TelegramConnectDialog";

const DeploymentFormSchema = v.object({
  model: v.pipe(
    v.string(),
    v.picklist(["claude-opus-4.5", "gpt-3.2", "gemini-3-flash"], "Invalid model selection")
  ),
  channel: v.pipe(
    v.string(),
    v.picklist(["telegram", "discord", "whatsapp"], "Invalid channel selection")
  ),
  channelToken: v.pipe(v.string(), v.minLength(1, "Channel token is required")),
});

type DeploymentFormData = v.InferInput<typeof DeploymentFormSchema>;

interface DeploymentFormProps {
  onSubmit?: (data: DeploymentFormData) => Promise<void>;
}

export function DeploymentForm({ onSubmit }: DeploymentFormProps) {
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTelegramDialog, setShowTelegramDialog] = useState(false);

  const form = useForm({
    defaultValues: {
      model: "" as "claude-opus-4.5" | "gpt-3.2" | "gemini-3-flash" | "",
      channel: "" as "telegram" | "discord" | "whatsapp" | "",
      channelToken: "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const validatedData = v.parse(DeploymentFormSchema, value);

        if (onSubmit) {
          await onSubmit(validatedData);
          return;
        }

        const dataWithUserId = {
          ...validatedData,
          userId: user?.id || "",
        };

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataWithUserId),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create checkout session");
        }

        const { sessionUrl } = await response.json();
        window.location.href = sessionUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    validatorAdapter: valibotValidator(),
  });

  const handleTokenSave = (token: string) => {
    form.setFieldValue("channelToken", token);
  };

  if (!isLoaded) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12 space-y-6">
        <GoogleOneTap />
        <p className="text-gray-400">
          Sign in to deploy your AI assistant and connect your channels.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Section - StartClaw inspired */}
      <div className="text-center mb-12">
        {/* Status Badge */}
        <div className="mt-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
          <span className="text-[11px] font-medium text-white/50 tracking-wide uppercase">
            Servers available
          </span>
        </div>


        {/* Main Title with gradient text */}
        <h1
          className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold mb-5 leading-[1.1] tracking-[-0.03em]"
          style={{
            background: 'linear-gradient(180deg, #f7f8f8 0%, rgba(138,143,152,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Deploy an OpenClaw<br className="hidden sm:block" /> in 60 seconds.
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] md:text-sm text-white/40 max-w-md mx-auto leading-relaxed">
          Your own assistant on a secure cloud server,<br />
          preconfigured and ready to chat via Telegram.<br />
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="w-full"
      >
        {/* Model Selection - Open flow, no card */}
        <div className="mb-8">
          <label className="block text-[11px] font-medium text-white/30 uppercase tracking-[0.08em] mb-3 px-1">Model</label>
          <form.Field
            name="model"
            validators={{
              onChange: v.pipe(
                v.string(),
                v.picklist(["claude-opus-4.5", "gpt-3.2", "gemini-3-flash"], "Please select a valid AI model")
              ),
            }}
          >
            {(field) => (
              <ModelSelector
                value={field.state.value}
                onChange={(value) => field.handleChange(value as "claude-opus-4.5" | "gpt-3.2" | "gemini-3-flash")}
                error={field.state.meta.errors[0] || undefined}
              />
            )}
          </form.Field>
        </div>

        {/* Channel Selection - Open flow, no card */}
        <div className="mb-8">
          <label className="block text-[11px] font-medium text-white/30 uppercase tracking-[0.08em] mb-3 px-1">Channel</label>
          <form.Field
            name="channel"
            validators={{
              onChange: v.pipe(
                v.string(),
                v.picklist(["telegram", "discord", "whatsapp"], "Please select a valid channel")
              ),
            }}
          >
            {(field) => (
              <ChannelSelector
                value={field.state.value}
                onChange={(value) => field.handleChange(value as "telegram" | "discord" | "whatsapp")}
                onTelegramConnect={() => setShowTelegramDialog(true)}
                error={field.state.meta.errors[0] || undefined}
              />
            )}
          </form.Field>
        </div>

        {/* Bottom section - Setup card */}
        <div className="bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          {/* User Profile */}
          <UserProfile user={user} />

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Submit Button - StartClaw style white CTA */}
          <Button
            type="submit"
            className="w-full bg-white hover:bg-gray-50 text-black font-semibold py-3.5 text-sm flex items-center justify-center gap-2 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-[1px]"
            disabled={isSubmitting}
          >
            <span className="text-base">⚡</span>
            {isSubmitting ? "Deploying..." : "Deploy Now"}
          </Button>

          {/* Info Messages */}
          <p className="text-center text-white/25 text-[11px] leading-relaxed">
            You&apos;ll enter payment on the next page. Not charged for 48 hours. Coupon codes accepted.
          </p>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>
      </form>

      {/* Telegram Dialog */}
      <TelegramConnectDialog
        open={showTelegramDialog}
        onOpenChange={setShowTelegramDialog}
        onTokenSave={handleTokenSave}
        initialToken={form.state.values.channelToken}
      />
    </div>
  );
}
