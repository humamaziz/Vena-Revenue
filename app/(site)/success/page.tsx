'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

// IMPORTANT: this page is a UX convenience, not the source of truth for
// payment status. The PayPal webhook (/api/webhooks/paypal) is what
// actually marks a lead as paid, and it fires server-to-server regardless
// of whether this page ever loads. What this page does is call /capture
// as a *fast path* so the buyer sees confirmation immediately instead of
// waiting on webhook latency — but if that call fails or the buyer closed
// the tab before getting here, the webhook will still mark them paid
// moments later. We never tell the buyer "payment failed" just because
// this client-side step had trouble; we show a pending state instead.
type Status = 'checking' | 'confirmed' | 'pending'

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('token') // PayPal appends ?token=<orderId> on return
  const leadId = (params.get('leadId') ?? '').trim() || null

  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    if (!orderId) {
      // No PayPal token in the URL at all — most likely the buyer is just
      // revisiting this page, or webhook already handled everything.
      // Treat as pending/confirmed-via-webhook rather than erroring.
      setStatus('pending')
      return
    }

    fetch('/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, leadId }),
    })
      .then((res) => res.json())
      .then((data) => setStatus(data.success ? 'confirmed' : 'pending'))
      .catch(() => setStatus('pending'))
  }, [orderId, leadId])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-lg">
        {status === 'checking' && (
          <>
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="font-display font-bold text-3xl text-white mb-4">Confirming your payment...</h1>
            <p className="text-[#8892A4] text-lg leading-relaxed">One moment while we verify everything with PayPal.</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="font-display font-bold text-4xl text-white mb-4">Payment confirmed.</h1>
            <p className="text-[#8892A4] text-lg leading-relaxed mb-8">
              Your payment has been received. Our team will now prepare your full audit report with PDF attachment and deliver it to your inbox within 24 hours.
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="font-display font-bold text-4xl text-white mb-4">Thank you!</h1>
            <p className="text-[#8892A4] text-lg leading-relaxed mb-8">
              We&apos;re finalizing confirmation with PayPal — this can take a minute on our end, but you&apos;re all set. You&apos;ll receive an email the moment it&apos;s confirmed.
            </p>
          </>
        )}

        <div className="glass border border-[#00F5D4]/20 rounded-2xl p-6 mb-8">
          <p className="text-[#8892A4] text-sm leading-relaxed">
            <span className="text-[#00F5D4] font-semibold">What happens next:</span>{' '}
            We will send a 90-second Loom video alongside your full written audit and PDF report. No calendar link. No discovery call. Just the answers you paid for.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/client" className="btn-primary">
            <span>Track Your Audit →</span>
          </Link>
          <Link href="/" className="btn-ghost">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[#0B0F1A]" />}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  )
}