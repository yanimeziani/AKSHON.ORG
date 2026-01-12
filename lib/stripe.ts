import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY not set - payments will be disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    })
    : null;

// Price IDs - these need to be created in Stripe Dashboard
export const PRICE_IDS = {
    RESEARCHER_MONTHLY: process.env.STRIPE_PRICE_RESEARCHER_MONTHLY || 'price_researcher_monthly',
    RESEARCHER_YEARLY: process.env.STRIPE_PRICE_RESEARCHER_YEARLY || 'price_researcher_yearly',
    ARBITRAGEUR_MONTHLY: process.env.STRIPE_PRICE_ARBITRAGEUR_MONTHLY || 'price_arbitrageur_monthly',
    ARBITRAGEUR_YEARLY: process.env.STRIPE_PRICE_ARBITRAGEUR_YEARLY || 'price_arbitrageur_yearly',
} as const;

// Tier configurations
export const TIERS = {
    FREE: {
        name: 'Free',
        apiCallsPerMonth: 100,
        downloadLimit: 10, // papers per month
        features: ['Basic corpus access', 'Community Discord'],
    },
    RESEARCHER: {
        name: 'Researcher',
        apiCallsPerMonth: 5000,
        downloadLimit: 500,
        features: ['Full Vault Access', 'Standard API', 'Weekly PDF Exports'],
    },
    ARBITRAGEUR: {
        name: 'Arbitrageur',
        apiCallsPerMonth: 50000,
        downloadLimit: -1, // unlimited
        features: ['Real-time Feed', 'Synthesis AI', 'Priority API', 'Custom Alerts'],
    },
    SOVEREIGN: {
        name: 'Sovereign',
        apiCallsPerMonth: -1, // unlimited
        downloadLimit: -1,
        features: ['Dedicated Infrastructure', 'Custom Models', 'White-glove Support'],
    },
} as const;

export type TierType = keyof typeof TIERS;
