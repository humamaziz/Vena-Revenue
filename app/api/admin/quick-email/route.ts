import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildQuickEmailPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId, instruction } = await req.json()
    if (!leadId || !instruction) return NextResponse.json({ error: 'leadId and instruction required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    const email = await callGroq('You are a human writing a short direct email. Sound like a real person.', buildQuickEmailPrompt({ name: lead.name, industry: lead.industry, goal: lead.goal, status: lead.status }, instruction), 0.7)
    return NextResponse.json({ success: true, email })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 }) }
}