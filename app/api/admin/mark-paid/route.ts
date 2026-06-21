import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'HANDLE_PAYMENTS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { leadId, paid } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    await prisma.lead.update({
      where: { id: leadId },
      data: { paid: paid ?? true, paymentDate: paid ?? true ? new Date() : null },
    })
    await prisma.interaction.create({
      data: { leadId, type: 'payment', content: `Manually marked as ${paid ?? true ? 'PAID' : 'unpaid'} by ${session.name} (${session.role}). Use this sparingly — payments should auto-confirm via the PayPal webhook.` },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}