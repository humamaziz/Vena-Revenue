import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Explicit `select` here is load-bearing, not stylistic: without it,
// Prisma returns every scalar column on Lead by default — including
// pdfData (Bytes, can be 100KB-2MB) and the full audit text — even
// though only a handful of fields are ever sent to the client. That
// unscoped over-fetch was a contributor to the memory pressure that
// caused "Array buffer allocation failed" once leads accumulated PDFs.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const lead = await prisma.lead.findFirst({
      where: { email: email.toLowerCase().trim() },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        paid: true,
        audit: true,
        preview: true,
        pdfGeneratedAt: true,
        loomUrl: true,
        pptUrl: true,
        createdAt: true,
        interactions: {
          orderBy: { createdAt: 'asc' },
          select: { type: true, createdAt: true },
        },
      },
    })

    if (!lead) return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 })

    return NextResponse.json({
      lead: {
        name: lead.name,
        status: lead.status,
        paid: lead.paid,
        audit: lead.status === 'sent' || lead.paid ? lead.audit : null,
        preview: lead.preview,
        // Public download endpoint — never the raw bytes, never the old
        // base64 data: URL. Only present once a PDF actually exists.
        pdfUrl: lead.paid && lead.pdfGeneratedAt ? `/api/client/pdf/${lead.id}` : null,
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
