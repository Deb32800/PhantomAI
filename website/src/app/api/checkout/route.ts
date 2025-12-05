import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const PRICES = {
    monthly: process.env.STRIPE_PRICE_MONTHLY!,
    lifetime: process.env.STRIPE_PRICE_LIFETIME!,
};

export async function POST(request: NextRequest) {
    try {
        const { plan, email } = await request.json();

        if (!plan || !['monthly', 'lifetime'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: plan === 'monthly' ? 'subscription' : 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICES[plan as keyof typeof PRICES],
                    quantity: 1,
                },
            ],
            customer_email: email,
            success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
            metadata: {
                plan,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
