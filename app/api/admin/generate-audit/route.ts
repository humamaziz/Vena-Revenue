import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildAuditPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'
console.log("GROQ KEY:", process.env.GROQ_API_KEY);
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const completion = await groq.chat.completions.create({
  messages: [
    { role: "user", content: "your prompt here" }
  ],
  model: "llama3-8b-8192",
});

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()

  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = buildAuditPrompt(lead)
    const audit = await callGroq(
      'You are an elite conversion rate optimization expert. Be specific, data-driven, and direct.',
      prompt
    )

    const preview = audit.split('\n').slice(0, 6).join('\n')

    await prisma.lead.update({
      where: { id: leadId },
      data: { audit, preview, status: 'reviewed' },
    })

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'audit',
        content: `AI audit generated. ${audit.length} characters.`,
      },
    })

    return NextResponse.json({ success: true, audit, preview })
  } catch (error) {
    console.error('[generate-audit]', error)
    return NextResponse.json({ error: 'Failed to generate audit' }, { status: 500 })
  }
}
