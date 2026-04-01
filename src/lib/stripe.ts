import Stripe from 'stripe';

// Initialize Stripe. Uses a placeholder key if none provided via environment variables.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});
