import Link from 'next/link'

const links = {
  Services: ['/services', 'Revenue Audit', 'Web Systems', 'Automation', 'Paid Ads'],
  Company: ['/about', 'About', 'Projects', 'Contact'],
  Legal: ['#', 'Privacy Policy', 'Terms of Service'],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="font-display font-bold text-xl mb-4">
              <span className="text-textPrimary">Vena</span>
              <span style={{ color: '#FFD700' }}>%</span>
              <span className="text-textPrimary">Revenue</span>
            </div>
            <p className="text-textMuted text-sm leading-relaxed max-w-xs">
              We don't build websites. We build revenue systems. AI-powered infrastructure for modern B2B and high-ticket businesses.
            </p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="text-xs font-bold tracking-widest uppercase text-textMuted mb-4">{section}</div>
              <ul className="space-y-2">
                {items.slice(1).map((item, i) => (
                  <li key={item}>
                    <Link href={items[0]} className="text-sm text-textMuted hover:text-textPrimary transition-colors duration-200">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-textMuted text-sm">
            © {new Date().getFullYear()} Vena%Revenue. All rights reserved.
          </p>
          <p className="text-textMuted text-xs">
            Built with the same infrastructure we sell.
          </p>
        </div>
      </div>
    </footer>
  )
}
