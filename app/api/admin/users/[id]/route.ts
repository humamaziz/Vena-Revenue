import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission, revokeAllSessionsForUser } from '@/lib/auth'

// Deactivating a user (rather than deleting) preserves their rating/
// interaction history while immediately revoking every active session
// they hold — so "this person left the team" actually locks them out
// right away instead of waiting up to 30 days for JWTs to expire.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { active, role } = await req.json()
    const data: { active?: boolean; role?: string } = {}
    if (typeof active === 'boolean') data.active = active
    if (role) data.role = role

    const user = await prisma.user.update({ where: { id: params.id }, data })

    if (active === false) {
      await revokeAllSessionsForUser(params.id)
    }

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role, active: user.active } })
  } catch (error) {
    console.error('[admin/users PATCH]', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
