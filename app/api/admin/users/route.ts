import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest, unauthorizedResponse, hasPermission, hashPassword } from '@/lib/auth'
import crypto from 'crypto'

const VALID_ROLES = ['ADMIN', 'CLOSER', 'DATA_MANAGER', 'VIDEO_CREATOR', 'PPT_CREATOR', 'LEAD_GEN']

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ users })
}

// Creates a new team member with a generated temporary password, which
// is returned exactly once in this response — never logged, never
// stored in plaintext anywhere. Whoever creates the account is
// responsible for relaying it to the new teammate securely.
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'MANAGE_USERS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { name, email, role } = await req.json()
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'name, email, and role are required' }, { status: 400 })
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    const tempPassword = crypto.randomBytes(12).toString('base64url')
    const passwordHash = await hashPassword(tempPassword)

    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase().trim(), role, passwordHash },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    })

    return NextResponse.json({ success: true, user, temporaryPassword: tempPassword })
  } catch (error) {
    console.error('[admin/users POST]', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
