import { auth } from '@clerk/nextjs/server';
import { userService } from '@/services/user/user.service';
import { polarService } from '@/services/polar/polar.service';
import BillingClient from './billing-client';
import { calculateRemainingBalance, BillingRates } from '@/lib/billing';
import { TopUpButton } from '@/components/features/billing/TopUpButton';
import { CustomerMeter } from '@polar-sh/sdk/models/components/customermeter';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
    const { userId } = await auth();

    if (!userId) {
        // Should be protected by middleware usually, but safe fallback
        return <div>Please sign in</div>;
    }

    const user = await userService.getUserByClerkId(userId);
    let balance = BillingRates.FREE_TIER_AMOUNT; // Default Free Tier

    if (user?.polarCustomerId) {
        // Validate UUID to avoid 422 errors from Polar SDK
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.polarCustomerId)) {
            console.warn(`Invalid Polar Customer ID for user ${userId}`);
            // Return default balance if ID is invalid, do not attempt fetch
        } else {
            try {
                const meters = await polarService.getCustomerMeters(user.polarCustomerId);
                // debug: console.log('Meters:', meters);

                // Find 'ai_usage' meter
                // We assume the meter name is 'ai_usage' or similar.
                // Also checking if there are specific credit meters.


                // ...

                // Find 'ai_usage' meter
                // We assume the meter name is 'ai_usage' or similar.
                const usageMeter = meters.find((m: CustomerMeter) => m.meter.name === 'ai_usage');

                if (usageMeter) {
                    // usageMeter.consumedUnits is the usage count (tokens)
                    const usageTokens = Number(usageMeter.consumedUnits || 0);

                    balance = calculateRemainingBalance(usageTokens);
                }
            } catch (error) {
                console.error("Failed to fetch meters", error);
                // Fallback to default balance or error state
            }
        }
    }

    // We'll modify BillingClient to accept the button or just render it here if BillingClient is full page.
    // Looking at BillingClient usage, it seems to be the whole page content.
    // Ideally we pass the button or render it inside.
    // Let's modify BillingClient to accept a 'children' or 'actions' prop? 
    // Or simpler: Just return a fragment and overlay it?
    // Let's assume BillingClient renders a layout where we can inject this.
    // Actually, checking standard pattern: usually standard components.
    // Let's just return the client for now, I need to check BillingClient implementation first to properly integrate. 
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Billing</h1>
                <TopUpButton />
            </div>
            <BillingClient initialBalance={balance} />
        </div>
    );
}
