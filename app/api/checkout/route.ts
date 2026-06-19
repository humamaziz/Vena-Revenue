import { NextRequest, NextResponse } from 'next/server'
import { createPaypalOrder } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { leadId, tier } = await req.json()

    const tiers: Record<string, { name: string; amount: number }> = {
      entry: { name: 'Entry Triage Audit', amount: 2500 },
      full: { name: 'Full Revenue Intelligence Report', amount: 6000 },
      premium: { name: 'Premium ARE Audit', amount: 12000 },
    }

    const selectedTier = tiers[tier ?? 'entry']
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

    const order = await createPaypalOrder({
      leadId: leadId ?? '',
      amount: selectedTier.amount,
      description: `${selectedTier.name} - Revenue audit by Vena%Revenue. Delivered in 48 hours.`,
      returnUrl: `${baseUrl}/success`,
      cancelUrl: `${baseUrl}/contact`,
    })

    return NextResponse.json({ url: order.approveUrl, orderId: order.id })
  } catch (error) {
    console.error('[checkout]', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}