import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, charityId, charityName } = body;

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 });
    }

    // In a placeholder scenario (no real Stripe key), simulating a checkout URL
    if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
       return NextResponse.json({ 
          url: `/dashboard?simulated_donation=true&amount=${amount}` 
       });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Real Stripe Checkout Session creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Independent Donation to ${charityName || 'Charity'}`,
              description: '100% of this contribution goes directly to the chosen charity.',
            },
            unit_amount: amount * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?donation=success`,
      cancel_url: `${origin}/charities`,
      metadata: {
         type: 'independent_donation',
         charityId: charityId || 'unknown'
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
