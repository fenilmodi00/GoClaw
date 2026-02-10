"use client";

import Image from "next/image";
import { Label } from "@/components/ui/label";

export const CHANNELS = [
  { id: "telegram", name: "Telegram", logo: "/logo/telegram.png", disabled: false },
  { id: "discord", name: "Discord", logo: "/logo/discord.png", disabled: true },
  { id: "whatsapp", name: "WhatsApp", logo: "/logo/png-whatsapp.png", disabled: true },
] as const;

interface ChannelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onTelegramConnect: () => void;
  error?: string;
}

export function ChannelSelector({ value, onChange, onTelegramConnect, error }: ChannelSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Which channel do you want to use for sending messages?</Label>
      <div className="flex flex-wrap gap-3">
        {CHANNELS.map((channel) => {
          const isSelected = value === channel.id;
          
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => {
                if (!channel.disabled) {
                  onChange(channel.id);
                  if (channel.id === "telegram") {
                    onTelegramConnect();
                  }
                }
              }}
              disabled={channel.disabled}
              className={`group relative flex items-center gap-2 px-5 py-3 rounded-lg border-2 transition-all duration-200 ${
                channel.disabled
                  ? "border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-orange-400/50"
              }`}
            >
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src={channel.logo}
                  alt={channel.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className={`text-sm font-medium ${
                channel.disabled
                  ? "text-gray-600"
                  : isSelected
                  ? "text-white"
                  : "text-gray-400 group-hover:text-white"
              }`}>
                {channel.name}
              </span>
              {channel.disabled && (
                <span className="text-xs text-gray-600 ml-1">Coming soon</span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
