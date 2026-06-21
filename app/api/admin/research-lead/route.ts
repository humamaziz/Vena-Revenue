import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LEAD_SAFE_SELECT } from '@/lib/leadSelect'
import { callGroq, buildResearchPrompt, estimateMonthlyLeakageFallback } from '@/lib/groq'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'RUN_RESEARCH')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: LEAD_SAFE_SELECT })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const raw = await callGroq(
      'You are a revenue intelligence analyst. Return only valid JSON. No markdown, no explanation.',
      buildResearchPrompt(lead),
      0.4
    )
    const cleaned = raw.replace(/```json|```/g, '').trim()
    let profile
    try { profile = JSON.parse(cleaned) } catch { return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 }) }

    // Server-side safety net: if the model still omits, blanks, or writes
    // a placeholder like "N/A" for the leakage figure, compute it
    // deterministically rather than showing nothing in the dashboard.
    const leakageValue = (profile.estimatedMonthlyLeakage ?? '').toString().trim()
    if (!leakageValue || /^n\/?a$/i.test(leakageValue) || leakageValue.length < 3) {
      profile.estimatedMonthlyLeakage = estimateMonthlyLeakageFallback(lead.revenue)
      profile.leakageReasoning = profile.leakageReasoning || 'Calculated server-side as 10%-25% of stated monthly revenue (AI did not return this field).'
    }

    await prisma.interaction.create({ data: { leadId, type: 'research', content: `ICP: ${profile.icpMatch}. Vector: ${profile.vectorName}. Leakage: ${profile.estimatedMonthlyLeakage}. Hook: ${profile.closingHook}` } })
    return NextResponse.json({ success: true, profile })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 })
  }
}