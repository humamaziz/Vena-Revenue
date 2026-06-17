import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAdminNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, business, website, industry, goal, location, revenue, adspend, budget } = body

    if (!name || !email || !industry || !goal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        website: website || business || '',
        industry,
        goal,
        location: location ?? null,
        revenue: revenue ?? null,
        adspend: adspend ?? null,
        budget: budget ?? null,
        status: 'new',
        source: req.headers.get('referer') ?? 'direct',
      },
    })

    await prisma.interaction.create({
      data: {
        leadId: lead.id,
        type: 'submission',
        content: `Form submitted. Industry: ${industry}. Location: ${location ?? 'not provided'}. Goal: ${goal}. Budget: ${budget ?? 'not provided'}.`,
      },
    })

    sendAdminNotification({
      name, email, website: lead.website, industry, goal, location, revenue, adspend, budget, problem: null,
    }).catch(() => {})

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('[/api/audit] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}