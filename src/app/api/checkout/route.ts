import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, email, userId, charityId, charityPercent } = body;

    // Define pricing based on plan
    const isYearly = plan === 'yearly';
    const amount = isYearly ? 27900 : 2900; // Cents
    const interval = isYearly ? 'year' : 'month';

    // In a placeholder scenario (no real Stripe key), simulate checkout completion
    if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
       return NextResponse.json({ 
          url: `/dashboard?simulated_subscription=true` 
       });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Digital Heroes ${isYearly ? 'Yearly' : 'Monthly'} Subscription`,
              description: `Includes platform access and ${charityPercent}% contribution.`,
            },
            unit_amount: amount,
            recurring: { interval: interval },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup`,
      metadata: {
         type: 'subscription',
         userId: userId || 'unknown',
         charityId: charityId || 'unknown',
         charityPercent: charityPercent || '10',
         planId: plan
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
