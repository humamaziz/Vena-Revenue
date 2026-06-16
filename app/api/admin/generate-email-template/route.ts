import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildEmailTemplatePrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId, vector, ownerName, specificLeak } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const email = await callGroq(
      'You write cold outbound emails that sound like a real expert found a real problem — not like marketing copy.',
      buildEmailTemplatePrompt({ name: lead.name, industry: lead.industry, website: lead.website, vector: vector || '1', ownerName, specificLeak }),
      0.68
    )
    await prisma.interaction.create({ data: { leadId, type: 'outreach_email', content: `Outreach email drafted for Vector ${vector || '1'}.` } })
    return NextResponse.json({ success: true, email })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 })
  }
}