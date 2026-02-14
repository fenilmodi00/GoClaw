
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { userService } from '@/services/user/user.service';
import { polarService } from '@/services/polar/polar.service';
import { calculateRemainingBalance, BillingRates } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET() {
    let balance: number = BillingRates.STARTER_CREDITS;
    let creditLimit: number = BillingRates.STARTER_CREDITS;

    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await userService.getUserByClerkId(userId);

        if (!user) {
            return NextResponse.json({ balance, creditLimit });
        }

        if (user.polarCustomerId) {
            // Validate UUID to avoid 422 errors from Polar SDK
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(user.polarCustomerId)) {
                console.warn(`Invalid Polar Customer ID for user ${userId}`);
                return NextResponse.json({ balance, creditLimit });
            }
        }

        // 1. Check for local tier to determine credit limit
        const { PRICING_TIERS } = await import('@/config/pricing');

        if (user.tier) {
            const tierKey = user.tier.toUpperCase() as keyof typeof PRICING_TIERS;
            const tierConfig = (PRICING_TIERS as Record<string, { credits: number }>)[tierKey];
            if (tierConfig) {
                creditLimit = tierConfig.credits;
            }
        }

        balance = creditLimit;

        // 2. Check usage
        if (user.polarCustomerId) {
            const meters = await polarService.getCustomerMeters(user.polarCustomerId);

            // Find 'ai_usage' meter
            const usageMeter = meters.find((m: { name?: string; slug?: string; meter?: { name: string } }) =>
                m.name === 'ai_usage' ||
                m.slug === 'ai_usage' ||
                (m.meter && m.meter.name === 'ai_usage')
            );

            if (usageMeter) {
                const consumed = (usageMeter as { consumedUnits?: number; usage?: number }).consumedUnits ??
                    (usageMeter as { consumedUnits?: number; usage?: number }).usage ?? 0;
                const usageTokens = Number(consumed);

                // balance = creditLimit - cost(usage)
                balance = calculateRemainingBalance(usageTokens, creditLimit);
            }
        }
    } catch (error) {
        console.error("Failed to fetch meters/subs for balance API", error);
    }

    return NextResponse.json({ balance, creditLimit });
}
