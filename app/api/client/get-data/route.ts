import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const lead = await prisma.lead.findFirst({
      where: { email: email.toLowerCase().trim() },
      orderBy: { createdAt: 'desc' },
      include: {
        interactions: {
          orderBy: { createdAt: 'asc' },
          select: { type: true, createdAt: true },
        },
      },
    })

    if (!lead) return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 })

    // Return only what client should see — never expose internal notes/admin data
    return NextResponse.json({
      lead: {
        name: lead.name,
        status: lead.status,
        paid: lead.paid,
        audit: lead.status === 'sent' || lead.paid ? lead.audit : null,
        preview: lead.preview,
        pdfUrl: lead.paid && lead.pdfUrl ? lead.pdfUrl : null,
        loomUrl: lead.loomUrl,
        createdAt: lead.createdAt,
        interactions: lead.interactions,
      },
    })
  } catch (error) {
    console.error('[client/get-data]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
