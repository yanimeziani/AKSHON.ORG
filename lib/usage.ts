import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { TIERS, TierType } from './stripe';

export interface UsageRecord {
    userId: string;
    tier: TierType;

    // Monthly counters (reset monthly)
    apiCallsThisMonth: number;
    downloadsThisMonth: number;
    synthesisCallsThisMonth: number;

    // Total counters (never reset)
    totalApiCalls: number;
    totalDownloads: number;
    totalSynthesisCalls: number;

    // Credits (for pay-as-you-go)
    creditsBalance: number;

    // Timestamps
    currentPeriodStart: Timestamp;
    currentPeriodEnd: Timestamp;
    lastUpdated: Timestamp;

    // Stripe subscription info
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'trialing';
}

const USAGE_COLLECTION = 'usage';

/**
 * Get or create usage record for a user
 */
export async function getUsageRecord(userId: string): Promise<UsageRecord> {
    const usageDoc = await getDoc(doc(db, USAGE_COLLECTION, userId));

    if (!usageDoc.exists()) {
        // Create default usage record for free tier
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const defaultUsage: UsageRecord = {
            userId,
            tier: 'FREE',
            apiCallsThisMonth: 0,
            downloadsThisMonth: 0,
            synthesisCallsThisMonth: 0,
            totalApiCalls: 0,
            totalDownloads: 0,
            totalSynthesisCalls: 0,
            creditsBalance: 0,
            currentPeriodStart: Timestamp.now(),
            currentPeriodEnd: Timestamp.fromDate(endOfMonth),
            lastUpdated: Timestamp.now(),
        };

        await setDoc(doc(db, USAGE_COLLECTION, userId), defaultUsage);
        return defaultUsage;
    }

    return usageDoc.data() as UsageRecord;
}

/**
 * Check if user can make an API call (within limits)
 */
export async function canMakeAPICall(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; error?: string }> {
    const usage = await getUsageRecord(userId);
    const tierConfig = TIERS[usage.tier];

    // Check if period needs reset
    if (usage.currentPeriodEnd.toDate() < new Date()) {
        await resetMonthlyUsage(userId);
        return { allowed: true, remaining: tierConfig.apiCallsPerMonth - 1, limit: tierConfig.apiCallsPerMonth };
    }

    // Unlimited tier
    if (tierConfig.apiCallsPerMonth === -1) {
        return { allowed: true, remaining: -1, limit: -1 };
    }

    const remaining = tierConfig.apiCallsPerMonth - usage.apiCallsThisMonth;

    if (remaining <= 0) {
        return {
            allowed: false,
            remaining: 0,
            limit: tierConfig.apiCallsPerMonth,
            error: 'API call limit reached for this billing period. Upgrade your plan for more calls.'
        };
    }

    return { allowed: true, remaining: remaining - 1, limit: tierConfig.apiCallsPerMonth };
}

/**
 * Record an API call
 */
export async function recordAPICall(userId: string, endpoint: string, responseTime?: number): Promise<void> {
    await updateDoc(doc(db, USAGE_COLLECTION, userId), {
        apiCallsThisMonth: increment(1),
        totalApiCalls: increment(1),
        lastUpdated: serverTimestamp(),
    });

    // Also log to a detailed analytics collection for insights
    // await addDoc(collection(db, 'apiCallLogs'), {
    //     userId,
    //     endpoint,
    //     responseTime,
    //     timestamp: serverTimestamp(),
    // });
}

/**
 * Record a download
 */
export async function recordDownload(userId: string): Promise<void> {
    await updateDoc(doc(db, USAGE_COLLECTION, userId), {
        downloadsThisMonth: increment(1),
        totalDownloads: increment(1),
        lastUpdated: serverTimestamp(),
    });
}

/**
 * Reset monthly usage counters
 */
async function resetMonthlyUsage(userId: string): Promise<void> {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await updateDoc(doc(db, USAGE_COLLECTION, userId), {
        apiCallsThisMonth: 0,
        downloadsThisMonth: 0,
        synthesisCallsThisMonth: 0,
        currentPeriodStart: Timestamp.now(),
        currentPeriodEnd: Timestamp.fromDate(endOfMonth),
        lastUpdated: serverTimestamp(),
    });
}

/**
 * Update user's tier (called after Stripe webhook)
 */
export async function updateUserTier(
    userId: string,
    tier: TierType,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
    subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'trialing'
): Promise<void> {
    await updateDoc(doc(db, USAGE_COLLECTION, userId), {
        tier,
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus,
        lastUpdated: serverTimestamp(),
    });
}

/**
 * Add credits to user's balance
 */
export async function addCredits(userId: string, amount: number): Promise<void> {
    await updateDoc(doc(db, USAGE_COLLECTION, userId), {
        creditsBalance: increment(amount),
        lastUpdated: serverTimestamp(),
    });
}

/**
 * Deduct credits (for pay-as-you-go)
 */
export async function deductCredits(userId: string, amount: number): Promise<boolean> {
    const usage = await getUsageRecord(userId);

    if (usage.creditsBalance < amount) {
        return false;
    }

    await updateDoc(doc(db, USAGE_COLLECTION, userId), {
        creditsBalance: increment(-amount),
        lastUpdated: serverTimestamp(),
    });

    return true;
}
