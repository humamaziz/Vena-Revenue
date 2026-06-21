import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LEAD_SAFE_SELECT } from '@/lib/leadSelect'
import { sendAuditEmail } from '@/lib/email'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'SEND_EMAIL')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { leadId } = await req.json()
    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: LEAD_SAFE_SELECT })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    if (!lead.audit) {
      return NextResponse.json(
        { error: 'No audit found. Generate the AI audit before sending email.' },
        { status: 400 }
      )
    }

    // Verify email config is present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: 'Email not configured. Set EMAIL_USER and EMAIL_PASS in environment variables.' },
        { status: 500 }
      )
    }

    await sendAuditEmail({
      name: lead.name,
      email: lead.email,
      audit: lead.audit,
      loomUrl: lead.loomUrl,
    })

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'sent',
        lastContact: new Date(),
      },
    })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'email',
        content: `Audit email sent to ${lead.email}.${lead.loomUrl ? ` Loom video included.` : ''}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[send-email]', message)
    return NextResponse.json(
      { error: `Failed to send email: ${message}` },
      { status: 500 }
    )
  }
}
