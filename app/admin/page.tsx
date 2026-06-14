'use client'

import { useState, useEffect, useCallback } from 'react'

interface Interaction {
  id: string
  type: string
  content: string
  createdAt: string
}

interface Lead {
  id: string
  name: string
  email: string
  website: string
  industry: string
  goal: string
  revenue: string | null
  adspend: string | null
  budget: string | null
  problem: string | null
  audit: string | null
  preview: string | null
  score: number | null
  priority: string | null
  status: string
  paid: boolean
  pdfUrl: string | null
  loomUrl: string | null
  notes: string | null
  lastContact: string | null
  createdAt: string
  interactions: Interaction[]
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sent: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-green-400',
  medium: 'text-yellow-400',
  low: 'text-red-400',
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string>('')
  const [auditEdit, setAuditEdit] = useState('')
  const [notesEdit, setNotesEdit] = useState('')
  const [loomEdit, setLoomEdit] = useState('')
  const [followupDrafts, setFollowupDrafts] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' }>({ msg: '', type: 'success' })
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [search, setSearch] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000)
  }

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/leads', {
        headers: { Authorization: `Bearer ${adminKey}` },
      })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setLeads(data.leads ?? [])
    } catch {
      showToast('Failed to load leads', 'error')
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  const handleAuth = async () => {
    setAuthError('')
    const res = await fetch('/api/admin/leads', {
      headers: { Authorization: `Bearer ${adminKey}` },
    })
    if (res.ok) {
      setAuthed(true)
      const data = await res.json()
      setLeads(data.leads ?? [])
      setLoading(false)
    } else {
      setAuthError('Invalid admin key. Check your ADMIN_KEY environment variable.')
    }
  }

  const selectLead = (lead: Lead) => {
    setSelected(lead)
    setAuditEdit(lead.audit ?? '')
    setNotesEdit(lead.notes ?? '')
    setLoomEdit(lead.loomUrl ?? '')
    setFollowupDrafts('')
  }

  // Generic admin API caller — returns parsed JSON or null on error
  const callAdmin = useCallback(async (
    endpoint: string,
    body: object,
    successMsg: string
  ): Promise<Record<string, unknown> | null> => {
    setActionLoading(endpoint)
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(body),
      })

      // PDF endpoint returns binary, not JSON
      if (endpoint === 'generate-pdf') {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'PDF generation failed' }))
          showToast(errData.error ?? 'PDF generation failed', 'error')
          return null
        }
        // Download the PDF in the browser
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-${selected?.name?.replace(/\s+/g, '-') ?? 'report'}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showToast('PDF downloaded!', 'success')
        await fetchLeads()
        return { success: true }
      }

      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? `Error from ${endpoint}`, 'error')
        return null
      }
      showToast(successMsg, 'success')
      await fetchLeads()
      return data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error'
      showToast(msg, 'error')
      return null
    } finally {
      setActionLoading('')
    }
  }, [adminKey, fetchLeads, selected])

  const generateAudit = async () => {
    if (!selected) return
    const data = await callAdmin('generate-audit', { leadId: selected.id }, 'Audit generated!')
    if (data?.audit) {
      setAuditEdit(data.audit as string)
      setSelected((prev) =>
        prev ? { ...prev, audit: data.audit as string, preview: data.preview as string, status: 'reviewed' } : prev
      )
    }
  }

  const saveAudit = async () => {
    if (!selected) return
    const data = await callAdmin(
      'update-lead',
      { leadId: selected.id, audit: auditEdit, status: 'approved' },
      'Audit saved & approved!'
    )
    if (data?.success) {
      setSelected((prev) => prev ? { ...prev, audit: auditEdit, status: 'approved' } : prev)
    }
  }

  const saveNotes = async () => {
    if (!selected) return
    await callAdmin('save-notes', { leadId: selected.id, notes: notesEdit }, 'Notes saved!')
    setSelected((prev) => prev ? { ...prev, notes: notesEdit } : prev)
  }

  const saveLoom = async () => {
    if (!selected) return
    await callAdmin('add-loom', { leadId: selected.id, loomUrl: loomEdit }, 'Loom URL saved!')
    setSelected((prev) => prev ? { ...prev, loomUrl: loomEdit } : prev)
  }

  const scoreLead = async () => {
    if (!selected) return
    const res = await callAdmin(
  'score-lead',
  { leadId: selected.id },
  'Lead scored successfully'
)
    if (data) {
      setSelected((prev) =>
        prev ? { ...prev, score: data.score as number, priority: data.priority as string } : prev
      )
    }
  }

  const generateFollowup = async () => {
    if (!selected) return
    const data = await callAdmin('generate-followup', { leadId: selected.id }, 'Follow-up drafts ready!')
    if (data?.drafts) setFollowupDrafts(data.drafts as string)
  }

  const generatePdf = async () => {
    if (!selected) return
    if (!selected.audit) {
      showToast('Generate the AI audit first before creating a PDF.', 'error')
      return
    }
    await callAdmin('generate-pdf', { leadId: selected.id }, 'PDF generated!')
  }

  const sendEmail = async () => {
    if (!selected) return
    if (!selected.audit) {
      showToast('Generate the AI audit first before sending email.', 'error')
      return
    }
    const data = await callAdmin('send-email', { leadId: selected.id }, 'Email sent to client!')
    if (data?.success) {
      setSelected((prev) => prev ? { ...prev, status: 'sent' } : prev)
    }
  }

  const sendFollowup = async (content: string) => {
    if (!selected) return
    await callAdmin('send-followup', { leadId: selected.id, content }, 'Follow-up sent!')
  }

  const filteredLeads = leads.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false
    if (filterPriority !== 'all' && l.priority !== filterPriority) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !l.name.toLowerCase().includes(q) &&
        !l.email.toLowerCase().includes(q) &&
        !l.website.toLowerCase().includes(q) &&
        !l.industry.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    high: leads.filter((l) => l.priority === 'high').length,
    paid: leads.filter((l) => l.paid).length,
  }

  const daysInactive = (l: Lead) => {
    const last = l.lastContact ? new Date(l.lastContact) : new Date(l.createdAt)
    return Math.floor((Date.now() - last.getTime()) / 86400000)
  }

  // Auth screen
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] px-4">
        <div className="glass border border-white/10 rounded-2xl p-10 w-full max-w-sm text-center">
          <div className="font-display font-bold text-2xl mb-1 text-white">
            Vena<span style={{ color: '#FFD700' }}>%</span>Revenue
          </div>
          <p className="text-[#8892A4] text-sm mb-8">Admin CRM — Restricted Access</p>
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm mb-3 focus:outline-none focus:border-[#00F5D4]/40 placeholder-[#8892A4]"
          />
          {authError && (
            <p className="text-red-400 text-xs mb-3 text-left">{authError}</p>
          )}
          <button onClick={handleAuth} className="btn-primary w-full justify-center">
            <span>Access Dashboard</span>
          </button>
          <p className="text-[#8892A4] text-xs mt-4">
            Set <code className="bg-white/10 px-1 rounded">ADMIN_KEY</code> in your .env.local
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E6E9F2]">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border transition-all ${
          toast.type === 'error'
            ? 'glass border-red-500/30 text-red-400'
            : 'glass border-[#00F5D4]/30 text-[#00F5D4]'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-80 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="font-display font-bold text-base mb-3">
              Vena<span style={{ color: '#FFD700' }}>%</span>Revenue{' '}
              <span className="text-[#8892A4] font-normal text-sm">CRM</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[
                { label: 'Total', value: stats.total, color: '#8892A4' },
                { label: 'New', value: stats.new, color: '#60A5FA' },
                { label: 'High', value: stats.high, color: '#34D399' },
                { label: 'Paid', value: stats.paid, color: '#F59E0B' },
              ].map((s) => (
                <div key={s.label} className="text-center bg-white/[0.03] rounded-lg py-1.5 px-1">
                  <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-[#8892A4]">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2"
            />

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Lead list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-[#8892A4] text-sm">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-[#8892A4] text-sm">
                {leads.length === 0 ? 'No leads yet. Submit the contact form to create one.' : 'No leads match your filters.'}
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => selectLead(lead)}
                  className={`w-full text-left p-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                    selected?.id === lead.id ? 'bg-white/[0.06] border-l-2 border-l-[#00F5D4]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-white truncate">{lead.name}</div>
                      <div className="text-xs text-[#8892A4] truncate">{lead.email}</div>
                      <div className="text-xs text-[#8892A4] truncate">{lead.industry}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[lead.status] ?? ''}`}>
                        {lead.status}
                      </span>
                      {lead.priority && (
                        <span className={`text-[10px] font-bold ${PRIORITY_COLORS[lead.priority] ?? ''}`}>
                          {lead.priority}{lead.score != null ? ` ${lead.score}` : ''}
                        </span>
                      )}
                      {lead.paid && (
                        <span className="text-[10px] text-yellow-400 font-bold">PAID</span>
                      )}
                      {daysInactive(lead) >= 3 && lead.status !== 'sent' && (
                        <span className="text-[10px] text-orange-400">⚠ {daysInactive(lead)}d</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── DETAIL PANEL ── */}
        {selected ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-4xl">
              {/* Lead header */}
              <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                  <h1 className="font-display font-bold text-2xl text-white">{selected.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#8892A4]">
                    <a href={`mailto:${selected.email}`} className="hover:text-[#00F5D4] transition-colors">{selected.email}</a>
                    <span>·</span>
                    <a
                      href={selected.website.startsWith('http') ? selected.website : `https://${selected.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#00F5D4] transition-colors"
                    >
                      {selected.website}
                    </a>
                    <span>·</span>
                    <span>{selected.industry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  {selected.paid && (
                    <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-1 rounded-full font-bold">
                      PAID
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[selected.status] ?? ''}`}>
                    {selected.status}
                  </span>
                  {selected.priority && (
                    <span className={`text-xs font-bold ${PRIORITY_COLORS[selected.priority] ?? ''}`}>
                      {selected.priority.toUpperCase()}{selected.score != null ? ` (${selected.score}/100)` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { label: 'Generate Audit (AI)', key: 'generate-audit', action: generateAudit, color: '#00F5D4' },
                  { label: 'Score Lead (AI)', key: 'score-lead', action: scoreLead, color: '#7B61FF' },
                  { label: 'Generate Follow-ups', key: 'generate-followup', action: generateFollowup, color: '#7B61FF' },
                  { label: 'Download PDF', key: 'generate-pdf', action: generatePdf, color: '#8892A4' },
                  { label: 'Send Email', key: 'send-email', action: sendEmail, color: '#34D399' },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={btn.action}
                    disabled={actionLoading === btn.key}
                    className="px-3 py-2 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    style={{
                      borderColor: `${btn.color}40`,
                      color: btn.color,
                      backgroundColor: `${btn.color}10`,
                    }}
                  >
                    {actionLoading === btn.key ? '⏳ Working...' : btn.label}
                  </button>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                {/* LEFT */}
                <div className="space-y-4">
                  {/* Lead info */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Lead Details</h3>
                    <div className="space-y-1.5">
                      {[
                        ['Goal', selected.goal],
                        ['Revenue', selected.revenue],
                        ['Ad Spend', selected.adspend],
                        ['Budget', selected.budget],
                        ['Submitted', new Date(selected.createdAt).toLocaleDateString()],
                        ['Last Contact', selected.lastContact ? new Date(selected.lastContact).toLocaleDateString() : 'Never'],
                      ].map(([k, v]) =>
                        v ? (
                          <div key={k} className="flex gap-2 text-sm">
                            <span className="text-[#8892A4] w-24 flex-shrink-0">{k}</span>
                            <span className="text-white">{v}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                    {selected.problem && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <div className="text-xs text-[#8892A4] mb-1">Main Challenge</div>
                        <p className="text-sm text-[#E6E9F2] leading-relaxed">{selected.problem}</p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Admin Notes</h3>
                    <textarea
                      rows={4}
                      value={notesEdit}
                      onChange={(e) => setNotesEdit(e.target.value)}
                      placeholder="Internal notes — never visible to client..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 resize-none"
                    />
                    <button
                      onClick={saveNotes}
                      disabled={actionLoading === 'save-notes'}
                      className="mt-2 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors disabled:opacity-40"
                    >
                      {actionLoading === 'save-notes' ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>

                  {/* Loom URL */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Loom Video URL</h3>
                    <input
                      type="url"
                      value={loomEdit}
                      onChange={(e) => setLoomEdit(e.target.value)}
                      placeholder="https://loom.com/share/..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2"
                    />
                    <button
                      onClick={saveLoom}
                      disabled={actionLoading === 'add-loom'}
                      className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors disabled:opacity-40"
                    >
                      {actionLoading === 'add-loom' ? 'Saving...' : 'Save Loom URL'}
                    </button>
                  </div>

                  {/* Activity timeline */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Activity Timeline</h3>
                    {selected.interactions.length === 0 ? (
                      <p className="text-[#8892A4] text-xs">No activity yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {[...selected.interactions].reverse().map((i) => (
                          <div key={i.id} className="text-xs border-l-2 border-white/10 pl-3">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-[#8892A4] uppercase text-[10px]">{i.type}</span>
                              <span className="text-[#8892A4] text-[10px]">
                                {new Date(i.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[#C8CDD8] line-clamp-2">{i.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-4">
                  {/* Audit editor */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-1 uppercase tracking-wider">
                      AI Audit{selected.audit ? '' : ' — Not generated yet'}
                    </h3>
                    {!selected.audit && (
                      <p className="text-[#8892A4] text-xs mb-2">
                        Click &quot;Generate Audit (AI)&quot; above first, then edit here before sending.
                      </p>
                    )}
                    <textarea
                      rows={16}
                      value={auditEdit}
                      onChange={(e) => setAuditEdit(e.target.value)}
                      placeholder="Generate audit using the button above. You can edit the output here before sending to client..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 resize-none font-mono"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveAudit}
                        disabled={actionLoading === 'update-lead' || !auditEdit.trim()}
                        className="px-3 py-1.5 bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 border border-[#00F5D4]/30 rounded-lg text-xs text-[#00F5D4] font-bold transition-colors disabled:opacity-40"
                      >
                        {actionLoading === 'update-lead' ? 'Saving...' : '✓ Save & Approve Audit'}
                      </button>
                    </div>
                  </div>

                  {/* Follow-up drafts */}
                  {followupDrafts && (
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#7B61FF] mb-3 uppercase tracking-wider">
                        AI Follow-up Drafts (Editable)
                      </h3>
                      <textarea
                        rows={12}
                        value={followupDrafts}
                        onChange={(e) => setFollowupDrafts(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7B61FF]/30 resize-none font-mono mb-2"
                      />
                      <button
                        onClick={() => sendFollowup(followupDrafts)}
                        disabled={actionLoading === 'send-followup'}
                        className="px-3 py-1.5 bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 border border-[#7B61FF]/30 rounded-lg text-xs text-[#7B61FF] font-bold transition-colors disabled:opacity-40"
                      >
                        {actionLoading === 'send-followup' ? 'Sending...' : '→ Send This Follow-up'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8892A4]">
            <div className="text-center">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm">Select a lead from the sidebar to view details</p>
              <p className="text-xs mt-2 text-[#8892A4]/60">
                {leads.length === 0 && 'Submit the contact form to create your first lead'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
