import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callGroq, buildTestimonialPrompt } from '@/lib/groq'
import { isAdminAuthorized, unauthorizedResponse } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    const email = await callGroq('Write a warm, genuine email to a happy client. Sound human.', buildTestimonialPrompt({ name: lead.name, industry: lead.industry, audit: lead.audit }), 0.7)
    return NextResponse.json({ success: true, email })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 }) }
}