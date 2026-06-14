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
      'You are an elite revenue engineering analyst. Be specific, data-driven, and direct. Never use generic advice.',
      userPrompt
    )

    // Generate a short preview (first 3 lines of actual content)
    const lines = audit.split('\n').filter((l) => l.trim().length > 0)
    const preview = lines.slice(0, 4).join('\n')

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
