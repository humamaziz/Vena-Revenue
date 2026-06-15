import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId, instruction } = await req.json()
    if (!leadId || !instruction) return NextResponse.json({ error: 'leadId and instruction required' }, { status: 400 })

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const prompt = `Write a short email for Ansh at Vena%Revenue to send to ${lead.name} (${lead.industry}).

Instruction from Ansh: "${instruction}"

Context: Goal is ${lead.goal}. Status: ${lead.status}.

Rules: Human tone, 3-4 sentences max, no corporate language, sign as "Ansh, Vena%Revenue". Just the email body.`

    const email = await callGroq(
      'You are a human writing a short direct email. Sound like a real person, not an AI assistant.',
      prompt,
      0.7
    )

    return NextResponse.json({ success: true, email })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}