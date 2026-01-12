import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateUserTier } from '@/lib/usage';
import type { TierType } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id || session.metadata?.userId;
                const tier = session.metadata?.tier as string;

                if (userId && tier) {
                    const tierMap: Record<string, TierType> = {
                        'Researcher': 'RESEARCHER',
                        'Arbitrageur': 'ARBITRAGEUR',
                        'Sovereign': 'SOVEREIGN',
                    };

                    await updateUserTier(
                        userId,
                        tierMap[tier] || 'FREE',
                        session.customer as string,
                        session.subscription as string,
                        'active'
                    );

                    console.log(`✅ User ${userId} upgraded to ${tier}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    const status = subscription.status as 'active' | 'past_due' | 'canceled' | 'trialing';
                    // Get current tier from subscription metadata
                    const tier = subscription.metadata?.tier;
                    const tierMap: Record<string, TierType> = {
                        'Researcher': 'RESEARCHER',
                        'Arbitrageur': 'ARBITRAGEUR',
                        'Sovereign': 'SOVEREIGN',
                    };

                    await updateUserTier(
                        userId,
                        tier ? tierMap[tier] : 'FREE',
                        subscription.customer as string,
                        subscription.id,
                        status
                    );
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    // Downgrade to free tier
                    await updateUserTier(
                        userId,
                        'FREE',
                        subscription.customer as string,
                        undefined,
                        'canceled'
                    );
                    console.log(`⚠️ User ${userId} subscription canceled, downgraded to FREE`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;
                // Handle failed payment - could send email, suspend access, etc.
                console.error(`❌ Payment failed for customer ${customerId}`);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
