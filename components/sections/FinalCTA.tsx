'use client'

import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function FinalCTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Full-bleed gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,245,212,0.08) 0%, rgba(123,97,255,0.08) 50%, transparent 80%)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection className="mb-6">
          <span className="text-aqua text-xs font-bold tracking-[0.3em] uppercase">The Decision Point</span>
        </AnimatedSection>

        <AnimatedSection className="mb-8">
          <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-7xl leading-tight">
            Every day this runs<br />
            <span className="gradient-text">is another day of revenue</span><br />
            going unrecovered.
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mb-12">
          <p className="text-textMuted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            The businesses that win in the next 3 years won't be the ones with the biggest budgets. They'll be the ones with the most intelligent infrastructure. The audit starts at $1,500. The leaks we find are worth multiples of that.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/contact" className="btn-primary text-base py-4 px-10">
            <span>Get My Revenue Audit →</span>
          </Link>
          <Link href="/services" className="btn-ghost text-base py-4 px-10">
            View Full Services
          </Link>
        </AnimatedSection>

        {/* Trust badges */}
        <AnimatedSection delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-8 text-textMuted text-sm">
            <div className="flex items-center gap-2">
              <span className="text-aqua">✓</span>
              <span>2× ROI guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-aqua">✓</span>
              <span>48-hour delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-aqua">✓</span>
              <span>Full refund if underwhelmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-aqua">✓</span>
              <span>No calendar links. No discovery calls.</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
