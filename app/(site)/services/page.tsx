import AnimatedSection from '@/components/ui/AnimatedSection'
import GlowCard from '@/components/ui/GlowCard'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

const phases = [
  {
    phase: 'Phase 1',
    name: 'Revenue Intelligence Diagnostic',
    tagline: 'Know exactly where you are bleeding — in dollars.',
    desc: 'We evaluate your business across our 8-Pillar Framework, scoring your conversion architecture, GEO intelligence, and backend system bottlenecks. Every gap is documented with a dollar estimate attached. In 48 hours, you have a complete map of every revenue leak - prioritized by financial impact.',
    pillars: ['Conversion Architecture', 'SEO + AI SEO Intelligence', 'Technical Performance', 'AI Integration Opportunity', 'Booking + Lead System', 'Branding + Visual Design', 'Competitive + Market Position', 'Psychology + Copy Audit'],
    pricing: 'From $2,500 - 100% credited toward build',
    color: '#00F5D4',
    icon: '🔬',
  },
  {
    phase: 'Phase 2',
    name: 'Core Web Development & AI Architecture',
    tagline: 'We do not build pages. We build infrastructure.',
    desc: 'We rebuild your web environment from the ground up using headless Next.js architecture, entity-graph schema injection, and MCP server-based AI agent pipelines. The result is a site that loads instantly, appears in AI search results, and autonomously qualifies, responds to, and reactivates leads - without requiring manual intervention from your team.',
    pillars: ['Headless Next.js decoupled architecture', 'Custom JSON-LD entity graph injection', 'MCP server AI agent pipeline deployment', 'CRM integration + automated intake flows', 'AI-parseable semantic markup layers', 'Core Web Vitals optimization', 'Ghosted lead reactivation system', 'Response automation under 90 seconds'],
    pricing: 'Standard: $25,000 · Mid-Market: $24,000 net · Enterprise: $35,000-$63,000 net',
    color: '#7B61FF',
    icon: '⚙️',
  },
  {
    phase: 'Phase 3',
    name: 'Scale & Algorithm Defense Retainer',
    tagline: 'We defend your position as LLMs update their weights.',
    desc: 'Commercial LLM providers - OpenAI, Anthropic, Google - constantly update their neural weights, vector embeddings, and citation scoring algorithms. Without active defense, a business that ranks well in AI search today can disappear from results in a single model update. Our retainer ensures your infrastructure adapts in real time.',
    pillars: ['Monthly citation score tracking', 'Real-time schema adaptation', 'Agent performance monitoring + tuning', 'Competitor displacement monitoring', 'GEO algorithm update response', 'Quarterly strategy recalibration', 'Conversion rate A/B optimization', 'Priority support'],
    pricing: '$5,000-$15,000 / month',
    color: '#FF4D6D',
    icon: '🛡️',
  },
]

const buildTiers = [
  { name: 'Standard Build', for: 'Entry Diagnostic clients', investment: '$25,000 flat', note: '$2,500 audit credited toward total' },
  { name: 'Mid-Market Build', for: 'Full Report clients', investment: '$24,000 net balance', note: 'Total value $30,000 - $6,000 report fee credited if signed within 14 days' },
  { name: 'Enterprise Build', for: 'ARE Audit clients', investment: '$35,000-$63,000 net', note: 'Total value $50,000-$75,000 - $12K-$15K premium diagnostic fee credited if signed within 14 days' },
]

export default function ServicesPage() {
  return (
    <>
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-4">
            <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase">What We Build</span>
          </AnimatedSection>
          <AnimatedSection className="mb-6">
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight max-w-3xl">
              Three phases.{' '}
              <span className="gradient-text">One complete revenue engine.</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-[#8892A4] text-xl max-w-2xl leading-relaxed">
              A DIY approach to building an autonomous revenue engine costs $200,000-$350,000+ in year one and takes 6-12 months to configure. We deliver a fully realized, AI-integrated web ecosystem in 60-90 days.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Phase cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {phases.map((phase, i) => (
            <AnimatedSection key={phase.phase} delay={i * 0.1}>
              <GlowCard glowColor={`${phase.color}10`}>
                <div className="p-8 md:p-10 grid md:grid-cols-[1fr_1.4fr_1fr] gap-8 items-start">
                  <div>
                    <div className="text-4xl mb-4">{phase.icon}</div>
                    <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: phase.color }}>{phase.phase}</div>
                    <h2 className="font-display font-bold text-xl text-white mb-2">{phase.name}</h2>
                    <p className="font-semibold text-sm mb-4" style={{ color: phase.color }}>{phase.tagline}</p>
                    <div className="text-xs text-[#8892A4] leading-relaxed">{phase.pricing}</div>
                  </div>
                  <div>
                    <p className="text-[#8892A4] leading-relaxed text-sm">{phase.desc}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-[#8892A4] mb-3">What is included</div>
                    <ul className="space-y-2">
                      {phase.pillars.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 flex-shrink-0" style={{ color: phase.color }}>→</span>
                          <span className="text-[#8892A4]">{p}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className="btn-primary text-sm py-2.5 px-5 mt-6 inline-flex">
                      <span>Inquire →</span>
                    </Link>
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Build pricing table */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Implementation Build Pricing</h2>
            <p className="text-[#8892A4] max-w-xl">Every diagnostic fee is credited 100% toward the build cost - provided you sign within 14 days of audit delivery.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {buildTiers.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <div className="glass border border-white/[0.06] rounded-2xl p-6 h-full hover:border-white/[0.12] transition-all duration-500">
                  <div className="text-xs font-bold tracking-widest uppercase text-[#8892A4] mb-2">{t.for}</div>
                  <div className="font-display font-bold text-2xl text-white mb-1">{t.name}</div>
                  <div className="text-[#00F5D4] font-bold text-lg mb-4">{t.investment}</div>
                  <p className="text-[#8892A4] text-sm leading-relaxed">{t.note}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
