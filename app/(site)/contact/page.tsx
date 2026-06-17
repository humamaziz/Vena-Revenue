'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/ui/AnimatedSection'

// ── FORM CONFIG ────────────────────────────────────────────────────────────────
// Step 3 ("biggest leak / problem") removed intentionally.
// The client does NOT know their leak — that is precisely what they are paying for.
// Location is added so we can run geo-accurate competitor comparisons in the audit.

const steps = [
  {
    id: 1,
    title: 'Tell us who you are.',
    subtitle: 'We research every submission before we respond. This lets us show up with the answers already in hand.',
    fields: [
      { name: 'name',     label: 'Your Name',        type: 'text',  placeholder: 'First and last name',              required: true  },
      { name: 'business', label: 'Business Name',    type: 'text',  placeholder: 'Company or practice name',         required: true  },
      { name: 'email',    label: 'Email Address',    type: 'email', placeholder: 'your@email.com',                   required: true  },
      { name: 'website',  label: 'Website URL',      type: 'url',   placeholder: 'https://yourbusiness.com',          required: true  },
      { name: 'location', label: 'Business Location', type: 'text', placeholder: 'e.g. Houston, TX, USA — or Delhi, India', required: true },
    ],
  },
  {
    id: 2,
    title: 'Tell us about the business.',
    subtitle: 'This context lets us pinpoint where the biggest leak is before the audit even begins.',
    fields: [
      {
        name: 'industry', label: 'Industry / Niche', type: 'text',
        placeholder: 'e.g. Personal Injury Law, MedSpa, B2B SaaS, Boutique Hotel',
        required: true,
      },
      {
        name: 'revenue', label: 'Estimated Monthly Revenue', type: 'select', required: true,
        options: ['Under $50K', '$50K–$200K', '$200K–$500K', '$500K–$1M', '$1M+'],
      },
      {
        name: 'adspend', label: 'Monthly Ad Spend', type: 'select', required: false,
        options: ['None', 'Under $2K', '$2K–$10K', '$10K–$50K', '$50K+'],
      },
      {
        name: 'goal', label: 'Primary Goal', type: 'select', required: true,
        options: [
          'Get more qualified leads',
          'Higher conversion rate',
          'Faster lead response',
          'AI search visibility',
          'Reduce ad spend waste',
          'Full system rebuild',
        ],
      },
      {
        name: 'budget', label: 'Budget Range', type: 'select', required: false,
        options: ['Under $5K', '$5K–$15K', '$15K–$30K', '$30K–$75K', '$75K+'],
      },
    ],
  },
]

