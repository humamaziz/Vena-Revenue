import { NextRequest, NextResponse } from 'next/server'
import { createPaypalOrder } from '@/lib/paypal'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Defensive trim: a leadId arriving with leading/trailing whitespace
    // (e.g. from a manually edited link, or a stray space introduced by
    // some clients when copy-pasting a URL) is otherwise invisible until
    // it reaches PayPal, which then rejects the whole return_url with a
    // generic INVALID_PARAMETER_SYNTAX — a confusing place to discover
    // a problem that originated here.
    const leadId = typeof body.leadId === 'string' ? body.leadId.trim() : ''
    const tier = body.tier

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

    // Validate the lead actually exists before ever talking to PayPal.
    // This turns "PayPal rejected a malformed URL" into a clear,
    // immediate "this payment link is invalid" instead — and avoids
    // burning a PayPal API call (and an orphaned order on their side)
    // on a request that was never going to succeed.
    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } })
      if (!lead) {
        return NextResponse.json({ error: 'This payment link is invalid or has expired. Ask your contact at Vena%Revenue for a new one.' }, { status: 404 })
      }
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? '').trim().replace(/\/$/, '')

    // encodeURIComponent is load-bearing here: leadId is a cuid() and
    // never *should* contain characters that need escaping, but the
    // return_url is sent to PayPal as a single opaque string and any
    // unescaped space, &, or # in it breaks query-string parsing on
    // either PayPal's side or ours when the browser lands back on
    // /success. Encoding it costs nothing when it's already safe and
    // prevents exactly the class of bug this fixes when it isn't.
    const returnUrl = `${baseUrl}/success?leadId=${encodeURIComponent(leadId)}`
    const cancelUrl = `${baseUrl}/contact`

    const order = await createPaypalOrder({
      leadId,
      amount: selectedTier.amount,
      description: `${selectedTier.name} - Revenue audit by Vena%Revenue. Delivered in 48 hours.`,
      returnUrl,
      cancelUrl,
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