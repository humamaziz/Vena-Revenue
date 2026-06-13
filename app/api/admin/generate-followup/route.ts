import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildFollowUpPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { interactions: { orderBy: { createdAt: 'desc' }, take: 5 } },
    })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = buildFollowUpPrompt(lead)
    const raw = await callGroq(
      'You are an expert B2B sales copywriter. Write concise, high-converting follow-up emails.',
      prompt
    )

    // Store drafts as an interaction
    await prisma.interaction.create({
      data: {
        leadId,
        type: 'followup_draft',
        content: raw,
      },
    })

    return NextResponse.json({ success: true, drafts: raw })
  } catch (error) {
    console.error('[generate-followup]', error)
    return NextResponse.json({ error: 'Failed to generate follow-up' }, { status: 500 })
  }
}
