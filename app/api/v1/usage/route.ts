import { NextRequest } from 'next/server';
import { withAPIAuth, apiResponse } from '@/lib/api-middleware';
import { getUsageRecord } from '@/lib/usage';
import { TIERS } from '@/lib/stripe';

/**
 * GET /api/v1/usage
 * Get current usage statistics for the authenticated user
 */
export async function GET(request: NextRequest) {
    return withAPIAuth(request, async (keyData, usage) => {
        const tierConfig = TIERS[usage.tier as keyof typeof TIERS];

        return apiResponse({
            tier: {
                name: tierConfig.name,
                features: tierConfig.features,
            },
            usage: {
                apiCalls: {
                    used: usage.apiCallsThisMonth,
                    limit: tierConfig.apiCallsPerMonth,
                    remaining: tierConfig.apiCallsPerMonth === -1
                        ? 'unlimited'
                        : tierConfig.apiCallsPerMonth - usage.apiCallsThisMonth,
                },
                downloads: {
                    used: usage.downloadsThisMonth,
                    limit: tierConfig.downloadLimit,
                    remaining: tierConfig.downloadLimit === -1
                        ? 'unlimited'
                        : tierConfig.downloadLimit - usage.downloadsThisMonth,
                },
                synthesis: {
                    used: usage.synthesisCallsThisMonth,
                },
            },
            totals: {
                apiCalls: usage.totalApiCalls,
                downloads: usage.totalDownloads,
                synthesisCalls: usage.totalSynthesisCalls,
            },
            credits: {
                balance: usage.creditsBalance,
            },
            period: {
                start: usage.currentPeriodStart?.toDate?.() || null,
                end: usage.currentPeriodEnd?.toDate?.() || null,
            },
            subscription: {
                status: usage.subscriptionStatus || 'none',
                customerId: usage.stripeCustomerId ? '***' : null,
            },
        });
    });
}
