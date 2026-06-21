import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'EDIT_LEAD')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { leadId, audit, status } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const data: Record<string, string> = {}
    if (audit !== undefined) data.audit = audit
    if (status !== undefined) data.status = status

    await prisma.lead.update({ where: { id: leadId }, data })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'edit',
        content: `Audit edited by admin. Status set to: ${status ?? 'unchanged'}.`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[update-lead]', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
