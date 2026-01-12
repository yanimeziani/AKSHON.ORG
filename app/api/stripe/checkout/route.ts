import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment.' },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const { tier, billingCycle, userId, userEmail } = body;

        if (!userId || !userEmail) {
            return NextResponse.json(
                { error: 'User authentication required' },
                { status: 401 }
            );
        }

        // Map tier + billing cycle to Stripe price ID
        let priceId: string;
        switch (tier) {
            case 'Researcher':
                priceId = billingCycle === 'annually'
                    ? PRICE_IDS.RESEARCHER_YEARLY
                    : PRICE_IDS.RESEARCHER_MONTHLY;
                break;
            case 'Arbitrageur':
                priceId = billingCycle === 'annually'
                    ? PRICE_IDS.ARBITRAGEUR_YEARLY
                    : PRICE_IDS.ARBITRAGEUR_MONTHLY;
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid tier selected' },
                    { status: 400 }
                );
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            client_reference_id: userId,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
            metadata: {
                userId,
                tier,
                billingCycle,
            },
            subscription_data: {
                metadata: {
                    userId,
                    tier,
                },
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
