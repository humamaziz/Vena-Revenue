import { NextRequest, NextResponse } from 'next/server'
import { createPaypalOrder } from '@/lib/paypal'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { leadId, tier } = await req.json()

    const tiers: Record<string, { name: string; amount: number }> = {
      entry: { name: 'Entry Triage Audit', amount: 2500 },
      full: { name: 'Full Revenue Intelligence Report', amount: 6000 },
      premium: { name: 'Premium ARE Audit', amount: 12000 },
    }

    const selectedTierKey = tier ?? 'entry'
    const selectedTier = tiers[selectedTierKey]
    if (!selectedTier) {
      return NextResponse.json({ error: `Unknown tier "${selectedTierKey}". Must be one of: ${Object.keys(tiers).join(', ')}` }, { status: 400 })
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

    const order = await createPaypalOrder({
      leadId: leadId ?? '',
      amount: selectedTier.amount,
      description: `${selectedTier.name} - Revenue audit by Vena%Revenue. Delivered in 48 hours.`,
      returnUrl: `${baseUrl}/success?leadId=${leadId ?? ''}`,
      cancelUrl: `${baseUrl}/contact`,
    })

    // Track this order's lifecycle independently of the Lead's flat
    // paid/paymentId columns — lets us see retries (cancel + try again)
    // and gives the webhook something to update by orderId even before
    // a capture event names the lead directly.
    if (leadId) {
      await prisma.paypalOrder.create({
        data: {
          leadId,
          orderId: order.id,
          amount: selectedTier.amount,
          tier: selectedTierKey,
          status: 'CREATED',
        },
      }).catch((e) => console.error('[checkout] failed to record PaypalOrder row', e))
    }

    return NextResponse.json({ url: order.approveUrl, orderId: order.id })
  } catch (error) {
    console.error('[checkout]', error)
    // Surface the real reason (e.g. PayPal credential/environment
    // mismatch) instead of a generic message — this is an admin-facing
    // checkout trigger, not a public error page, so the detail is safe
    // and actively useful for diagnosing config issues.
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}