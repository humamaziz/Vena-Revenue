import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
}

// ── ADMIN NOTIFICATION ───────────────────────────────────────
export async function sendAdminNotification(lead: {
  name: string; email: string; website: string; industry: string
  goal: string; location?: string | null; revenue?: string | null
  adspend?: string | null; budget?: string | null; problem?: string | null
}) {
  const transporter = getTransporter()
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_USER ?? ''
  const hasAdSpend = lead.adspend && lead.adspend !== 'None'
  const rows = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['Website', lead.website],
    ['Industry', lead.industry],
    ['Location', lead.location ?? '-'],
    ['Goal', lead.goal],
    ['Monthly Revenue', lead.revenue ?? '-'],
    ['Ad Spend', lead.adspend ?? '-'],
    ['Budget', lead.budget ?? '-'],
  ]
  await transporter.sendMail({
    from: `"Vena%Revenue System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Lead 🚀 - ${lead.name} (${lead.industry}${lead.location ? `, ${lead.location}` : ''})`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:620px;background:#0B0F1A;color:#E6E9F2;padding:28px;border-radius:12px;">
  <h2 style="color:#00F5D4;margin-top:0;">New Lead Submitted</h2>
  ${hasAdSpend ? '<div style="background:rgba(0,245,212,0.08);border:1px solid rgba(0,245,212,0.25);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#00F5D4;">⚡ Running paid ads - ${lead.adspend}/month. Conversion leak likely active.</div>' : '<div style="background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.25);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#FF4D6D;">⚠ Not running ads - missed acquisition channel. Flag in audit.</div>'}
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    ${rows.map(([k, v]) => `<tr><td style="padding:7px 10px;color:#8892A4;font-weight:bold;width:130px;border-bottom:1px solid #1E2535;">${k}</td><td style="padding:7px 10px;color:#E6E9F2;border-bottom:1px solid #1E2535;">${v}</td></tr>`).join('')}
  </table>
  <p style="margin-top:20px;color:#8892A4;font-size:12px;">Review and generate audit at <a href="/admin" style="color:#00F5D4;">/admin</a></p>
</div>`,
  })
}

// ── AUDIT EMAIL TO CLIENT ────────────────────────────────────
// Renders the new 8-pillar markdown audit properly in dark HTML email
export async function sendAuditEmail(lead: {
  name: string; email: string; audit: string; loomUrl?: string | null
}) {
  const transporter = getTransporter()
  const firstName = lead.name.split(' ')[0]
  const auditHtml = renderAuditToHtml(lead.audit)

  await transporter.sendMail({
    from: `"Ansh - Vena%Revenue" <${process.env.EMAIL_USER}>`,
    to: lead.email,
    subject: `Your Revenue Audit - Vena%Revenue`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0F1A;">
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#0B0F1A;color:#E6E9F2;padding:36px 32px;">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #1E2535;">
    <div style="font-size:22px;font-weight:bold;color:#00F5D4;">Vena<span style="color:#FFD700;">%</span>Revenue</div>
    <div style="color:#8892A4;font-size:12px;margin-top:4px;">Revenue Intelligence Platform</div>
  </div>

  <!-- Intro -->
  <h2 style="color:#E6E9F2;margin-top:0;">${firstName},</h2>
  <p style="color:#8892A4;line-height:1.7;margin-bottom:24px;">
    Your Comprehensive Revenue Leak &amp; Growth Audit is complete. What follows is a full 8-pillar analysis of where your business is losing money, who in your market is capturing it instead, and the exact moves that close the gap.
  </p>

  ${lead.loomUrl ? `
  <!-- Loom CTA -->
  <div style="background:rgba(0,245,212,0.07);border:1px solid rgba(0,245,212,0.22);border-radius:10px;padding:18px 20px;margin-bottom:28px;text-align:center;">
    <div style="color:#E6E9F2;font-weight:bold;font-size:15px;margin-bottom:10px;">🎥 Watch the Loom Walkthrough First</div>
    <div style="color:#8892A4;font-size:13px;margin-bottom:14px;">I recorded a 90-second video walking through your biggest leak and why your competitor is winning on it right now.</div>
    <a href="${lead.loomUrl}" style="display:inline-block;background:linear-gradient(135deg,#00F5D4,#7B61FF);color:#0B0F1A;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Watch the Video →</a>
  </div>` : ''}

  <!-- Audit Content -->
  <div style="background:#111827;border:1px solid #1E2535;border-radius:12px;padding:28px;margin-bottom:28px;">
    ${auditHtml}
  </div>

  <!-- Next Step CTA -->
  <div style="background:rgba(123,97,255,0.07);border:1px solid rgba(123,97,255,0.22);border-radius:10px;padding:18px 20px;margin-bottom:28px;">
    <div style="color:#E6E9F2;font-weight:bold;font-size:15px;margin-bottom:8px;">📞 Ready to fix this?</div>
    <p style="color:#8892A4;font-size:13px;line-height:1.6;margin:0 0 14px;">
      The audit fee is credited 100% toward the build if you sign within 14 days. Reply to this email or click below to choose your implementation tier.
    </p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vena-revenue.vercel.app'}/pay" style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(123,97,255,0.4);color:#A78BFA;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">View Implementation Options →</a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding-top:20px;border-top:1px solid #1E2535;">
    <div style="color:#8892A4;font-size:11px;">Ansh · Vena%Revenue · Revenue Engineering Platform</div>
    <div style="color:#8892A4;font-size:11px;margin-top:4px;">This audit is confidential and prepared exclusively for ${lead.name}.</div>
  </div>

</div>
</body>
</html>`,
  })
}

