'use client'

import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function FinalCTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,245,212,0.07) 0%, rgba(123,97,255,0.07) 50%, transparent 80%)' }} />

      <div className="max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection className="mb-6">
          <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase">The Decision Point</span>
        </AnimatedSection>

        <AnimatedSection className="mb-8">
          <h2 className="font-display font-bold text-4xl md:text-5xl xl:text-7xl leading-tight">
            Every day this runs<br />
            <span className="gradient-text">is another day of revenue</span><br />
            going unrecovered.
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mb-12">
          <p className="text-[#8892A4] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            The businesses that win in the next three years will not be the ones with the biggest budgets. They will be the ones with the most intelligent infrastructure. By 2027, AI will initiate 95% of seller research workflows. The question is not whether to adapt - it is whether you adapt before or after your competitors do.
          </p>
          <p className="text-[#8892A4] text-lg mt-4 max-w-2xl mx-auto">
            The audit starts at <span className="text-white font-bold">$2,500</span>. The leaks we find are worth multiples of that. The full build is delivered in <span className="text-white font-bold">60–90 days</span>. The audit fee is credited 100% toward the build.
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

        <AnimatedSection delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[#8892A4] text-sm">
            {[
              '2× ROI guarantee or instant refund',
              '48-hour diagnostic delivery',
              '100% fee credited toward build',
              'No discovery calls - just answers',
              '60–90 day full implementation',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-[#00F5D4]">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Live Query CTA block */}
        <AnimatedSection delay={0.5} className="mt-16">
          <div className="glass border border-[#7B61FF]/20 rounded-2xl p-8">
            <p className="text-[#8892A4] text-sm mb-3 uppercase tracking-widest font-bold">The Live Shadow Query</p>
            <p className="text-white text-lg font-medium mb-2">
              Right now, someone is typing into ChatGPT or Perplexity:
            </p>
            <p className="text-[#7B61FF] font-display font-bold text-xl mb-4">
              &quot;Best [your service] in [your city]&quot;
            </p>
            <p className="text-[#8892A4]">
              Three competitors appear. You do not. The audit finds out why - and maps the exact schema architecture that gets your name back in those results.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
