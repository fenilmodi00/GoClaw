
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { userService } from '@/services/user/user.service';
import { polarService } from '@/services/polar/polar.service';
import { calculateRemainingBalance, BillingRates } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await userService.getUserByClerkId(userId);
        let balance = BillingRates.FREE_TIER_AMOUNT; // Default Free Tier

        if (user?.polarCustomerId) {
            // Validate UUID to avoid 422 errors from Polar SDK
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(user.polarCustomerId)) {
                console.warn(`Invalid Polar Customer ID for user ${userId}`);
                return NextResponse.json({ balance });
            }

            try {
                // 1. Check for active subscription to determine credit limit
                let creditLimit = BillingRates.FREE_TIER_AMOUNT;
                const subscriptions = await polarService.getUserSubscriptions(user.polarCustomerId);

                // Find the highest tier subscription
                // We need to match subscription product ID to our configured tiers
                const { PRICING_TIERS } = await import('@/config/pricing');

                for (const sub of subscriptions) {
                    // Check if sub.productId matches any of our tiers
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const subProductId = (sub as any).productId || (sub as any).product_id;

                    if (subProductId === PRICING_TIERS.STARTER.polarProductId) {
                        creditLimit = Math.max(creditLimit, PRICING_TIERS.STARTER.credits);
                    } else if (subProductId === PRICING_TIERS.PRO.polarProductId) {
                        creditLimit = Math.max(creditLimit, PRICING_TIERS.PRO.credits);
                    } else if (subProductId === PRICING_TIERS.BUSINESS.polarProductId) {
                        creditLimit = Math.max(creditLimit, PRICING_TIERS.BUSINESS.credits);
                    }
                }

                // If no subscription found, use default (0 or whatever is in BillingRates)
                balance = creditLimit;

                // 2. Check usage
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
            } catch (error) {
                console.error("Failed to fetch meters/subs for balance API", error);
            }
        }

        return NextResponse.json({ balance });
    } catch (error) {
        console.error("Balance API Error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
