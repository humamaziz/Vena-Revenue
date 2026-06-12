'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'
import GlowCard from '@/components/ui/GlowCard'

const steps = [
  {
    number: '01',
    phase: 'Diagnose',
    title: 'We Find Every Leak',
    desc: 'In 48 hours, we run your business through our 8-Pillar Revenue Diagnostic. We expose exactly where and why money is escaping your system — with dollar estimates attached.',
    bullets: ['AI search visibility audit', 'Funnel friction mapping', 'Intake automation gaps', 'Competitor positioning'],
    color: '#00F5D4',
    icon: '🔍',
  },
  {
    number: '02',
    phase: 'Engineer',
    title: 'We Rebuild the Infrastructure',
    desc: "We don't patch your old system. We architect a new revenue engine — headless web build, AI agent integration, schema markup, and automated intake — all deployed in 60–90 days.",
    bullets: ['Headless Next.js architecture', 'AI agent pipeline', 'JSON-LD entity graphs', 'CRM sync & automation'],
    color: '#7B61FF',
    icon: '⚙️',
  },
  {
    number: '03',
    phase: 'Defend',
    title: 'We Protect Your Position',
    desc: "LLMs update their weights constantly. Our retainer ensures your citation scores, AI visibility, and conversion logic adapt in real-time — so you don't lose ground to competitors.",
    bullets: ['Monthly algorithm defense', 'Citation score tracking', 'Agent performance tuning', 'Competitor monitoring'],
    color: '#FF4D6D',
    icon: '🛡️',
  },
]

export default function SystemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" ref={ref} className="section-padding relative">
      {/* Bg glow */}
      <div className="absolute right-0 top-1/2 w-96 h-96 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(123,97,255,0.07) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-4">
          <span className="text-aqua text-xs font-bold tracking-[0.3em] uppercase">Chapter 02 — The System</span>
        </AnimatedSection>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <AnimatedSection>
            <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight max-w-xl">
              The Revenue Engineering{' '}
              <span className="gradient-text">Loop</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="max-w-sm">
            <p className="text-textMuted leading-relaxed">
              Three phases. No guesswork. Every deliverable is tied to measurable revenue outcomes — not vanity metrics.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <AnimatedSection key={step.number} delay={i * 0.15}>
              <GlowCard glowColor={`${step.color}15`} className="h-full">
                <div className="p-8">
                  {/* Phase badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: step.color }}>
                      Phase {step.number}
                    </span>
                    <span className="glass border border-white/[0.06] rounded-lg px-3 py-1 text-xs text-textMuted">
                      {step.phase}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-4">{step.icon}</div>

                  <h3 className="font-display font-bold text-xl mb-3 text-textPrimary">{step.title}</h3>
                  <p className="text-textMuted text-sm leading-relaxed mb-6">{step.desc}</p>

                  {/* Bullets */}
                  <ul className="space-y-2">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: step.color }} />
                        <span className="text-textMuted">{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bottom glow line */}
                  <div className="mt-8 h-px w-full" style={{ background: `linear-gradient(90deg, ${step.color}, transparent)`, opacity: 0.4 }} />
                </div>
              </GlowCard>
            </AnimatedSection>
          ))}
        </div>

        {/* Flow connector */}
        <div className="hidden lg:flex items-center justify-center gap-4 mt-4 text-textMuted text-sm">
          <span className="text-aqua font-semibold">Diagnose</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-aqua to-purple" />
          <span className="text-purple font-semibold">Engineer</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-purple to-pink" />
          <span className="text-pink font-semibold">Defend</span>
        </div>
      </div>
    </section>
  )
}
