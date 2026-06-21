import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LEAD_SAFE_SELECT } from '@/lib/leadSelect.ts'
import { callGroq, buildObjectionPrompt } from '@/lib/groq'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'AI_CHAT_TOOLS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { leadId, objection } = await req.json()
    if (!leadId || !objection) return NextResponse.json({ error: 'leadId and objection required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: LEAD_SAFE_SELECT })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    const reply = await callGroq('You are a confident, human sales closer. Never sound like AI. Never be defensive.', buildObjectionPrompt({ name: lead.name, industry: lead.industry, goal: lead.goal, objection }), 0.65)
    return NextResponse.json({ success: true, reply })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 }) }
}