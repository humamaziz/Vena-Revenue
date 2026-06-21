import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

// Single-lead detail fetch — includes interactions and ratings, which
// the paginated list route intentionally omits to stay cheap at scale.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'VIEW_LEADS_BASIC')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const isRestrictedRole = session.role === 'LEAD_GEN'

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, company: true, email: true, phone: true, website: true,
        industry: true, location: true, status: true, createdAt: true, lastContact: true,
        ...(isRestrictedRole
          ? {}
          : {
              goal: true, revenue: true, adspend: true, budget: true, audit: true, preview: true,
              score: true, priority: true, paid: true, paymentId: true, paymentDate: true,
              pdfUrl: true, pdfGeneratedAt: true, loomUrl: true, pptUrl: true, source: true,
              notes: true, createdByRole: true,
              interactions: { orderBy: { createdAt: 'asc' } },
              ratings: { include: { ratedBy: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' } },
            }),
      },
    })

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json({ lead })
  } catch (error) {
    console.error('[admin/leads/:id]', error)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can delete leads' }, { status: 403 })
  }
  try {
    await prisma.lead.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/leads/:id DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
