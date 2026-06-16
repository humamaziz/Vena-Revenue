import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildLoomScriptPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId, vector, competitorName, specificLeak } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const script = await callGroq(
      'You write sharp, direct video scripts for a premium revenue engineering firm. Sound like a confident expert talking to one specific person.',
      buildLoomScriptPrompt({ name: lead.name, website: lead.website, industry: lead.industry, vector: vector || '1', competitorName, specificLeak }),
      0.65
    )
    await prisma.interaction.create({ data: { leadId, type: 'loom_script', content: `Loom script generated for Vector ${vector || '1'}.` } })
    return NextResponse.json({ success: true, script })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 })
  }
}
