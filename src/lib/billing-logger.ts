import { logger } from './logger';

export const billingLogger = {
    recordUsage: (userId: string, tokens: number, cost: number) => {
        logger.info('💰 Usage recorded', {
            userId,
            tokens,
            cost: `$${cost.toFixed(4)}`,
            event: 'usage_recorded',
        });
    },

    insufficientCredits: (userId: string, requested: number, available: number) => {
        logger.warn('💳 Insufficient credits', {
            userId,
            requested,
            available,
            event: 'insufficient_credits',
        });
    },

    tierChanged: (userId: string, oldTier: string, newTier: string, reason: string) => {
        logger.info('🔄 Tier changed', {
            userId,
            oldTier,
            newTier,
            reason,
            event: 'tier_changed',
        });
    },

    tokenThrottled: (userId: string, requested: number, remaining: number) => {
        logger.warn('🚫 Token throttled', {
            userId,
            requested,
            remaining,
            event: 'token_throttled',
        });
    },
};
