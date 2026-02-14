"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TelegramConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTokenSave: (token: string) => void;
  initialToken?: string;
}

export function TelegramConnectDialog({
  open,
  onOpenChange,
  onTokenSave,
  initialToken = "",
}: TelegramConnectDialogProps) {
  const [botToken, setBotToken] = useState(initialToken);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with initial token when dialog opens
  useEffect(() => {
    if (open) {
      setBotToken(initialToken);
      setTokenError(null);
    }
  }, [open, initialToken]);

  const handleSave = () => {
    const trimmedToken = botToken.trim();

    if (!trimmedToken) {
      setTokenError("Please enter a bot token");
      return;
    }

    setIsSaving(true);

    // Simulate save animation
    setTimeout(() => {
      onTokenSave(trimmedToken);
      setIsSaving(false);
      onOpenChange(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-black/95 backdrop-blur-xl border border-gray-800/50 text-white p-0 gap-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-0">
          {/* Instructions */}
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-0 p-0">
              <DialogTitle className="flex items-center gap-2.5 text-lg font-medium">
                <div className="relative w-5 h-5">
                  <Image
                    src="/logo/telegram.png"
                    alt="Telegram"
                    fill
                    className="object-contain"
                  />
                </div>
                Connect Telegram
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300">How to get your bot token?</h3>

              <ol className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <li className="flex gap-3">
                  <span className="font-medium text-white flex-shrink-0">1.</span>
                  <span>
                    Open Telegram and go to{" "}
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      @BotFather
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-medium text-white flex-shrink-0">2.</span>
                  <span>Type <code className="bg-gray-800/50 px-2 py-0.5 rounded text-xs font-mono">/newbot</code></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-medium text-white flex-shrink-0">3.</span>
                  <span>Follow prompts to name your bot and choose a username</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-medium text-white flex-shrink-0">4.</span>
                  <span>Copy the bot token from BotFather&apos;s message</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-medium text-white flex-shrink-0">5.</span>
                  <span>Paste the token below and click Save & Connect</span>
                </li>
              </ol>
            </div>

            <div className="space-y-3 pt-2">
              <Label htmlFor="bot-token" className="text-sm font-medium text-gray-300">
                Enter bot token
              </Label>
              <Input
                id="bot-token"
                type="text"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={botToken}
                onChange={(e) => {
                  setBotToken(e.target.value);
                  setTokenError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-600 focus:border-gray-600 h-11"
              />
              {tokenError && (
                <p className="text-xs text-red-400">{tokenError}</p>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={!botToken.trim() || isSaving}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white h-11 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save & Connect"}
            </Button>
          </div>

          {/* Video Preview */}
          <div className="hidden lg:block bg-gradient-to-br from-gray-900/50 to-black/50 p-8 border-l border-gray-800/50">
            <div className="relative w-[340px] h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <video
                src="/TelegramTokenDemo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
