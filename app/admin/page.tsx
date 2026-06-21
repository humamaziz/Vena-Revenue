'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChangeEvent } from 'react'

// ── TYPES ──────────────────────────────────────────────────────
type Role = 'ADMIN' | 'CLOSER' | 'DATA_MANAGER' | 'VIDEO_CREATOR' | 'PPT_CREATOR' | 'LEAD_GEN'

interface SessionInfo { userId: string; role: Role; name: string; email: string }

interface Interaction { id: string; type: string; content: string; createdAt: string }

interface RatingEntry { rating: number; ratedById: string; ratedBy?: { name: string; role?: string } }

interface Lead {
  id: string; name: string; company?: string | null; phone?: string | null
  email: string; website: string; industry: string; goal: string | null
  location?: string | null
  revenue: string | null; adspend: string | null; budget: string | null
  audit: string | null; preview: string | null; score: number | null; priority: string | null
  status: string; paid: boolean; pdfUrl: string | null; pdfGeneratedAt?: string | null
  loomUrl: string | null; pptUrl?: string | null
  notes: string | null; lastContact: string | null; createdAt: string
  interactions: Interaction[]
  ratings?: RatingEntry[]
  avgRating?: number | null
  ratingCount?: number
  createdByRole?: Role | null
}

interface ResearchProfile {
  icpMatch: string; estimatedLTV: string; primaryVector: string; vectorName: string
  topCompetitors: { name: string; estimatedRevenue: string; whyTheyWin: string }[]
  industryBenchmarks: Record<string, string>
  estimatedMonthlyLeakage: string; leakageReasoning?: string; closingHook: string; suggestedAuditTier: string
  marketDensity?: string; geographicOpportunity?: string; gapVsTopCompetitor?: string; loomVector?: string
  clientAvatar?: { decisionMaker: string; mainFear: string; mainDesire: string; objectionToExpect: string }
  redFlags: string[]; strengthSignals: string[]
}

interface TeamUser { id: string; name: string; email: string; role: Role; active: boolean; lastLoginAt: string | null; createdAt: string }

// ── PERMISSIONS (mirrors lib/auth.ts — keep in sync) ────────────
const PERMISSIONS: Record<string, Role[]> = {
  ADD_LEAD: ['ADMIN', 'LEAD_GEN', 'DATA_MANAGER', 'CLOSER'],
  VIEW_LEADS_BASIC: ['ADMIN', 'LEAD_GEN', 'DATA_MANAGER', 'VIDEO_CREATOR', 'PPT_CREATOR', 'CLOSER'],
  EDIT_LEAD: ['ADMIN', 'DATA_MANAGER', 'CLOSER'],
  UPLOAD_CSV: ['ADMIN', 'DATA_MANAGER'],
  RUN_RESEARCH: ['ADMIN', 'DATA_MANAGER', 'CLOSER'],
  GENERATE_AUDIT: ['ADMIN', 'DATA_MANAGER', 'CLOSER'],
  SCORE_LEAD: ['ADMIN', 'DATA_MANAGER', 'CLOSER'],
  GENERATE_LOOM_SCRIPT: ['ADMIN', 'VIDEO_CREATOR', 'CLOSER'],
  ATTACH_LOOM_URL: ['ADMIN', 'VIDEO_CREATOR', 'CLOSER'],
  ATTACH_PPT_URL: ['ADMIN', 'PPT_CREATOR', 'CLOSER'],
  VIEW_AUDIT: ['ADMIN', 'PPT_CREATOR', 'DATA_MANAGER', 'CLOSER'],
  AI_CHAT_TOOLS: ['ADMIN', 'CLOSER'],
  SEND_EMAIL: ['ADMIN', 'CLOSER'],
  HANDLE_PAYMENTS: ['ADMIN', 'CLOSER'],
  MANAGE_USERS: ['ADMIN'],
  RATE_LEAD: ['ADMIN', 'CLOSER', 'DATA_MANAGER', 'VIDEO_CREATOR', 'PPT_CREATOR', 'LEAD_GEN'],
}
function can(role: Role | undefined, perm: keyof typeof PERMISSIONS): boolean {
  if (!role) return false
  return PERMISSIONS[perm]?.includes(role) ?? false
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin', CLOSER: 'Closer', DATA_MANAGER: 'Data Manager',
  VIDEO_CREATOR: 'Video Creator', PPT_CREATOR: 'PPT Creator', LEAD_GEN: 'Lead Gen',
}

