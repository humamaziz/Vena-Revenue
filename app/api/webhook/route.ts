import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { capturePaypalOrder } from '@/lib/paypal'

// Called from the /success page once PayPal redirects the buyer back with
// ?token={orderId}. PayPal's redirect-based checkout requires an explicit
// capture call — it isn't captured automatically on approval.
export async function POST(req: NextRequest) {
  try {
    const { orderId, leadId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const result = await capturePaypalOrder(orderId)

    if (result.status === 'COMPLETED' && leadId) {
      const existing = await prisma.lead.findUnique({ where: { id: leadId } })
      if (existing && !existing.paid) {
        await prisma.lead.update({
          where: { id: leadId },
          data: { paid: true, paymentId: result.captureId ?? undefined },
        })
        await prisma.interaction.create({
          data: {
            leadId,
            type: 'payment',
            content: `Payment confirmed via PayPal. Capture ID: ${result.captureId}.`,
          },
        })
      }
    }

    return NextResponse.json({ success: result.status === 'COMPLETED', status: result.status })
  } catch (error) {
    console.error('[capture-paypal-order]', error)
    return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 })
  }
}