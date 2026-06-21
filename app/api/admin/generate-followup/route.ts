import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildFollowUpPrompt } from '@/lib/groq'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'
import { LEAD_SAFE_SELECT } from '@/lib/leadSelect'

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
      select: { ...LEAD_SAFE_SELECT, interactions: { orderBy: { createdAt: 'desc' }, take: 5 } },
    })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = buildFollowUpPrompt(lead)
    const drafts = await callGroq(
      'You are Ansh, a real person writing short human emails. Never sound like an AI. No corporate speak.',
      prompt,
      0.72
    )

    await prisma.interaction.create({
      data: { leadId, type: 'followup_draft', content: drafts },
    })

    return NextResponse.json({ success: true, drafts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-followup]', message)
    return NextResponse.json({ error: `Failed: ${message}` }, { status: 500 })
  }
}