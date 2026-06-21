import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

// The ONLY route allowed to select pdfData. Every other query (leads
// list, single-lead detail, client portal) must omit this field — it's
// a Bytes column holding the full PDF binary and including it anywhere
// else is exactly what caused the original memory crash.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'VIEW_AUDIT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    select: { name: true, pdfData: true },
  })

  if (!lead || !lead.pdfData) {
    return NextResponse.json({ error: 'No PDF found for this lead' }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(lead.pdfData), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="audit-${lead.name.replace(/\s+/g, '-')}.pdf"`,
    },
  })
}