const SC: Record<string, string> = { new: 'bg-blue-500/20 text-blue-400 border-blue-500/30', reviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', approved: 'bg-purple-500/20 text-purple-400 border-purple-500/30', sent: 'bg-green-500/20 text-green-400 border-green-500/30' }
const PC: Record<string, string> = { high: 'text-green-400', medium: 'text-yellow-400', low: 'text-red-400' }
const VECTORS = [{ id: '1', label: 'V1: AI Invisibility' }, { id: '2', label: 'V2: Ghosted Lead Bleed' }, { id: '3', label: 'V3: Form Friction' }, { id: '4', label: 'V4: Ad Spend Hemorrhage' }, { id: '5', label: 'V5: Booking Crisis' }]

type Tab = 'details' | 'audit' | 'outreach' | 'ai_tools' | 'research'
type View = 'pipeline' | 'upload' | 'team'

const PAGE_SIZE = 25

export default function AdminDashboard() {
  // ── SESSION ──────────────────────────────────────────────────
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  // ── VIEW / NAV ───────────────────────────────────────────────
  const [view, setView] = useState<View>('pipeline')
  const [tab, setTab] = useState<Tab>('details')

  // ── LEADS LIST (paginated) ──────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLeads, setTotalLeads] = useState(0)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [needsFollowup, setNeedsFollowup] = useState(false)
  const [search, setSearch] = useState('')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' }>({ msg: '', type: 'success' })

  // ── EDITABLE FIELDS ──────────────────────────────────────────
  const [auditEdit, setAuditEdit] = useState('')
  const [notesEdit, setNotesEdit] = useState('')
  const [loomEdit, setLoomEdit] = useState('')
  const [pptEdit, setPptEdit] = useState('')

  // ── AI OUTPUTS ───────────────────────────────────────────────
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

  // ── RATING WIDGET ────────────────────────────────────────────
  const [myRating, setMyRating] = useState(0)
  const [ratingNotes, setRatingNotes] = useState('')

  // ── ADD LEAD (manual) ────────────────────────────────────────
  const [showAddLead, setShowAddLead] = useState(false)
  const [addLeadForm, setAddLeadForm] = useState({ name: '', company: '', email: '', phone: '', website: '', industry: '', location: '', notes: '' })

  // ── CSV UPLOAD ───────────────────────────────────────────────
  const [csvText, setCsvText] = useState('')
  const [csvFileName, setCsvFileName] = useState('')
  const [csvPreview, setCsvPreview] = useState<any>(null)
  const [csvCommitting, setCsvCommitting] = useState(false)
  const [csvResult, setCsvResult] = useState<any>(null)

  // ── TEAM MANAGEMENT ──────────────────────────────────────────
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'LEAD_GEN' as Role })
  const [newUserTempPassword, setNewUserTempPassword] = useState<{ email: string; password: string } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 4000)
  }

  // ── RESTORE SESSION ON LOAD (fixes "logged out on refresh") ─────
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session) setSession(data.session)
      })
      .finally(() => setSessionLoading(false))
  }, [])

  // Bridges toast calls from the nested LeadDetailPanel (clipboard-copy
  // confirmations) without threading showToast through every prop layer.
  useEffect(() => {
    const handler = (e: Event) => showToast((e as CustomEvent).detail)
    window.addEventListener('vena-toast', handler)
    return () => window.removeEventListener('vena-toast', handler)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setSession(null)
    setLeads([])
    setSelected(null)
  }

  // ── PAGINATED LEADS FETCH ────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    if (!session) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterPriority !== 'all') params.set('priority', filterPriority)
      if (search.trim()) params.set('search', search.trim())
      if (needsFollowup) params.set('needsFollowup', 'true')

      const res = await fetch(`/api/admin/leads?${params}`, { credentials: 'include' })
      if (res.status === 401) { setSession(null); return }
      const data = await res.json()
      setLeads(data.leads ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      setTotalLeads(data.pagination?.total ?? 0)
    } catch {
      showToast('Failed to load leads', 'error')
    } finally {
      setLoading(false)
    }
  }, [session, page, filterStatus, filterPriority, search, needsFollowup])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  // Debounced search — reset to page 1 whenever the search term changes
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => setPage(1), 400)
  }

  const refreshSelected = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/leads/${id}`, { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    setSelected(data.lead)
  }, [])

  const selectLead = async (lead: Lead) => {
    setView('pipeline')
    // Fetch full detail (list view omits interactions/ratings for scale)
    const res = await fetch(`/api/admin/leads/${lead.id}`, { credentials: 'include' })
    const full = res.ok ? (await res.json()).lead : lead
    setSelected(full)
    setAuditEdit(full.audit ?? '')
    setNotesEdit(full.notes ?? '')
    setLoomEdit(full.loomUrl ?? '')
    setPptEdit(full.pptUrl ?? '')
    setFollowupDrafts(''); setSalesAnalysis('')
    setObjectionReply(''); setObjectionInput(''); setTestimonialDraft('')
    setQuickDraft(''); setQuickInstruction(''); setLoomScript('')
    setOutreachEmail(''); setResearchProfile(null); setTab('details')
    setOwnerName(full.name.split(' ')[0])
    const mine = full.ratings?.find((r: RatingEntry) => r.ratedById === session?.userId)
    setMyRating(mine?.rating ?? 0)
    setRatingNotes('')
  }

  // ── GENERIC ADMIN API CALLER (cookie auth) ──────────────────
  const callAdmin = useCallback(async (
    endpoint: string,
    body: object,
    successMsg: string
  ): Promise<Record<string, unknown> | null> => {
    setActionLoading(endpoint)
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
        showToast('PDF downloaded!')
        if (selected) refreshSelected(selected.id)
        return { success: true }
      }

      if (res.status === 401) { setSession(null); return null }
      if (res.status === 403) { showToast('You do not have permission to do this', 'error'); return null }

      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Error', 'error'); return null }
      showToast(successMsg)
      if (selected) refreshSelected(selected.id)
      return data
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Network error', 'error')
      return null
    } finally {
      setActionLoading('')
    }
  }, [selected, refreshSelected])

  const generateAudit = async () => {
    if (!selected) return
    const d = await callAdmin('generate-audit', { leadId: selected.id }, 'Audit generated!')
    if (d?.audit) { setAuditEdit(d.audit as string); setSelected(p => p ? { ...p, audit: d.audit as string, status: 'reviewed' } : p); setTab('audit') }
  }
  const saveAudit = async () => { if (!selected) return; await callAdmin('update-lead', { leadId: selected.id, audit: auditEdit, status: 'approved' }, 'Saved!'); setSelected(p => p ? { ...p, audit: auditEdit, status: 'approved' } : p) }
  const saveNotes = async () => { if (!selected) return; await callAdmin('save-notes', { leadId: selected.id, notes: notesEdit }, 'Notes saved!'); setSelected(p => p ? { ...p, notes: notesEdit } : p) }
  const saveLoom = async () => { if (!selected) return; await callAdmin('add-loom', { leadId: selected.id, loomUrl: loomEdit }, 'Loom saved!'); setSelected(p => p ? { ...p, loomUrl: loomEdit } : p) }
  const savePpt = async () => { if (!selected) return; await callAdmin('add-ppt', { leadId: selected.id, pptUrl: pptEdit }, 'PPT link saved!'); setSelected(p => p ? { ...p, pptUrl: pptEdit } : p) }
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

  const submitRating = async (ratingValue: number) => {
    if (!selected) return
    setMyRating(ratingValue)
    const d = await callAdmin('rate-lead', { leadId: selected.id, rating: ratingValue, notes: ratingNotes || null }, 'Rating saved!')
    if (d) {
      setSelected(p => p ? { ...p, avgRating: d.avgRating as number, ratingCount: d.ratingCount as number } : p)
      // also reflect it in the list without a full refetch
      setLeads(prev => prev.map(l => l.id === selected.id ? { ...l, avgRating: d.avgRating as number, ratingCount: d.ratingCount as number } : l))
    }
  }

  // ── ADD LEAD (manual entry) ──────────────────────────────────
  const submitAddLead = async () => {
    if (!addLeadForm.name || !addLeadForm.email || !addLeadForm.website || !addLeadForm.industry) {
      showToast('Name, email, website, and industry are required', 'error')
      return
    }
    setActionLoading('add-lead')
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addLeadForm),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Failed to add lead', 'error'); return }
      showToast('Lead added!')
      setShowAddLead(false)
      setAddLeadForm({ name: '', company: '', email: '', phone: '', website: '', industry: '', location: '', notes: '' })
      fetchLeads()
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading('')
    }
  }

  // ── CSV UPLOAD ────────────────────────────────────────────────
  const handleCsvFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    setCsvResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => setCsvText((ev.target?.result as string) ?? '')
    reader.readAsText(file)
  }

  const previewCsv = async () => {
    if (!csvText.trim()) return
    setActionLoading('csv-preview')
    try {
      const res = await fetch('/api/admin/upload-csv', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, mode: 'preview' }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Preview failed', 'error'); return }
      setCsvPreview(data)
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading('')
    }
  }

  const commitCsv = async () => {
    if (!csvText.trim()) return
    setCsvCommitting(true)
    try {
      const res = await fetch('/api/admin/upload-csv', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, mode: 'commit' }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Upload failed', 'error'); return }
      setCsvResult(data)
      setCsvPreview(null)
      showToast(`Imported ${data.summary.inserted} leads!`)
      fetchLeads()
    } catch {
      showToast('Network error', 'error')
    } finally {
      setCsvCommitting(false)
    }
  }

  const resetCsvUpload = () => {
    setCsvText(''); setCsvFileName(''); setCsvPreview(null); setCsvResult(null)
  }

  // ── TEAM MANAGEMENT ───────────────────────────────────────────
  const fetchTeam = useCallback(async () => {
    setTeamLoading(true)
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setTeamUsers(data.users ?? [])
    } finally {
      setTeamLoading(false)
    }
  }, [])

  useEffect(() => { if (view === 'team' && session?.role === 'ADMIN') fetchTeam() }, [view, session, fetchTeam])

  const createTeamUser = async () => {
    if (!newUserForm.name || !newUserForm.email) { showToast('Name and email required', 'error'); return }
    setActionLoading('create-user')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Failed to create user', 'error'); return }
      setNewUserTempPassword({ email: data.user.email, password: data.temporaryPassword })
      setNewUserForm({ name: '', email: '', role: 'LEAD_GEN' })
      fetchTeam()
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading('')
    }
  }

  const toggleUserActive = async (userId: string, active: boolean) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    fetchTeam()
  }

  const stats = { total: totalLeads, new: leads.filter(l => l.status === 'new').length, high: leads.filter(l => l.priority === 'high').length, paid: leads.filter(l => l.paid).length }
  const daysInactive = (l: Lead) => Math.floor((Date.now() - new Date(l.lastContact ?? l.createdAt).getTime()) / 86400000)

  // ── SESSION GATE ─────────────────────────────────────────────
  // Middleware already redirects anonymous /admin traffic to
  // /admin/login before this component would ever mount without a
  // cookie. This check exists for the case where a session expires
  // *while* the dashboard is open (e.g. after 30 days, or an admin
  // revokes it) — a client-side fetch starts returning 401s, at which
  // point we push the user to the same single login page rather than
  // rendering a second, separately-maintained login form here.
  useEffect(() => {
    if (!sessionLoading && !session) {
      window.location.href = '/admin/login'
    }
  }, [sessionLoading, session])

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] text-[#8892A4] text-sm">Loading...</div>
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] text-[#8892A4] text-sm">Redirecting to login...</div>
  }

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
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-bold text-sm">Vena<span style={{ color: '#FFD700' }}>%</span>Revenue <span className="text-[#8892A4] font-normal">CRM</span></div>
            </div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="text-xs">
                <div className="text-white font-medium">{session.name}</div>
                <div className="text-[#8892A4]">{ROLE_LABELS[session.role]}</div>
              </div>
              <button onClick={handleLogout} className="text-[10px] text-[#8892A4] hover:text-red-400 transition-colors">Sign out</button>
            </div>

            {/* Nav between views */}
            <div className="flex gap-1 mb-3">
              <button onClick={() => setView('pipeline')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${view === 'pipeline' ? 'bg-[#00F5D4]/15 text-[#00F5D4]' : 'text-[#8892A4] hover:bg-white/[0.04]'}`}>
                Pipeline
              </button>
              {can(session.role, 'UPLOAD_CSV') && (
                <button onClick={() => setView('upload')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${view === 'upload' ? 'bg-[#7B61FF]/15 text-[#7B61FF]' : 'text-[#8892A4] hover:bg-white/[0.04]'}`}>
                  Upload CSV
                </button>
              )}
              {can(session.role, 'MANAGE_USERS') && (
                <button onClick={() => setView('team')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${view === 'team' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'text-[#8892A4] hover:bg-white/[0.04]'}`}>
                  Team
                </button>
              )}
            </div>

            {view === 'pipeline' && (
              <>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[{ l: 'All', v: stats.total, c: '#8892A4' }, { l: 'New', v: stats.new, c: '#60A5FA' }, { l: 'Hot', v: stats.high, c: '#34D399' }, { l: 'Paid', v: stats.paid, c: '#F59E0B' }].map(s => (
                    <div key={s.l} className="text-center bg-white/[0.03] rounded-lg py-1.5">
                      <div className="font-bold text-sm" style={{ color: s.c }}>{s.v}</div>
                      <div className="text-[10px] text-[#8892A4]">{s.l}</div>
                    </div>
                  ))}
                </div>

                {can(session.role, 'ADD_LEAD') && (
                  <button onClick={() => setShowAddLead(true)}
                    className="w-full mb-2 px-3 py-2 bg-[#00F5D4]/10 border border-[#00F5D4]/30 rounded-lg text-xs text-[#00F5D4] font-bold hover:bg-[#00F5D4]/15 transition-colors">
                    + Add Lead
                  </button>
                )}

                <input type="text" placeholder="Search..." value={search} onChange={e => handleSearchChange(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2" />
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                    <option value="sent">Sent</option>
                  </select>
                  <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1) }} className="bg-[#131823] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <button onClick={() => { setNeedsFollowup(v => !v); setPage(1) }}
                  className={`w-full px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${needsFollowup ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'text-[#8892A4] border-white/[0.08] hover:border-orange-500/20'}`}>
                  ⚠ Needs Follow-up Only
                </button>
              </>
            )}
          </div>

          {view === 'pipeline' && (
            <>
              <div className="flex-1 overflow-y-auto">
                {loading ? <div className="p-6 text-center text-[#8892A4] text-sm">Loading...</div>
                  : leads.length === 0 ? <div className="p-6 text-center text-[#8892A4] text-sm">No leads match your filters.</div>
                  : leads.map(lead => (
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
                          {typeof lead.avgRating === 'number' && (
                            <span className="text-[10px] text-amber-300">{'★'.repeat(Math.round(lead.avgRating))}{'☆'.repeat(5 - Math.round(lead.avgRating))} <span className="text-[#8892A4]">({lead.ratingCount})</span></span>
                          )}
                          {daysInactive(lead) >= 3 && lead.status !== 'sent' && <span className="text-[10px] text-orange-400">⚠ {daysInactive(lead)}d</span>}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Pagination footer */}
              <div className="p-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#8892A4] hover:text-white disabled:opacity-30 transition-colors">← Prev</button>
                <span className="text-[11px] text-[#8892A4]">Page {page} of {totalPages} · {totalLeads} total</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#8892A4] hover:text-white disabled:opacity-30 transition-colors">Next →</button>
              </div>
            </>
          )}
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        {view === 'upload' ? (
          <CsvUploadPanel
            csvFileName={csvFileName} csvPreview={csvPreview} csvResult={csvResult}
            csvCommitting={csvCommitting} actionLoading={actionLoading}
            onFileChange={handleCsvFileChange} onPreview={previewCsv} onCommit={commitCsv} onReset={resetCsvUpload}
          />
        ) : view === 'team' ? (
          <TeamPanel
            users={teamUsers} loading={teamLoading} newUserForm={newUserForm} setNewUserForm={setNewUserForm}
            onCreate={createTeamUser} onToggleActive={toggleUserActive}
            tempPassword={newUserTempPassword} onDismissTempPassword={() => setNewUserTempPassword(null)}
            actionLoading={actionLoading} roleLabels={ROLE_LABELS}
          />
        ) : selected ? (
          <LeadDetailPanel
            selected={selected} session={session} tab={tab} setTab={setTab} actionLoading={actionLoading}
            auditEdit={auditEdit} setAuditEdit={setAuditEdit}
            notesEdit={notesEdit} setNotesEdit={setNotesEdit}
            loomEdit={loomEdit} setLoomEdit={setLoomEdit}
            pptEdit={pptEdit} setPptEdit={setPptEdit}
            followupDrafts={followupDrafts} setFollowupDrafts={setFollowupDrafts}
            salesAnalysis={salesAnalysis}
            objectionInput={objectionInput} setObjectionInput={setObjectionInput} objectionReply={objectionReply} setObjectionReply={setObjectionReply}
            quickInstruction={quickInstruction} setQuickInstruction={setQuickInstruction} quickDraft={quickDraft} setQuickDraft={setQuickDraft}
            testimonialDraft={testimonialDraft} setTestimonialDraft={setTestimonialDraft}
            loomScript={loomScript} setLoomScript={setLoomScript}
            outreachEmail={outreachEmail} setOutreachEmail={setOutreachEmail}
            selectedVector={selectedVector} setSelectedVector={setSelectedVector}
            competitorName={competitorName} setCompetitorName={setCompetitorName}
            specificLeak={specificLeak} setSpecificLeak={setSpecificLeak}
            ownerName={ownerName} setOwnerName={setOwnerName}
            researchProfile={researchProfile}
            myRating={myRating} ratingNotes={ratingNotes} setRatingNotes={setRatingNotes} onSubmitRating={submitRating}
            generateAudit={generateAudit} saveAudit={saveAudit} saveNotes={saveNotes} saveLoom={saveLoom} savePpt={savePpt}
            scoreLead={scoreLead} generateFollowup={generateFollowup} sendEmail={sendEmail} sendFollowup={sendFollowup}
            runSalesAssistant={runSalesAssistant} handleObjection={handleObjection} generateQuickEmail={generateQuickEmail}
            requestTestimonial={requestTestimonial} generateLoomScript={generateLoomScript} generateOutreachEmail={generateOutreachEmail}
            generatePdf={generatePdf} togglePaid={togglePaid} runResearch={runResearch}
            can={can}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8892A4]">
            <div className="text-center">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm">Select a lead from the sidebar</p>
              <p className="text-xs mt-2 text-[#8892A4]/60">{leads.length === 0 && totalLeads === 0 && 'No leads yet — add one or upload a CSV'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead modal */}
      {showAddLead && (
        <AddLeadModal
          form={addLeadForm} setForm={setAddLeadForm} onSubmit={submitAddLead}
          onClose={() => setShowAddLead(false)} loading={actionLoading === 'add-lead'}
        />
      )}
    </div>
  )
}

// ── ADD LEAD MODAL ─────────────────────────────────────────────
function AddLeadModal({ form, setForm, onSubmit, onClose, loading }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h3 className="font-display font-bold text-lg text-white mb-4">Add New Lead</h3>
        <div className="space-y-2.5">
          {[
            { k: 'name', l: 'Contact Name *', ph: 'Jane Doe' },
            { k: 'company', l: 'Company', ph: 'Acme Inc.' },
            { k: 'email', l: 'Email *', ph: 'jane@acme.com' },
            { k: 'phone', l: 'Phone', ph: '+1 555 0100' },
            { k: 'website', l: 'Website *', ph: 'acme.com' },
            { k: 'industry', l: 'Industry *', ph: 'MedSpa' },
            { k: 'location', l: 'Location', ph: 'Houston, TX' },
          ].map(f => (
            <div key={f.k}>
              <label className="text-[11px] text-[#8892A4] mb-1 block">{f.l}</label>
              <input value={form[f.k]} onChange={e => setForm((p: any) => ({ ...p, [f.k]: e.target.value }))}
                placeholder={f.ph}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30" />
            </div>
          ))}
          <div>
            <label className="text-[11px] text-[#8892A4] mb-1 block">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00F5D4]/30 resize-none" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/[0.06] rounded-lg text-sm text-white">Cancel</button>
          <button onClick={onSubmit} disabled={loading} className="flex-1 btn-primary justify-center disabled:opacity-50">
            <span>{loading ? 'Adding...' : 'Add Lead'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CSV UPLOAD PANEL ───────────────────────────────────────────
function CsvUploadPanel({ csvFileName, csvPreview, csvResult, csvCommitting, actionLoading, onFileChange, onPreview, onCommit, onReset }: any) {
  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
      <h1 className="font-display font-bold text-xl text-white mb-1">Upload Leads CSV</h1>
      <p className="text-[#8892A4] text-sm mb-6">Expected columns: contactName/name, email, companyName/company, website, phone, industry, location, notes. Header names are flexible — common variants are auto-detected.</p>

      {!csvResult && (
        <div className="glass border border-white/[0.06] rounded-xl p-6">
          <label className="block">
            <div className="border-2 border-dashed border-white/[0.12] rounded-xl p-8 text-center cursor-pointer hover:border-[#00F5D4]/30 transition-colors">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-sm text-white font-medium">{csvFileName || 'Click to choose a CSV file'}</div>
              <div className="text-xs text-[#8892A4] mt-1">Up to 5,000 rows per upload</div>
            </div>
            <input type="file" accept=".csv,text/csv" onChange={onFileChange} className="hidden" />
          </label>

          {csvFileName && !csvPreview && (
            <button onClick={onPreview} disabled={actionLoading === 'csv-preview'}
              className="btn-primary w-full justify-center mt-4 disabled:opacity-50">
              <span>{actionLoading === 'csv-preview' ? 'Analyzing...' : 'Preview Upload'}</span>
            </button>
          )}

          {csvPreview && (
            <div className="mt-5">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { l: 'Total Rows', v: csvPreview.summary.total, c: '#8892A4' },
                  { l: 'Valid', v: csvPreview.summary.valid, c: '#34D399' },
                  { l: 'Duplicates', v: csvPreview.summary.duplicate, c: '#F59E0B' },
                  { l: 'Invalid', v: csvPreview.summary.invalid, c: '#FF4D6D' },
                ].map((s: any) => (
                  <div key={s.l} className="text-center bg-white/[0.03] rounded-lg py-2">
                    <div className="font-bold text-lg" style={{ color: s.c }}>{s.v}</div>
                    <div className="text-[10px] text-[#8892A4]">{s.l}</div>
                  </div>
                ))}
              </div>

              {csvPreview.summary.unmappedHeaders?.length > 0 && (
                <div className="text-xs text-orange-400 mb-3">⚠ Unrecognized columns (ignored): {csvPreview.summary.unmappedHeaders.join(', ')}</div>
              )}

              <div className="max-h-64 overflow-y-auto border border-white/[0.06] rounded-lg mb-4">
                <table className="w-full text-xs">
                  <thead className="bg-white/[0.03] sticky top-0">
                    <tr><th className="text-left p-2 text-[#8892A4]">Row</th><th className="text-left p-2 text-[#8892A4]">Name</th><th className="text-left p-2 text-[#8892A4]">Email</th><th className="text-left p-2 text-[#8892A4]">Status</th></tr>
                  </thead>
                  <tbody>
                    {csvPreview.preview.map((r: any) => (
                      <tr key={r.rowNumber} className="border-t border-white/[0.04]">
                        <td className="p-2 text-[#8892A4]">{r.rowNumber}</td>
                        <td className="p-2 text-white">{r.data.name || '—'}</td>
                        <td className="p-2 text-white">{r.data.email || '—'}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.status === 'valid' ? 'bg-green-500/15 text-green-400' : r.status === 'duplicate' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'}`}>
                            {r.status}{r.reason ? ` — ${r.reason}` : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvPreview.preview.length < csvPreview.summary.total && (
                <p className="text-[11px] text-[#8892A4] mb-3">Showing first {csvPreview.preview.length} of {csvPreview.summary.total} rows.</p>
              )}

              <div className="flex gap-2">
                <button onClick={onReset} className="px-4 py-2.5 bg-white/[0.06] rounded-lg text-sm text-white">Cancel</button>
                <button onClick={onCommit} disabled={csvCommitting || csvPreview.summary.valid === 0}
                  className="flex-1 btn-primary justify-center disabled:opacity-50">
                  <span>{csvCommitting ? 'Importing...' : `Import ${csvPreview.summary.valid} Valid Leads`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {csvResult && (
        <div className="glass border border-[#00F5D4]/20 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-display font-bold text-lg text-white mb-1">{csvResult.summary.inserted} leads imported</h3>
          <p className="text-[#8892A4] text-sm mb-4">{csvResult.summary.duplicate} duplicates and {csvResult.summary.invalid} invalid rows were skipped.</p>
          <button onClick={onReset} className="btn-primary mx-auto"><span>Upload Another File</span></button>
        </div>
      )}
    </div>
  )
}

// ── TEAM MANAGEMENT PANEL (ADMIN only) ──────────────────────────
function TeamPanel({ users, loading, newUserForm, setNewUserForm, onCreate, onToggleActive, tempPassword, onDismissTempPassword, actionLoading, roleLabels }: any) {
  const ROLES = ['ADMIN', 'CLOSER', 'DATA_MANAGER', 'VIDEO_CREATOR', 'PPT_CREATOR', 'LEAD_GEN']
  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
      <h1 className="font-display font-bold text-xl text-white mb-1">Team Management</h1>
      <p className="text-[#8892A4] text-sm mb-6">Create accounts and control access by role. Deactivating a user revokes their session immediately.</p>

      {tempPassword && (
        <div className="glass border border-[#00F5D4]/30 rounded-xl p-4 mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-white font-bold mb-1">Account created for {tempPassword.email}</div>
            <div className="text-xs text-[#8892A4] mb-1">Temporary password (shown once — copy it now):</div>
            <code className="text-sm text-[#00F5D4] bg-black/30 px-2 py-1 rounded select-all">{tempPassword.password}</code>
          </div>
          <button onClick={onDismissTempPassword} className="text-[#8892A4] hover:text-white text-xs">✕</button>
        </div>
      )}

      <div className="glass border border-white/[0.06] rounded-xl p-5 mb-6">
        <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Add Team Member</h3>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input placeholder="Full name" value={newUserForm.name} onChange={e => setNewUserForm((p: any) => ({ ...p, name: e.target.value }))}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none" />
          <input placeholder="email@vena-revenue.com" value={newUserForm.email} onChange={e => setNewUserForm((p: any) => ({ ...p, email: e.target.value }))}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none" />
        </div>
        <select value={newUserForm.role} onChange={e => setNewUserForm((p: any) => ({ ...p, role: e.target.value }))}
          className="w-full bg-[#131823] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none">
          {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
        <button onClick={onCreate} disabled={actionLoading === 'create-user'} className="btn-primary disabled:opacity-50">
          <span>{actionLoading === 'create-user' ? 'Creating...' : 'Create Account'}</span>
        </button>
      </div>

      <div className="glass border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="text-left p-3 text-[#8892A4] text-xs">Name</th>
              <th className="text-left p-3 text-[#8892A4] text-xs">Role</th>
              <th className="text-left p-3 text-[#8892A4] text-xs">Last Login</th>
              <th className="text-left p-3 text-[#8892A4] text-xs">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-6 text-[#8892A4] text-sm">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-6 text-[#8892A4] text-sm">No users yet.</td></tr>
            ) : users.map((u: TeamUser) => (
              <tr key={u.id} className="border-t border-white/[0.04]">
                <td className="p-3"><div className="text-white font-medium">{u.name}</div><div className="text-[#8892A4] text-xs">{u.email}</div></td>
                <td className="p-3 text-[#8892A4]">{roleLabels[u.role]}</td>
                <td className="p-3 text-[#8892A4] text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                <td className="p-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {u.active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => onToggleActive(u.id, !u.active)} className="text-xs text-[#8892A4] hover:text-white">
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── STAR RATING WIDGET ──────────────────────────────────────────
function StarRating({ value, onRate, size = 'text-lg' }: { value: number; onRate: (v: number) => void; size?: string }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onRate(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          className={`${size} transition-colors leading-none`}>
          <span className={(hover || value) >= n ? 'text-amber-300' : 'text-white/15'}>★</span>
        </button>
      ))}
    </div>
  )
}

// ── LEAD DETAIL PANEL (header + action bar + tabs) ──────────────
function LeadDetailPanel(props: any) {
  const {
    selected, session, tab, setTab, actionLoading,
    myRating, ratingNotes, setRatingNotes, onSubmitRating,
    generateAudit, scoreLead, runResearch, generateFollowup, runSalesAssistant, generatePdf, sendEmail, togglePaid,
    auditEdit, setAuditEdit, notesEdit, setNotesEdit, loomEdit, setLoomEdit, pptEdit, setPptEdit,
    saveAudit, saveNotes, saveLoom, savePpt, sendFollowup,
    followupDrafts, setFollowupDrafts,
    salesAnalysis,
    objectionInput, setObjectionInput, objectionReply, setObjectionReply, handleObjection,
    quickInstruction, setQuickInstruction, quickDraft, setQuickDraft, generateQuickEmail,
    testimonialDraft, setTestimonialDraft, requestTestimonial,
    loomScript, setLoomScript, generateLoomScript,
    outreachEmail, setOutreachEmail, generateOutreachEmail,
    selectedVector, setSelectedVector, competitorName, setCompetitorName, specificLeak, setSpecificLeak,
    ownerName, setOwnerName,
    researchProfile,
    can,
  } = props

  const onCopy = (msg: string) => {
    // Toast is owned by the top-level dashboard; this component has no
    // direct access to it, so we use a transient custom event the page
    // shell listens for. Simpler than threading one more prop through
    // every nested handler.
    window.dispatchEvent(new CustomEvent('vena-toast', { detail: msg }))
  }

  const TABS: [string, string, string | null][] = [
    ['details', '📋 Details', null],
    ['audit', '📝 Audit', 'VIEW_AUDIT'],
    ['outreach', '📤 Outreach', null],
    ['ai_tools', '🤖 AI Tools', 'AI_CHAT_TOOLS'],
    ['research', '🔍 Research', 'RUN_RESEARCH'],
  ]
  const visibleTabs = TABS.filter(([, , perm]) => !perm || can(session.role, perm))

  const actionButtons = [
    { l: '🔬 Audit', k: 'generate-audit', a: generateAudit, c: '#00F5D4', perm: 'GENERATE_AUDIT' },
    { l: '📊 Score', k: 'score-lead', a: scoreLead, c: '#7B61FF', perm: 'SCORE_LEAD' },
    { l: '🔍 Research', k: 'research-lead', a: runResearch, c: '#60A5FA', perm: 'RUN_RESEARCH' },
    { l: '💬 Follow-ups', k: 'generate-followup', a: generateFollowup, c: '#7B61FF', perm: 'AI_CHAT_TOOLS' },
    { l: '🧠 Sales Intel', k: 'sales-assistant', a: runSalesAssistant, c: '#F59E0B', perm: 'AI_CHAT_TOOLS' },
    { l: '📄 PDF', k: 'generate-pdf', a: generatePdf, c: '#8892A4', perm: 'VIEW_AUDIT' },
    { l: '📧 Send Audit', k: 'send-email', a: sendEmail, c: '#34D399', perm: 'SEND_EMAIL' },
  ].filter(btn => can(session.role, btn.perm))

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5 max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h1 className="font-display font-bold text-xl text-white">{selected.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#8892A4]">
              {selected.company && <><span>{selected.company}</span><span>·</span></>}
              <a href={`mailto:${selected.email}`} className="hover:text-[#00F5D4]">{selected.email}</a>
              <span>·</span>
              <a href={selected.website?.startsWith('http') ? selected.website : `https://${selected.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00F5D4]">{selected.website}</a>
              <span>·</span><span>{selected.industry}</span>
              {selected.location && <><span>·</span><span>{selected.location}</span></>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {can(session.role, 'HANDLE_PAYMENTS') && (
              <button onClick={togglePaid} disabled={actionLoading === 'mark-paid'}
                className={`text-[10px] px-2 py-1 rounded-full border font-bold transition-all ${selected.paid ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'text-[#8892A4] border-white/10 hover:border-yellow-500/30'}`}>
                {selected.paid ? 'PAID ✓' : 'Mark Paid'}
              </button>
            )}
            {!can(session.role, 'HANDLE_PAYMENTS') && selected.paid && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">PAID ✓</span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${SC[selected.status] ?? ''}`}>{selected.status}</span>
            {selected.priority && <span className={`text-xs font-bold ${PC[selected.priority] ?? ''}`}>{selected.priority.toUpperCase()}{selected.score != null ? ` ${selected.score}/100` : ''}</span>}
          </div>
        </div>

        {/* Rating widget — everyone can rate, this is how the team flags priority */}
        <div className="glass border border-white/[0.06] rounded-xl p-3 mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8892A4]">Your rating:</span>
            <StarRating value={myRating} onRate={onSubmitRating} />
            {typeof selected.avgRating === 'number' && (
              <span className="text-xs text-[#8892A4]">Team avg: <span className="text-amber-300 font-bold">{selected.avgRating.toFixed(1)}</span> ({selected.ratingCount})</span>
            )}
          </div>
          <input value={ratingNotes} onChange={(e: any) => setRatingNotes(e.target.value)} placeholder="Why this rating? (optional)"
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8892A4] focus:outline-none flex-1 min-w-[180px]" />
        </div>

        {/* Action bar — role-gated */}
        {actionButtons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 p-3 glass border border-white/[0.06] rounded-xl">
            {actionButtons.map(btn => (
              <button key={btn.k} onClick={btn.a} disabled={actionLoading === btn.k}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
                style={{ borderColor: `${btn.c}40`, color: btn.c, backgroundColor: `${btn.c}10` }}>
                {actionLoading === btn.k ? '⏳...' : btn.l}
              </button>
            ))}
          </div>
        )}

        {/* Tabs — role-gated */}
        <div className="flex gap-0.5 mb-4 border-b border-white/[0.06]">
          {visibleTabs.map(([id, label]) => (
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
                    </div>
                    <div className="glass border border-white/[0.06] rounded-xl p-4">
                      <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Admin Notes</h3>
                      <textarea rows={4} value={notesEdit} onChange={e => setNotesEdit(e.target.value)} placeholder="Internal notes — never sent to client..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 resize-none" />
                      <button onClick={saveNotes} className="mt-2 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">Save Notes</button>
                    </div>
                    {can(session.role, 'ATTACH_LOOM_URL') && (
                      <div className="glass border border-white/[0.06] rounded-xl p-4">
                        <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Loom Video URL <span className="text-[#8892A4] font-normal">— Video Creator</span></h3>
                        <input type="url" value={loomEdit} onChange={e => setLoomEdit(e.target.value)} placeholder="https://loom.com/share/..."
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#00F5D4]/30 mb-2" />
                        <button onClick={saveLoom} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">Save Loom URL</button>
                      </div>
                    )}
                    {!can(session.role, 'ATTACH_LOOM_URL') && selected.loomUrl && (
                      <div className="glass border border-white/[0.06] rounded-xl p-4">
                        <h3 className="font-bold text-xs text-[#00F5D4] mb-2 uppercase tracking-wider">Loom Video</h3>
                        <a href={selected.loomUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00F5D4] hover:underline break-all">{selected.loomUrl}</a>
                      </div>
                    )}
                    {can(session.role, 'ATTACH_PPT_URL') && (
                      <div className="glass border border-white/[0.06] rounded-xl p-4">
                        <h3 className="font-bold text-xs text-[#7B61FF] mb-2 uppercase tracking-wider">Audit PPT URL <span className="text-[#8892A4] font-normal">— PPT Creator</span></h3>
                        <input type="url" value={pptEdit} onChange={e => setPptEdit(e.target.value)} placeholder="https://docs.google.com/presentation/..."
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-[#8892A4] focus:outline-none focus:border-[#7B61FF]/30 mb-2" />
                        <button onClick={savePpt} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg text-xs text-white transition-colors">Save PPT URL</button>
                      </div>
                    )}
                    {!can(session.role, 'ATTACH_PPT_URL') && selected.pptUrl && (
                      <div className="glass border border-white/[0.06] rounded-xl p-4">
                        <h3 className="font-bold text-xs text-[#7B61FF] mb-2 uppercase tracking-wider">Audit PPT</h3>
                        <a href={selected.pptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7B61FF] hover:underline break-all">{selected.pptUrl}</a>
                      </div>
                    )}
                    {/* Payment link — Closer's domain */}
                    {can(session.role, 'HANDLE_PAYMENTS') && (
                      <div className="glass border border-white/[0.06] rounded-xl p-4">
                        <h3 className="font-bold text-xs text-[#F59E0B] mb-2 uppercase tracking-wider">Payment Link</h3>
                        <div className="bg-black/20 rounded-lg px-3 py-2 text-xs text-[#8892A4] font-mono break-all mb-2">
                          {typeof window !== 'undefined' ? `${window.location.origin}/pay?leadId=${selected.id}` : `/pay?leadId=${selected.id}`}
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/pay?leadId=${selected.id}`).then(() => onCopy('Payment link copied!')) }}
                          className="px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg text-xs text-[#F59E0B] font-bold">
                          Copy Payment Link
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="glass border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-xs text-[#00F5D4] mb-3 uppercase tracking-wider">Activity Timeline</h3>
                    {(selected.interactions ?? []).length === 0 ? <p className="text-[#8892A4] text-xs">No activity yet.</p> : (
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
                        <button onClick={() => navigator.clipboard.writeText(loomScript).then(() => onCopy('Script copied!'))}
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
                        <button onClick={() => navigator.clipboard.writeText(outreachEmail).then(() => onCopy('Email copied!'))}
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
                          {can(session.role, 'SEND_EMAIL') && (
                            <button onClick={() => sendFollowup(followupDrafts)} disabled={actionLoading === 'send-followup'}
                              className="px-4 py-2 bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 rounded-lg text-xs text-[#FF4D6D] font-bold disabled:opacity-40">
                              {actionLoading === 'send-followup' ? 'Sending...' : 'Send This Follow-up'}
                            </button>
                          )}
                          <button onClick={() => navigator.clipboard.writeText(followupDrafts).then(() => onCopy('Copied!'))}
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
                          <div className="font-display font-bold text-lg text-[#FF4D6D]">{researchProfile.estimatedMonthlyLeakage || 'Not enough data'}</div>
                          {researchProfile.leakageReasoning && (
                            <div className="text-[10px] text-[#8892A4] mt-1.5 leading-snug">{researchProfile.leakageReasoning}</div>
                          )}
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
                          {Object.entries(researchProfile.industryBenchmarks as Record<string, string>).map(([k, v]) => (
                            <div key={k} className="text-center">
                              <div className="text-[10px] text-[#8892A4] mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                              <div className="font-bold text-sm text-white">{String(v)}</div>
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
  )
}
