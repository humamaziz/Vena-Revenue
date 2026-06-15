'use client'

import { useState, useCallback } from 'react'

interface Interaction { id: string; type: string; content: string; createdAt: string }
interface Lead {
  id: string; name: string; email: string; website: string; industry: string; goal: string
  revenue: string | null; adspend: string | null; budget: string | null; problem: string | null
  audit: string | null; preview: string | null; score: number | null; priority: string | null
  status: string; paid: boolean; pdfUrl: string | null; loomUrl: string | null
  notes: string | null; lastContact: string | null; createdAt: string; interactions: Interaction[]
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sent: 'bg-green-500/20 text-green-400 border-green-500/30',
}
const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-green-400', medium: 'text-yellow-400', low: 'text-red-400',
}

type Tab = 'details' | 'audit' | 'ai_tools' | 'comms'

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('details')
  // Editable fields
  const [auditEdit, setAuditEdit] = useState('')
  const [notesEdit, setNotesEdit] = useState('')
  const [loomEdit, setLoomEdit] = useState('')
  // AI outputs
  const [followupDrafts, setFollowupDrafts] = useState('')
  const [salesAnalysis, setSalesAnalysis] = useState('')
  const [objectionReply, setObjectionReply] = useState('')
  const [objectionInput, setObjectionInput] = useState('')
  const [testimonialDraft, setTestimonialDraft] = useState('')
  const [quickEmailDraft, setQuickEmailDraft] = useState('')
  const [quickEmailInstruction, setQuickEmailInstruction] = useState('')
  // Auth
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  // Filters
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [search, setSearch] = useState('')
  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' }>({ msg: '', type: 'success' })

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000)
  }

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/leads', { headers: { Authorization: `Bearer ${adminKey}` } })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setLeads(data.leads ?? [])
    } catch { showToast('Failed to load leads', 'error') }
    finally { setLoading(false) }
  }, [adminKey])

  const handleAuth = async () => {
    setAuthError('')
    const res = await fetch('/api/admin/leads', { headers: { Authorization: `Bearer ${adminKey}` } })
    if (res.ok) {
      setAuthed(true)
      const data = await res.json()
      setLeads(data.leads ?? [])
      setLoading(false)
    } else { setAuthError('Invalid admin key.') }
  }

  const selectLead = (lead: Lead) => {
    setSelected(lead)
    setAuditEdit(lead.audit ?? '')
    setNotesEdit(lead.notes ?? '')
    setLoomEdit(lead.loomUrl ?? '')
    setFollowupDrafts('')
    setSalesAnalysis('')
    setObjectionReply('')
    setObjectionInput('')
    setTestimonialDraft('')
    setQuickEmailDraft('')
    setQuickEmailInstruction('')
    setActiveTab('details')
  }

  const callAdmin = useCallback(async (endpoint: string, body: object, successMsg: string): Promise<Record<string, unknown> | null> => {
    setActionLoading(endpoint)
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify(body),
      })

      if (endpoint === 'generate-pdf') {
        if (!res.ok) {
          const e = await res.json().catch(() => ({ error: 'PDF failed' }))
          showToast(e.error ?? 'PDF failed', 'error')
          return null
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-${selected?.name?.replace(/\s+/g, '-') ?? 'report'}.pdf`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showToast('PDF downloaded!', 'success')
        await fetchLeads()
        return { success: true }
      }

      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? `Error`, 'error'); return null }
      showToast(successMsg, 'success')
      await fetchLeads()
      return data
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Network error', 'error')
      return null
    } finally { setActionLoading('') }
  }, [adminKey, fetchLeads, selected])

  // Action handlers
  const generateAudit = async () => {
    if (!selected) return
    const data = await callAdmin('generate-audit', { leadId: selected.id }, 'Audit generated!')
    if (data?.audit) { setAuditEdit(data.audit as string); setSelected(p => p ? { ...p, audit: data.audit as string, status: 'reviewed' } : p); setActiveTab('audit') }
  }
  const saveAudit = async () => {
    if (!selected) return
    await callAdmin('update-lead', { leadId: selected.id, audit: auditEdit, status: 'approved' }, 'Audit saved!')
    setSelected(p => p ? { ...p, audit: auditEdit, status: 'approved' } : p)
  }
  const saveNotes = async () => { if (selected) { await callAdmin('save-notes', { leadId: selected.id, notes: notesEdit }, 'Notes saved!'); setSelected(p => p ? { ...p, notes: notesEdit } : p) } }
  const saveLoom = async () => { if (selected) { await callAdmin('add-loom', { leadId: selected.id, loomUrl: loomEdit }, 'Loom saved!'); setSelected(p => p ? { ...p, loomUrl: loomEdit } : p) } }
  const scoreLead = async () => {
    if (!selected) return
    const data = await callAdmin('score-lead', { leadId: selected.id }, 'Scored!')
    if (data) setSelected(p => p ? { ...p, score: data.score as number, priority: data.priority as string } : p)
  }
  const generateFollowup = async () => {
    if (!selected) return
    const data = await callAdmin('generate-followup', { leadId: selected.id }, 'Follow-ups ready!')
    if (data?.drafts) { setFollowupDrafts(data.drafts as string); setActiveTab('comms') }
  }
  const generatePdf = async () => {
    if (!selected) return
    if (!selected.audit) { showToast('Generate the audit first', 'error'); return }
    await callAdmin('generate-pdf', { leadId: selected.id }, '')
  }
  const sendEmail = async () => {
    if (!selected) return
    if (!selected.audit) { showToast('Generate the audit before sending', 'error'); return }
    const data = await callAdmin('send-email', { leadId: selected.id }, 'Email sent!')
    if (data?.success) setSelected(p => p ? { ...p, status: 'sent' } : p)
  }
  const sendFollowup = async (content: string) => { if (selected) await callAdmin('send-followup', { leadId: selected.id, content }, 'Follow-up sent!') }
  const runSalesAssistant = async () => {
    if (!selected) return
    const data = await callAdmin('sales-assistant', { leadId: selected.id }, 'Analysis ready!')
    if (data?.analysis) setSalesAnalysis(data.analysis as string)
  }
  const handleObjection = async () => {
    if (!selected || !objectionInput.trim()) return
    const data = await callAdmin('handle-objection', { leadId: selected.id, objection: objectionInput }, 'Reply drafted!')
    if (data?.reply) setObjectionReply(data.reply as string)
  }
  const requestTestimonial = async () => {
    if (!selected) return
    const data = await callAdmin('request-testimonial', { leadId: selected.id }, 'Draft ready!')
    if (data?.email) setTestimonialDraft(data.email as string)
  }
  const generateQuickEmail = async () => {
    if (!selected || !quickEmailInstruction.trim()) return
    const data = await callAdmin('quick-email', { leadId: selected.id, instruction: quickEmailInstruction }, 'Draft ready!')
    if (data?.email) setQuickEmailDraft(data.email as string)
  }
  const togglePaid = async () => {
    if (!selected) return
    await callAdmin('mark-paid', { leadId: selected.id, paid: !selected.paid }, `Marked as ${!selected.paid ? 'paid' : 'unpaid'}!`)
    setSelected(p => p ? { ...p, paid: !p.paid } : p)
  }

  const filteredLeads = leads.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false
    if (filterPriority !== 'all' && l.priority !== filterPriority) return false
    if (search) {
      const q = search.toLowerCase()
      if (!l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !l.industry.toLowerCase().includes(q)) return false
    }
    return true
  })

  const stats = { total: leads.length, new: leads.filter(l => l.status === 'new').length, high: leads.filter(l => l.priority === 'high').length, paid: leads.filter(l => l.paid).length }
  const daysInactive = (l: Lead) => Math.floor((Date.now() - new Date(l.lastContact ?? l.createdAt).getTime()) / 86400000)

  // ── AUTH ──────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] px-4">
      <div className="glass border border-white/10 rounded-2xl p-10 w-full max-w-sm text-center">
        <div className="font-display font-bold text-2xl mb-1 text-white">Vena<span style={{ color: '#FFD700' }}>%</span>Revenue</div>
        <p className="text-[#8892A4] text-sm mb-8">Admin CRM</p>
        <input type="password" placeholder="Enter admin key" value={adminKey}
          onChange={e => setAdminKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm mb-3 focus:outline-none focus:border-[#00F5D4]/40 placeholder-[#8892A4]" />
        {authError && <p className="text-red-400 text-xs mb-3 text-left">{authError}</p>}
        <button onClick={handleAuth} className="btn-primary w-full justify-center"><span>Access Dashboard</span></button>
      </div>
    </div>
  )

  // ── MAIN ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E6E9F2]">
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium border ${toast.type === 'error' ? 'glass border-red-500/30 text-red-400' : 'glass border-[#00F5D4]/30 text-[#00F5D4]'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* ── SIDEBAR ── */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="font-display font-bold text-sm mb-3">
              Vena<span style={{ color: '#FFD700' }}>%</span>Revenue <span className="text-[#8892A4] font-normal">CRM</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[{ label: 'All', value: stats.total, color: '#8892A4' }, { label: 'New', value: stats.new, color: '#60A5FA' }, { label: 'High', value: stats.high, color: '#34D399' }, { label: 'Paid', value: stats.paid, color: '#F59E0B' }].map(s => (
                <div key={s.label} className="text-center bg-white/[0.03] rounded-lg py-1.5">
                  <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-[#8892A4]">{s.label}</div>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2" />
            <div className="grid grid-cols-2 gap-1.5">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="p-6 text-center text-[#8892A4] text-sm">Loading...</div>
              : filteredLeads.length === 0 ? <div className="p-6 text-center text-[#8892A4] text-sm">{leads.length === 0 ? 'No leads yet.' : 'No matches.'}</div>
              : filteredLeads.map(lead => (
                <button key={lead.id} onClick={() => selectLead(lead)}
                  className={`w-full text-left p-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${selected?.id === lead.id ? 'bg-white/[0.06] border-l-2 border-l-[#00F5D4]' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-white truncate">{lead.name}</div>
                      <div className="text-xs text-[#8892A4] truncate">{lead.industry}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[lead.status] ?? ''}`}>{lead.status}</span>
                      {lead.priority && <span className={`text-[10px] font-bold ${PRIORITY_COLORS[lead.priority] ?? ''}`}>{lead.priority}{lead.score != null ? ` ${lead.score}` : ''}</span>}
                      {lead.paid && <span className="text-[10px] text-yellow-400 font-bold">PAID</span>}
                      {daysInactive(lead) >= 3 && lead.status !== 'sent' && <span className="text-[10px] text-orange-400">⚠ {daysInactive(lead)}d</span>}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* ── DETAIL ── */}
        {selected ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 max-w-5xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h1 className="font-display font-bold text-xl text-white">{selected.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#8892A4]">
                    <a href={`mailto:${selected.email}`} className="hover:text-[#00F5D4]">{selected.email}</a>
                    <span>·</span>
                    <a href={selected.website.startsWith('http') ? selected.website : `https://${selected.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00F5D4]">{selected.website}</a>
                    <span>·</span><span>{selected.industry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button onClick={togglePaid} className={`text-[10px] px-2 py-1 rounded-full border font-bold transition-all ${selected.paid ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'text-[#8892A4] border-white/10 hover:border-yellow-500/30'}`}>
                    {selected.paid ? 'PAID ✓' : 'Mark Paid'}
                  </button>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[selected.status] ?? ''}`}>{selected.status}</span>
                  {selected.priority && <span className={`text-xs font-bold ${PRIORITY_COLORS[selected.priority] ?? ''}`}>{selected.priority.toUpperCase()}{selected.score != null ? ` (${selected.score}/100)` : ''}</span>}
                </div>
              </div>

              {/* Quick action bar */}
              <div className="flex flex-wrap gap-1.5 mb-5 p-3 glass border border-white/[0.06] rounded-xl">
                {[
                  { label: '🔬 Generate Audit', key: 'generate-audit', action: generateAudit, color: '#00F5D4' },
                  { label: '📊 Score Lead', key: 'score-lead', action: scoreLead, color: '#7B61FF' },
                  { label: '💬 Follow-ups', key: 'generate-followup', action: generateFollowup, color: '#7B61FF' },
                  { label: '🧠 Sales Intel', key: 'sales-assistant', action: runSalesAssistant, color: '#F59E0B' },
                  { label: '📄 Download PDF', key: 'generate-pdf', action: generatePdf, color: '#8892A4' },
                  { label: '📧 Send Email', key: 'send-email', action: sendEmail, color: '#34D399' },
                ].map(btn => (
                  <button key={btn.key} onClick={btn.action} disabled={actionLoading === btn.key}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
                    style={{ borderColor: `${btn.color}40`, color: btn.color, backgroundColor: `${btn.color}10` }}>
                    {actionLoading === btn.key ? '⏳ Working...' : btn.label}
                  </button>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
                {([['details', 'Details'], ['audit', 'Audit'], ['ai_tools', 'AI Tools'], ['comms', 'Comms']] as [Tab, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === id ? 'text-[#00F5D4] border-[#00F5D4]' : 'text-[#8892A4] border-transparent hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── TAB: DETAILS ── */}
              {activeTab === 'details' && (
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Lead Info</h3>
                      <div className="space-y-1.5">
                        {[['Goal', selected.goal], ['Revenue', selected.revenue], ['Ad Spend', selected.adspend], ['Budget', selected.budget], ['Submitted', new Date(selected.createdAt).toLocaleDateString()], ['Last Contact', selected.lastContact ? new Date(selected.lastContact).toLocaleDateString() : 'Never']].map(([k, v]) =>
                          v ? <div key={k} className="flex gap-2 text-sm"><span className="text-[#8892A4] w-24 flex-shrink-0">{k}</span><span className="text-white">{v}</span></div> : null
                        )}
                      </div>
                      {selected.problem && <div className="mt-3 pt-3 border-t border-white/[0.06]"><div className="text-xs text-[#8892A4] mb-1">Challenge</div><p className="text-sm text-[#E6E9F2]">{selected.problem}</p></div>}
                    </div>

                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Admin Notes</h3>
                      <textarea rows={4} value={notesEdit} onChange={e => setNotesEdit(e.target.value)} placeholder="Internal notes..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 resize-none" />
                      <button onClick={saveNotes} className="mt-2 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">Save Notes</button>
                    </div>

                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Loom Video</h3>
                      <input type="url" value={loomEdit} onChange={e => setLoomEdit(e.target.value)} placeholder="https://loom.com/share/..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2" />
                      <button onClick={saveLoom} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">Save Loom</button>
                    </div>
                  </div>

                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Activity Timeline</h3>
                    {selected.interactions.length === 0 ? <p className="text-[#8892A4] text-xs">No activity yet.</p> : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {[...selected.interactions].reverse().map(i => (
                          <div key={i.id} className="text-xs border-l-2 border-white/10 pl-3">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-[#8892A4] uppercase text-[10px]">{i.type}</span>
                              <span className="text-[#8892A4] text-[10px]">{new Date(i.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[#C8CDD8] line-clamp-3">{i.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: AUDIT ── */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  {!selected.audit && <div className="glass border border-yellow-500/20 rounded-xl p-4 text-yellow-400 text-sm">No audit generated yet. Click Generate Audit above.</div>}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Audit Content (Editable)</h3>
                    <textarea rows={20} value={auditEdit} onChange={e => setAuditEdit(e.target.value)} placeholder="Generate audit above first..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 resize-none font-mono" />
                    <button onClick={saveAudit} disabled={!auditEdit.trim()}
                      className="mt-2 px-4 py-2 bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 border border-[#00F5D4]/30 rounded-lg text-xs text-[#00F5D4] font-bold transition-colors disabled:opacity-40">
                      Save and Approve Audit
                    </button>
                  </div>
                </div>
              )}

              {/* ── TAB: AI TOOLS ── */}
              {activeTab === 'ai_tools' && (
                <div className="space-y-4">
                  {/* Sales Intelligence */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-xs text-[#F59E0B] uppercase tracking-wider">Sales Intelligence</h3>
                      <button onClick={runSalesAssistant} disabled={actionLoading === 'sales-assistant'}
                        className="px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg text-xs text-[#F59E0B] font-bold disabled:opacity-40">
                        {actionLoading === 'sales-assistant' ? 'Analyzing...' : 'Run Analysis'}
                      </button>
                    </div>
                    {salesAnalysis ? (
                      <div className="bg-black/20 rounded-lg p-4 text-sm text-[#C8CDD8] leading-relaxed whitespace-pre-wrap">{salesAnalysis}</div>
                    ) : <p className="text-[#8892A4] text-xs">Get a sharp situational read on this lead — current status, biggest risk, recommended next action, and close probability.</p>}
                  </div>

                  {/* Objection Handler */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#FF4D6D] mb-2 uppercase tracking-wider">Objection Handler</h3>
                    <p className="text-[#8892A4] text-xs mb-3">Enter the objection they raised. Get a human, confident reply drafted instantly.</p>
                    <input type="text" value={objectionInput} onChange={e => setObjectionInput(e.target.value)}
                      placeholder='e.g. "We already have an SEO agency" or "Your price is too high"'
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#FF4D6D]/30 mb-2" />
                    <button onClick={handleObjection} disabled={!objectionInput.trim() || actionLoading === 'handle-objection'}
                      className="px-3 py-1.5 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 rounded-lg text-xs text-[#FF4D6D] font-bold disabled:opacity-40">
                      {actionLoading === 'handle-objection' ? 'Drafting...' : 'Draft Reply'}
                    </button>
                    {objectionReply && (
                      <textarea rows={5} value={objectionReply} onChange={e => setObjectionReply(e.target.value)}
                        className="w-full mt-3 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />
                    )}
                  </div>

                  {/* Quick Email */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#7B61FF] mb-2 uppercase tracking-wider">Quick Email Writer</h3>
                    <p className="text-[#8892A4] text-xs mb-3">Tell the AI what you want to say. It writes it in the Vena%Revenue voice.</p>
                    <input type="text" value={quickEmailInstruction} onChange={e => setQuickEmailInstruction(e.target.value)}
                      placeholder='e.g. "Check in on where they are in their decision" or "Share the audit results and push for a call"'
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#7B61FF]/30 mb-2" />
                    <button onClick={generateQuickEmail} disabled={!quickEmailInstruction.trim() || actionLoading === 'quick-email'}
                      className="px-3 py-1.5 bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-lg text-xs text-[#7B61FF] font-bold disabled:opacity-40">
                      {actionLoading === 'quick-email' ? 'Writing...' : 'Write Email'}
                    </button>
                    {quickEmailDraft && (
                      <textarea rows={5} value={quickEmailDraft} onChange={e => setQuickEmailDraft(e.target.value)}
                        className="w-full mt-3 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />
                    )}
                  </div>

                  {/* Testimonial Request */}
                  {selected.status === 'sent' && (
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xs text-[#34D399] uppercase tracking-wider">Testimonial Request</h3>
                        <button onClick={requestTestimonial} disabled={actionLoading === 'request-testimonial'}
                          className="px-3 py-1.5 bg-[#34D399]/10 border border-[#34D399]/30 rounded-lg text-xs text-[#34D399] font-bold disabled:opacity-40">
                          {actionLoading === 'request-testimonial' ? 'Writing...' : 'Draft Request'}
                        </button>
                      </div>
                      <p className="text-[#8892A4] text-xs mb-3">Client has been sent their audit. Draft a warm, specific testimonial request.</p>
                      {testimonialDraft && (
                        <textarea rows={5} value={testimonialDraft} onChange={e => setTestimonialDraft(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: COMMS ── */}
              {activeTab === 'comms' && (
                <div className="space-y-4">
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-xs text-[#7B61FF] uppercase tracking-wider">Follow-up Drafts</h3>
                      <button onClick={generateFollowup} disabled={actionLoading === 'generate-followup'}
                        className="px-3 py-1.5 bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-lg text-xs text-[#7B61FF] font-bold disabled:opacity-40">
                        {actionLoading === 'generate-followup' ? 'Generating...' : followupDrafts ? 'Regenerate' : 'Generate Drafts'}
                      </button>
                    </div>
                    {!followupDrafts && <p className="text-[#8892A4] text-xs">Click Generate to get 3 human, direct follow-up emails (Day 1, 3, and 7).</p>}
                    {followupDrafts && (
                      <>
                        <textarea rows={14} value={followupDrafts} onChange={e => setFollowupDrafts(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7B61FF]/30 resize-none font-mono mb-3" />
                        <button onClick={() => sendFollowup(followupDrafts)} disabled={actionLoading === 'send-followup'}
                          className="px-4 py-2 bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 border border-[#7B61FF]/30 rounded-lg text-xs text-[#7B61FF] font-bold disabled:opacity-40">
                          {actionLoading === 'send-followup' ? 'Sending...' : 'Send This Follow-up'}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xs text-[#34D399] uppercase tracking-wider">Audit Email</h3>
                      <button onClick={sendEmail} disabled={actionLoading === 'send-email' || !selected.audit}
                        className="px-3 py-1.5 bg-[#34D399]/10 border border-[#34D399]/30 rounded-lg text-xs text-[#34D399] font-bold disabled:opacity-40">
                        {actionLoading === 'send-email' ? 'Sending...' : 'Send Audit to Client'}
                      </button>
                    </div>
                    <p className="text-[#8892A4] text-xs">{selected.audit ? 'Sends the current audit content to the client email. Includes Loom if saved.' : 'Generate and approve audit first, then send here.'}</p>
                    {selected.loomUrl && <p className="text-[#00F5D4] text-xs mt-2">Loom included: {selected.loomUrl}</p>}
                  </div>

                  {/* Payment link generator */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#F59E0B] mb-2 uppercase tracking-wider">Send Payment Link</h3>
                    <p className="text-[#8892A4] text-xs mb-3">Send the client a direct link to choose their audit tier and pay.</p>
                    <div className="bg-black/20 rounded-lg px-3 py-2 text-xs text-[#8892A4] font-mono break-all select-all mb-2">
                      {`${typeof window !== 'undefined' ? window.location.origin : 'https://vena-revenue.vercel.app'}/pay?leadId=${selected.id}`}
                    </div>
                    <button onClick={() => {
                      const url = `${window.location.origin}/pay?leadId=${selected.id}`
                      navigator.clipboard.writeText(url).then(() => showToast('Payment link copied!'))
                    }} className="px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg text-xs text-[#F59E0B] font-bold">
                      Copy Payment Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8892A4]">
            <div className="text-center">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm">Select a lead to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}