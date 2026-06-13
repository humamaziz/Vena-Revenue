import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId, loomUrl } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    await prisma.lead.update({ where: { id: leadId }, data: { loomUrl } })

    await prisma.interaction.create({
      data: { leadId, type: 'loom', content: `Loom video added: ${loomUrl}` },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[add-loom]', error)
    return NextResponse.json({ error: 'Failed to save Loom URL' }, { status: 500 })
  }
}