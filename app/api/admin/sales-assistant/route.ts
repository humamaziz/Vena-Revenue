import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildSalesAssistantPrompt } from '@/lib/groq'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'
import { LEAD_SAFE_SELECT } from '@/lib/leadSelect.ts'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'AI_CHAT_TOOLS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { ...LEAD_SAFE_SELECT, interactions: { orderBy: { createdAt: 'desc' }, take: 6 } },
    })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    const analysis = await callGroq('You are a direct, experienced B2B sales advisor. No fluff. Sharp reads.', buildSalesAssistantPrompt(lead), 0.5)
    await prisma.interaction.create({ data: { leadId, type: 'ai_analysis', content: `Sales analysis run.` } })
    return NextResponse.json({ success: true, analysis })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 }) }
}