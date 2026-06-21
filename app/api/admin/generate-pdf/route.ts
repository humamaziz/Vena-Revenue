import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAuditPDF } from '@/lib/generatePdf'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

// CRITICAL: the PDF's binary bytes go into `pdfData` (a Bytes column),
// never into `pdfUrl`. `pdfUrl` only ever holds the short internal
// download path. Storing a base64 data: URL in a String/TEXT column was
// the original cause of the "Array buffer allocation failed" crash —
// every unscoped lead query (list view, client portal, etc.) was pulling
// a multi-hundred-KB string per row into memory and re-serializing it.
// See the comment on the Lead model in schema.prisma for the full story.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'VIEW_AUDIT')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { leadId } = await req.json()
    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    if (!lead.audit) {
      return NextResponse.json(
        { error: 'No audit found. Generate the AI audit first before creating a PDF.' },
        { status: 400 }
      )
    }

    const pdfBuffer = await generateAuditPDF({
      name: lead.name,
      email: lead.email,
      website: lead.website,
      industry: lead.industry,
      goal: lead.goal ?? '',
      audit: lead.audit,
      createdAt: lead.createdAt,
    })

    // Store the actual bytes in pdfData; pdfUrl is just the short path
    // a browser or email link hits to stream them back out.
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        pdfData: pdfBuffer,
        pdfUrl: `/api/admin/leads/${leadId}/pdf`,
        pdfGeneratedAt: new Date(),
      },
    })

    await prisma.interaction.create({
      data: { leadId, type: 'pdf', content: `${session.name} generated the audit PDF for ${lead.name}.` },
    })

    // Return the PDF binary directly so the dashboard can trigger an
    // immediate download without a second round trip.
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="audit-${lead.name.replace(/\s+/g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-pdf]', message)
    return NextResponse.json(
      { error: `Failed to generate PDF: ${message}` },
      { status: 500 }
    )
  }
}
