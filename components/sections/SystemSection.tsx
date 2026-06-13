'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'
import GlowCard from '@/components/ui/GlowCard'

const steps = [
  {
    number: '01',
    phase: 'Diagnose',
    title: 'We Find Every Leak',
    desc: 'In 48 hours we run your business through our 8-Pillar Revenue Diagnostic — scoring conversion architecture, GEO intelligence, technical performance, AI integration opportunity, booking systems, branding, competitive position, and copy psychology. Every gap is quantified in dollars.',
    bullets: [
      'AI search visibility gap analysis',
      'Funnel friction and form audit',
      'Competitor schema comparison',
      'Core Web Vitals performance scan',
      'Intake automation assessment',
      'Prioritized fix roadmap with ROI estimates',
    ],
    color: '#00F5D4',
    icon: '🔬',
  },
  {
    number: '02',
    phase: 'Engineer',
    title: 'We Rebuild the Infrastructure',
    desc: 'We do not patch your old system. We architect a new revenue engine — headless Next.js decoupled architecture, custom JSON-LD entity graph injection, MCP server AI agent pipelines, CRM integration, and automated intake flows. Deployed in 60–90 days.',
    bullets: [
      'Headless Next.js decoupled web build',
      'Entity-graph JSON-LD schema injection',
      'MCP server AI agent pipeline deployment',
      'Autonomous lead qualification and follow-up',
      'Ghosted lead reactivation system',
      'Response automation under 90 seconds',
    ],
    color: '#7B61FF',
    icon: '⚙️',
  },
  {
    number: '03',
    phase: 'Defend',
    title: 'We Guard Your Position',
    desc: 'Commercial LLM providers — OpenAI, Anthropic, Google — constantly update their neural weights, vector embeddings, and citation scoring algorithms. Our retainer ensures your infrastructure adapts in real time so you do not lose ground in a single model update.',
    bullets: [
      'Monthly citation score tracking',
      'Real-time schema adaptation',
      'AI agent performance monitoring',
      'Competitor displacement monitoring',
      'GEO algorithm update response',
      'Quarterly strategy recalibration',
    ],
    color: '#FF4D6D',
    icon: '🛡️',
  },
]

const pillars = [
  'Conversion Architecture',
  'SEO + AI SEO Intelligence',
  'Technical Performance',
  'AI Integration Opportunity',
  'Booking + Lead System',
  'Branding + Visual Design',
  'Competitive + Market Position',
  'Psychology + Copy Audit',
]

export default function SystemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" ref={ref} className="section-padding relative">
      <div className="absolute right-0 top-1/2 w-96 h-96 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(123,97,255,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-4">
          <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase">Chapter 02 — The System</span>
        </AnimatedSection>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <AnimatedSection>
            <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight max-w-xl">
              The Revenue Engineering{' '}
              <span className="gradient-text">Loop</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2} className="max-w-sm">
            <p className="text-[#8892A4] leading-relaxed">
              Three phases. No guesswork. Every deliverable is tied to measurable revenue outcomes — not vanity metrics. A DIY approach costs $200K–$350K+ in year one and takes 6–12 months to configure. We deliver in 60–90 days.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {steps.map((step, i) => (
            <AnimatedSection key={step.number} delay={i * 0.15}>
              <GlowCard glowColor={`${step.color}12`} className="h-full">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: step.color }}>
                      Phase {step.number}
                    </span>
                    <span className="glass border border-white/[0.06] rounded-lg px-3 py-1 text-xs text-[#8892A4]">
                      {step.phase}
                    </span>
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="font-display font-bold text-xl mb-3 text-white">{step.title}</h3>
                  <p className="text-[#8892A4] text-sm leading-relaxed mb-6">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: step.color }} />
                        <span className="text-[#8892A4]">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 h-px w-full" style={{ background: `linear-gradient(90deg, ${step.color}, transparent)`, opacity: 0.4 }} />
                </div>
              </GlowCard>
            </AnimatedSection>
          ))}
        </div>

        {/* 8 Pillars callout */}
        <AnimatedSection>
          <div className="glass border border-white/[0.06] rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="flex-shrink-0">
                <div className="text-xs font-bold tracking-widest uppercase text-[#00F5D4] mb-3">The 8-Pillar Diagnostic Framework</div>
                <h3 className="font-display font-bold text-2xl text-white max-w-xs">Every revenue leak, mapped and priced.</h3>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                {pillars.map((p, i) => (
                  <div key={p} className="flex items-start gap-2 text-sm">
                    <span className="font-bold text-[#00F5D4] flex-shrink-0 text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[#8892A4] leading-tight">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="hidden lg:flex items-center justify-center gap-4 mt-6 text-[#8892A4] text-sm">
          <span className="text-[#00F5D4] font-semibold">Diagnose</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-[#00F5D4] to-[#7B61FF]" />
          <span className="text-[#7B61FF] font-semibold">Engineer</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-[#7B61FF] to-[#FF4D6D]" />
          <span className="text-[#FF4D6D] font-semibold">Defend</span>
        </div>
      </div>
    </section>
  )
}
