"use client";

import Image from "next/image";
import { Copy } from "lucide-react";
import type { UserResource } from "@clerk/types";

interface UserProfileProps {
  user: UserResource;
}

export function UserProfile({ user }: UserProfileProps) {
  const handleCopyEmail = () => {
    const email = user.primaryEmailAddress?.emailAddress;
    if (email) {
      navigator.clipboard.writeText(email);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName || "User"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-semibold">
            {user.firstName?.[0] || "U"}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium text-white">
          {user.fullName || user.firstName || "User"}
        </span>
        <span className="text-xs text-gray-400">
          {user.primaryEmailAddress?.emailAddress}
        </span>
      </div>
      <button
        type="button"
        onClick={handleCopyEmail}
        className="p-1 hover:bg-gray-800 rounded transition-colors flex-shrink-0"
        title="Copy email"
      >
        <Copy className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
