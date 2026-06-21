import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPaypalWebhook } from '@/lib/paypal'

// Server-to-server PayPal webhook — the authoritative source of truth for
// payment status. This fires from PayPal's servers regardless of whether
// the buyer's browser ever makes it back to /success, which is what makes
// payment tracking actually automatic: a client closing the tab right
// after approving on PayPal no longer means the lead stays unmarked.
//
// Setup (one-time, in PayPal Developer Dashboard -> your app -> Webhooks):
//   URL: https://<your-domain>/api/webhooks/paypal
//   Events: PAYMENT.CAPTURE.COMPLETED, CHECKOUT.ORDER.APPROVED
// Copy the generated Webhook ID into PAYPAL_WEBHOOK_ID in your env vars.
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      console.error('[paypal-webhook] PAYPAL_WEBHOOK_ID not configured — rejecting unverifiable webhook')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const verified = await verifyPaypalWebhook(
      {
        transmissionId: req.headers.get('paypal-transmission-id') ?? '',
        transmissionTime: req.headers.get('paypal-transmission-time') ?? '',
        certUrl: req.headers.get('paypal-cert-url') ?? '',
        authAlgo: req.headers.get('paypal-auth-algo') ?? '',
        transmissionSig: req.headers.get('paypal-transmission-sig') ?? '',
      },
      webhookId,
      body
    )

    if (!verified) {
      console.error('[paypal-webhook] signature verification failed — possible spoofed request')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const eventType = body.event_type as string
    const resource = body.resource ?? {}

    // Two events can carry the lead id (set as custom_id on the order):
    // CHECKOUT.ORDER.APPROVED fires when the buyer approves but before
    // capture; PAYMENT.CAPTURE.COMPLETED fires once money has actually
    // moved. We only mark `paid: true` on the capture event — approval
    // alone is not a completed payment.
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureId = resource.id as string | undefined
      const leadId =
        resource.custom_id ??
        resource.supplementary_data?.related_ids?.order_id ??
        null

      // PayPal's capture resource carries custom_id directly when it was
      // set on the purchase_unit at order-creation time (see
      // createPaypalOrder in lib/paypal.ts, which sets custom_id: leadId).
      const targetLeadId = resource.custom_id as string | undefined

      if (targetLeadId) {
        const lead = await prisma.lead.findUnique({ where: { id: targetLeadId } })
        if (lead && !lead.paid) {
          await prisma.lead.update({
            where: { id: targetLeadId },
            data: { paid: true, paymentId: captureId ?? null, paymentDate: new Date() },
          })
          await prisma.interaction.create({
            data: {
              leadId: targetLeadId,
              type: 'payment',
              content: `Payment auto-confirmed via PayPal webhook. Capture ID: ${captureId ?? 'unknown'}.`,
            },
          })
        }

        // Keep the order's lifecycle row in sync too, if we have one
        const orderId = resource.supplementary_data?.related_ids?.order_id as string | undefined
        if (orderId) {
          await prisma.paypalOrder.updateMany({
            where: { orderId },
            data: { status: 'COMPLETED', captureId: captureId ?? null },
          })
        }
      } else {
        console.warn('[paypal-webhook] PAYMENT.CAPTURE.COMPLETED with no custom_id — cannot map to a lead', resource.id)
      }
    }

    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = resource.id as string | undefined
      if (orderId) {
        await prisma.paypalOrder.updateMany({
          where: { orderId },
          data: { status: 'APPROVED' },
        })
      }
    }

    // Always 200 once verified + processed, even for event types we don't
    // act on — PayPal retries (and eventually disables) webhooks that
    // return non-2xx, and we don't want every unrelated event type to
    // count as a delivery failure.
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[paypal-webhook]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}