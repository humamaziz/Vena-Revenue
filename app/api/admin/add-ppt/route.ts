import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'ATTACH_PPT_URL')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { leadId, pptUrl } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    await prisma.lead.update({ where: { id: leadId }, data: { pptUrl } })
    await prisma.interaction.create({
      data: { leadId, type: 'ppt', content: `${session.name} attached the audit PPT: ${pptUrl}` },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[add-ppt]', error)
    return NextResponse.json({ error: 'Failed to save PPT URL' }, { status: 500 })
  }
}
