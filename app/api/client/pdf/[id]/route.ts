import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public-facing PDF download for a paying client — gated on `paid: true`
// rather than an admin session, since the buyer has no dashboard login.
// Still scoped to select only what's needed; never returns pdfData to
// anything other than the binary response itself.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    select: { name: true, paid: true, pdfData: true },
  })

  if (!lead || !lead.paid || !lead.pdfData) {
    return NextResponse.json({ error: 'Report not available' }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(lead.pdfData), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="audit-${lead.name.replace(/\s+/g, '-')}.pdf"`,
    },
  })
}
