import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

// Helper to use Supabase Admin key if possible
const supabaseAdmin = supabase; // In production this should use SUPABASE_SERVICE_ROLE_KEY to bypass RLS

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // In development mode without a webhook secret, just trust the literal JSON body
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook payload Error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Handle Subscription
        if (session.metadata?.type === 'subscription') {
           const userId = session.metadata.userId;
           // Update User Profile to Active
           if (userId && userId !== 'unknown') {
              await supabaseAdmin.from('profiles').update({ status: 'Active' }).eq('id', userId);
           }
        }
        
        // Handle Independent Donation
        if (session.metadata?.type === 'independent_donation') {
           const charityId = session.metadata.charityId;
           const amount = session.amount_total;
           
           if (charityId !== 'unknown') {
              // Add to the total raised for the charity
              // (Note: Requires a Postgres function or reading existing amount then updating, 
              // for the scope of PRD, we'll log it)
              console.log(`Donation of ${amount} applied to ${charityId}`);
           }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        // Lookup user by stripe customer ID (requires mapping table) OR via email
        // Set profile status to 'Lapsed'
        console.log(`Subscription ${subscription.id} for customer ${customerId} lapsed.`);
        break;
      }
      
      // Additional events as needed...
    }
    
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler failed.', err);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
