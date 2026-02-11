
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
                console.warn(`Invalid Polar Customer ID for user ${userId}: ${user.polarCustomerId}`);
                // Return default balance if ID is invalid
                return NextResponse.json({ balance });
            }

            try {
                const meters = await polarService.getCustomerMeters(user.polarCustomerId);

                // Find 'ai_usage' meter
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const usageMeter = meters.find((m: any) => m.name === 'ai_usage' || m.slug === 'ai_usage');

                if (usageMeter) {
                    // usageMeter.consumedUnits is the usage count (tokens)
                    const usageTokens = Number(usageMeter.consumedUnits || 0);
                    balance = calculateRemainingBalance(usageTokens);
                }
            } catch (error) {
                console.error("Failed to fetch meters for balance API", error);
            }
        }

        return NextResponse.json({ balance });
    } catch (error) {
        console.error("Balance API Error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
