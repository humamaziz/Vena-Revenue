import AnimatedSection from '@/components/ui/AnimatedSection'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const timeline = [
  { year: '2023', title: 'The Gap Discovered', desc: 'After auditing dozens of businesses, a pattern emerged. They were not failing at marketing — they were failing at systems. Traffic was arriving and dying inside broken intake flows, unanswered inboxes, and websites that AI crawlers could not parse.' },
  { year: '2024', title: 'The Blue Ocean Identified', desc: 'GEO agencies do not build. Web agencies do not optimize for AI. AI SaaS does not fix websites. Nobody was building the complete AI-discovery-to-autonomous-sales-execution loop natively into client web infrastructure. We built the company that does.' },
  { year: '2025', title: 'The Model Proven', desc: 'The diagnostic-first model validated. Clients recouped their audit investment within days of delivery. Full builds launched. The 2× guarantee has never been triggered. The retainer model locked in recurring revenue from clients who cannot afford to lose their AI search position.' },
  { year: '2026', title: 'The Infrastructure Era', desc: 'By 2027, AI is projected to initiate 95% of seller research workflows. The businesses that survive will not be the ones with the biggest budgets — they will be the ones with the most intelligent infrastructure. We build that infrastructure.' },
]

const differentiators = [
  { icon: '🔗', title: 'Complete Loop Integration', desc: 'GEO agencies stop at visibility. AI SaaS starts at outreach. We build the bridge — from the moment an AI engine mentions your name to the moment a lead is booked, qualified, and followed up with autonomously.' },
  { icon: '⚡', title: '48-Hour Diagnostic Delivery', desc: 'Every audit ships in 48 hours with every revenue leak quantified in dollars. Not vague recommendations — a precise, prioritized fix map with ROI estimates attached to each item.' },
  { icon: '🔒', title: 'Radical Risk Reversal', desc: 'If we do not document at least 2× the audit cost in recoverable revenue leaks, you receive a full refund immediately. We have never issued one — because the leaks are always there.' },
  { icon: '🧬', title: 'Technical Moat', desc: 'MCP server architectures, headless Next.js decoupled builds, entity-graph JSON-LD injection — we build infrastructure that internal IT teams cannot replicate from off-the-shelf tools. That is the barrier we create between our clients and their competitors.' },
  { icon: '📊', title: 'GEO Intelligence at Scale', desc: 'The GEO market is growing from $848M today to $17–19B by 2034 at a 34–50% CAGR. We are not riding that wave — we are building the infrastructure businesses need to survive it.' },
  { icon: '🎯', title: 'No Discovery Calls', desc: 'We do not ask for permission. We send a 90-second Loom showing you exactly what is broken before you spend a dollar. You see the leak before the conversation begins. That is how confident we are in what we find.' },
]

const targets = [
  { type: 'Personal Injury Law Firms', pain: 'Intake speed is critical. A lead answered within 2 hours converts at 11%. After 24 hours: 1%. Most firms have no automation.' },
  { type: 'Medical Spas & Clinics', pain: 'High lifetime value, but structural lead capture failures. Phone-only booking losing 60%+ of mobile traffic.' },
  { type: 'Boutique Hotels', pain: 'Losing 20% commission to OTAs because their direct booking flow has friction. One UX fix recovers six figures annually.' },
  { type: 'Mid-Market B2B SaaS ($2M–$30M ARR)', pain: 'Organic traffic declining while enterprise revenue targets increase. Invisible in AI search. Enterprise deals closed by competitors who appear in AI results.' },
]

export default function AboutPage() {
  return (
    <>
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-4">
            <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase">Our Mission</span>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight max-w-4xl mb-8">
              We exist because{' '}
              <span className="gradient-text">the market left a gap</span>{' '}
              nobody was filling.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-[#8892A4] text-xl max-w-2xl leading-relaxed">
              Every business we audited had the same problem: good traffic, broken infrastructure. Leads were arriving and dying — inside unanswered inboxes, clunky forms, and websites that AI search engines could not read. No single provider was solving the full problem. So we built the company that does.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Market reality strip */}
      <section className="py-12 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: '80%', label: 'of B2B sales interactions now happen digitally before CRM contact' },
              { stat: '95%', label: 'of seller research workflows will be AI-initiated by 2027' },
              { stat: '$19.8B', label: 'projected GEO market size by 2034 — growing at 34–50% CAGR' },
              { stat: '40%+', label: 'of sales team time wasted on unqualified leads due to poor web automation' },
            ].map((s) => (
              <div key={s.stat}>
                <div className="font-display font-bold text-3xl gradient-text mb-2">{s.stat}</div>
                <div className="text-[#8892A4] text-xs leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="mb-12">
            <h2 className="font-display font-bold text-3xl text-white">How we got here</h2>
          </AnimatedSection>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-gradient-to-b from-[#00F5D4] via-[#7B61FF] to-[#FF4D6D]" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <AnimatedSection key={item.year} delay={i * 0.1}>
                  <div className="flex gap-10">
                    <div className="relative flex-shrink-0 w-32 text-right">
                      <span className="font-display font-bold text-2xl gradient-text">{item.year}</span>
                      <div className="absolute right-0 top-3 w-3 h-3 rounded-full bg-[#00F5D4] translate-x-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white mb-2">{item.title}</h3>
                      <p className="text-[#8892A4] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Who we work with</h2>
            <p className="text-[#8892A4] max-w-xl">We target businesses where the pain of lost leads is quantifiable and immediate — not theoretical.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {targets.map((t, i) => (
              <AnimatedSection key={t.type} delay={i * 0.1}>
                <div className="glass border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-500">
                  <h3 className="font-display font-bold text-lg text-white mb-3">{t.type}</h3>
                  <p className="text-[#8892A4] text-sm leading-relaxed">{t.pain}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white max-w-xl">
              What makes us different is what we{' '}
              <span className="gradient-text">refuse to do separately.</span>
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((d, i) => (
              <AnimatedSection key={d.title} delay={i * 0.08}>
                <div className="glass border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-500 h-full">
                  <div className="text-3xl mb-4">{d.icon}</div>
                  <h3 className="font-display font-bold text-lg text-white mb-3">{d.title}</h3>
                  <p className="text-[#8892A4] text-sm leading-relaxed">{d.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="font-display font-bold text-4xl text-white mb-6">Ready to see what is leaking?</h2>
            <p className="text-[#8892A4] text-lg mb-8">The audit takes 48 hours. The findings change how you run the business.</p>
            <Link href="/contact" className="btn-primary text-base py-4 px-10">
              <span>Get Your Revenue Audit →</span>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  )
}
