'use client'

import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { motion } from 'framer-motion'

const deliverables = [
  'Complete 8-Pillar Revenue Diagnostic',
  'AI search visibility gap analysis',
  'Funnel friction & form audit',
  'Competitor schema comparison',
  'Intake automation assessment',
  'Prioritized fix roadmap with ROI estimates',
  'Delivered in 48 hours',
  '2× ROI guarantee or full refund',
]

const tiers = [
  {
    name: 'Entry Triage',
    price: '$2,500',
    target: 'Local businesses under $500K revenue',
    pillars: '4 pillars',
    delivery: '48 hours',
    cta: 'Start Here',
    featured: false,
    color: '#8892A4',
  },
  {
    name: 'Full Revenue Audit',
    price: '$6,000',
    target: 'Regional businesses $500K–$5M',
    pillars: 'All 8 pillars',
    delivery: '48 hours',
    cta: 'Get the Audit',
    featured: true,
    color: '#00F5D4',
  },
  {
    name: 'Enterprise ARE Audit',
    price: '$12,000+',
    target: 'Law firms, SaaS, Enterprise',
    pillars: 'AI gap + schema + roadmap',
    delivery: '5 business days',
    cta: 'Talk to Us',
    featured: false,
    color: '#7B61FF',
  },
]

export default function OfferSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Glowing center orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,245,212,0.04) 0%, rgba(123,97,255,0.04) 50%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-4">
          <span className="text-aqua text-xs font-bold tracking-[0.3em] uppercase">Chapter 04 — The Investment</span>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <AnimatedSection>
            <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight">
              A complete diagnostic.{' '}
              <span className="gradient-text">Not a sales call.</span>
            </h2>
            <p className="text-textMuted text-lg leading-relaxed mt-6">
              We don't book calls to "learn more about your business." We show up with answers. The audit is the product — and it pays for itself before we even talk about the build.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            {/* Guarantee card */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,245,212,0.08), rgba(123,97,255,0.08))' }} />
              <div className="absolute inset-0 border border-aqua/20 rounded-2xl" />
              <div className="relative p-8">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-display font-bold text-xl text-textPrimary mb-3">The Radical Risk Reversal</h3>
                <p className="text-textMuted leading-relaxed mb-6">
                  If our audit doesn't map out at least <span className="text-aqua font-bold">2× its cost in hidden revenue leaks</span>, we refund the fee instantly. No questions, no friction.
                </p>
                <div className="space-y-3">
                  {deliverables.slice(0, 4).map((d) => (
                    <div key={d} className="flex items-center gap-3 text-sm">
                      <span className="text-aqua">✓</span>
                      <span className="text-textMuted">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Pricing tiers */}
        <div className="grid lg:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <AnimatedSection key={tier.name} delay={i * 0.12}>
              <div className={`relative rounded-2xl h-full flex flex-col transition-all duration-500 hover:-translate-y-2 ${
                tier.featured
                  ? 'border border-aqua/30'
                  : 'glass border border-white/[0.06]'
              }`}>
                {tier.featured && (
                  <>
                    <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,245,212,0.06), rgba(123,97,255,0.06))' }} />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-aqua text-bg text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  </>
                )}

                <div className="relative p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: tier.color }}>
                      {tier.name}
                    </div>
                    <div className="font-display font-bold text-4xl text-textPrimary">{tier.price}</div>
                    <div className="text-textMuted text-sm mt-1">{tier.target}</div>
                  </div>

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span style={{ color: tier.color }}>✓</span>
                      <span className="text-textMuted">{tier.pillars} audited</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span style={{ color: tier.color }}>✓</span>
                      <span className="text-textMuted">Delivered in {tier.delivery}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span style={{ color: tier.color }}>✓</span>
                      <span className="text-textMuted">2× ROI guarantee</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span style={{ color: tier.color }}>✓</span>
                      <span className="text-textMuted">Credited toward full build</span>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className={tier.featured ? 'btn-primary text-center justify-center' : 'btn-ghost text-center justify-center'}
                  >
                    <span>{tier.cta} →</span>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Urgency strip */}
        <AnimatedSection delay={0.3} className="mt-8">
          <div className="glass border border-pink/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-pink animate-pulse" />
              <span className="text-textMuted text-sm">
                We cap audits at <span className="text-textPrimary font-semibold">10 per month</span> to ensure 48-hour delivery. Currently{' '}
                <span className="text-pink font-bold">2 slots remaining.</span>
              </span>
            </div>
            <Link href="/contact" className="btn-primary text-sm py-2.5 px-6 whitespace-nowrap">
              <span>Lock In Your Slot →</span>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