interface Field {
  name: string
  label: string
  type: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export default function ContactPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [leadId, setLeadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleField = (name: string, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }))

  const isStepValid = () =>
    step.fields.filter((f) => f.required).every((f) => formData[f.name]?.trim())

  const handleNext = () => {
    if (isStepValid() && currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
  }
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    if (!isStepValid()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setLeadId(data.leadId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── SUCCESS STATE ────────────────────────────────────────────────────────────
  if (leadId) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-xl w-full"
          >
            <div className="text-5xl mb-6">✅</div>
            <h2 className="font-display font-bold text-4xl text-white mb-3">
              Brief received.
            </h2>
            <p className="text-[#8892A4] text-lg leading-relaxed mb-10">
              Our team will start researching{' '}
              <span className="text-white font-semibold">{formData.business}</span> in{' '}
              <span className="text-white font-semibold">{formData.location}</span>. Expect a
              90-second Loom video from us within 48 hours showing exactly where the revenue is
              leaking - compared to the top competitor in your market doing the same thing.
            </p>

            {/* Payment CTA */}
            <div className="glass border border-[#00F5D4]/20 rounded-2xl p-8 mb-5 text-left">
              <div className="flex items-start gap-4 mb-5">
                <div className="text-3xl flex-shrink-0">⚡</div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white mb-1">
                    Want to move to the front of the queue?
                  </h3>
                  <p className="text-[#8892A4] text-sm leading-relaxed">
                    Pay for your audit now and we prioritize your research immediately. Delivered
                    in 24 hours guaranteed. The full fee is credited 100% toward the build if you
                    sign within 14 days.
                  </p>
                </div>
              </div>
              <Link
                href={`/pay?leadId=${leadId}`}
                className="btn-primary w-full justify-center text-base py-3.5"
              >
                <span>Choose Your Audit Tier and Pay Now →</span>
              </Link>
            </div>

            <div className="glass border border-white/[0.06] rounded-xl p-5 text-left">
              <p className="text-[#8892A4] text-sm leading-relaxed">
                <span className="text-white font-semibold">Prefer to wait?</span>{' '}
                No problem. We will send the Loom breakdown first - you decide after seeing what
                we found. Track your status below.
              </p>
              <Link
                href="/client"
                className="inline-flex items-center gap-2 text-[#00F5D4] text-sm mt-3 hover:underline"
              >
                Track your audit status →
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  // ── FORM ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,212,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-2xl mx-auto px-6">
          <AnimatedSection className="mb-12 text-center">
            <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase block mb-4">
              Start Here
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Find your <span className="gradient-text">revenue leaks.</span>
            </h1>
            <p className="text-[#8892A4] max-w-md mx-auto">
              2 steps. We send a 90-second Loom within 24 hours showing exactly where your
              business is leaking money — and who in your market is capturing it instead.
            </p>
          </AnimatedSection>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex justify-between text-xs text-[#8892A4] mb-3">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #00F5D4, #7B61FF)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            {/* Step labels */}
            <div className="flex justify-between mt-2">
              {steps.map((s, i) => (
                <span
                  key={s.id}
                  className={`text-[10px] font-medium ${
                    i <= currentStep ? 'text-[#00F5D4]' : 'text-[#8892A4]'
                  }`}
                >
                  {s.title.split('.')[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Step card */}
          <div className="glass border border-white/[0.08] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 md:p-10"
              >
                <h2 className="font-display font-bold text-2xl text-white mb-1.5">
                  {step.title}
                </h2>
                <p className="text-[#8892A4] text-sm mb-8">{step.subtitle}</p>

                <div className="space-y-5">
                  {step.fields.map((field: Field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-[#8892A4] mb-2">
                        {field.label}
                        {!field.required && (
                          <span className="ml-1.5 text-[10px] text-[#8892A4]/60 font-normal">
                            optional
                          </span>
                        )}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-[#131823] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:border-[#00F5D4]/40 focus:outline-none transition-all duration-200"
                        >
                          <option value="" disabled>
                            Select an option
                          </option>
                          {field.options?.map((o) => (
                            <option key={o} value={o} className="bg-[#131823] text-white">
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-[#8892A4] focus:border-[#00F5D4]/40 focus:outline-none transition-all duration-200"
                        />
                      )}

                      {/* Location helper hint */}
                      {field.name === 'location' && (
                        <p className="mt-1.5 text-[11px] text-[#8892A4]">
                          Be specific — we will compare you against the top performer in your exact
                          city and market.
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

                <div className="flex items-center justify-between mt-8">
                  {currentStep > 0 ? (
                    <button onClick={handleBack} className="btn-ghost text-sm py-2.5 px-5">
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="btn-primary text-sm py-2.5 px-8 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Continue →</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!isStepValid() || loading}
                      className="btn-primary text-sm py-2.5 px-8 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>{loading ? 'Submitting...' : 'Send Brief →'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Trust footer */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-[#8892A4] text-xs">
            <div className="flex items-center gap-1.5">
              <span>🔒</span> No discovery call required
            </div>
            <div className="flex items-center gap-1.5">
              <span>⏱</span> 90-sec Loom within 24 hours
            </div>
            <div className="flex items-center gap-1.5">
              <span>↩</span> 2x ROI guarantee or instant refund
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}