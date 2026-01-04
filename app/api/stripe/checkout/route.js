import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await request.json();

        // Price IDs mapping (these would be real Stripe price IDs in production)
        const priceIds = {
            premium: 'price_1SlivyFBI8p7hm9XooIkBtki',
            lifetime: 'price_1SliwdFBI8p7hm9XwlGuvbYI'
        };

        const priceId = priceIds[planId];
        if (!priceId) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Create or get Stripe customer
        // In production, you'd store the customer ID in the database
        const customer = await createStripeCustomer({
            email: session.user.email,
            name: `${session.user.first_name} ${session.user.last_name}`
        });

        // Create checkout session
        const checkoutSession = await createCheckoutSession({
            priceId,
            customerId: customer.id,
            successUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/account?success=true`,
            cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/pricing?canceled=true`
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Payment processing error' }, { status: 500 });
    }
}
