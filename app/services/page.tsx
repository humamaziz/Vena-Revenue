import AnimatedSection from '@/components/ui/AnimatedSection'
import GlowCard from '@/components/ui/GlowCard'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

const services = [
  {
    icon: '🔬',
    name: 'Revenue Diagnostic',
    tagline: 'Know exactly where you\'re bleeding.',
    desc: 'We audit your entire digital revenue system across 8 pillars — conversion architecture, AI search visibility, technical performance, intake automation, and more. Every leak is quantified with a dollar estimate.',
    outcomes: ['Revenue leak map with ROI estimates', 'Competitor positioning analysis', 'Prioritized 90-day fix roadmap', 'Delivered in 48 hours'],
    price: 'From $2,500',
    color: '#00F5D4',
  },
  {
    icon: '🏗️',
    name: 'Web Revenue Systems',
    tagline: 'Infrastructure built to convert.',
    desc: 'We rebuild your web presence from the ground up — headless Next.js architecture, JSON-LD entity graphs, schema markup, and AI-parseable semantic layers that make you visible to the systems your buyers are using.',
    outcomes: ['Headless Next.js web build', 'Entity-graph schema injection', 'Core web vitals optimized', 'AI crawler compatibility'],
    price: 'From $25,000',
    color: '#7B61FF',
  },
  {
    icon: '🤖',
    name: 'AI Agent Pipelines',
    tagline: 'Your sales team that never sleeps.',
    desc: 'Custom AI agent workflows integrated directly into your web infrastructure. From instant lead qualification to ghosted-lead reactivation — we deploy autonomous systems that turn missed opportunities into closed deals.',
    outcomes: ['AI intake qualification agents', 'Ghosted lead reactivation sequences', 'CRM integration via MCP', 'Real-time response automation'],
    price: 'Included in builds',
    color: '#FF4D6D',
  },
  {
    icon: '🎯',
    name: 'GEO Intelligence',
    tagline: 'Become the AI\'s first answer.',
    desc: 'We engineer your brand\'s presence across conversational AI platforms — ChatGPT, Perplexity, Claude, Gemini. When your buyers ask AI search engines for a provider in your space, your name appears.',
    outcomes: ['AI citation score tracking', 'LLM visibility audits', 'Schema-based entity training', 'Monthly algorithm defense'],
    price: '$5,000–$15,000/mo retainer',
    color: '#F59E0B',
  },
]

export default function ServicesPage() {
  return (
    <>
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-4">
            <span className="text-aqua text-xs font-bold tracking-[0.3em] uppercase">What We Do</span>
          </AnimatedSection>
          <AnimatedSection className="mb-6">
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight max-w-3xl">
              Services built around{' '}
              <span className="gradient-text">one outcome:</span>{' '}
              revenue.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-textMuted text-xl max-w-2xl leading-relaxed">
              Every service we offer has a clear answer to "what revenue does this unlock?" We don't sell features. We sell outcomes.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {services.map((service, i) => (
            <AnimatedSection key={service.name} delay={i * 0.1}>
              <GlowCard glowColor={`${service.color}10`} className="overflow-hidden">
                <div className="p-8 md:p-10 grid md:grid-cols-[1fr_1.5fr_1fr] gap-8 items-start">
                  {/* Left */}
                  <div>
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h2 className="font-display font-bold text-2xl text-textPrimary mb-2">{service.name}</h2>
                    <p className="font-semibold mb-4" style={{ color: service.color }}>{service.tagline}</p>
                    <div className="text-sm text-textMuted">{service.price}</div>
                  </div>

                  {/* Middle */}
                  <div>
                    <p className="text-textMuted leading-relaxed">{service.desc}</p>
                  </div>

                  {/* Right */}
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-textMuted mb-3">Outcomes</div>
                    <ul className="space-y-2 mb-6">
                      {service.outcomes.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5" style={{ color: service.color }}>→</span>
                          <span className="text-textMuted">{o}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className="btn-primary text-sm py-2.5 px-5">
                      <span>Inquire →</span>
                    </Link>
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          ))}
        </div>
      </section>
      <Footer />
    </>
  )
}
