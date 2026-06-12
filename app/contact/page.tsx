'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/ui/AnimatedSection'

const steps = [
  {
    id: 1,
    title: 'Tell us who you are.',
    subtitle: 'We research every lead before we respond. This helps us show up prepared.',
    fields: [
      { name: 'name', label: 'Your Name', type: 'text', placeholder: 'First and last name' },
      { name: 'business', label: 'Business Name', type: 'text', placeholder: 'Company or practice name' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
    ],
  },
  {
    id: 2,
    title: 'Tell us about the business.',
    subtitle: 'We need context to know if we can help — and where the biggest opportunity is.',
    fields: [
      { name: 'revenue', label: 'Estimated Monthly Revenue', type: 'select', options: ['Under $50K', '$50K–$200K', '$200K–$500K', '$500K–$1M', '$1M+'] },
      { name: 'adspend', label: 'Monthly Ad Spend', type: 'select', options: ['None', 'Under $2K', '$2K–$10K', '$10K–$50K', '$50K+'] },
      { name: 'industry', label: 'Industry / Niche', type: 'text', placeholder: 'e.g. Personal Injury Law, MedSpa, SaaS' },
    ],
  },
  {
    id: 3,
    title: 'What\'s the biggest leak?',
    subtitle: 'Be specific. The more detail you give, the more precise the audit becomes.',
    fields: [
      { name: 'problem', label: 'Describe Your Main Challenge', type: 'textarea', placeholder: 'e.g. We run Google Ads but our conversion rate is under 1%. Leads come in but our team is slow to respond...' },
      { name: 'budget', label: 'Budget Range for a Fix', type: 'select', options: ['Under $5K', '$5K–$15K', '$15K–$30K', '$30K–$75K', '$75K+'] },
    ],
  },
]

export default function ContactPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const isStepValid = () => {
    return step.fields.every((f) => formData[f.name]?.trim())
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
            <h2 className="font-display font-bold text-4xl text-textPrimary mb-4">We've received your brief.</h2>
            <p className="text-textMuted text-lg leading-relaxed mb-8">
              Our team is already researching <strong className="text-textPrimary">{formData.business}</strong>. Expect a Loom video from us within 24 hours showing exactly where the revenue is leaking — and how we'd fix it.
            </p>
            <div className="glass border border-aqua/20 rounded-2xl p-6">
              <p className="text-textMuted text-sm">
                <span className="text-aqua font-semibold">What happens next:</span> We'll record a personalized 90-second breakdown of your primary revenue leak. No calendar link. No discovery call. Just answers.
              </p>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
        {/* Bg */}
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,212,0.05) 0%, transparent 70%)' }} />

        <div className="max-w-2xl mx-auto px-6">
          <AnimatedSection className="mb-12 text-center">
            <span className="text-aqua text-xs font-bold tracking-[0.3em] uppercase block mb-4">Start Here</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-textPrimary mb-4">
              Let's find your{' '}
              <span className="gradient-text">revenue leaks.</span>
            </h1>
            <p className="text-textMuted">
              3 quick steps. We handle everything else.
            </p>
          </AnimatedSection>

          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between text-xs text-textMuted mb-3">
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
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 md:p-10"
              >
                <h2 className="font-display font-bold text-2xl text-textPrimary mb-2">{step.title}</h2>
                <p className="text-textMuted text-sm mb-8">{step.subtitle}</p>

                <div className="space-y-5">
                  {step.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-textMuted mb-2">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-textPrimary text-sm focus:border-aqua/40 focus:outline-none focus:ring-1 focus:ring-aqua/20 transition-all duration-200 appearance-none"
                        >
                          <option value="" disabled>Select an option</option>
                          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-textPrimary text-sm placeholder-textMuted focus:border-aqua/40 focus:outline-none focus:ring-1 focus:ring-aqua/20 transition-all duration-200 resize-none"
                        />
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleField(field.name, e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-textPrimary text-sm placeholder-textMuted focus:border-aqua/40 focus:outline-none focus:ring-1 focus:ring-aqua/20 transition-all duration-200"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-8">
                  {currentStep > 0 ? (
                    <button onClick={handleBack} className="btn-ghost text-sm py-2.5 px-5">
                      ← Back
                    </button>
                  ) : <div />}

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="btn-primary text-sm py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span>Continue →</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!isStepValid()}
                      className="btn-primary text-sm py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span>Send Brief →</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Trust line */}
          <p className="text-center text-textMuted text-xs mt-6">
            No calendar link. No sales call. We respond with a Loom video showing your specific revenue leak.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
