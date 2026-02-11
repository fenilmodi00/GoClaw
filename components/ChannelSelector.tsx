"use client";

import Image from "next/image";

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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
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
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${channel.disabled
                ? "bg-white/[0.02] border-white/[0.04] opacity-40 cursor-not-allowed"
                : isSelected
                  ? "bg-white/[0.08] border-white/[0.12]"
                  : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]"
                }`}
            >
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              )}
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={channel.logo}
                  alt={channel.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className={`text-[13px] font-medium ${channel.disabled
                ? "text-white/20"
                : isSelected
                  ? "text-white/90"
                  : "text-white/40 group-hover:text-white/60"
                }`}>
                {channel.name}
              </span>
              {channel.disabled && (
                <span className="text-[10px] text-white/20 ml-0.5">Soon</span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-[11px] text-red-400/80">{error}</p>}
    </div>
  );
}
