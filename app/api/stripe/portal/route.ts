import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getUsageRecord } from '@/lib/usage';

export async function POST(request: NextRequest) {
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe not configured' },
            { status: 503 }
        );
    }

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User authentication required' },
                { status: 401 }
            );
        }

        // Get user's Stripe customer ID from usage record
        const usage = await getUsageRecord(userId);

        if (!usage.stripeCustomerId) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 400 }
            );
        }

        // Create billing portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: usage.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://akshon.org'}/dashboard`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Portal session error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
