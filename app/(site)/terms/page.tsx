import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  const sections = [
    {
      title: '1. Services',
      content: `Vena%Revenue provides revenue audit and optimization services including diagnostic reports, web development, AI agent implementation, and ongoing algorithm defense retainers. The specific deliverables, timelines, and pricing for each engagement are confirmed in writing before work begins.`,
    },
    {
      title: '2. Audit Delivery & Guarantee',
      content: `Standard diagnostic reports are delivered within 48 hours of payment confirmation. If our audit does not identify at least 2× its cost in documented, recoverable revenue leaks, we will issue a full refund upon request within 7 days of delivery. This guarantee applies to the diagnostic report only and does not extend to implementation services.`,
    },
    {
      title: '3. Payment Terms',
      content: `All diagnostics and one-time services are paid in full before work begins. Implementation builds require a 50% deposit upon contract signing with the remaining balance due at project completion. Retainer services are billed monthly in advance. All fees are non-refundable except where our audit guarantee applies.`,
    },
    {
      title: '4. Client Responsibilities',
      content: `Clients are responsible for providing accurate information during the audit request process. Clients must provide necessary access (website admin, analytics, CRM) within 5 business days of project start. Delays caused by client inaction may affect delivery timelines without penalty to Vena%Revenue.`,
    },
    {
      title: '5. Intellectual Property',
      content: `Upon full payment, clients own all deliverables produced for their specific project including audit reports, code, and content. Vena%Revenue retains the right to reference the engagement (without disclosing confidential data) in our marketing materials unless the client requests otherwise in writing.`,
    },
    {
      title: '6. Confidentiality',
      content: `Both parties agree to keep confidential any proprietary business information shared during the engagement. This includes client financial data, internal systems, and strategic plans. This obligation survives termination of the engagement for a period of 3 years.`,
    },
    {
      title: '7. Limitation of Liability',
      content: `Vena%Revenue is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability for any claim related to a specific engagement is limited to the fees paid for that engagement. We do not guarantee specific revenue outcomes from implementation services.`,
    },
    {
      title: '8. Termination',
      content: `Either party may terminate an ongoing retainer agreement with 30 days written notice. For project-based work, termination by the client after work has begun forfeits any deposits paid. Termination by Vena%Revenue due to client breach results in a prorated refund of any unused fees.`,
    },
    {
      title: '9. Governing Law',
      content: `These terms are governed by applicable law. Any disputes arising from these terms or our services will be resolved through good-faith negotiation first, and if necessary, binding arbitration.`,
    },
    {
      title: '10. Modifications',
      content: `We reserve the right to update these terms at any time. Active clients will be notified of material changes via email. Continued use of our services after notification constitutes acceptance of the updated terms.`,
    },
  ]

  return (
    <>
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase block mb-4">Legal</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">Terms of Service</h1>
            <p className="text-[#8892A4]">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <p className="text-[#8892A4] leading-relaxed mb-10">
            These Terms of Service govern your use of Vena%Revenue&apos;s website and services. By submitting an audit request or engaging our services, you agree to these terms. Please read them carefully before proceeding.
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="glass border border-white/[0.06] rounded-xl p-6">
                <h2 className="font-display font-bold text-lg text-white mb-3">{section.title}</h2>
                <p className="text-[#8892A4] leading-relaxed text-sm">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 glass border border-[#00F5D4]/10 rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-white mb-2">Questions?</h2>
            <p className="text-[#8892A4] text-sm leading-relaxed">
              Contact us through the{' '}
              <a href="/contact" className="text-[#00F5D4] hover:underline">contact form</a> for any questions about these terms before engaging our services.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
