import Stripe from 'stripe';

// Initialize Stripe with secret key
// In production, this should be stored in environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER_KEY', {
    apiVersion: '2024-12-18.acacia',
});

// Helper function to create checkout session
export async function createCheckoutSession({ priceId, customerId, successUrl, cancelUrl }) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer: customerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    return session;
}

// Helper function to create customer
export async function createStripeCustomer({ email, name }) {
    const customer = await stripe.customers.create({
        email,
        name,
    });

    return customer;
}

export default stripe;
