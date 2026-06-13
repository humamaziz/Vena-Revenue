'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

const leaks = [
  {
    icon: '🤖',
    title: 'The AI Invisibility Leak',
    stat: '0',
    statLabel: 'times your name appears in AI search',
    desc: 'A high-intent buyer opens ChatGPT or Perplexity and types "best [your service] in [your city]." Three competitors appear. You do not exist. This is not a ranking problem — it is a structural invisibility problem. And it happens on every search, every day, without you knowing.',
    color: '#7B61FF',
    vector: 'Vector 1',
  },
  {
    icon: '📞',
    title: 'The Ghosted Lead Bleed',
    stat: '391%',
    statLabel: 'higher conversion if responded to in 5 minutes',
    desc: 'A lead responds to your ad at 9 PM. Nobody responds until morning. By then they have already hired the competitor who answered first. Leads go cold in under 48 hours. Most go cold in under 4. You are paying to acquire inquiries and then watching them expire in your own inbox.',
    color: '#FF4D6D',
    vector: 'Vector 2',
  },
  {
    icon: '📋',
    title: 'The Form Friction Wall',
    stat: '11%',
    statLabel: 'drop-off per extra form field',
    desc: 'They decided to book. They clicked the CTA. Then your 8-field intake form killed the deal — silently, invisibly. Every additional form field drops completion rate by 11%. You have built a qualification wall at the exact moment someone is trying to give you money.',
    color: '#F59E0B',
    vector: 'Vector 3',
  },
  {
    icon: '💸',
    title: 'The Ad Spend Hemorrhage',
    stat: '53%',
    statLabel: 'of mobile users abandon a page taking 3+ seconds',
    desc: 'Your landing page loads in 5.1 seconds on mobile. Your tracking parameters are being stripped on page load. Your campaigns are running blind — budget optimization based on corrupted data, pushing cost-per-acquisition higher every week. You are not running an ad problem. You are running a funnel integrity problem.',
    color: '#00F5D4',
    vector: 'Vector 4',
  },
]

export default function ProblemSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ['0%', '100%'])

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,77,109,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-4">
          <span className="text-[#FF4D6D] text-xs font-bold tracking-[0.3em] uppercase">Chapter 01 — The Problem</span>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <AnimatedSection>
            <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-tight">
              Your business is not bleeding.{' '}
              <span className="gradient-text-fire">It is hemorrhaging.</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-[#8892A4] text-lg leading-relaxed">
              Most business owners assume they have a marketing problem. More ads, more content, more outreach. But the revenue is not dying at acquisition — it is dying <strong className="text-white">after</strong> the interest is already there. The systems that were supposed to catch buyers are actively pushing them away. We call these Revenue Leaks. They exist in every business we have ever audited.
            </p>
          </AnimatedSection>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/[0.04] hidden lg:block">
            <motion.div className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#FF4D6D] via-[#7B61FF] to-[#00F5D4]"
              style={{ height: lineHeight }} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {leaks.map((leak, i) => (
              <AnimatedSection key={leak.title} delay={i * 0.12} direction="up">
                <div className="glass border border-white/[0.06] rounded-2xl p-6 group hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{leak.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                          style={{ color: leak.color, borderColor: `${leak.color}30`, backgroundColor: `${leak.color}10` }}>
                          {leak.vector}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-white">{leak.title}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-display font-bold text-2xl" style={{ color: leak.color }}>{leak.stat}</span>
                        <span className="text-xs text-[#8892A4]">{leak.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[#8892A4] text-sm leading-relaxed">{leak.desc}</p>
                  <div className="mt-4 h-px w-0 group-hover:w-full transition-all duration-700"
                    style={{ background: `linear-gradient(90deg, ${leak.color}, transparent)` }} />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <AnimatedSection delay={0.3} className="mt-20">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,77,109,0.06) 0%, rgba(123,97,255,0.06) 100%)' }} />
            <div className="absolute inset-0 border border-[#FF4D6D]/10 rounded-3xl" />
            <div className="relative p-10 md:p-16 text-center">
              <p className="font-display font-bold text-3xl md:text-4xl xl:text-5xl text-white max-w-3xl mx-auto leading-tight">
                &quot;You are not losing leads.{' '}
                <span className="gradient-text-fire">You are losing revenue quietly</span> — and your dashboard will never show you where.&quot;
              </p>
              <p className="text-[#8892A4] mt-6 text-lg">
                The average business we audit loses{' '}
                <span className="text-[#FF4D6D] font-bold">$12,000–$85,000/year</span> to fixable system failures.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
