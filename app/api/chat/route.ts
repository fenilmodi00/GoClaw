import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { userService } from '@/services/user/user.service';
import { polarService } from '@/services/polar/polar.service';
import { calculateRemainingBalance } from '@/lib/billing';
import { rateLimit } from '@/middleware/rate-limit';
import { checkTokenThrottle } from '@/middleware/token-throttle';
import * as v from 'valibot';
import { CustomerMeter } from '@polar-sh/sdk/models/components/customermeter';

const AKASHML_BASE_URL = 'https://api.akashml.com/v1';
// ...

// ...

// In production, use your actual key. 
// Note: AKASHML_KEY is used by the deployed bot too.
const AKASHML_API_KEY = process.env.AKASHML_KEY;

// Validation Schema
const MessageSchema = v.object({
    role: v.string(),
    content: v.string(),
});

const ChatRequestSchema = v.object({
    messages: v.array(MessageSchema),
    model: v.string(),
    max_tokens: v.optional(v.number()),
    temperature: v.optional(v.number()),
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check Content-Length (Max 1MB)
        const contentLength = parseInt(req.headers.get('content-length') || '0');
        if (contentLength > 1024 * 1024) {
            return new NextResponse("Payload too large", { status: 413 });
        }

        // Rate Limiting (60 req/min)
        const rateLimitResult = await rateLimit(`chat:${userId}`, 60, 60_000);
        if (!rateLimitResult.success) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }

        const user = await userService.getUserByClerkId(userId);
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Token Throttling - Check before processing request
        const json = await req.json();
        const estimatedTokens = json.max_tokens || 4000; // Default estimate
        const tierKey = (user.tier || 'starter').toUpperCase();
        const throttleResult = await checkTokenThrottle(userId, tierKey, estimatedTokens);

        if (!throttleResult.allowed) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Token limit exceeded',
                    retryAfter: throttleResult.retryAfter,
                    remaining: throttleResult.remaining,
                    limit: throttleResult.limit,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': String(throttleResult.retryAfter || 60),
                        'X-RateLimit-Remaining': String(throttleResult.remaining),
                        'X-RateLimit-Limit': String(throttleResult.limit),
                    }
                }
            );
        }

        // If user has no Polar Customer ID, try to create it?
        // Ideally this should have happened on webhook or login.
        if (!user.polarCustomerId) {
            // Fallback or error. For now error.
            return new NextResponse("Billing account not set up. Please contact support.", { status: 402 });
        }

        // Check Balance
        // Enforce tier credit limits

        // Validate UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.polarCustomerId)) {
            console.warn(`Invalid Polar Customer ID for user ${userId}`);
            // Start fresh or error? For now, let's block to prevent unmetered usage if ID is bad.
            // Or allow if we think it's a seed user.
            // Better to block and force them to contact support or fix logic.
            return new NextResponse("Invalid Billing ID. Please contact support.", { status: 402 });
        }

        const meters = await polarService.getCustomerMeters(user.polarCustomerId);

        // Find 'ai_usage' meter
        // We look for the meter that tracks our AI usage events


        // ...

        // Find 'ai_usage' meter
        // We look for the meter that tracks our AI usage events
        const usageMeter = meters.find((m: CustomerMeter) => m.meter.name === 'ai_usage');

        if (usageMeter) {
            const usageTokens = Number(usageMeter.consumedUnits || 0);
            const remainingBalance = calculateRemainingBalance(usageTokens);

            if (remainingBalance <= 0) {
                return new NextResponse("Insufficient credits. Please top up to continue.", { status: 402 });
            }
        }

        // Validate Request Body (json already parsed above for token throttling)
        const result = v.safeParse(ChatRequestSchema, json);
        if (!result.success) {
            return new NextResponse("Invalid request body", { status: 400 });
        }
        const body = result.output;

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
            // Sanitize upstream error
            console.error(`Upstream API error: ${response.status}`, await response.text());
            return new NextResponse("Provider error", { status: 502 });
        }

        const data = await response.json();

        // Record Usage
        // Usage structure depends on model. OpenAI standard: details in usage object.
        const usage = data.usage;
        if (usage) {
            const totalTokens = usage.total_tokens || 0;
            if (totalTokens > 0) {
                // Record to Polar with validation and fallback
                const result = await polarService.recordUsageSafe(
                    user.polarCustomerId, 
                    'ai_usage', 
                    totalTokens,
                    true // fallback to local if Polar fails
                );
                
                if (!result.success) {
                    console.error(`⚠️  Failed to record usage: ${result.error}`);
                    // Continue - don't block user for billing issues
                }
            }
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("[CHAT_PROXY_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
