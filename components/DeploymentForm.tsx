"use client";

import { useForm } from "@tanstack/react-form";
import { valibotValidator } from "@tanstack/valibot-form-adapter";
import * as v from "valibot";
import { useState } from "react";
import { useUser, GoogleOneTap, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { ChannelSelector } from "./ChannelSelector";
import { UserProfile } from "./UserProfile";
import { TelegramConnectDialog } from "./TelegramConnectDialog";

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
  const { signOut } = useClerk();
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
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Deploy OpenClaw under 1 minute</h1>
          <p className="text-gray-400 text-sm">
            Avoid all technical complexity and one-click deploy your own 24/7 active<br />
            OpenClaw instance under 1 minute.
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6 w-full"
      >
        {/* Model Selection */}
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

        {/* Channel Selection */}
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

        {/* User Profile */}
        <UserProfile user={user} />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 text-base flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          <span>⚡</span>
          {isSubmitting ? "Deploying..." : "Deploy OpenClaw"}
        </Button>

        {/* Info Messages */}
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            Connect Telegram to continue. You can also add other channels to the same account in the future.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-md bg-red-500/10 border border-red-500">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
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
