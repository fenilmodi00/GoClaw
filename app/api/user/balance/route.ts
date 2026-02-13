
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { userService } from '@/services/user/user.service';
import { polarService } from '@/services/polar/polar.service';
import { calculateRemainingBalance, BillingRates } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET() {
    let balance = BillingRates.FREE_TIER_AMOUNT;
    let creditLimit = BillingRates.FREE_TIER_AMOUNT;

    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await userService.getUserByClerkId(userId);

        if (!user) {
            return NextResponse.json({ balance });
        }

        if (user.polarCustomerId) {
            // Validate UUID to avoid 422 errors from Polar SDK
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(user.polarCustomerId)) {
                console.warn(`Invalid Polar Customer ID for user ${userId}`);
                return NextResponse.json({ balance });
            }
        }

        // 1. Check for local tier to determine credit limit
        const { PRICING_TIERS } = await import('@/config/pricing');

        if (user.tier) {
            const tierKey = user.tier.toUpperCase() as keyof typeof PRICING_TIERS;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((PRICING_TIERS as any)[tierKey]) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                creditLimit = (PRICING_TIERS as any)[tierKey].credits;
            }
        }

        balance = creditLimit;

        // 2. Check usage
        if (user.polarCustomerId) {
            const meters = await polarService.getCustomerMeters(user.polarCustomerId);

            // Find 'ai_usage' meter
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const usageMeter = meters.find((m: any) =>
                m.name === 'ai_usage' ||
                m.slug === 'ai_usage' ||
                (m.meter && m.meter.name === 'ai_usage')
            );

            if (usageMeter) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const meterObj = usageMeter as any;
                const consumed = meterObj.consumedUnits ?? meterObj.usage ?? 0;
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
