
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { userService } from '@/services/user/user.service';
import { polarService } from '@/services/polar/polar.service';
import { calculateRemainingBalance } from '@/lib/billing';

const AKASHML_BASE_URL = 'https://api.akashml.com/v1';
// In production, use your actual key. 
// Note: AKASHML_KEY is used by the deployed bot too.
const AKASHML_API_KEY = process.env.AKASHML_KEY;

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await userService.getUserByClerkId(userId);
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // If user has no Polar Customer ID, try to create it?
        // Ideally this should have happened on webhook or login.
        if (!user.polarCustomerId) {
            // Fallback or error. For now error.
            return new NextResponse("Billing account not set up. Please contact support.", { status: 402 });
        }

        // Check Balance
        // Enforce $10 free tier limit (approx 1M tokens)

        // Validate UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.polarCustomerId)) {
            console.warn(`Invalid Polar Customer ID for user ${userId}: ${user.polarCustomerId}`);
            // Start fresh or error? For now, let's block to prevent unmetered usage if ID is bad.
            // Or allow if we think it's a seed user.
            // Better to block and force them to contact support or fix logic.
            return new NextResponse("Invalid Billing ID. Please contact support.", { status: 402 });
        }

        const meters = await polarService.getCustomerMeters(user.polarCustomerId);

        // Find 'ai_usage' meter
        // We look for the meter that tracks our AI usage events
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usageMeter = meters.find((m: any) => m.meter?.slug === 'ai_usage' || m.meter?.name === 'ai_usage');

        if (usageMeter) {
            const usageTokens = Number(usageMeter.consumedUnits || 0);
            const remainingBalance = calculateRemainingBalance(usageTokens);

            if (remainingBalance <= 0) {
                return new NextResponse("Insufficient credits. Please top up to continue.", { status: 402 });
            }
        }

        const body = await req.json();

        // Forward to AkashML
        if (!AKASHML_API_KEY) {
            console.error("AKASHML_KEY is missing");
            return new NextResponse("Configuration error", { status: 500 });
        }

        const response = await fetch(`${AKASHML_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AKASHML_API_KEY}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(`Upstream API error: ${response.status} ${errorText}`, { status: response.status });
        }

        const data = await response.json();

        // Record Usage
        // Usage structure depends on model. OpenAI standard: details in usage object.
        const usage = data.usage;
        if (usage) {
            const totalTokens = usage.total_tokens || 0;
            if (totalTokens > 0) {
                // Record to Polar
                // eventName 'ai_usage' matches what we planned.
                await polarService.recordUsage(user.polarCustomerId, 'ai_usage', totalTokens);
            }
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("[CHAT_PROXY_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
