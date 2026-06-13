import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { interactions: { orderBy: { createdAt: 'asc' } } },
    })
    return NextResponse.json({ leads })
  } catch (error) {
    console.error('[admin/leads]', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}