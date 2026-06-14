import Footer from '@/components/layout/Footer'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `When you submit an audit request through our website, we collect the information you provide including your name, email address, business name, website URL, industry, revenue metrics, and a description of your business challenges. We also collect standard server logs including IP addresses, browser type, and pages visited.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information you provide solely to deliver the services you have requested: generating revenue audit reports, sending follow-up communications relevant to your audit, and improving the quality of our diagnostic methodology. We do not sell, rent, or share your personal information with third parties for marketing purposes.`,
    },
    {
      title: '3. Email Communications',
      content: `By submitting our audit form, you consent to receiving email communications from Vena%Revenue related to your audit, including the audit report, follow-up questions, and service recommendations. You may opt out of future communications at any time by replying to any email with "unsubscribe" in the subject line.`,
    },
    {
      title: '4. Data Storage & Security',
      content: `Your data is stored in a secured database. We use industry-standard encryption and security practices. Access to your data is restricted to our team members who require it to deliver your audit. We retain your data for a maximum of 24 months from your last interaction with us.`,
    },
    {
      title: '5. Payment Processing',
      content: `Payments are processed via Stripe, a PCI-compliant payment processor. Vena%Revenue does not store, process, or have access to your full payment card information. All payment data is handled exclusively by Stripe under their privacy policy and security standards.`,
    },
    {
      title: '6. Cookies',
      content: `We use essential cookies to operate the website and optional analytics cookies to understand how visitors use our site. You can disable cookies in your browser settings, though this may affect certain features of the site.`,
    },
    {
      title: '7. Your Rights',
      content: `You have the right to request access to the personal data we hold about you, request correction or deletion of your data, and withdraw consent for any communications. To exercise these rights, contact us at the email address listed on our contact page.`,
    },
    {
      title: '8. Changes to This Policy',
      content: `We may update this privacy policy from time to time. We will notify active clients of material changes by email. Continued use of our services after changes are posted constitutes acceptance of the updated policy.`,
    },
  ]

  return (
    <>
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase block mb-4">Legal</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">Privacy Policy</h1>
            <p className="text-[#8892A4]">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <p className="text-[#8892A4] leading-relaxed mb-10">
            Vena%Revenue (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the privacy of our clients and website visitors. This policy describes how we collect, use, and protect your personal information when you use our website or services.
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
            <h2 className="font-display font-bold text-lg text-white mb-2">Contact</h2>
            <p className="text-[#8892A4] text-sm leading-relaxed">
              For any privacy-related questions or requests, contact us through the{' '}
              <a href="/contact" className="text-[#00F5D4] hover:underline">contact form</a> on our website.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
