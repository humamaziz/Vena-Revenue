import AnimatedSection from '@/components/ui/AnimatedSection'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const timeline = [
  { year: '2023', title: "The Problem Discovered", desc: 'After auditing dozens of businesses, a pattern emerged: they weren\'t failing at marketing. They were failing at systems. Traffic was converting at a fraction of its potential because the infrastructure was broken.' },
  { year: '2024', title: 'The Blue Ocean Identified', desc: "GEO agencies don't build. Web agencies don't optimize for AI. AI SaaS doesn't fix websites. Nobody was doing all three — so we built the company that does." },
  { year: '2025', title: 'The Model Proven', desc: 'The $1,500 audit model validated. Clients recouped their investment within days. Full builds launched. The 2× guarantee has never been triggered.' },
  { year: '2026', title: 'The Infrastructure Era', desc: 'The market is moving toward AI-first buyer journeys at a pace most agencies can\'t match. We\'re not following the wave. We\'re building the infrastructure that rides it.' },
]

const differentiators = [
  { icon: '🔗', title: 'End-to-End Integration', desc: "GEO agencies stop at visibility. AI SaaS starts at outreach. We build the bridge — from the moment an AI mentions your name to the moment a lead is booked." },
  { icon: '⏱️', title: '48-Hour Delivery', desc: 'Every audit ships in 48 hours. No bloated project timelines. We find the bleeding wound fast and move.' },
  { icon: '🔒', title: 'Performance Guarantee', desc: "If we don't map out 2× the audit cost in revenue leaks, you get a full refund. We've never issued one." },
  { icon: '🧬', title: 'Technical Moat', desc: 'MCP server architectures, headless builds, entity-graph schema — we build infrastructure that internal IT teams can\'t replicate from off-the-shelf tools.' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-4">
            <span className="text-aqua text-xs font-bold tracking-[0.3em] uppercase">Our Mission</span>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight max-w-4xl mb-8">
              We exist because{' '}
              <span className="gradient-text">the market left a gap</span>{' '}
              nobody was filling.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-textMuted text-xl max-w-2xl leading-relaxed">
              Every business we audited had the same problem: good traffic, bad infrastructure. Leads were arriving and dying — inside broken systems, unanswered inboxes, and websites that AI search engines couldn't even read. Nobody was solving the full problem.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="mb-12">
            <h2 className="font-display font-bold text-3xl text-textPrimary">How we got here</h2>
          </AnimatedSection>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-gradient-to-b from-aqua via-purple to-pink" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <AnimatedSection key={item.year} delay={i * 0.1}>
                  <div className="flex gap-10">
                    <div className="relative flex-shrink-0">
                      <div className="w-32 text-right">
                        <span className="font-display font-bold text-2xl gradient-text">{item.year}</span>
                      </div>
                      <div className="absolute right-0 top-3 w-3 h-3 rounded-full bg-aqua -translate-x-1/2 translate-x-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-textPrimary mb-2">{item.title}</h3>
                      <p className="text-textMuted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-textPrimary max-w-xl">
              What makes us different is what we{' '}
              <span className="gradient-text">refuse to do separately.</span>
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((d, i) => (
              <AnimatedSection key={d.title} delay={i * 0.1}>
                <div className="glass border border-white/[0.06] rounded-2xl p-8 hover:border-white/[0.12] transition-all duration-500">
                  <div className="text-3xl mb-4">{d.icon}</div>
                  <h3 className="font-display font-bold text-lg text-textPrimary mb-3">{d.title}</h3>
                  <p className="text-textMuted leading-relaxed">{d.desc}</p>
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
            <h2 className="font-display font-bold text-4xl text-textPrimary mb-6">
              Ready to see what's leaking?
            </h2>
            <p className="text-textMuted text-lg mb-8">
              The audit takes 48 hours. The findings are permanent.
            </p>
            <Link href="/contact" className="btn-primary text-base py-4 px-10">
              <span>Get Your Audit →</span>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </>
  )
}
