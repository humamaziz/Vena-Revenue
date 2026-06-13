import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAuditPDF } from '@/lib/generatePdf'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'
import path from 'path'
import fs from 'fs'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    if (!lead.audit) return NextResponse.json({ error: 'No audit to generate PDF from' }, { status: 400 })

    const pdfBuffer = await generateAuditPDF({
      name: lead.name,
      email: lead.email,
      website: lead.website,
      industry: lead.industry,
      goal: lead.goal,
      audit: lead.audit,
      createdAt: lead.createdAt,
    })

    // Save to public/pdfs directory
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs')
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true })

    const filename = `audit-${leadId}.pdf`
    const filePath = path.join(pdfDir, filename)
    fs.writeFileSync(filePath, pdfBuffer)

    const pdfUrl = `/pdfs/${filename}`
    await prisma.lead.update({ where: { id: leadId }, data: { pdfUrl } })

    await prisma.interaction.create({
      data: { leadId, type: 'pdf', content: `PDF generated: ${pdfUrl}` },
    })

    return NextResponse.json({ success: true, pdfUrl })
  } catch (error) {
    console.error('[generate-pdf]', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
