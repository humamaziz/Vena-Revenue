import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

// Paginated, server-side-filtered lead list. This replaces the old
// "fetch every lead with every interaction" query, which is exactly what
// caused memory pressure ("Array buffer allocation failed") once the
// table grew past a few hundred rows with attached PDFs/long audits.
//
// - Pagination: page/pageSize query params, default 25/page
// - Filtering: status, priority, paid, industry, search (name/email/company/website)
// - Sorting: createdAt desc by default
// - Interactions are NOT included here — the detail panel fetches a
//   single lead's full interaction history separately on selection
// - Role gating: LEAD_GEN only sees the fields needed to avoid duplicate
//   submissions (name/email/website/company), never audit/payment/notes
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'VIEW_LEADS_BASIC')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = req.nextUrl

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '25', 10) || 25))
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const paid = searchParams.get('paid')
    const industry = searchParams.get('industry')
    const search = searchParams.get('search')?.trim()
    const minRating = searchParams.get('minRating')
    const needsFollowup = searchParams.get('needsFollowup') === 'true'

    const where: Prisma.LeadWhereInput = {}
    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (paid === 'true') where.paid = true
    if (paid === 'false') where.paid = false
    if (industry && industry !== 'all') where.industry = industry

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
      ]
    }

    // "Needs follow-up": no contact in 3+ days and not yet sent/closed
    if (needsFollowup) {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      where.AND = [
        { status: { notIn: ['sent', 'closed', 'lost'] } },
        {
          OR: [
            { lastContact: { lt: threeDaysAgo } },
            { lastContact: null, createdAt: { lt: threeDaysAgo } },
          ],
        },
      ]
    }

    // Field selection by role — LEAD_GEN should never see audit content,
    // payment data, or internal notes; everyone else gets the full shape
    // minus the heavy pdfData bytes (never selected in list views).
    const isRestrictedRole = session.role === 'LEAD_GEN'

    const baseSelect = {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      website: true,
      industry: true,
      location: true,
      status: true,
      createdAt: true,
      lastContact: true,
    }

    const fullSelect = {
      ...baseSelect,
      goal: true,
      revenue: true,
      adspend: true,
      budget: true,
      audit: true,
      preview: true,
      score: true,
      priority: true,
      paid: true,
      paymentId: true,
      paymentDate: true,
      pdfUrl: true,
      pdfGeneratedAt: true,
      loomUrl: true,
      pptUrl: true,
      source: true,
      notes: true,
      createdByRole: true,
      ratings: { select: { rating: true, ratedById: true, ratedBy: { select: { name: true } } } },
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: isRestrictedRole ? baseSelect : fullSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ])

    // Compute average rating + filter by minRating in JS since it's a
    // derived value across a relation — keeps the Prisma query simple
    // and this only runs over one page (<=100 rows), not the full table.
    let leadsWithAvg = (leads as any[]).map((lead) => {
      if (isRestrictedRole) return lead
      const ratings: { rating: number }[] = lead.ratings ?? []
      const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null
      return { ...lead, avgRating, ratingCount: ratings.length }
    })

    if (minRating && !isRestrictedRole) {
      const min = parseFloat(minRating)
      leadsWithAvg = leadsWithAvg.filter((l) => l.avgRating != null && l.avgRating >= min)
    }

    return NextResponse.json({
      leads: leadsWithAvg,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('[admin/leads]', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

// Lightweight manual "add lead" endpoint for LEAD_GEN — just the fields
// needed to register a prospect, nothing else.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'ADD_LEAD')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, company, email, phone, website, industry, location, notes } = body

    if (!name || !email || !website || !industry) {
      return NextResponse.json({ error: 'name, email, website, and industry are required' }, { status: 400 })
    }

    const existing = await prisma.lead.findFirst({
      where: { OR: [{ email: email.toLowerCase().trim() }, { website }] },
      select: { id: true, name: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: `Possible duplicate: "${existing.name}" already exists with this email or website`, duplicateId: existing.id },
        { status: 409 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        company: company ?? null,
        email: email.toLowerCase().trim(),
        phone: phone ?? null,
        website,
        industry,
        location: location ?? null,
        notes: notes ?? null,
        status: 'new',
        source: 'manual_entry',
        createdByRole: session.role,
      },
    })

    await prisma.interaction.create({
      data: { leadId: lead.id, type: 'created', content: `Lead added manually by ${session.name} (${session.role}).` },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('[admin/leads POST]', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
