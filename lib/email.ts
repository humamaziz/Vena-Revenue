import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function sendAdminNotification(lead: {
  name: string
  email: string
  website: string
  industry: string
  goal: string
  revenue?: string | null
  adspend?: string | null
  budget?: string | null
  problem?: string | null
  location?: string | null
}) {
  const transporter = getTransporter()
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_USER ?? ''

  await transporter.sendMail({
    from: `"Vena%Revenue System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Lead 🚀 — ${lead.name} (${lead.industry})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
        <h2 style="color: #00F5D4;">New Lead Submitted</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Name</td><td>${lead.name}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Email</td><td>${lead.email}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Website</td><td>${lead.website}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Industry</td><td>${lead.industry}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Goal</td><td>${lead.goal}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Monthly Revenue</td><td>${lead.revenue ?? '—'}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Ad Spend</td><td>${lead.adspend ?? '—'}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Budget</td><td>${lead.budget ?? '—'}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Location</td><td>${lead.location ?? '—'}</td></tr>
        </table>
        <h3>Challenge</h3>
        <p>${lead.problem ?? '—'}</p>
        <hr/>
        <p style="color:#999; font-size:12px;">Review in admin dashboard → /admin</p>
      </div>
    `,
  })
}

export async function sendAuditEmail(lead: {
  name: string
  email: string
  audit: string
  loomUrl?: string | null
}) {
  const transporter = getTransporter()

  const auditHtml = lead.audit
    .split('\n')
    .map((line) => {
      if (/^\d+\./.test(line.trim()) || line.trim().startsWith('#')) {
        return `<h3 style="color:#00F5D4; margin-top:16px;">${line}</h3>`
      }
      return `<p style="margin:4px 0; color:#333;">${line}</p>`
    })
    .join('')

  await transporter.sendMail({
    from: `"Vena%Revenue" <${process.env.EMAIL_USER}>`,
    to: lead.email,
    subject: 'Your Revenue Audit is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0B0F1A; color: #E6E9F2; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #00F5D4; margin: 0;">Vena<span style="color: #FFD700;">%</span>Revenue</h1>
          <p style="color: #8892A4; margin: 8px 0 0;">Revenue Intelligence Platform</p>
        </div>

        <h2 style="color: #E6E9F2;">Hi ${lead.name},</h2>
        <p style="color: #8892A4; line-height: 1.6;">
          Your revenue audit is complete. Below is a breakdown of where your business is leaking money and what to do about it.
        </p>

        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin: 24px 0;">
          ${auditHtml}
        </div>

        ${lead.loomUrl ? `
        <div style="background: rgba(0,245,212,0.06); border: 1px solid rgba(0,245,212,0.2); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="color: #E6E9F2; margin: 0 0 12px; font-weight: bold;">🎥 Personalized Video Breakdown</p>
          <a href="${lead.loomUrl}" style="display: inline-block; background: linear-gradient(135deg, #00F5D4, #7B61FF); color: #0B0F1A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Watch Your Loom Video →</a>
        </div>
        ` : `
        <div style="background: rgba(0,245,212,0.06); border: 1px solid rgba(0,245,212,0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #E6E9F2; margin: 0; font-weight: bold;">📹 Next Step</p>
          <p style="color: #8892A4; margin: 8px 0 0;">We'll follow up with a personalized Loom video walking through exactly how we'd fix the top issues identified above.</p>
        </div>
        `}

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06);">
          <p style="color: #8892A4; font-size: 12px;">Vena%Revenue · Revenue Engineering Platform</p>
        </div>
      </div>
    `,
  })
}

export async function sendFollowUpEmail(lead: {
  name: string
  email: string
  content: string
}) {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: `"Vena%Revenue" <${process.env.EMAIL_USER}>`,
    to: lead.email,
    subject: `Following up — ${lead.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
        <p>Hi ${lead.name},</p>
        ${lead.content.split('\n').map((p) => `<p>${p}</p>`).join('')}
        <p style="margin-top: 24px; color: #999; font-size: 12px;">Vena%Revenue</p>
      </div>
    `,
  })
}
