import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

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
