export const PRICING_TIERS = {
    STARTER: {
        id: 'starter',
        label: 'Starter',
        price: 29,
        credits: 10,
        description: 'Perfect for hobbyists and improved experiments',
        features: [
            '1 AI agent deployment',
            '$10/mo in AI credits',
            'All integrations included',
            'Standard support',
            'Community access',
        ],
        polarProductId: process.env.POLAR_PRODUCT_ID_STARTER || '',
    },
    PRO: {
        id: 'pro',
        label: 'Pro',
        price: 49,
        credits: 20,
        description: 'For power users who need more resources',
        features: [
            '3 AI agent deployments',
            '$20/mo in AI credits',
            'Priority support',
            'Early access to new features',
            'Higher rate limits',
        ],
        polarProductId: process.env.POLAR_PRODUCT_ID_PRO || '',
    },
    BUSINESS: {
        id: 'business',
        label: 'Business',
        price: 99,
        credits: 60,
        description: 'Ultimate power and scale for your business',
        features: [
            'Unlimited AI agent deployments',
            '$60/mo in AI credits',
            'Dedicated support',
            'Custom integrations',
            'SLA guarantees',
        ],
        polarProductId: process.env.POLAR_PRODUCT_ID_BUSINESS || '',
    },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;
