/**
 * Billing Utilities
 * 
 * Centralizes logic for converting between AI tokens and currency.
 * Current pricing model: $10.00 credits = 1,000,000 tokens.
 * Rate: $0.00001 per token.
 */

import { PRICING_TIERS } from '@/config/pricing';

export const BillingRates = {
    TOKENS_PER_DOLLAR: 100_000, // 1M tokens / $10
    STARTER_CREDITS: PRICING_TIERS.STARTER.credits,
    PRO_CREDITS: PRICING_TIERS.PRO.credits,
    BUSINESS_CREDITS: PRICING_TIERS.BUSINESS.credits,
};

/**
 * Converts token usage to dollar cost.
 * @param tokens Number of tokens used
 * @returns Cost in dollars
 */
export function calculateCost(tokens: number): number {
    return tokens / BillingRates.TOKENS_PER_DOLLAR;
}

/**
 * Calculates remaining balance in dollars given usage tokens.
 * @param usageTokens Total tokens consumed
 * @param initialBalance Initial credit balance (default: Starter Tier)
 * @returns Remaining balance in dollars (min 0)
 */
export function calculateRemainingBalance(usageTokens: number, initialBalance: number = BillingRates.STARTER_CREDITS): number {
    const cost = calculateCost(usageTokens);
    return Math.max(0, initialBalance - cost);
}
