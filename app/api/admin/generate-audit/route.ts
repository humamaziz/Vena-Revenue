import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildAuditPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const body = await req.json()
    const { leadId } = body

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const userPrompt = buildAuditPrompt(lead)

    const audit = await callGroq(
      'You are an elite revenue engineering analyst at Vena%Revenue writing a $6,000 comprehensive audit document. Follow the exact structure given with zero deviation — section headers, tables, ASCII diagrams, and the financial leakage breakdown are all mandatory, not optional. Name specific competitor archetypes. Use specific numbers everywhere. Never write generic advice. Never sound like an AI assistant — sound like a senior consultant who has already studied this exact market.',
      userPrompt,
      0.65,
      4500
    )

    // Extract the Executive Briefing section for the client-facing preview —
    // grabbing the first 4 raw lines would just capture the title block now
    // that the audit uses the full # / ## header structure.
    const preview = extractExecutiveBriefingPreview(audit)

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        audit,
        preview,
        status: 'reviewed',
      },
    })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'audit',
        content: `AI audit generated (${audit.length} chars). Model: llama-3.3-70b-versatile.`,
      },
    })

    return NextResponse.json({ success: true, audit, preview })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-audit]', message)
    return NextResponse.json(
      { error: `Failed to generate audit: ${message}` },
      { status: 500 }
    )
  }
}

function extractExecutiveBriefingPreview(audit: string): string {
  const briefingMatch = audit.match(/## Executive Briefing[\s\S]*?(?=\n## Pillar 1)/)
  if (briefingMatch) {
    const cleaned = briefingMatch[0].replace(/^## Executive Briefing.*\n/, '').trim()
    return cleaned.slice(0, 600)
  }
  // Fallback — first meaningful paragraph if the header pattern didn't match
  const lines = audit.split('\n').filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'))
  return lines.slice(0, 3).join('\n').slice(0, 600)
}