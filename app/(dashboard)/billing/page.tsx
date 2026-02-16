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
        return <div>Please sign in</div>;
    }

    const user = await userService.getUserByClerkId(userId);
    
    // Get credit limit - support multiple subscriptions
    let creditLimit = BillingRates.STARTER_CREDITS as number;
    
    if (user?.polarCustomerId) {
        try {
            // Fetch all active subscriptions from Polar
            const subscriptions = await polarService.getUserSubscriptions(user.polarCustomerId);
            
            if (subscriptions && subscriptions.length > 0) {
                const { getTierByProductId } = await import('@/config/pricing');
                let totalCredits = 0;
                
                for (const sub of subscriptions) {
                    // @ts-expect-error - sub.status and sub.productId exist on Polar subscription object
                    if (sub.status === 'active') {
                        // @ts-expect-error - sub.productId exists
                        const tier = getTierByProductId(sub.productId);
                        if (tier) {
                            totalCredits += tier.credits;
                        }
                    }
                }
                
                if (totalCredits > 0) {
                    creditLimit = totalCredits;
                }
            }
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
        }
    }
    
    // Fallback to single tier from DB if no subscriptions found
    if (creditLimit === BillingRates.STARTER_CREDITS && user?.tier) {
        const { PRICING_TIERS } = await import('@/config/pricing');
        const tierKey = user.tier.toUpperCase() as keyof typeof PRICING_TIERS;
        const tierConfig = PRICING_TIERS[tierKey];
        if (tierConfig) {
            creditLimit = tierConfig.credits as number;
        }
    }
    
    let balance = creditLimit;

    if (user?.polarCustomerId) {
        // Validate UUID to avoid 422 errors from Polar SDK
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.polarCustomerId)) {
            console.warn(`Invalid Polar Customer ID for user ${userId}`);
            // Return default balance if ID is invalid, do not attempt fetch
        } else {
            try {
                const meters = await polarService.getCustomerMeters(user.polarCustomerId);

                // Find 'ai_usage' meter
                const usageMeter = meters.find((m: CustomerMeter) => m.meter.name === 'ai_usage');

                if (usageMeter) {
                    // usageMeter.consumedUnits is the usage count (tokens)
                    const usageTokens = Number(usageMeter.consumedUnits || 0);

                    // balance = creditLimit - cost(usage)
                    balance = calculateRemainingBalance(usageTokens, creditLimit);
                }
            } catch (error) {
                console.error("Failed to fetch meters", error);
                // Fallback to default balance or error state
            }
        }
    }

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
