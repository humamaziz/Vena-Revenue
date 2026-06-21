import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LEAD_SAFE_SELECT } from '@/lib/leadSelect.ts'
import { sendFollowUpEmail } from '@/lib/email'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'SEND_EMAIL')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { leadId, content } = await req.json()
    if (!leadId || !content) return NextResponse.json({ error: 'leadId and content required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: LEAD_SAFE_SELECT })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    await sendFollowUpEmail({ name: lead.name, email: lead.email, content })

    await prisma.lead.update({
      where: { id: leadId },
      data: { lastContact: new Date() },
    })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'followup',
        content: `Follow-up email sent: ${content.slice(0, 200)}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[send-followup]', error)
    return NextResponse.json({ error: 'Failed to send follow-up' }, { status: 500 })
  }
}
