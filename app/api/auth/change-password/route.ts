import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, verifyPassword, hashPassword, revokeAllSessionsForUser, createSession, setSessionCookie } from '@/lib/auth'

// Lets a logged-in user change their own password (e.g. after first login
// with the temporary password the seed script generated). Revokes every
// other existing session for this user once the password changes, then
// issues a fresh session for the current device so they aren't logged
// out of their own change-password flow.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()

  try {
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'currentPassword and newPassword are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return unauthorizedResponse()

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

    await revokeAllSessionsForUser(user.id)
    const token = await createSession(
      { userId: user.id, role: user.role, name: user.name, email: user.email },
      req.headers.get('user-agent')
    )
    await setSessionCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[change-password]', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
