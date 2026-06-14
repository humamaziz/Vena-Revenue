'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ClientData {
  name: string
  status: string
  paid: boolean
  audit: string | null
  preview: string | null
  pdfUrl: string | null
  loomUrl: string | null
  createdAt: string
  interactions: Array<{ type: string; createdAt: string }>
}

const STATUS_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  new: { label: 'Received', desc: 'Your brief has been received. Our team is reviewing it.', color: '#60A5FA' },
  reviewed: { label: 'In Review', desc: 'Our analysts are working on your audit right now.', color: '#F59E0B' },
  approved: { label: 'Ready', desc: 'Your audit is complete and being prepared for delivery.', color: '#7B61FF' },
  sent: { label: 'Delivered', desc: 'Your audit has been sent. Check your email inbox.', color: '#00F5D4' },
}

export default function ClientPortal() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<ClientData | null>(null)

  const handleLookup = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/client/get-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Not found'); return }
      setData(json.lead)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = data ? (STATUS_LABELS[data.status] ?? STATUS_LABELS.new) : null

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,212,0.05) 0%, transparent 70%)' }} />

      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-[#00F5D4] text-xs font-bold tracking-[0.3em] uppercase block mb-4">Client Portal</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Track Your <span className="gradient-text">Audit</span>
          </h1>
          <p className="text-[#8892A4] text-lg">Enter the email you used when submitting your brief.</p>
        </div>

        {!data ? (
          <div className="glass border border-white/[0.08] rounded-2xl p-8">
            <label className="block text-sm font-medium text-[#8892A4] mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="your@email.com"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/40 mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={handleLookup}
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              <span>{loading ? 'Looking up...' : 'Access My Report →'}</span>
            </button>
            <p className="text-center text-[#8892A4] text-xs mt-4">
              {"Haven't submitted yet?"}{' '}
              <Link href="/contact" className="text-[#00F5D4] hover:underline">Get your audit →</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Status card */}
            <div className="glass border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-white">Hi, {data.name}</h2>
                  <p className="text-[#8892A4] text-sm">Submitted {new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusInfo?.color }} />
                  <span className="font-bold text-sm" style={{ color: statusInfo?.color }}>{statusInfo?.label}</span>
                  {data.paid && <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full">PAID</span>}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-[#E6E9F2] text-sm">{statusInfo?.desc}</p>
              </div>
            </div>

            {/* Loom video */}
            {data.loomUrl && (
              <div className="glass border border-[#00F5D4]/20 rounded-2xl p-6 text-center">
                <p className="text-white font-bold mb-3">🎥 Your Personalized Video Breakdown</p>
                <a href={data.loomUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
                  <span>Watch Loom Video →</span>
                </a>
              </div>
            )}

            {/* Audit content */}
            {data.audit ? (
              <div className="glass border border-white/[0.08] rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">Your Revenue Audit</h3>
                <div className="prose prose-invert prose-sm max-w-none">
                  {data.audit.split('\n').map((line, i) => {
                    if (/^\d+\./.test(line.trim())) {
                      return <p key={i} className="font-bold text-[#00F5D4] mt-4 mb-1">{line}</p>
                    }
                    return line.trim() ? <p key={i} className="text-[#C8CDD8] mb-2 text-sm leading-relaxed">{line}</p> : null
                  })}
                </div>
              </div>
            ) : data.preview ? (
              <div className="glass border border-white/[0.08] rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg text-white mb-2">Audit Preview</h3>
                <p className="text-[#8892A4] text-sm mb-4">Your full audit is being prepared. Here is a preview:</p>
                <p className="text-[#C8CDD8] text-sm leading-relaxed">{data.preview}</p>
              </div>
            ) : (
              <div className="glass border border-white/[0.08] rounded-2xl p-6 text-center">
                <p className="text-[#8892A4]">Your audit is being prepared. {"You'll"} receive an email when it is ready.</p>
              </div>
            )}

            {/* PDF download */}
            {data.pdfUrl && (
              <div className="glass border border-[#7B61FF]/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">📄 PDF Report Ready</p>
                  <p className="text-[#8892A4] text-xs">Download your full audit as a formatted PDF</p>
                </div>
                <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm py-2 px-4">
                  Download →
                </a>
              </div>
            )}

            <button onClick={() => { setData(null); setEmail('') }} className="text-sm text-[#8892A4] hover:text-white w-full text-center transition-colors">
              ← Look up different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
