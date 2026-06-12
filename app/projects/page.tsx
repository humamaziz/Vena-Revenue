import AnimatedSection from '@/components/ui/AnimatedSection'
import GlowCard from '@/components/ui/GlowCard'
import Footer from '@/components/layout/Footer'

const projects = [
  {
    client: 'Personal Injury Law Firm',
    location: 'Houston, TX',
    category: 'Law · AI Intake · GEO',
    headline: '$84K recovered from ghosted leads in 60 days',
    problem: 'No intake automation. Zero schema markup. 8+ hour response times. Completely invisible in AI search.',
    solution: 'Deployed AI intake agent with 90-second response. Injected JSON-LD entity graph. Rebuilt lead capture system.',
    metrics: [
      { label: 'Leads Reactivated', value: '142' },
      { label: 'Revenue Recovered', value: '$84K' },
      { label: 'Response Time', value: '< 90s' },
      { label: 'AI Search Rank', value: '#1' },
    ],
    color: '#00F5D4',
    tag: 'CASE STUDY',
  },
  {
    client: 'MedSpa Group (4 Locations)',
    location: 'Miami, FL',
    category: 'MedSpa · Booking · Conversion',
    headline: '+312% conversion rate after full system rebuild',
    problem: 'Phone-only booking losing 60% of mobile traffic. No post-booking automation. 0 AI search visibility.',
    solution: 'Rebuilt booking flow for mobile-first UX. Integrated AI confirmation sequences. Schema injection for all treatment keywords.',
    metrics: [
      { label: 'Conversion Rate', value: '+312%' },
      { label: 'Mobile Bookings', value: '+180%' },
      { label: 'AI Visibility', value: 'Top 3' },
      { label: 'Review Count', value: '+340' },
    ],
    color: '#7B61FF',
    tag: 'CASE STUDY',
  },
  {
    client: 'B2B SaaS (HR Tech)',
    location: 'Remote · $8M ARR',
    category: 'SaaS · GEO · Pipeline',
    headline: '$2.1M ARR attributed to GEO infrastructure in 6 months',
    problem: 'Organic traffic declining 40% YoY. No enterprise AI search presence. Sales team wasting 40% of time on unqualified leads.',
    solution: 'Built complete GEO network. Deployed AI qualification layer. Compressed sales cycle with AI-assisted outbound.',
    metrics: [
      { label: 'ARR Attributed', value: '$2.1M' },
      { label: 'Deal Cycle', value: '-28%' },
      { label: 'Win Rate', value: '+41%' },
      { label: 'CPL Reduction', value: '53%' },
    ],
    color: '#FF4D6D',
    tag: 'CASE STUDY',
  },
  {
    client: 'Boutique Hotel Collection',
    location: 'Thailand · 3 Properties',
    category: 'Hospitality · Direct Booking · UX',
    headline: '20% OTA commission recovered through direct booking optimization',
    problem: 'Losing 20% commission to OTAs. No direct booking incentive flow. Clunky third-party booking embeds.',
    solution: 'Rebuilt direct booking UX with instant confirmation. Deployed upsell automation. Schema for local AI search.',
    metrics: [
      { label: 'OTA Commission Saved', value: '$180K/yr' },
      { label: 'Direct Bookings', value: '+95%' },
      { label: 'Avg. Booking Value', value: '+34%' },
      { label: 'Mobile Completion', value: '4.1→8.7%' },
    ],
    color: '#F59E0B',
    tag: 'CASE STUDY',
  },
]

export default function ProjectsPage() {
  return (
    <>
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-4">
            <span className="text-aqua text-xs font-bold tracking-[0.3em] uppercase">Proof of Work</span>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight max-w-3xl mb-6">
              Real systems.{' '}
              <span className="gradient-text">Documented outcomes.</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-textMuted text-xl max-w-2xl">
              Every case study below is a system we built, a leak we found, and revenue we recovered. No testimonial soup — just before, after, and the exact methodology.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {projects.map((project, i) => (
            <AnimatedSection key={project.client} delay={i * 0.1}>
              <GlowCard glowColor={`${project.color}10`}>
                <div className="p-8 md:p-10">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: project.color }}>
                        {project.tag}
                      </span>
                      <h2 className="font-display font-bold text-2xl md:text-3xl text-textPrimary mt-1 max-w-2xl">
                        {project.headline}
                      </h2>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-textPrimary">{project.client}</div>
                      <div className="text-sm text-textMuted">{project.location}</div>
                      <div className="text-xs text-textMuted mt-1">{project.category}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {project.metrics.map((m) => (
                      <div key={m.label} className="glass border border-white/[0.04] rounded-xl p-4 text-center">
                        <div className="font-display font-bold text-xl" style={{ color: project.color }}>{m.value}</div>
                        <div className="text-xs text-textMuted mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Before / After */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-pink/[0.04] border border-pink/10 rounded-xl p-5">
                      <div className="text-xs font-bold tracking-widest uppercase text-pink mb-3">The Problem</div>
                      <p className="text-textMuted text-sm leading-relaxed">{project.problem}</p>
                    </div>
                    <div className="border rounded-xl p-5" style={{ background: `${project.color}08`, borderColor: `${project.color}20` }}>
                      <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: project.color }}>The Solution</div>
                      <p className="text-textMuted text-sm leading-relaxed">{project.solution}</p>
                    </div>
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
