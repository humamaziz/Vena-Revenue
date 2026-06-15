import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildObjectionPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId, objection } = await req.json()
    if (!leadId || !objection) return NextResponse.json({ error: 'leadId and objection required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = buildObjectionPrompt({ name: lead.name, industry: lead.industry, goal: lead.goal, objection })
    const reply = await callGroq(
      'You are a confident, human sales closer. Write naturally. Never sound like AI.',
      prompt,
      0.65
    )

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}