// ── FOLLOW-UP EMAIL ──────────────────────────────────────────
export async function sendFollowUpEmail(lead: { name: string; email: string; content: string }) {
  const transporter = getTransporter()
  const paragraphs = lead.content
    .split('\n')
    .filter((l) => l.trim())
    .map((p) => `<p style="margin:0 0 14px;color:#333;line-height:1.65;">${p}</p>`)
    .join('')

  await transporter.sendMail({
    from: `"Ansh - Vena%Revenue" <${process.env.EMAIL_USER}>`,
    to: lead.email,
    subject: `Re: Your Revenue Audit`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:580px;padding:24px;color:#333;">
  ${paragraphs}
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999;">
    Ansh · Vena%Revenue
  </div>
</div>`,
  })
}

// ── AUDIT HTML RENDERER ──────────────────────────────────────
// Converts the new 8-pillar markdown audit format to styled HTML for email
function renderAuditToHtml(audit: string): string {
  const lines = audit.split('\n')
  const out: string[] = []
  let inDiagram = false
  let diagramLines: string[] = []
  let inTable = false
  let tableRows: string[] = []

  const flushDiagram = () => {
    if (diagramLines.length > 0) {
      out.push(`<div style="background:#0B0F1A;border:1px solid #2A3142;border-radius:6px;padding:12px;margin:12px 0;overflow-x:auto;">
        <pre style="font-family:Courier,monospace;font-size:11px;color:#8FE3D8;margin:0;line-height:1.4;">${diagramLines.join('\n')}</pre>
      </div>`)
      diagramLines = []
    }
    inDiagram = false
  }

  const flushTable = () => {
    if (tableRows.length > 1) {
      const [headerLine, , ...dataLines] = tableRows
      const headers = splitPipeRow(headerLine)
      const rows = dataLines.map(splitPipeRow)
      out.push(`<table style="width:100%;border-collapse:collapse;font-size:12px;margin:10px 0;">
        <thead><tr>${headers.map(h => `<th style="padding:7px 10px;background:#1B2230;color:#00F5D4;text-align:left;border:1px solid #2A3142;">${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((row, ri) => `<tr style="background:${ri % 2 === 0 ? '#111827' : '#0E1320'}">${row.map(cell => `<td style="padding:7px 10px;color:#C8CDD8;border:1px solid #2A3142;">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`)
      tableRows = []
    }
    inTable = false
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (inDiagram) { flushDiagram(); continue }
      if (inTable) flushTable()
      inDiagram = true; continue
    }
    if (inDiagram) { diagramLines.push(line); continue }

    if (trimmed.startsWith('|')) {
      inTable = true; tableRows.push(trimmed); continue
    }
    if (inTable && !trimmed.startsWith('|')) flushTable()

    if (trimmed.startsWith('# ')) {
      out.push(`<h2 style="color:#E6E9F2;font-size:17px;margin:20px 0 8px;padding-bottom:8px;border-bottom:1px solid #1E2535;">${trimmed.slice(2)}</h2>`)
    } else if (trimmed.startsWith('## ')) {
      out.push(`<h3 style="color:#00F5D4;font-size:13px;font-weight:bold;margin:18px 0 6px;text-transform:uppercase;letter-spacing:0.05em;">${trimmed.slice(3)}</h3>`)
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80) {
      out.push(`<p style="color:#A78BFA;font-weight:bold;font-size:12px;margin:12px 0 4px;">${trimmed.replace(/\*\*/g, '')}</p>`)
    } else if (trimmed.startsWith('───►') || trimmed.includes('───►') || trimmed.startsWith('────')) {
      out.push(`<div style="background:#0B0F1A;border:1px solid #2A3142;border-radius:6px;padding:10px 14px;margin:8px 0;font-family:Courier,monospace;font-size:11px;color:#8FE3D8;">${escapeHtml(trimmed)}</div>`)
    } else if (trimmed.startsWith('Before:') || trimmed.startsWith('After:')) {
      const isAfter = trimmed.startsWith('After:')
      out.push(`<div style="background:${isAfter ? 'rgba(0,245,212,0.06)' : 'rgba(255,77,109,0.06)'};border-left:3px solid ${isAfter ? '#00F5D4' : '#FF4D6D'};padding:8px 12px;margin:6px 0;font-size:12px;color:#C8CDD8;"><strong style="color:${isAfter ? '#00F5D4' : '#FF4D6D'}">${trimmed.split(':')[0]}:</strong> ${trimmed.slice(trimmed.indexOf(':') + 1).trim()}</div>`)
    } else if (trimmed) {
      out.push(`<p style="color:#C8CDD8;font-size:13px;line-height:1.7;margin:6px 0;">${trimmed.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E6E9F2;">$1</strong>')}</p>`)
    } else {
      out.push('<div style="height:8px;"></div>')
    }
  }
  if (inDiagram) flushDiagram()
  if (inTable) flushTable()

  return out.join('\n')
}

function splitPipeRow(line: string): string[] {
  return line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim().replace(/\*\*/g, ''))
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}