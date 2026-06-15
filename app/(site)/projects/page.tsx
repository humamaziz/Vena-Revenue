import AnimatedSection from '@/components/ui/AnimatedSection'
import GlowCard from '@/components/ui/GlowCard'
import Footer from '@/components/layout/Footer'

const projects = [
  {
    client: 'Personal Injury Law Firm',
    location: 'Houston, TX',
    vector: 'Vector 2 — Ghosted Lead Bleed',
    category: 'Law Firm · AI Intake · GEO',
    headline: '$84K recovered from a ghosted lead database in 60 days',
    problem: 'No intake automation. Zero schema markup. 8+ hour average response time. Completely invisible in AI search. Inbound leads going cold before any follow-up was triggered. Team had no visibility into which leads had responded.',
    solution: 'Deployed AI agent pipeline with sub-90-second automated response and multi-channel follow-up sequence. Injected JSON-LD entity graph across all practice area pages. Reactivated ghosted inquiry database with personalized outreach sequences.',
    metrics: [
      { label: 'Leads Reactivated', value: '142' },
      { label: 'Revenue Recovered', value: '$84K' },
      { label: 'Response Time', value: '< 90s' },
      { label: 'AI Search Rank', value: '#1 Cited' },
    ],
    color: '#00F5D4',
  },
  {
    client: 'MedSpa Group (4 Locations)',
    location: 'Miami, FL',
    vector: 'Vector 3 — Form Friction Wall',
    category: 'MedSpa · Booking Optimization · Schema',
    headline: '+312% conversion rate after intake system rebuild',
    problem: 'Phone-only booking losing 60%+ of mobile traffic. 9-field intake form creating abandonment at the submission step. Zero AI search visibility for treatment keywords. No post-booking automation to prevent no-shows.',
    solution: 'Rebuilt intake to a 2-field mobile-first flow. Integrated AI booking confirmation with pre-consultation sequence. Injected schema markup for all treatment keywords across 4 location pages. Built automated review capture post-appointment.',
    metrics: [
      { label: 'Conversion Rate', value: '+312%' },
      { label: 'Mobile Bookings', value: '+180%' },
      { label: 'AI Visibility', value: 'Top 3' },
      { label: 'Review Count', value: '+340' },
    ],
    color: '#7B61FF',
  },
  {
    client: 'B2B SaaS - HR Tech Platform',
    location: 'Remote · $8M ARR',
    vector: 'Vector 1 - AI Invisibility Leak',
    category: 'SaaS · GEO · AI Agent Pipeline',
    headline: '$2.1M ARR attributed to GEO infrastructure in 6 months',
    problem: 'Organic traffic declining 40% YoY. No enterprise AI search presence - invisible in ChatGPT, Perplexity, and Claude results. Sales team wasting 40%+ of time on unqualified leads with no intake automation layer.',
    solution: 'Built complete GEO citation network across 6 enterprise HR keywords. Deployed MCP-based AI qualification agent on the demo request flow. Compressed sales cycle through AI-assisted outbound targeting buyers already showing AI search intent.',
    metrics: [
      { label: 'ARR Attributed', value: '$2.1M' },
      { label: 'Deal Cycle', value: '-28%' },
      { label: 'Win Rate', value: '+41%' },
      { label: 'CPL Reduction', value: '53%' },
    ],
    color: '#FF4D6D',
  },
  {
    client: 'Boutique Hotel Collection',
    location: 'Thailand · 3 Properties',
    vector: 'Vector 5 - Booking & Response Crisis',
    category: 'Hospitality · Direct Booking · OTA Recovery',
    headline: '$180K/yr OTA commission recovered through direct booking rebuild',
    problem: 'Losing 20% commission to OTAs on every booking. Clunky third-party booking embeds on mobile. No direct booking incentive flow. Guests not discovering add-ons or upgrades. No upsell automation post-booking.',
    solution: 'Rebuilt direct booking UX with instant confirmation and automated upsell sequence. Implemented schema for local AI travel searches. Added intelligent add-on recommendation engine post-booking.',
    metrics: [
      { label: 'OTA Commission Saved', value: '$180K/yr' },
      { label: 'Direct Bookings', value: '+95%' },
      { label: 'Avg. Booking Value', value: '+34%' },
      { label: 'Mobile Completion', value: '4.1→8.7%' },
    ],
    color: '#F59E0B',
  },
  {
    client: 'Orthodontic Group (Multi-Location)',
    location: 'Florida · 6 Locations',
    vector: 'Vector 4 - Ad Spend Hemorrhage',
    category: 'Dental · Paid Traffic · Landing Page',
    headline: 'Google Ads CPL reduced 61% after funnel integrity rebuild',
    problem: 'Spending $11K/month on Google Ads. Landing page loading at 4.8 seconds on mobile. UTM tracking parameters being stripped on page load - ad campaigns running blind on corrupted conversion data. Message mismatch between ad copy and landing page.',
    solution: 'Rebuilt landing page with sub-1.5-second mobile load. Fixed pixel and tracking parameter integrity. Aligned ad copy with landing page messaging across 6 location campaigns. Deployed A/B testing framework.',
    metrics: [
      { label: 'CPL Reduction', value: '61%' },
      { label: 'Page Load Time', value: '4.8s → 1.4s' },
      { label: 'Conversion Rate', value: '0.8% → 3.2%' },
      { label: 'Monthly Leads', value: '+280%' },
    ],
    color: '#34D399',
  },
]

export default function ProjectsPage() {
  return (
    <>
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-4">
            <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase">Proof of Work</span>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight max-w-3xl mb-6">
              Real systems.{' '}
              <span className="gradient-text">Documented outcomes.</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-[#8892A4] text-xl max-w-2xl">
              Every case study is a system we built, a leak we found, and revenue we recovered. Before, after, and the exact methodology - no testimonial soup, no vanity metrics.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {projects.map((project, i) => (
            <AnimatedSection key={project.client} delay={i * 0.08}>
              <GlowCard glowColor={`${project.color}08`}>
                <div className="p-8 md:p-10">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase block mb-1" style={{ color: project.color }}>
                        {project.vector}
                      </span>
                      <h2 className="font-display font-bold text-2xl md:text-3xl text-white max-w-2xl">
                        {project.headline}
                      </h2>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-white">{project.client}</div>
                      <div className="text-sm text-[#8892A4]">{project.location}</div>
                      <div className="text-xs text-[#8892A4] mt-0.5">{project.category}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {project.metrics.map((m) => (
                      <div key={m.label} className="glass border border-white/[0.04] rounded-xl p-4 text-center">
                        <div className="font-display font-bold text-xl" style={{ color: project.color }}>{m.value}</div>
                        <div className="text-xs text-[#8892A4] mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#FF4D6D]/[0.04] border border-[#FF4D6D]/10 rounded-xl p-5">
                      <div className="text-xs font-bold tracking-widest uppercase text-[#FF4D6D] mb-3">The Problem</div>
                      <p className="text-[#8892A4] text-sm leading-relaxed">{project.problem}</p>
                    </div>
                    <div className="rounded-xl p-5 border" style={{ background: `${project.color}08`, borderColor: `${project.color}20` }}>
                      <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: project.color }}>The Solution</div>
                      <p className="text-[#8892A4] text-sm leading-relaxed">{project.solution}</p>
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
