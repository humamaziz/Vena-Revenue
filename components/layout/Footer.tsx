import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="font-display font-bold text-xl mb-4">
              <span className="text-white">Vena</span>
              <span style={{ color: '#FFD700' }}>%</span>
              <span className="text-white">Revenue</span>
            </div>
            <p className="text-[#8892A4] text-sm leading-relaxed max-w-xs">
              We build the complete AI-discovery-to-autonomous-sales-execution loop natively into your web infrastructure. GEO intelligence meets AI agent orchestration.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-[#8892A4] mb-4">Services</div>
            <ul className="space-y-2">
              {['Revenue Diagnostic', 'Web Revenue Systems', 'AI Agent Pipelines', 'GEO Intelligence', 'Algorithm Defense'].map((s) => (
                <li key={s}><Link href="/services" className="text-sm text-[#8892A4] hover:text-white transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-[#8892A4] mb-4">Company</div>
            <ul className="space-y-2">
              {[['About', '/about'], ['Projects', '/projects'], ['Client Portal', '/client'], ['Contact', '/contact']].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm text-[#8892A4] hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-[#8892A4] mb-4">Legal</div>
            <ul className="space-y-2">
              {[['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms']].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm text-[#8892A4] hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#8892A4] text-sm">© {new Date().getFullYear()} Vena%Revenue. All rights reserved.</p>
          <p className="text-[#8892A4] text-xs">Built with the same infrastructure we sell.</p>
        </div>
      </div>
    </footer>
  )
}
