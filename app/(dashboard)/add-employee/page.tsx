"use client";

import { UserPlus, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddEmployeePage() {
    return (
        <div className="max-w-2xl mx-auto mt-16 text-center space-y-6">
            <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-orange-500" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Add Employee</h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Deploy a preconfigured AI agent as your virtual employee. Each agent
                comes with unique skills and personality, ready to work 24/7.
            </p>
            <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6 h-10 text-sm font-medium gap-2">
                <Bot className="h-4 w-4" />
                Browse Agents
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
