import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendFollowUpEmail } from '@/lib/email'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId, content } = await req.json()
    if (!leadId || !content) return NextResponse.json({ error: 'leadId and content required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
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
