"use client";

import Image from "next/image";

export const AI_MODELS = [
  { id: "claude-opus-4.5" as const, name: "AkashML", logo: "/logo/akashml.png", showName: false, invert: true, comingSoon: false },
  { id: "gpt-3.2" as const, name: "ChatGPT", logo: "/logo/openai.png", showName: true, invert: true, comingSoon: true },
  { id: "gemini-3-flash" as const, name: "Gemini", logo: "/logo/google-gemini-icon.png", showName: true, invert: false, comingSoon: true },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ModelSelector({ value, onChange, error }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {AI_MODELS.map((model) => {
          const isSelected = value === model.id;
          const isDisabled = model.comingSoon;

          return (
            <button
              key={model.id}
              type="button"
              onClick={() => !isDisabled && onChange(model.id)}
              disabled={isDisabled}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${isDisabled
                ? "bg-white/[0.02] border-white/[0.04] cursor-not-allowed opacity-40"
                : isSelected
                  ? "bg-white/[0.08] border-white/[0.12]"
                  : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]"
                }`}
            >
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              )}
              <div className={`relative ${model.showName ? 'w-5 h-5' : 'w-28 h-7'} flex-shrink-0`}>
                <Image
                  src={model.logo}
                  alt={model.name || model.id}
                  fill
                  className="object-contain"
                  style={model.invert ? { filter: 'brightness(0) invert(1)' } : undefined}
                />
              </div>
              {model.showName && (
                <span className={`text-[13px] font-medium ${isDisabled
                  ? "text-white/20"
                  : isSelected
                    ? "text-white/90"
                    : "text-white/40 group-hover:text-white/60"
                  }`}>
                  {model.name}
                </span>
              )}
              {model.comingSoon && (
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
