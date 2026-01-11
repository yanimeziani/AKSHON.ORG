import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'Missing STRIPE_SECRET_KEY environment variable. ' +
    'Please configure it in your .env.local file or Vercel environment variables.'
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const { tier, billingCycle } = await req.json();

    // Define pricing (in cents)
    const prices: Record<string, { monthly: number; annually: number }> = {
        "Researcher": { monthly: 29900, annually: 240000 },
        "Arbitrageur": { monthly: 99900, annually: 800000 },
    };

    const priceConfig = prices[tier];
    if (!priceConfig) {
        throw new Error("Invalid tier");
    }

    const unitAmount = billingCycle === "annually" ? priceConfig.annually : priceConfig.monthly;
    const productName = `Akshon Access: ${tier} (${billingCycle})`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: `Access to ${tier} tier on Akshon platform.`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        tier,
        billingCycle
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
