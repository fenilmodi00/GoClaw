"use client";

import Image from "next/image";
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
    <div className="flex items-center gap-3 p-3 rounded-xl">
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
        className="text-gray-400 hover:text-white transition-colors"
        title="Copy email"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}
