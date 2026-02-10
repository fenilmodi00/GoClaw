"use client";

import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const AI_MODELS = [
  { id: "claude-opus-4.5", name: "AkashML", logo: "/logo/akashml.png", showName: false, invert: true, comingSoon: false },
  { id: "gpt-3.2", name: "ChatGPT", logo: "/logo/openai.png", showName: true, invert: true, comingSoon: true },
  { id: "gemini-3-flash", name: "Gemini", logo: "/logo/google-gemini-icon.png", showName: true, invert: false, comingSoon: true },
] as const;

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ModelSelector({ value, onChange, error }: ModelSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Which model do you want as default?</Label>
      <div className="flex flex-wrap gap-3">
        {AI_MODELS.map((model) => {
          const isSelected = value === model.id;
          const isDisabled = model.comingSoon;
          
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => !isDisabled && onChange(model.id)}
              disabled={isDisabled}
              className={`group relative flex items-center gap-2 px-5 py-3 rounded-lg border-2 transition-all duration-200 ${
                isDisabled
                  ? "border-gray-800 bg-gray-900/30 cursor-not-allowed opacity-60"
                  : isSelected
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-orange-400/50"
              }`}
            >
              <div className={`relative ${model.showName ? 'w-6 h-6' : 'w-32 h-8'} flex-shrink-0`}>
                <Image
                  src={model.logo}
                  alt={model.name || model.id}
                  fill
                  className="object-contain"
                  style={model.invert ? { filter: 'brightness(0) invert(1)' } : undefined}
                />
              </div>
              {model.showName && (
                <span className={`text-sm font-medium ${
                  isDisabled
                    ? "text-gray-600"
                    : isSelected 
                    ? "text-white" 
                    : "text-gray-400 group-hover:text-white"
                }`}>
                  {model.name}
                </span>
              )}
              {model.comingSoon && (
                <Badge variant="secondary" className="ml-1 text-xs bg-gray-800 text-gray-400">
                  Coming Soon
                </Badge>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
