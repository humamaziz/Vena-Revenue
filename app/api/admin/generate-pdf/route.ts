import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAuditPDF } from '@/lib/generatePdf'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

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
      goal: lead.goal,
      audit: lead.audit,
      createdAt: lead.createdAt,
    })

    // On Vercel there is no writable filesystem, so we return the PDF as a
    // download stream and store a data URL reference in the DB for the client portal.
    const base64 = Buffer.from(pdfBuffer).toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64}`

    // Save the data URL so the client portal can reference it
    await prisma.lead.update({
      where: { id: leadId },
      data: { pdfUrl: dataUrl },
    })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'pdf',
        content: `PDF report generated for ${lead.name}.`,
      },
    })

    // Return the PDF binary so the admin can download it directly
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="audit-${lead.name.replace(/\s+/g, '-')}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
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
