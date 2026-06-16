import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildResearchPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const raw = await callGroq(
      'You are a revenue intelligence analyst. Return only valid JSON. No markdown, no explanation.',
      buildResearchPrompt(lead),
      0.4
    )
    const cleaned = raw.replace(/```json|```/g, '').trim()
    let profile
    try { profile = JSON.parse(cleaned) } catch { return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 }) }

    await prisma.interaction.create({ data: { leadId, type: 'research', content: `ICP: ${profile.icpMatch}. Vector: ${profile.vectorName}. Hook: ${profile.closingHook}` } })
    return NextResponse.json({ success: true, profile })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 })
  }
}