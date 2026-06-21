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
    const { leadId, notes } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    await prisma.lead.update({ where: { id: leadId }, data: { notes } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[save-notes]', error)
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }
}
