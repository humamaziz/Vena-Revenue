import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildFollowUpPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId is required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = buildFollowUpPrompt(lead)
    const drafts = await callGroq(
      'You are an expert B2B sales copywriter. Write concise, high-converting follow-up emails. Be specific to the industry and situation.',
      prompt
    )

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'followup_draft',
        content: drafts,
      },
    })

    return NextResponse.json({ success: true, drafts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-followup]', message)
    return NextResponse.json(
      { error: `Failed to generate follow-ups: ${message}` },
      { status: 500 }
    )
  }
}
