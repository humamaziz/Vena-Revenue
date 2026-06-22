// Minimal PayPal REST API client. No SDK dependency — PayPal's REST API is
// simple enough that a thin fetch wrapper is more maintainable than pulling
// in @paypal/checkout-server-sdk (which is unmaintained) or the newer
// @paypal/paypal-server-sdk (heavy for what we need here).

// .trim().toLowerCase() guards against the single most common way this
// silently breaks: pasting "PAYPAL_ENV=live " (trailing space) or "Live"
// into Vercel's env var UI. Either of those would previously fall through
// to the sandbox branch below while you have live credentials configured
// (or vice versa) — PayPal then correctly rejects the mismatched
// credential/endpoint pair with a generic "invalid_client" 401 that gives
// no hint this is the actual cause.
const PAYPAL_BASE_URL =
  (process.env.PAYPAL_ENV ?? '').trim().toLowerCase() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value
  }

  const clientId = (process.env.PAYPAL_CLIENT_ID ?? '').trim()
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET ?? '').trim()

  if (!clientId || !clientSecret) {
    throw new Error(
      'PayPal credentials are missing. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your environment variables.'
    )
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const text = await res.text()
    // invalid_client almost always means one of: (1) PAYPAL_CLIENT_ID/SECRET
    // are from the sandbox app but PAYPAL_ENV=live (or vice versa), (2) a
    // copy-paste included extra whitespace or a missing character, or (3)
    // the app's secret was regenerated in the PayPal dashboard and the env
    // var here is stale. The PAYPAL_BASE_URL is included below specifically
    // so you can see which environment it actually tried to hit.
    throw new Error(
      `PayPal auth failed against ${PAYPAL_BASE_URL} (PAYPAL_ENV="${process.env.PAYPAL_ENV ?? 'unset'}"): ${res.status} ${text}. ` +
      `If this says invalid_client, check that PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET match the same sandbox-or-live app as PAYPAL_ENV.`
    )
  }

  const data = await res.json()
  // Cache with a 60s safety margin before actual expiry.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 }
  return cachedToken.value
}

export interface CreateOrderParams {
  leadId: string
  amount: number // in dollars, e.g. 2500 for $2,500.00... actually pass whole dollars here
  description: string
  returnUrl: string
  cancelUrl: string
}

export async function createPaypalOrder(params: CreateOrderParams): Promise<{ id: string; approveUrl: string }> {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: params.leadId,
          description: params.description,
          amount: {
            currency_code: 'USD',
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Vena Revenue',
        user_action: 'PAY_NOW',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal order creation failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  const approveLink = (data.links ?? []).find((l: { rel: string; href: string }) => l.rel === 'approve')

  if (!approveLink) {
    throw new Error('PayPal order created but no approval link was returned')
  }

  return { id: data.id, approveUrl: approveLink.href }
}

export async function capturePaypalOrder(orderId: string): Promise<{ status: string; captureId: string | null }> {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${res.status} ${JSON.stringify(data)}`)
  }

  const captureId =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null

  return { status: data.status, captureId }
}

/**
 * Verifies a PayPal webhook signature using PayPal's verification API.
 * This is the recommended approach (vs. manually checking certs) and
 * matches what PayPal's own docs suggest for server-side verification.
 */
export async function verifyPaypalWebhook(
  headers: { transmissionId: string; transmissionTime: string; certUrl: string; authAlgo: string; transmissionSig: string },
  webhookId: string,
  body: unknown
): Promise<boolean> {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transmission_id: headers.transmissionId,
      transmission_time: headers.transmissionTime,
      cert_url: headers.certUrl,
      auth_algo: headers.authAlgo,
      transmission_sig: headers.transmissionSig,
      webhook_id: webhookId,
      webhook_event: body,
    }),
  })

  if (!res.ok) {
    console.error('[paypal] webhook verification request failed', res.status, await res.text())
    return false
  }

  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}