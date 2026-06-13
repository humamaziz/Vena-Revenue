import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const leadId = session.metadata?.leadId

    if (leadId) {
      try {
        await prisma.lead.update({
          where: { id: leadId },
          data: { paid: true },
        })
        await prisma.interaction.create({
          data: {
            leadId,
            type: 'payment',
            content: `Payment confirmed via Stripe. Session: ${session.id}. Amount: $${(session.amount_total ?? 0) / 100}.`,
          },
        })
      } catch (e) {
        console.error('[webhook] DB update failed:', e)
      }
    }
  }

  return NextResponse.json({ received: true })
}
