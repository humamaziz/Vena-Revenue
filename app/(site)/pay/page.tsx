'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/layout/Footer'

const tiers = [
  {
    id: 'entry',
    name: 'Entry Diagnostic',
    price: '$2,500',
    amount: 2500,
    target: 'Local businesses under $500K revenue',
    delivery: '48 hours',
    includes: [
      'Top 4 Pillars scored and documented',
      'Primary revenue leak identified with dollar estimate',
      'Prioritized fix roadmap',
      '2x ROI guarantee - full refund if we miss',
    ],
    note: '100% credited toward Standard Build if signed within 14 days.',
    color: '#8892A4',
    featured: false,
  },
  {
    id: 'full',
    name: 'Full Revenue Intelligence Report',
    price: '$6,000',
    amount: 6000,
    target: 'Regional businesses $500K–$5M revenue',
    delivery: '48 hours',
    includes: [
      'All 8 Pillars fully audited',
      'Complete competitor schema comparison',
      'AI search visibility gap analysis',
      'Full intake and funnel friction map',
      'Prioritized 90-day implementation roadmap',
      '2x ROI guarantee',
    ],
    note: '100% credited toward Mid-Market Build ($30,000) if signed within 14 days.',
    color: '#00F5D4',
    featured: true,
  },
  {
    id: 'premium',
    name: 'Premium ARE Audit',
    price: '$12,000',
    amount: 12000,
    target: 'Law firms, B2B SaaS, Enterprise',
    delivery: '5 business days',
    includes: [
      'AI search gap analysis across all major LLMs',
      'Full schema and entity graph audit',
      'Structured 90-day implementation plan',
      'Competitor displacement analysis',
      'Enterprise intake automation assessment',
      '2x ROI guarantee',
    ],
    note: '100% credited toward Enterprise Build ($50,000–$75,000) if signed within 14 days.',
    color: '#7B61FF',
    featured: false,
  },
]

function PayPageContent() {
  const searchParams = useSearchParams()
  const leadId = (searchParams.get('leadId') ?? '').trim()
  const [selected, setSelected] = useState('full')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, tier: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')
      if (data.url) {
        // Stash leadId so the /success page can pair it with PayPal's
        // returned order token (PayPal's return_url only appends `token`).
        sessionStorage.setItem('vena_pending_lead_id', leadId)
        window.location.href = data.url
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,212,0.05) 0%, transparent 70%)' }} />

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase block mb-4">Choose Your Diagnostic</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Select your <span className="gradient-text">audit tier</span>
          </h1>
          <p className="text-[#8892A4] text-lg max-w-xl mx-auto">
            Every audit fee is credited 100% toward the implementation build if you sign within 14 days. The audit pays for itself before we discuss the build.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={`relative rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 ${
                selected === tier.id
                    ? 'ring-2 scale-[1.02]'
                  : 'glass border border-white/[0.06] hover:border-white/[0.12]'
              }`}
              style={selected === tier.id ? { border: `2px solid ${tier.color}`, background: `${tier.color}08`, boxShadow: `0 0 0 2px ${tier.color}` } : {}}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#0B0F1A] text-xs font-bold px-4 py-1 rounded-full"
                  style={{ backgroundColor: tier.color }}>
                  Most Popular
                </div>
              )}
              {selected === tier.id && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center text-[#0B0F1A] text-xs font-bold"
                  style={{ backgroundColor: tier.color }}>
                  ✓
                </div>
              )}
              <div className="p-6">
                <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: tier.color }}>{tier.name}</div>
                <div className="font-display font-bold text-3xl text-white mb-1">{tier.price}</div>
                <div className="text-[#8892A4] text-xs mb-4">{tier.target}</div>
                <div className="text-xs text-[#8892A4] mb-4">Delivered in {tier.delivery}</div>
                <ul className="space-y-2 mb-4">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: tier.color }}>✓</span>
                      <span className="text-[#8892A4]">{item}</span>
                    </li>
                  ))}
                </ul>
                {tier.note && (
                  <div className="text-xs text-[#8892A4] italic border-t border-white/[0.06] pt-3">{tier.note}</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Checkout */}
        <div className="max-w-md mx-auto">
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <div className="glass border border-white/[0.08] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#8892A4]">Selected tier</span>
              <span className="text-white font-semibold">{tiers.find(t => t.id === selected)?.name}</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[#8892A4]">Total due today</span>
              <span className="font-display font-bold text-2xl text-white">{tiers.find(t => t.id === selected)?.price}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-4 disabled:opacity-50"
            >
              <span>{loading ? 'Redirecting to payment...' : `Pay ${tiers.find(t => t.id === selected)?.price} Securely →`}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[#8892A4] text-xs">
            <div className="flex items-center gap-1.5"><span>🔒</span> Secured by PayPal</div>
            <div className="flex items-center gap-1.5"><span>↩</span> 2x ROI guarantee or instant refund</div>
            <div className="flex items-center gap-1.5"><span>⏱</span> 48-hr delivery</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PayPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen pt-32 flex items-center justify-center text-[#8892A4]">Loading...</div>}>
        <PayPageContent />
      </Suspense>
      <Footer />
    </>
  )
}