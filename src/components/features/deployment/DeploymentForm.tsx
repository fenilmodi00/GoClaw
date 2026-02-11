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
import { Clock, Shield, Users, Star } from "lucide-react";



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
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Deployment Form Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#111214]/80 backdrop-blur-sm p-6 space-y-6">
        {/* Model Selection */}
        <div>
          <label className="block text-xs text-gray-400 mb-3">
            Which model do you want as default?
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="model"
              validators={{
                onChange: v.pipe(
                  v.string(),
                  v.picklist(
                    ["claude-opus-4.5", "gpt-3.2", "gemini-3-flash"],
                    "Please select a valid AI model"
                  )
                ),
              }}
            >
              {(field) => (
                <ModelSelector
                  value={field.state.value}
                  onChange={(value) =>
                    field.handleChange(value as "claude-opus-4.5" | "gpt-3.2" | "gemini-3-flash")
                  }
                  error={field.state.meta.errors[0] || undefined}
                />
              )}
            </form.Field>
          </form>
        </div>

        {/* Channel Selection */}
        <div>
          <label className="block text-xs text-gray-400 mb-3">
            Which channel do you want to use for sending messages?
          </label>
          <form.Field
            name="channel"
            validators={{
              onChange: v.pipe(
                v.string(),
                v.picklist(
                  ["telegram", "discord", "whatsapp"],
                  "Please select a valid channel"
                )
              ),
            }}
          >
            {(field) => (
              <ChannelSelector
                value={field.state.value}
                onChange={(value) =>
                  field.handleChange(value as "telegram" | "discord" | "whatsapp")
                }
                onTelegramConnect={() => setShowTelegramDialog(true)}
                error={field.state.meta.errors[0] || undefined}
              />
            )}
          </form.Field>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* User Profile */}
        <UserProfile user={user} />

        {/* Start Free Trial Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="w-full bg-white/[0.06] hover:bg-white/[0.08] text-white/60 border border-white/[0.06] font-medium py-3 text-sm flex items-center justify-center gap-2 rounded-xl transition-all duration-200"
          disabled={isSubmitting}
        >
          <span className="text-base">⚡</span>
          {isSubmitting ? "Deploying..." : "Deploy Now"}
        </Button>

        {/* Helper Text */}
        <p className="text-center text-white/25 text-[11px]">
          Select a channel to continue
        </p>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Social Proof Pills */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {[
          { icon: Clock, text: "Cancel anytime" },
          { icon: Shield, text: "Trial is not charged" },
          { icon: Users, text: "15+ active agents deployed" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-1.5 text-xs text-gray-500">
            <item.icon className="h-3 w-3" />
            <span>{item.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Star className="h-2 w-2 text-orange-400" />
          </div>
          <span>Backed by @marcflvs</span>
        </div>
      </div>

      {/* Testimonial */}


      {/* Stats Bar */}


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
