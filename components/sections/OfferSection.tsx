'use client'

import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'

const tiers = [
  {
    name: 'Entry Diagnostic',
    price: '$2,500',
    target: 'Local owner-operated businesses (<$500K revenue)',
    pillars: 'Top 4 Pillars scored report',
    delivery: '48 hours',
    note: null,
    featured: false,
    color: '#8892A4',
    cta: 'Start Here',
  },
  {
    name: 'Full Revenue Intelligence Report',
    price: '$6,000',
    target: 'Established regional businesses ($500K–$5M)',
    pillars: 'All 8 Pillars + competitor intelligence + prioritized roadmap',
    delivery: '48 hours',
    note: '100% credited toward the $30K Mid-Market Build if signed within 14 days.',
    featured: true,
    color: '#00F5D4',
    cta: 'Get the Report',
  },
  {
    name: 'Premium ARE Audit',
    price: '$12,000–$15,000',
    target: 'Law firms, B2B SaaS, Enterprise clients',
    pillars: 'AI search gap analysis + schema audit + 90-day implementation plan',
    delivery: '5 business days',
    note: '100% credited toward the $50K–$75K Enterprise Build if signed within 14 days.',
    featured: false,
    color: '#7B61FF',
    cta: 'Talk to Us',
  },
]

const guarantee = [
  'Every documented leak quantified in dollars',
  'Prioritized 90-day fix roadmap',
  '100% audit fee credited toward full build',
  '2× ROI guarantee — or instant full refund',
  'Delivered in 48 hours, no exceptions',
]

export default function OfferSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,245,212,0.04) 0%, rgba(123,97,255,0.04) 50%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-4">
          <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase">Chapter 04 — The Investment</span>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <AnimatedSection>
            <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight">
              A complete diagnostic.{' '}
              <span className="gradient-text">Not a sales call.</span>
            </h2>
            <p className="text-[#8892A4] text-lg leading-relaxed mt-6">
              We do not book calls to &quot;learn more about your business.&quot; We show up with answers. The audit is the product — and it pays for itself before we discuss the build. Every diagnostic fee is credited 100% toward the implementation if you sign within 14 days.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,245,212,0.08), rgba(123,97,255,0.08))' }} />
              <div className="absolute inset-0 border border-[#00F5D4]/20 rounded-2xl" />
              <div className="relative p-8">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-display font-bold text-xl text-white mb-3">The Radical Risk Reversal</h3>
                <p className="text-[#8892A4] leading-relaxed mb-6">
                  If our audit does not map out at least <span className="text-[#00F5D4] font-bold">2× its cost in documented, recoverable revenue leaks</span>, we refund the fee instantly. No questions. No friction.
                </p>
                <ul className="space-y-2">
                  {guarantee.map((g) => (
                    <li key={g} className="flex items-center gap-3 text-sm">
                      <span className="text-[#00F5D4]">✓</span>
                      <span className="text-[#8892A4]">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Pricing tiers */}
        <div className="grid lg:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <AnimatedSection key={tier.name} delay={i * 0.12}>
              <div className={`relative rounded-2xl h-full flex flex-col transition-all duration-500 hover:-translate-y-2 ${
                tier.featured ? 'border border-[#00F5D4]/30' : 'glass border border-white/[0.06]'
              }`}>
                {tier.featured && (
                  <>
                    <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,245,212,0.06), rgba(123,97,255,0.06))' }} />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00F5D4] text-[#0B0F1A] text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                  </>
                )}
                <div className="relative p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: tier.color }}>{tier.name}</div>
                    <div className="font-display font-bold text-3xl text-white">{tier.price}</div>
                    <div className="text-[#8892A4] text-sm mt-1">{tier.target}</div>
                  </div>
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5" style={{ color: tier.color }}>✓</span>
                      <span className="text-[#8892A4]">{tier.pillars}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span style={{ color: tier.color }}>✓</span>
                      <span className="text-[#8892A4]">Delivered in {tier.delivery}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span style={{ color: tier.color }}>✓</span>
                      <span className="text-[#8892A4]">2× ROI guarantee</span>
                    </div>
                    {tier.note && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-[#8892A4] italic">{tier.note}</div>
                    )}
                  </div>
                  <Link href="/contact" className={tier.featured ? 'btn-primary text-center justify-center' : 'btn-ghost text-center justify-center'}>
                    <span>{tier.cta} →</span>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="mt-8">
          <div className="glass border border-[#FF4D6D]/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" />
              <span className="text-[#8892A4] text-sm">
                We cap audits at <span className="text-white font-semibold">10 per month</span> to guarantee 48-hour delivery. Currently{' '}
                <span className="text-[#FF4D6D] font-bold">2 slots remaining.</span>
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
