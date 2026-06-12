'use client'

import AnimatedSection from '@/components/ui/AnimatedSection'
import Counter from '@/components/ui/Counter'

const stats = [
  { value: 41, suffix: '%', label: 'Increase in win rates', sub: 'with AI-integrated outbound' },
  { value: 30, suffix: '%', label: 'Faster deal cycles', sub: 'avg. compressed timeline' },
  { value: 96, suffix: '%', label: 'Forecast accuracy', sub: 'AI-powered sales predictions' },
  { value: 2, prefix: '', suffix: '×', label: 'Minimum ROI guarantee', sub: 'or retainer is waived' },
]

const caseStudies = [
  {
    client: 'Personal Injury Law Firm',
    location: 'Houston, TX',
    result: '$84K recovered in 60 days',
    detail: 'Reactivated ghosted intake database. Deployed AI follow-up sequencer.',
    before: '8-hour avg. response time',
    after: '< 90 seconds, automated',
    color: '#00F5D4',
  },
  {
    client: 'MedSpa Group',
    location: 'Miami, FL',
    result: '+312% conversion rate',
    detail: 'Rebuilt intake form. Added AI booking confirmation. Fixed schema invisibility.',
    before: '0 AI search visibility',
    after: '#1 cited in Perplexity results',
    color: '#7B61FF',
  },
  {
    client: 'B2B SaaS Company',
    location: 'Remote',
    result: '$2.1M ARR attributed',
    detail: 'GEO infrastructure deployed. LLM citation network built across 6 keywords.',
    before: '$9K/mo ad spend, 0.4% CVR',
    after: '2.9% CVR, 53% lower CPL',
    color: '#FF4D6D',
  },
]

export default function ResultsSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(0,245,212,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-4">
          <span className="text-purple text-xs font-bold tracking-[0.3em] uppercase">Chapter 03 — The Results</span>
        </AnimatedSection>

        <AnimatedSection className="mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight max-w-2xl">
            Numbers that{' '}
            <span className="gradient-text">redefine the ROI</span>{' '}
            conversation
          </h2>
        </AnimatedSection>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <div className="glass border border-white/[0.06] rounded-2xl p-6 text-center group hover:border-aqua/20 transition-all duration-500">
                <div className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                  {stat.prefix}
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-textPrimary font-semibold text-sm mb-1">{stat.label}</div>
                <div className="text-textMuted text-xs">{stat.sub}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Case studies */}
        <AnimatedSection className="mb-8">
          <h3 className="font-display font-bold text-2xl text-textPrimary">Real systems. Real outcomes.</h3>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6">
          {caseStudies.map((cs, i) => (
            <AnimatedSection key={cs.client} delay={i * 0.15}>
              <div className="glass border border-white/[0.06] rounded-2xl p-6 h-full group hover:-translate-y-1 transition-all duration-500 hover:border-white/[0.12]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-semibold text-textPrimary">{cs.client}</div>
                    <div className="text-xs text-textMuted">{cs.location}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: cs.color, boxShadow: `0 0 8px ${cs.color}` }} />
                </div>

                <div className="font-display font-bold text-xl mb-2" style={{ color: cs.color }}>{cs.result}</div>
                <p className="text-textMuted text-sm mb-5 leading-relaxed">{cs.detail}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-pink text-xs">BEFORE</span>
                    <span className="text-textMuted">{cs.before}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-aqua text-xs">AFTER</span>
                    <span className="text-textPrimary font-medium">{cs.after}</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
