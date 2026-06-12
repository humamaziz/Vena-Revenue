'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

const leaks = [
  {
    icon: '📞',
    title: 'The Silent Miss',
    stat: '78%',
    statLabel: 'of missed calls never call back',
    desc: "A potential client reaches out at 9 PM. Nobody responds. By morning, they've already hired your competitor.",
    color: '#FF4D6D',
  },
  {
    icon: '🤖',
    title: 'The AI Ghost',
    stat: '0',
    statLabel: 'times your name appears in AI search',
    desc: "When a buyer asks ChatGPT who the best provider is in your city, three competitors appear. You don't exist.",
    color: '#7B61FF',
  },
  {
    icon: '📋',
    title: 'The Form Wall',
    stat: '11%',
    statLabel: 'drop-off per extra form field',
    desc: "They decided to book. They clicked the button. Then your 9-field intake form killed the deal silently.",
    color: '#F59E0B',
  },
  {
    icon: '💸',
    title: 'The Ad Drain',
    stat: '$0',
    statLabel: 'return on ad spend with broken tracking',
    desc: "You're writing checks to Google every month. Broken pixels and slow landing pages mean you're training the algorithm on corrupted data.",
    color: '#00F5D4',
  },
]

export default function ProblemSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ['0%', '100%'])

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,77,109,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Chapter label */}
        <AnimatedSection className="mb-4">
          <span className="text-pink text-xs font-bold tracking-[0.3em] uppercase">Chapter 01 — The Problem</span>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <AnimatedSection>
            <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight">
              Your business isn't bleeding.{' '}
              <span className="gradient-text-fire">It's hemorrhaging.</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-textMuted text-lg leading-relaxed">
              Most business owners assume they have a marketing problem. More ads, more content, more outreach. But the revenue isn't dying at acquisition — it's dying <strong className="text-textPrimary">after</strong> the interest is already there. The systems that were supposed to catch buyers are actively pushing them away.
            </p>
            <p className="text-textMuted text-lg leading-relaxed mt-4">
              We call these <span className="text-pink font-semibold">Revenue Leaks</span>. And they exist in every business we've ever audited.
            </p>
          </AnimatedSection>
        </div>

        {/* Leak cards with connecting timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/[0.05] hidden lg:block">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-pink via-purple to-aqua"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {leaks.map((leak, i) => (
              <AnimatedSection key={leak.title} delay={i * 0.15} direction="up">
                <div className="relative pl-16 lg:pl-0">
                  {/* Timeline dot (mobile only) */}
                  <div
                    className="absolute left-6 top-6 w-3 h-3 rounded-full lg:hidden"
                    style={{ backgroundColor: leak.color, boxShadow: `0 0 12px ${leak.color}` }}
                  />

                  <div className="glass border border-white/[0.06] rounded-2xl p-6 group hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-3xl">{leak.icon}</div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-textPrimary">{leak.title}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-display font-bold text-2xl" style={{ color: leak.color }}>{leak.stat}</span>
                          <span className="text-xs text-textMuted">{leak.statLabel}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-textMuted text-sm leading-relaxed">{leak.desc}</p>

                    {/* Bottom accent */}
                    <div className="mt-4 h-px w-0 group-hover:w-full transition-all duration-700"
                      style={{ background: `linear-gradient(90deg, ${leak.color}, transparent)` }} />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Hard truth callout */}
        <AnimatedSection delay={0.3} className="mt-20">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,77,109,0.08) 0%, rgba(123,97,255,0.08) 100%)' }} />
            <div className="absolute inset-0 border border-pink/10 rounded-3xl" />
            <div className="relative p-10 md:p-16 text-center">
              <p className="font-display font-bold text-3xl md:text-4xl xl:text-5xl text-textPrimary max-w-3xl mx-auto leading-tight">
                "You're not losing leads.{' '}
                <span className="gradient-text-fire">You're losing revenue quietly</span> — and your dashboard will never show you where."
              </p>
              <p className="text-textMuted mt-6 text-lg">
                The average business we audit loses{' '}
                <span className="text-pink font-bold">$12,000–$85,000/year</span> to fixable system failures.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
