import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId, paid } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    await prisma.lead.update({ where: { id: leadId }, data: { paid: paid ?? true } })
    await prisma.interaction.create({
      data: { leadId, type: 'payment', content: `Manually marked as ${paid ? 'paid' : 'unpaid'} by admin.` },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}