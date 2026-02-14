"use client";

import { useForm } from "@tanstack/react-form";
import { valibotValidator } from "@tanstack/valibot-form-adapter";
import * as v from "valibot";
import { useState, useEffect } from "react";
import { useUser, GoogleOneTap } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { ChannelSelector } from "./ChannelSelector";
import { UserProfile } from "./UserProfile";
import { TelegramConnectDialog } from "../telegram/TelegramConnectDialog";
import { Clock, Shield, Users, Star, Check, Info } from "lucide-react";
import { PRICING_TIERS, TierConfig } from "@/config/pricing";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DeploymentFormSchema = v.object({
  model: v.pipe(
    v.string(),
    v.picklist(["minimax-m2.5", "gpt-3.2", "gemini-3-flash"], "Invalid model selection")
  ),
  channel: v.pipe(
    v.string(),
    v.picklist(["telegram", "discord", "whatsapp"], "Invalid channel selection")
  ),
  channelToken: v.pipe(v.string(), v.minLength(1, "Channel token is required")),
  tier: v.pipe(
    v.string(),
    v.picklist(["starter", "pro", "business"], "Please select a plan")
  ),
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
      model: "" as "minimax-m2.5" | "gpt-3.2" | "gemini-3-flash" | "",
      channel: "" as "telegram" | "discord" | "whatsapp" | "",
      channelToken: "",
      tier: "" as "starter" | "pro" | "business" | "",
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tier = params.get('tier');
    if (tier && ['starter', 'pro', 'business'].includes(tier)) {
      form.setFieldValue('tier', tier as "starter" | "pro" | "business");
    }
  }, [isLoaded, form]);

  const handleTokenSave = (token: string) => {
    form.setFieldValue("channelToken", token);
  };

  // Use form store to subscribe to field changes reactively
  const hasToken = form.useStore((state) => state.values.channelToken.length > 0);
  const selectedTier = form.useStore((state) => state.values.tier);

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
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white/90">Step 1: Bot Configuration</h3>
          <p className="text-[11px] text-white/40">Choose your model and connect your channel</p>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-3 font-semibold">
            Default Model
          </label>
          <form.Field
            name="model"
            validators={{
              onChange: v.pipe(
                v.string(),
              v.picklist(
                  ["minimax-m2.5", "gpt-3.2", "gemini-3-flash"],
                  "Please select a valid AI model"
                )
              ),
            }}
          >
            {(field) => (
              <ModelSelector
                value={field.state.value}
                onChange={(value) =>
                  field.handleChange(value as "minimax-m2.5" | "gpt-3.2" | "gemini-3-flash")
                }
                error={field.state.meta.errors[0] || undefined}
              />
            )}
          </form.Field>
        </div>

        {/* Channel Selection */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-3 font-semibold">
            Messaging Channel
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

        <AnimatePresence>
          {hasToken && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="h-px bg-white/[0.06] mb-6" />

              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-white/90">Step 2: Choose your Plan</h3>
                  <p className="text-[11px] text-white/40">Select a subscription to power your agent</p>
                </div>

                <form.Field name="tier">
                  {(field) => (
                    <TooltipProvider delayDuration={100}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(Object.values(PRICING_TIERS) as TierConfig[]).map((tier) => {
                          const isSelected = field.state.value === tier.id;
                          return (
                            <div key={tier.id} className="relative">
                              {/* Tier Card Button */}
                              <button
                                type="button"
                                onClick={() => field.handleChange(tier.id)}
                                className={cn(
                                  "relative flex flex-col p-4 rounded-xl border transition-all duration-300 text-left w-full h-full group",
                                  isSelected
                                    ? "bg-white/[0.05] border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                                    : "bg-transparent border-white/[0.06] hover:border-orange-500/30 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                                )}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-semibold text-white/90">{tier.label}</span>
                                  {isSelected && (
                                    <div className="h-3 w-3 rounded-full bg-white flex items-center justify-center">
                                      <Check className="h-2 w-2 text-black" />
                                    </div>
                                  )}
                                </div>
                                <div className="mb-2">
                                  <span className="text-lg font-bold text-white">${tier.price}</span>
                                  <span className="text-[10px] text-white/30">/mo</span>
                                </div>
                                <p className="text-[10px] text-emerald-400/70 mb-1">
                                  ${tier.credits} credits
                                </p>
                                <p className="text-[9px] text-white/25 leading-tight">
                                  {tier.id === 'starter' ? '1 bot' : tier.id === 'pro' ? '3 bots' : 'Unlimited'}
                                </p>
                              </button>

                              {/* Info Button with Tooltip - Only triggers on info icon hover */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute bottom-2 right-2 z-10 h-5 w-5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center transition-all duration-200 hover:bg-white/[0.12] hover:border-white/[0.2] hover:scale-110"
                                  >
                                    <Info className="h-2.5 w-2.5 text-white/50 hover:text-white/70" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  align="end"
                                  className="max-w-[280px] p-4 bg-[#1a1a1a] border border-white/[0.08] shadow-2xl"
                                  sideOffset={8}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-white">{tier.label}</span>
                                      <span className="text-sm font-bold text-emerald-400">${tier.price}/mo</span>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed">
                                      {tier.description}
                                    </p>
                                    <div className="pt-2 border-t border-white/[0.06]">
                                      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">Features</p>
                                      <ul className="space-y-1.5">
                                        {tier.features.map((feature, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-[11px] text-white/70">
                                            <Check className="h-3 w-3 text-emerald-400/80 flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          );
                        })}
                      </div>
                    </TooltipProvider>
                  )}
                </form.Field>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* User Profile */}
        <UserProfile user={user} />

        {/* Submit Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className={cn(
            "w-full font-semibold py-3 text-sm flex items-center justify-center gap-2 rounded-xl transition-all duration-300",
            !selectedTier && hasToken
              ? "bg-white/[0.02] text-white/30 border border-white/[0.05] cursor-not-allowed"
              : "bg-white text-black hover:bg-white/95 shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          )}
          disabled={isSubmitting || (hasToken && !selectedTier)}
        >
          {isSubmitting ? (
            "Processing..."
          ) : !hasToken ? (
            "Connect Channel to Continue"
          ) : !selectedTier ? (
            "Select Plan to Deploy"
          ) : (
            `Deploy & Subscribe - $${PRICING_TIERS[selectedTier.toUpperCase() as keyof typeof PRICING_TIERS].price}/mo`
          )}
        </Button>

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
          { icon: Shield, text: "Rollover credits" },
          { icon: Users, text: "15+ active bots" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-1.5 text-xs text-gray-500/60">
            <item.icon className="h-3 w-3" />
            <span>{item.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-500/60">
          <div className="w-3 h-3 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Star className="h-2 w-2 text-orange-400/60" />
          </div>
          <span>Trusted by @marcflvs</span>
        </div>
      </div>

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
