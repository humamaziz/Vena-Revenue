import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export default function SuccessPage() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-display font-bold text-4xl text-white mb-4">Payment confirmed.</h1>
          <p className="text-[#8892A4] text-lg leading-relaxed mb-8">
            Your payment has been received. Our team will now prepare your full audit report with PDF attachment and deliver it to your inbox within 24 hours.
          </p>
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
      <Footer />
    </>
  )
}
