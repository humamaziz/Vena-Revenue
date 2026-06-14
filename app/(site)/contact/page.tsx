'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/ui/AnimatedSection'

const steps = [
  {
    id: 1,
    title: 'Who are you?',
    subtitle: 'We research every submission before responding — this lets us show up with answers, not questions.',
    fields: [
      { name: 'name', label: 'Your Name', type: 'text', placeholder: 'First and last name' },
      { name: 'business', label: 'Business Name', type: 'text', placeholder: 'Company or practice name' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
      { name: 'website', label: 'Website URL', type: 'url', placeholder: 'https://yourbusiness.com' },
    ],
  },
  {
    id: 2,
    title: 'Tell us about the business.',
    subtitle: 'Context lets us pinpoint your biggest leak before the audit even starts.',
    fields: [
      { name: 'industry', label: 'Industry / Niche', type: 'text', placeholder: 'e.g. Personal Injury Law, MedSpa, B2B SaaS' },
      { name: 'revenue', label: 'Estimated Monthly Revenue', type: 'select', options: ['Under $50K', '$50K–$200K', '$200K–$500K', '$500K–$1M', '$1M+'] },
      { name: 'adspend', label: 'Monthly Ad Spend', type: 'select', options: ['None', 'Under $2K', '$2K–$10K', '$10K–$50K', '$50K+'] },
    ],
  },
  {
    id: 3,
    title: 'What is the biggest leak?',
    subtitle: 'Specificity makes the audit sharper. The more honest you are, the more precise the fix map.',
    fields: [
      { name: 'problem', label: 'Describe Your Main Challenge', type: 'textarea', placeholder: 'e.g. We run Google Ads but conversion rate is under 1%. Leads come in but our team is slow to respond. We are invisible on AI search engines...' },
      { name: 'goal', label: 'Primary Goal', type: 'select', options: ['More qualified leads', 'Higher conversion rate', 'Faster lead response', 'AI search visibility', 'Reduce ad spend waste', 'Full system rebuild'] },
      { name: 'budget', label: 'Budget Range for a Fix', type: 'select', options: ['Under $5K', '$5K–$15K', '$15K–$30K', '$30K–$75K', '$75K+'] },
    ],
  },
]

export default function ContactPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleField = (name: string, value: string) => setFormData((prev) => ({ ...prev, [name]: value }))

  const isStepValid = () => step.fields.every((f) => formData[f.name]?.trim())

  const handleNext = () => { if (isStepValid() && currentStep < steps.length - 1) setCurrentStep((s) => s + 1) }
  const handleBack = () => { if (currentStep > 0) setCurrentStep((s) => s - 1) }

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
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-lg"
          >
            <div className="text-6xl mb-6">✅</div>
            <h2 className="font-display font-bold text-4xl text-white mb-4">Brief received.</h2>
            <p className="text-[#8892A4] text-lg leading-relaxed mb-8">
              Our team is already researching <strong className="text-white">{formData.business}</strong>. Expect a 90-second Loom video from us within 24 hours showing exactly where the revenue is leaking — and what we would do about it.
            </p>
            <div className="glass border border-[#00F5D4]/20 rounded-2xl p-6 mb-6">
              <p className="text-[#8892A4] text-sm leading-relaxed">
                <span className="text-[#00F5D4] font-semibold">What happens next:</span> No calendar link. No discovery call. We will send a personalized Loom walking through your primary revenue leak. You will have our full analysis before we speak.
              </p>
            </div>
            <Link href="/client" className="btn-ghost text-sm py-2.5 px-6">
              Track Your Audit Status →
            </Link>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,212,0.05) 0%, transparent 70%)' }} />

        <div className="max-w-2xl mx-auto px-6">
          <AnimatedSection className="mb-12 text-center">
            <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase block mb-4">Start Here</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Find your <span className="gradient-text">revenue leaks.</span>
            </h1>
            <p className="text-[#8892A4]">3 steps. We deliver a 90-second Loom within 24 hours. No discovery call required.</p>
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
                <h2 className="font-display font-bold text-2xl text-white mb-2">{step.title}</h2>
                <p className="text-[#8892A4] text-sm mb-8">{step.subtitle}</p>

                <div className="space-y-5">
                  {step.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-[#8892A4] mb-2">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-[#131823] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:border-[#00F5D4]/40 focus:outline-none transition-all duration-200"
                        >
                          <option value="" disabled>Select an option</option>
                          {field.options?.map((o) => <option key={o} value={o} className="bg-[#131823] text-white">{o}</option>)}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-[#8892A4] focus:border-[#00F5D4]/40 focus:outline-none transition-all duration-200 resize-none"
                        />
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-[#8892A4] focus:border-[#00F5D4]/40 focus:outline-none transition-all duration-200"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

                <div className="flex items-center justify-between mt-8">
                  {currentStep > 0 ? (
                    <button onClick={handleBack} className="btn-ghost text-sm py-2.5 px-5">← Back</button>
                  ) : <div />}
                  {currentStep < steps.length - 1 ? (
                    <button onClick={handleNext} disabled={!isStepValid()} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed">
                      <span>Continue →</span>
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={!isStepValid() || loading} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed">
                      <span>{loading ? 'Submitting...' : 'Send Brief →'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-[#8892A4] text-xs mt-6">
            No calendar link. No sales call. We respond with a Loom showing your specific revenue leak.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
