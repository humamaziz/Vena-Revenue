import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

// Any team member can star-rate a lead (1-5). Re-rating the same lead
// updates their existing rating rather than stacking duplicates, thanks
// to the @@unique([leadId, ratedById]) constraint — upsert is the
// correct primitive here, not create.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'RATE_LEAD')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { leadId, rating, notes } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const numericRating = Number(rating)
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'rating must be an integer from 1 to 5' }, { status: 400 })
    }

    const result = await prisma.leadRating.upsert({
      where: { leadId_ratedById: { leadId, ratedById: session.userId } },
      update: { rating: numericRating, notes: notes ?? null },
      create: { leadId, ratedById: session.userId, rating: numericRating, notes: notes ?? null },
    })

    // Recompute average for the response so the dashboard can update
    // without an extra round trip.
    const allRatings = await prisma.leadRating.findMany({ where: { leadId }, select: { rating: true } })
    const avgRating = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length

    await prisma.interaction.create({
      data: {
        leadId,
        type: 'rating',
        content: `${session.name} (${session.role}) rated this lead ${numericRating}/5${notes ? `: "${notes}"` : '.'}`,
      },
    })

    return NextResponse.json({
      success: true,
      rating: result,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: allRatings.length,
    })
  } catch (error) {
    console.error('[rate-lead]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to rate lead' }, { status: 500 })
  }
}
