'use client'

import AnimatedSection from '@/components/ui/AnimatedSection'
import Counter from '@/components/ui/Counter'

const stats = [
  { value: 41, suffix: '%', label: 'Increase in win rates', sub: 'AI-integrated outbound systems', color: '#00F5D4' },
  { value: 30, suffix: '%', label: 'Faster deal cycles', sub: 'Avg. compressed timeline', color: '#7B61FF' },
  { value: 96, suffix: '%', label: 'Forecast accuracy', sub: 'AI-powered sales predictions', color: '#FF4D6D' },
  { value: 2, suffix: '×', label: 'ROI guarantee', sub: 'Or the audit fee is refunded', color: '#F59E0B' },
]

const cases = [
  {
    client: 'Personal Injury Law Firm',
    location: 'Houston, TX',
    vector: 'Vector 2 - Ghosted Lead Bleed',
    result: '$84K recovered in 60 days',
    detail: 'Zero intake automation - leads going cold within 48 hours. Deployed AI agent pipeline with sub-90-second response. Reactivated ghosted inquiry database.',
    before: '8+ hour average response time',
    after: '< 90 seconds, fully automated',
    color: '#00F5D4',
  },
  {
    client: 'MedSpa Group (4 Locations)',
    location: 'Miami, FL',
    vector: 'Vector 3 - Form Friction Wall',
    result: '+312% conversion rate',
    detail: 'Phone-only booking losing 60%+ of mobile traffic. Rebuilt intake to 2-field mobile-first flow. Injected schema for all treatment keywords.',
    before: '0 AI search visibility, 9-field form',
    after: '#1 cited in Perplexity, 2-field form',
    color: '#7B61FF',
  },
  {
    client: 'B2B SaaS - HR Tech',
    location: 'Remote · $8M ARR',
    vector: 'Vector 1 - AI Invisibility Leak',
    result: '$2.1M ARR attributed',
    detail: 'Invisible in enterprise AI search. Built complete GEO citation network. Deployed MCP-based lead qualification agent. Compressed sales cycle significantly.',
    before: '$9K/mo ad spend, 0.4% CVR',
    after: '2.9% CVR, 53% lower CPL, Series A signed',
    color: '#FF4D6D',
  },
  {
    client: 'Boutique Hotel Collection',
    location: 'Thailand · 3 Properties',
    vector: 'Vector 5 - Response & Booking Crisis',
    result: '$180K/yr OTA commission recovered',
    detail: 'Losing 20% commission to OTAs. Rebuilt direct booking flow with instant confirmation. Deployed upsell automation. Schema for local AI search.',
    before: '20% OTA commission drain, clunky embeds',
    after: '+95% direct bookings, +34% avg. booking value',
    color: '#F59E0B',
  },
]

export default function ResultsSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(0,245,212,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-4">
          <span className="text-[#7B61FF] text-xs font-bold tracking-[0.3em] uppercase">Chapter 03 - The Results</span>
        </AnimatedSection>

        <AnimatedSection className="mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight max-w-2xl">
            Numbers that{' '}
            <span className="gradient-text">redefine the ROI conversation</span>
          </h2>
        </AnimatedSection>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <div className="glass border border-white/[0.06] rounded-2xl p-6 text-center group hover:border-white/[0.12] transition-all duration-500">
                <div className="text-4xl md:text-5xl font-display font-bold mb-2" style={{ color: stat.color }}>
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
                <div className="text-[#8892A4] text-xs">{stat.sub}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Case studies */}
        <AnimatedSection className="mb-8">
          <h3 className="font-display font-bold text-2xl text-white">Real systems. Documented outcomes.</h3>
          <p className="text-[#8892A4] mt-2 text-sm">Before, after, and the exact methodology - no testimonial soup.</p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-6">
          {cases.map((cs, i) => (
            <AnimatedSection key={cs.client} delay={i * 0.12}>
              <div className="glass border border-white/[0.06] rounded-2xl p-6 h-full group hover:-translate-y-1 transition-all duration-500 hover:border-white/[0.12]">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-white">{cs.client}</div>
                    <div className="text-xs text-[#8892A4]">{cs.location}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="w-2 h-2 rounded-full ml-auto mb-1" style={{ backgroundColor: cs.color, boxShadow: `0 0 8px ${cs.color}` }} />
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: cs.color }}>{cs.vector}</span>
                  </div>
                </div>

                <div className="font-display font-bold text-xl mb-2" style={{ color: cs.color }}>{cs.result}</div>
                <p className="text-[#8892A4] text-sm mb-5 leading-relaxed">{cs.detail}</p>

                <div className="space-y-2 text-sm border-t border-white/[0.06] pt-4">
                  <div className="flex items-start gap-3">
                    <span className="text-[#FF4D6D] text-xs font-bold flex-shrink-0 pt-0.5">BEFORE</span>
                    <span className="text-[#8892A4]">{cs.before}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#00F5D4] text-xs font-bold flex-shrink-0 pt-0.5">AFTER</span>
                    <span className="text-white font-medium">{cs.after}</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Market stat strip */}
        <AnimatedSection delay={0.2} className="mt-16">
          <div className="glass border border-white/[0.06] rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              {[
                { stat: '$848M → $19.8B', label: 'GEO market growth by 2034 at 34–50% CAGR - the space we operate in is not a trend, it is a structural shift.' },
                { stat: '40%+', label: 'of sales team time wasted on unqualified leads or manual tasks when AI automation is absent from the web infrastructure.' },
                { stat: '$350K+', label: 'average annual deal size for managed GEO service contracts at the enterprise level - this market pays premium for quality execution.' },
              ].map((s) => (
                <div key={s.stat}>
                  <div className="font-display font-bold text-2xl gradient-text mb-2">{s.stat}</div>
                  <div className="text-[#8892A4] text-sm leading-relaxed">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
