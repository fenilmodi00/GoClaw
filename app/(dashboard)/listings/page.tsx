"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * My Listings Page
 * Manage marketplace listings and track sales
 */
export default function ListingsPage() {
    const hasListings = false;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">My Listings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your marketplace listings and track sales
                    </p>
                </div>
                <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-100 text-xs h-8 gap-1.5"
                >
                    <Plus className="h-3 w-3" />
                    New Listing
                </Button>
            </div>

            {/* Listings Content */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111214] overflow-hidden">
                {!hasListings && (
                    <div className="py-10 text-center">
                        <p className="text-sm text-gray-500 mb-6">
                            You haven&apos;t created any listings yet.
                        </p>
                        <Button className="w-full max-w-xl mx-auto bg-white text-black hover:bg-gray-100 rounded-lg h-10 text-sm font-medium gap-1.5">
                            <Plus className="h-4 w-4" />
                            Create Your First Listing
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
