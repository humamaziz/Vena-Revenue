import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildScorePrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId is required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = buildScorePrompt(lead)
    const raw = await callGroq(
      'You are a lead scoring expert. Return ONLY valid JSON. No markdown, no code fences, no explanation before or after the JSON.',
      prompt
    )

    // Strip any accidental markdown fences before parsing
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    let parsed: { score: number; priority: string; reasoning: string }
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('[score-lead] JSON parse failed. Raw:', raw)
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Try again.', raw },
        { status: 500 }
      )
    }

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))))
    const priority = ['low', 'medium', 'high'].includes(parsed.priority)
      ? parsed.priority
      : score >= 71 ? 'high' : score >= 41 ? 'medium' : 'low'

    await prisma.lead.update({
      where: { id: leadId },
      data: { score, priority },
    })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'score',
        content: `Lead scored ${score}/100. Priority: ${priority}. ${parsed.reasoning ?? ''}`,
      },
    })

    return NextResponse.json({
      success: true,
      score,
      priority,
      reasoning: parsed.reasoning ?? '',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[score-lead]', message)
    return NextResponse.json(
      { error: `Failed to score lead: ${message}` },
      { status: 500 }
    )
  }
}
