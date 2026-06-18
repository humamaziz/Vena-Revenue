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
interface ResearchProfile {
  icpMatch: string; estimatedLTV: string; primaryVector: string; vectorName: string
  topCompetitors: {
  name: string
  estimatedRevenue: string
  whyTheyWin: string
}[]; industryBenchmarks: Record<string, string>
  estimatedLeakage: string; closingHook: string; suggestedAuditTier: string
  redFlags: string[]; strengthSignals: string[]
}

const SC: Record<string, string> = { new: 'bg-blue-500/20 text-blue-400 border-blue-500/30', reviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', approved: 'bg-purple-500/20 text-purple-400 border-purple-500/30', sent: 'bg-green-500/20 text-green-400 border-green-500/30' }
const PC: Record<string, string> = { high: 'text-green-400', medium: 'text-yellow-400', low: 'text-red-400' }
const VECTORS = [{ id: '1', label: 'V1: AI Invisibility' }, { id: '2', label: 'V2: Ghosted Lead Bleed' }, { id: '3', label: 'V3: Form Friction' }, { id: '4', label: 'V4: Ad Spend Hemorrhage' }, { id: '5', label: 'V5: Booking Crisis' }]

type Tab = 'details' | 'audit' | 'outreach' | 'ai_tools' | 'research'

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [tab, setTab] = useState<Tab>('details')
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' }>({ msg: '', type: 'success' })
  // Editable fields
  const [auditEdit, setAuditEdit] = useState('')
  const [notesEdit, setNotesEdit] = useState('')
  const [loomEdit, setLoomEdit] = useState('')
  // AI outputs
  const [followupDrafts, setFollowupDrafts] = useState('')
  const [salesAnalysis, setSalesAnalysis] = useState('')
  const [objectionInput, setObjectionInput] = useState('')
  const [objectionReply, setObjectionReply] = useState('')
  const [quickInstruction, setQuickInstruction] = useState('')
  const [quickDraft, setQuickDraft] = useState('')
  const [testimonialDraft, setTestimonialDraft] = useState('')
  const [loomScript, setLoomScript] = useState('')
  const [outreachEmail, setOutreachEmail] = useState('')
  const [selectedVector, setSelectedVector] = useState('1')
  const [competitorName, setCompetitorName] = useState('')
  const [specificLeak, setSpecificLeak] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [researchProfile, setResearchProfile] = useState<ResearchProfile | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 4000)
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
    if (res.ok) { setAuthed(true); const d = await res.json(); setLeads(d.leads ?? []); setLoading(false) }
    else setAuthError('Invalid admin key.')
  }

  const selectLead = (lead: Lead) => {
    setSelected(lead); setAuditEdit(lead.audit ?? ''); setNotesEdit(lead.notes ?? '')
    setLoomEdit(lead.loomUrl ?? ''); setFollowupDrafts(''); setSalesAnalysis('')
    setObjectionReply(''); setObjectionInput(''); setTestimonialDraft('')
    setQuickDraft(''); setQuickInstruction(''); setLoomScript('')
    setOutreachEmail(''); setResearchProfile(null); setTab('details')
    setOwnerName(lead.name.split(' ')[0])
  }

  const callAdmin = useCallback(async (endpoint: string, body: object, successMsg: string): Promise<Record<string, unknown> | null> => {
    setActionLoading(endpoint)
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify(body),
      })
      if (endpoint === 'generate-pdf') {
        if (!res.ok) { const e = await res.json().catch(() => ({ error: 'PDF failed' })); showToast(e.error ?? 'PDF failed', 'error'); return null }
        const blob = await res.blob(); const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `audit-${selected?.name?.replace(/\s+/g, '-') ?? 'report'}.pdf`
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
        showToast('PDF downloaded!'); await fetchLeads(); return { success: true }
      }
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Error', 'error'); return null }
      showToast(successMsg); await fetchLeads(); return data
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Network error', 'error'); return null }
    finally { setActionLoading('') }
  }, [adminKey, fetchLeads, selected])

  const generateAudit = async () => {
    if (!selected) return
    const d = await callAdmin('generate-audit', { leadId: selected.id }, 'Audit generated!')
    if (d?.audit) { setAuditEdit(d.audit as string); setSelected(p => p ? { ...p, audit: d.audit as string, status: 'reviewed' } : p); setTab('audit') }
  }
  const saveAudit = async () => { if (!selected) return; await callAdmin('update-lead', { leadId: selected.id, audit: auditEdit, status: 'approved' }, 'Saved!'); setSelected(p => p ? { ...p, audit: auditEdit, status: 'approved' } : p) }
  const saveNotes = async () => { if (!selected) return; await callAdmin('save-notes', { leadId: selected.id, notes: notesEdit }, 'Notes saved!'); setSelected(p => p ? { ...p, notes: notesEdit } : p) }
  const saveLoom = async () => { if (!selected) return; await callAdmin('add-loom', { leadId: selected.id, loomUrl: loomEdit }, 'Loom saved!'); setSelected(p => p ? { ...p, loomUrl: loomEdit } : p) }
  const scoreLead = async () => { if (!selected) return; const d = await callAdmin('score-lead', { leadId: selected.id }, 'Scored!'); if (d) setSelected(p => p ? { ...p, score: d.score as number, priority: d.priority as string } : p) }
  const generateFollowup = async () => { if (!selected) return; const d = await callAdmin('generate-followup', { leadId: selected.id }, 'Drafts ready!'); if (d?.drafts) { setFollowupDrafts(d.drafts as string); setTab('outreach') } }
  const sendEmail = async () => { if (!selected) return; if (!selected.audit) { showToast('Generate audit first', 'error'); return }; const d = await callAdmin('send-email', { leadId: selected.id }, 'Email sent!'); if (d?.success) setSelected(p => p ? { ...p, status: 'sent' } : p) }
  const sendFollowup = async (content: string) => { if (selected) await callAdmin('send-followup', { leadId: selected.id, content }, 'Follow-up sent!') }
  const runSalesAssistant = async () => { if (!selected) return; const d = await callAdmin('sales-assistant', { leadId: selected.id }, 'Analysis ready!'); if (d?.analysis) setSalesAnalysis(d.analysis as string) }
  const handleObjection = async () => { if (!selected || !objectionInput.trim()) return; const d = await callAdmin('handle-objection', { leadId: selected.id, objection: objectionInput }, 'Reply drafted!'); if (d?.reply) setObjectionReply(d.reply as string) }
  const generateQuickEmail = async () => { if (!selected || !quickInstruction.trim()) return; const d = await callAdmin('quick-email', { leadId: selected.id, instruction: quickInstruction }, 'Draft ready!'); if (d?.email) setQuickDraft(d.email as string) }
  const requestTestimonial = async () => { if (!selected) return; const d = await callAdmin('request-testimonial', { leadId: selected.id }, 'Draft ready!'); if (d?.email) setTestimonialDraft(d.email as string) }
  const generateLoomScript = async () => { if (!selected) return; const d = await callAdmin('create-loom-script', { leadId: selected.id, vector: selectedVector, competitorName: competitorName || null, specificLeak: specificLeak || null }, 'Script ready!'); if (d?.script) setLoomScript(d.script as string) }
  const generateOutreachEmail = async () => { if (!selected) return; const d = await callAdmin('generate-email-template', { leadId: selected.id, vector: selectedVector, ownerName: ownerName || null, specificLeak: specificLeak || null }, 'Email drafted!'); if (d?.email) setOutreachEmail(d.email as string) }
  const generatePdf = async () => { if (!selected) return; if (!selected.audit) { showToast('Generate audit first', 'error'); return }; await callAdmin('generate-pdf', { leadId: selected.id }, '') }
  const togglePaid = async () => { if (!selected) return; await callAdmin('mark-paid', { leadId: selected.id, paid: !selected.paid }, `Marked ${!selected.paid ? 'paid' : 'unpaid'}!`); setSelected(p => p ? { ...p, paid: !p.paid } : p) }
  const runResearch = async () => { if (!selected) return; const d = await callAdmin('research-lead', { leadId: selected.id }, 'Profile built!'); if (d?.profile) { setResearchProfile(d.profile as ResearchProfile); setTab('research') } }

  const filteredLeads = leads.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false
    if (filterPriority !== 'all' && l.priority !== filterPriority) return false
    if (search) { const q = search.toLowerCase(); if (!l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !l.industry.toLowerCase().includes(q)) return false }
    return true
  })
  const stats = { total: leads.length, new: leads.filter(l => l.status === 'new').length, high: leads.filter(l => l.priority === 'high').length, paid: leads.filter(l => l.paid).length }
  const daysInactive = (l: Lead) => Math.floor((Date.now() - new Date(l.lastContact ?? l.createdAt).getTime()) / 86400000)

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] px-4">
      <div className="glass border border-white/10 rounded-2xl p-10 w-full max-w-sm text-center">
        <div className="font-display font-bold text-2xl mb-1 text-white">Vena<span style={{ color: '#FFD700' }}>%</span>Revenue</div>
        <p className="text-[#8892A4] text-sm mb-8">Admin CRM — Restricted Access</p>
        <input type="password" placeholder="Enter admin key" value={adminKey}
          onChange={e => setAdminKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()}
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm mb-3 focus:outline-none focus:border-[#00F5D4]/40 placeholder-[#8892A4]" />
        {authError && <p className="text-red-400 text-xs mb-3 text-left">{authError}</p>}
        <button onClick={handleAuth} className="btn-primary w-full justify-center"><span>Access Dashboard</span></button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E6E9F2]">
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium border ${toast.type === 'error' ? 'glass border-red-500/30 text-red-400' : 'glass border-[#00F5D4]/30 text-[#00F5D4]'}`}>
          {toast.msg}
        </div>
      )}
      <div className="flex h-screen overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="font-display font-bold text-sm mb-3">Vena<span style={{ color: '#FFD700' }}>%</span>Revenue <span className="text-[#8892A4] font-normal">CRM</span></div>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[{ l: 'All', v: stats.total, c: '#8892A4' }, { l: 'New', v: stats.new, c: '#60A5FA' }, { l: 'Hot', v: stats.high, c: '#34D399' }, { l: 'Paid', v: stats.paid, c: '#F59E0B' }].map(s => (
                <div key={s.l} className="text-center bg-white/[0.03] rounded-lg py-1.5">
                  <div className="font-bold text-sm" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-[10px] text-[#8892A4]">{s.l}</div>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2" />
            <div className="grid grid-cols-2 gap-1.5">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="p-6 text-center text-[#8892A4] text-sm">Loading...</div>
              : filteredLeads.length === 0 ? <div className="p-6 text-center text-[#8892A4] text-sm">{leads.length === 0 ? 'No leads yet. Submit contact form to create one.' : 'No matches.'}</div>
              : filteredLeads.map(lead => (
                <button key={lead.id} onClick={() => selectLead(lead)}
                  className={`w-full text-left p-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${selected?.id === lead.id ? 'bg-white/[0.06] border-l-2 border-l-[#00F5D4]' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-white truncate">{lead.name}</div>
                      <div className="text-xs text-[#8892A4] truncate">{lead.industry}</div>
                      <div className="text-xs text-[#8892A4] truncate">{lead.email}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${SC[lead.status] ?? ''}`}>{lead.status}</span>
                      {lead.priority && <span className={`text-[10px] font-bold ${PC[lead.priority] ?? ''}`}>{lead.priority}{lead.score != null ? ` ${lead.score}` : ''}</span>}
                      {lead.paid && <span className="text-[10px] text-yellow-400 font-bold">PAID</span>}
                      {daysInactive(lead) >= 3 && lead.status !== 'sent' && <span className="text-[10px] text-orange-400">⚠ {daysInactive(lead)}d</span>}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* DETAIL PANEL */}
        {selected ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 max-w-5xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h1 className="font-display font-bold text-xl text-white">{selected.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#8892A4]">
                    <a href={`mailto:${selected.email}`} className="hover:text-[#00F5D4]">{selected.email}</a>
                    <span>·</span>
                    <a href={selected.website.startsWith('http') ? selected.website : `https://${selected.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00F5D4]">{selected.website}</a>
                    <span>·</span><span>{selected.industry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                  <button onClick={togglePaid} disabled={actionLoading === 'mark-paid'}
                    className={`text-[10px] px-2 py-1 rounded-full border font-bold transition-all ${selected.paid ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'text-[#8892A4] border-white/10 hover:border-yellow-500/30'}`}>
                    {selected.paid ? 'PAID ✓' : 'Mark Paid'}
                  </button>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${SC[selected.status] ?? ''}`}>{selected.status}</span>
                  {selected.priority && <span className={`text-xs font-bold ${PC[selected.priority] ?? ''}`}>{selected.priority.toUpperCase()}{selected.score != null ? ` ${selected.score}/100` : ''}</span>}
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap gap-1.5 mb-4 p-3 glass border border-white/[0.06] rounded-xl">
                {[
                  { l: '🔬 Audit', k: 'generate-audit', a: generateAudit, c: '#00F5D4' },
                  { l: '📊 Score', k: 'score-lead', a: scoreLead, c: '#7B61FF' },
                  { l: '🔍 Research', k: 'research-lead', a: runResearch, c: '#60A5FA' },
                  { l: '💬 Follow-ups', k: 'generate-followup', a: generateFollowup, c: '#7B61FF' },
                  { l: '🧠 Sales Intel', k: 'sales-assistant', a: runSalesAssistant, c: '#F59E0B' },
                  { l: '📄 PDF', k: 'generate-pdf', a: generatePdf, c: '#8892A4' },
                  { l: '📧 Send Audit', k: 'send-email', a: sendEmail, c: '#34D399' },
                ].map(btn => (
                  <button key={btn.k} onClick={btn.a} disabled={actionLoading === btn.k}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
                    style={{ borderColor: `${btn.c}40`, color: btn.c, backgroundColor: `${btn.c}10` }}>
                    {actionLoading === btn.k ? '⏳...' : btn.l}
                  </button>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-0.5 mb-4 border-b border-white/[0.06]">
                {([['details', '📋 Details'], ['audit', '📝 Audit'], ['outreach', '📤 Outreach'], ['ai_tools', '🤖 AI Tools'], ['research', '🔍 Research']] as [Tab, string][]).map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`px-3 py-2 text-xs font-medium transition-all border-b-2 -mb-px ${tab === id ? 'text-[#00F5D4] border-[#00F5D4]' : 'text-[#8892A4] border-transparent hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* TAB: DETAILS */}
              {tab === 'details' && (
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Lead Info</h3>
                      <div className="space-y-1.5">
                        {[['Goal', selected.goal], ['Revenue', selected.revenue], ['Ad Spend', selected.adspend], ['Budget', selected.budget], ['Submitted', new Date(selected.createdAt).toLocaleDateString()], ['Last Contact', selected.lastContact ? new Date(selected.lastContact).toLocaleDateString() : 'Never']].map(([k, v]) =>
                          v ? <div key={k} className="flex gap-2 text-sm"><span className="text-[#8892A4] w-24 flex-shrink-0">{k}</span><span className="text-white">{v}</span></div> : null
                        )}
                      </div>
                      {selected.problem && <div className="mt-3 pt-3 border-t border-white/[0.06]"><p className="text-xs text-[#8892A4] mb-1">Challenge</p><p className="text-sm text-white">{selected.problem}</p></div>}
                    </div>
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Admin Notes</h3>
                      <textarea rows={4} value={notesEdit} onChange={e => setNotesEdit(e.target.value)} placeholder="Internal notes — never sent to client..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 resize-none" />
                      <button onClick={saveNotes} className="mt-2 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">Save Notes</button>
                    </div>
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Loom Video URL</h3>
                      <input type="url" value={loomEdit} onChange={e => setLoomEdit(e.target.value)} placeholder="https://loom.com/share/..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2" />
                      <button onClick={saveLoom} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">Save Loom URL</button>
                    </div>
                    {/* Payment link */}
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#F59E0B] mb-2 uppercase tracking-wider">Payment Link</h3>
                      <div className="bg-black/20 rounded-lg px-3 py-2 text-xs text-[#8892A4] font-mono break-all mb-2">
                        {typeof window !== 'undefined' ? `${window.location.origin}/pay?leadId=${selected.id}` : `/pay?leadId=${selected.id}`}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/pay?leadId=${selected.id}`).then(() => showToast('Payment link copied!')) }}
                        className="px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg text-xs text-[#F59E0B] font-bold">
                        Copy Payment Link
                      </button>
                    </div>
                  </div>
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Activity Timeline</h3>
                    {selected.interactions.length === 0 ? <p className="text-[#8892A4] text-xs">No activity yet.</p> : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
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

              {/* TAB: AUDIT */}
              {tab === 'audit' && (
                <div className="space-y-4">
                  {!selected.audit && <div className="glass border border-yellow-500/20 rounded-xl p-4 text-sm"><span className="text-yellow-400 font-bold">No audit yet.</span> <span className="text-[#8892A4]">Click the Audit button above to generate one with AI.</span></div>}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-xs text-[#00F5D4] uppercase tracking-wider">Audit Content — Editable Before Sending</h3>
                      <button onClick={generateAudit} disabled={actionLoading === 'generate-audit'}
                        className="px-3 py-1.5 bg-[#00F5D4]/10 border border-[#00F5D4]/30 rounded-lg text-xs text-[#00F5D4] font-bold disabled:opacity-40">
                        {actionLoading === 'generate-audit' ? '⏳ Generating...' : selected.audit ? 'Regenerate' : 'Generate Now'}
                      </button>
                    </div>
                    <textarea rows={22} value={auditEdit} onChange={e => setAuditEdit(e.target.value)} placeholder="Generate audit first, then edit here before sending..."
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 resize-none font-mono" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={saveAudit} disabled={!auditEdit.trim() || actionLoading === 'update-lead'}
                        className="px-4 py-2 bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 border border-[#00F5D4]/30 rounded-lg text-xs text-[#00F5D4] font-bold disabled:opacity-40">
                        {actionLoading === 'update-lead' ? 'Saving...' : 'Save and Approve'}
                      </button>
                      <button onClick={generatePdf} disabled={!selected.audit || actionLoading === 'generate-pdf'}
                        className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-lg text-xs text-white font-bold disabled:opacity-40">
                        {actionLoading === 'generate-pdf' ? 'Generating...' : 'Download PDF'}
                      </button>
                      <button onClick={sendEmail} disabled={!selected.audit || actionLoading === 'send-email'}
                        className="px-4 py-2 bg-[#34D399]/10 hover:bg-[#34D399]/20 border border-[#34D399]/30 rounded-lg text-xs text-[#34D399] font-bold disabled:opacity-40">
                        {actionLoading === 'send-email' ? 'Sending...' : 'Send to Client'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: OUTREACH */}
              {tab === 'outreach' && (
                <div className="space-y-4">
                  {/* Vector selector */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Campaign Vector Selection</h3>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {VECTORS.map(v => (
                        <button key={v.id} onClick={() => setSelectedVector(v.id)}
                          className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all text-center ${selectedVector === v.id ? 'bg-[#00F5D4]/20 border-[#00F5D4]/50 text-[#00F5D4]' : 'border-white/[0.08] text-[#8892A4] hover:border-white/20'}`}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-[#8892A4] mb-1">Owner First Name</label>
                        <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Brian"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8892A4] mb-1">Competitor Name (optional)</label>
                        <input type="text" value={competitorName} onChange={e => setCompetitorName(e.target.value)} placeholder="e.g. Smith Law Group"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8892A4] mb-1">Specific Leak Found (optional)</label>
                        <input type="text" value={specificLeak} onChange={e => setSpecificLeak(e.target.value)} placeholder="e.g. 5.1s mobile load time"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Loom Script */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xs text-[#7B61FF] uppercase tracking-wider">Loom Video Script</h3>
                      <button onClick={generateLoomScript} disabled={actionLoading === 'create-loom-script'}
                        className="px-3 py-1.5 bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-lg text-xs text-[#7B61FF] font-bold disabled:opacity-40">
                        {actionLoading === 'create-loom-script' ? '⏳ Writing...' : loomScript ? 'Regenerate' : 'Generate Script'}
                      </button>
                    </div>
                    <p className="text-[#8892A4] text-xs mb-3">90-second structured Loom script with screen share annotations. Follows the Vena%Revenue closing format.</p>
                    {loomScript && (
                      <>
                        <textarea rows={14} value={loomScript} onChange={e => setLoomScript(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />
                        <button onClick={() => navigator.clipboard.writeText(loomScript).then(() => showToast('Script copied!'))}
                          className="mt-2 px-3 py-1.5 bg-white/[0.06] rounded-lg text-xs text-white">Copy Script</button>
                      </>
                    )}
                  </div>

                  {/* Outreach Email */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xs text-[#00F5D4] uppercase tracking-wider">Cold Outreach Email</h3>
                      <button onClick={generateOutreachEmail} disabled={actionLoading === 'generate-email-template'}
                        className="px-3 py-1.5 bg-[#00F5D4]/10 border border-[#00F5D4]/30 rounded-lg text-xs text-[#00F5D4] font-bold disabled:opacity-40">
                        {actionLoading === 'generate-email-template' ? '⏳ Writing...' : outreachEmail ? 'Regenerate' : 'Generate Email'}
                      </button>
                    </div>
                    <p className="text-[#8892A4] text-xs mb-3">5-line cold email using the selected vector. Replace [LOOM VIDEO LINK] with your Loom URL before sending.</p>
                    {outreachEmail && (
                      <>
                        <textarea rows={10} value={outreachEmail} onChange={e => setOutreachEmail(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />
                        <button onClick={() => navigator.clipboard.writeText(outreachEmail).then(() => showToast('Email copied!'))}
                          className="mt-2 px-3 py-1.5 bg-white/[0.06] rounded-lg text-xs text-white">Copy Email</button>
                      </>
                    )}
                  </div>

                  {/* Follow-up drafts */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xs text-[#FF4D6D] uppercase tracking-wider">Follow-up Sequence (Day 1 / 3 / 7)</h3>
                      <button onClick={generateFollowup} disabled={actionLoading === 'generate-followup'}
                        className="px-3 py-1.5 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 rounded-lg text-xs text-[#FF4D6D] font-bold disabled:opacity-40">
                        {actionLoading === 'generate-followup' ? '⏳ Writing...' : followupDrafts ? 'Regenerate' : 'Generate Sequence'}
                      </button>
                    </div>
                    <p className="text-[#8892A4] text-xs mb-3">Human, direct 3-email follow-up sequence. References their specific audit findings. No corporate language.</p>
                    {followupDrafts && (
                      <>
                        <textarea rows={14} value={followupDrafts} onChange={e => setFollowupDrafts(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono mb-2" />
                        <div className="flex gap-2">
                          <button onClick={() => sendFollowup(followupDrafts)} disabled={actionLoading === 'send-followup'}
                            className="px-4 py-2 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 rounded-lg text-xs text-[#FF4D6D] font-bold disabled:opacity-40">
                            {actionLoading === 'send-followup' ? 'Sending...' : 'Send This Follow-up'}
                          </button>
                          <button onClick={() => navigator.clipboard.writeText(followupDrafts).then(() => showToast('Copied!'))}
                            className="px-3 py-1.5 bg-white/[0.06] rounded-lg text-xs text-white">Copy All</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: AI TOOLS */}
              {tab === 'ai_tools' && (
                <div className="space-y-4">
                  {/* Sales Intel */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xs text-[#F59E0B] uppercase tracking-wider">Sales Intelligence Report</h3>
                      <button onClick={runSalesAssistant} disabled={actionLoading === 'sales-assistant'}
                        className="px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg text-xs text-[#F59E0B] font-bold disabled:opacity-40">
                        {actionLoading === 'sales-assistant' ? '⏳ Analyzing...' : salesAnalysis ? 'Refresh' : 'Run Analysis'}
                      </button>
                    </div>
                    <p className="text-[#8892A4] text-xs mb-3">Situation read, biggest risk, exact next move, close probability. No fluff.</p>
                    {salesAnalysis && <div className="bg-black/20 rounded-lg p-4 text-sm text-[#C8CDD8] whitespace-pre-wrap leading-relaxed">{salesAnalysis}</div>}
                  </div>

                  {/* Objection Handler */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#FF4D6D] mb-2 uppercase tracking-wider">Objection Handler</h3>
                    <input type="text" value={objectionInput} onChange={e => setObjectionInput(e.target.value)}
                      placeholder='e.g. "We already have an SEO agency" or "Your price is too high"'
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none mb-2" />
                    <button onClick={handleObjection} disabled={!objectionInput.trim() || actionLoading === 'handle-objection'}
                      className="px-3 py-1.5 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 rounded-lg text-xs text-[#FF4D6D] font-bold disabled:opacity-40">
                      {actionLoading === 'handle-objection' ? '⏳ Drafting...' : 'Draft Reply'}
                    </button>
                    {objectionReply && <textarea rows={5} value={objectionReply} onChange={e => setObjectionReply(e.target.value)}
                      className="w-full mt-3 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />}
                  </div>

                  {/* Quick Email */}
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#7B61FF] mb-2 uppercase tracking-wider">Quick Email Writer</h3>
                    <input type="text" value={quickInstruction} onChange={e => setQuickInstruction(e.target.value)}
                      placeholder='e.g. "Check in on where they are in their decision" or "Share that we found a second leak"'
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none mb-2" />
                    <button onClick={generateQuickEmail} disabled={!quickInstruction.trim() || actionLoading === 'quick-email'}
                      className="px-3 py-1.5 bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-lg text-xs text-[#7B61FF] font-bold disabled:opacity-40">
                      {actionLoading === 'quick-email' ? '⏳ Writing...' : 'Write Email'}
                    </button>
                    {quickDraft && <textarea rows={5} value={quickDraft} onChange={e => setQuickDraft(e.target.value)}
                      className="w-full mt-3 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />}
                  </div>

                  {/* Testimonial */}
                  {selected.status === 'sent' && (
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xs text-[#34D399] uppercase tracking-wider">Testimonial Request</h3>
                        <button onClick={requestTestimonial} disabled={actionLoading === 'request-testimonial'}
                          className="px-3 py-1.5 bg-[#34D399]/10 border border-[#34D399]/30 rounded-lg text-xs text-[#34D399] font-bold disabled:opacity-40">
                          {actionLoading === 'request-testimonial' ? '⏳ Writing...' : 'Draft Request'}
                        </button>
                      </div>
                      {testimonialDraft && <textarea rows={5} value={testimonialDraft} onChange={e => setTestimonialDraft(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono" />}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: RESEARCH */}
              {tab === 'research' && (
                <div className="space-y-4">
                  {!researchProfile ? (
                    <div className="glass border border-white/[0.06] rounded-xl p-8 text-center">
                      <div className="text-3xl mb-3">🔍</div>
                      <h3 className="font-display font-bold text-lg text-white mb-2">Lead Research Profile</h3>
                      <p className="text-[#8892A4] text-sm mb-6 max-w-md mx-auto">AI builds a complete intelligence profile — ICP match, best vector, industry benchmarks, estimated leakage, and the closing hook most likely to win this deal.</p>
                      <button onClick={runResearch} disabled={actionLoading === 'research-lead'}
                        className="btn-primary mx-auto">
                        <span>{actionLoading === 'research-lead' ? '⏳ Building Profile...' : 'Build Research Profile'}</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* ICP + Vector */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="glass border border-white/[0.06] rounded-xl p-4 text-center">
                          <div className="text-xs text-[#8892A4] mb-1 uppercase tracking-wider">ICP Match</div>
                          <div className={`font-display font-bold text-lg ${researchProfile.icpMatch.includes('Perfect') ? 'text-green-400' : researchProfile.icpMatch.includes('Strong') ? 'text-yellow-400' : 'text-red-400'}`}>{researchProfile.icpMatch.split('—')[0]}</div>
                        </div>
                        <div className="glass border border-white/[0.06] rounded-xl p-4 text-center">
                          <div className="text-xs text-[#8892A4] mb-1 uppercase tracking-wider">Primary Vector</div>
                          <div className="font-display font-bold text-lg text-[#00F5D4]">V{researchProfile.primaryVector}</div>
                          <div className="text-xs text-[#8892A4]">{researchProfile.vectorName}</div>
                        </div>
                        <div className="glass border border-white/[0.06] rounded-xl p-4 text-center">
                          <div className="text-xs text-[#8892A4] mb-1 uppercase tracking-wider">Est. Monthly Leakage</div>
                          <div className="font-display font-bold text-lg text-[#FF4D6D]">{researchProfile.estimatedLeakage}</div>
                        </div>
                      </div>

                      {/* Closing hook */}
                      <div className="glass border border-[#F59E0B]/20 rounded-xl p-4">
                        <div className="text-xs font-bold text-[#F59E0B] mb-2 uppercase tracking-wider">Closing Hook</div>
                        <p className="text-white text-sm font-medium">{researchProfile.closingHook}</p>
                      </div>

                      {/* Audit tier rec */}
                      <div className="glass border border-[#00F5D4]/20 rounded-xl p-4">
                        <div className="text-xs font-bold text-[#00F5D4] mb-1 uppercase tracking-wider">Recommended Audit Tier</div>
                        <p className="text-white font-semibold">{researchProfile.suggestedAuditTier}</p>
                        <p className="text-[#8892A4] text-xs mt-1">Est. LTV: {researchProfile.estimatedLTV}</p>
                      </div>

                      {/* Industry benchmarks */}
                      <div className="glass border border-white/[0.06] rounded-xl p-4">
                        <div className="text-xs font-bold text-[#8892A4] mb-3 uppercase tracking-wider">Industry Benchmarks</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(researchProfile.industryBenchmarks).map(([k, v]) => (
                            <div key={k} className="text-center">
                              <div className="text-[10px] text-[#8892A4] mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                              <div className="font-bold text-sm text-white">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Competitors */}
                      <div className="glass border border-white/[0.06] rounded-xl p-4">
                        <div className="text-xs font-bold text-[#8892A4] mb-2 uppercase tracking-wider">Top Competitors</div>
                        <div className="flex flex-wrap gap-2">
                          {researchProfile.topCompetitors.map((comp, i) => (
  <div key={i} className="p-3 border border-white/10 rounded mb-2">
    <p className="text-white font-semibold">{comp.name}</p>
    <p className="text-sm text-[#8892A4]">
      Revenue: {comp.estimatedRevenue}
    </p>
    <p className="text-sm text-[#8892A4]">
      {comp.whyTheyWin}
    </p>
  </div>
))}
                        </div>
                      </div>

                      {/* Signals */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="glass border border-green-500/20 rounded-xl p-4">
                          <div className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">Strength Signals</div>
                          {researchProfile.strengthSignals.map((s, i) => <div key={i} className="flex items-start gap-2 text-sm mb-1"><span className="text-green-400 flex-shrink-0">+</span><span className="text-[#8892A4]">{s}</span></div>)}
                        </div>
                        <div className="glass border border-red-500/20 rounded-xl p-4">
                          <div className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Red Flags</div>
                          {researchProfile.redFlags.map((s, i) => <div key={i} className="flex items-start gap-2 text-sm mb-1"><span className="text-red-400 flex-shrink-0">!</span><span className="text-[#8892A4]">{s}</span></div>)}
                        </div>
                      </div>

                      <button onClick={runResearch} disabled={actionLoading === 'research-lead'}
                        className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">
                        {actionLoading === 'research-lead' ? 'Refreshing...' : 'Refresh Profile'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8892A4]">
            <div className="text-center">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm">Select a lead from the sidebar</p>
              <p className="text-xs mt-2 text-[#8892A4]/60">{leads.length === 0 && 'Submit the contact form to create your first lead'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}