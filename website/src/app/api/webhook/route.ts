import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function generateLicenseKey(): string {
    const bytes = crypto.randomBytes(12);
    const key = bytes.toString('hex').toUpperCase();
    return `PH-${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}`;
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerEmail = session.customer_email;
            const plan = session.metadata?.plan;

            if (customerEmail && plan) {
                // Generate license key
                const licenseKey = generateLicenseKey();

                // TODO: Store in database
                // await db.license.create({
                //   email: customerEmail,
                //   licenseKey,
                //   plan,
                //   createdAt: new Date(),
                // });

                // TODO: Send license email
                // await sendLicenseEmail(customerEmail, licenseKey);

                console.log(`License created for ${customerEmail}: ${licenseKey}`);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            // TODO: Handle subscription cancellation
            console.log('Subscription cancelled:', subscription.id);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            // TODO: Handle failed payment
            console.log('Payment failed:', invoice.id);
            break;
        }
    }

    return NextResponse.json({ received: true });
}

// Disable body parsing for webhook
export const config = {
    api: {
        bodyParser: false,
    },
};
