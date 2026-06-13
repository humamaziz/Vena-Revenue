import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { leadId, tier } = await req.json()

    const tiers: Record<string, { name: string; amount: number }> = {
      entry: { name: 'Entry Triage Audit', amount: 250000 },
      full: { name: 'Full Revenue Intelligence Report', amount: 600000 },
      premium: { name: 'Premium ARE Audit', amount: 1200000 },
    }

    const selectedTier = tiers[tier ?? 'entry']

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedTier.name,
              description: 'Revenue audit by Vena%Revenue. Delivered in 48 hours.',
            },
            unit_amount: selectedTier.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/contact`,
      metadata: { leadId: leadId ?? '' },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[checkout]', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
