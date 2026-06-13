import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildScorePrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = buildScorePrompt(lead)
    const raw = await callGroq('You are a lead scoring expert. Return only valid JSON.', prompt)

    let parsed: { score: number; priority: string; reasoning: string }
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI score response', raw }, { status: 500 })
    }

    const score = Math.max(0, Math.min(100, Number(parsed.score)))
    const priority = ['low', 'medium', 'high'].includes(parsed.priority) ? parsed.priority : 'medium'

    await prisma.lead.update({
      where: { id: leadId },
      data: { score, priority },
    })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'score',
        content: `Scored ${score}/100 · Priority: ${priority}. ${parsed.reasoning}`,
      },
    })

    return NextResponse.json({ success: true, score, priority, reasoning: parsed.reasoning })
  } catch (error) {
    console.error('[score-lead]', error)
    return NextResponse.json({ error: 'Failed to score lead' }, { status: 500 })
  }
}
