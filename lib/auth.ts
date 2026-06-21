import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import crypto from 'crypto'

export type Role = 'ADMIN' | 'CLOSER' | 'DATA_MANAGER' | 'VIDEO_CREATOR' | 'PPT_CREATOR' | 'LEAD_GEN'

export interface SessionPayload {
  userId: string
  role: Role
  name: string
  email: string
}

const COOKIE_NAME = 'vena_session'
const SESSION_DAYS = 30

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

// ── PASSWORD HASHING ─────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ── SESSION CREATION (LOGIN) ──────────────────────────────────
// Issues a signed JWT, hashes it, and stores the hash as a Session row so
// it can be revoked server-side (logout, deactivate user) without waiting
// for the JWT's own expiry. The cookie holds the raw token; the DB holds
// only its SHA-256 hash — so a DB leak never exposes a usable session.
export async function createSession(payload: SessionPayload, userAgent?: string | null): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret())

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  await prisma.session.create({
    data: {
      userId: payload.userId,
      tokenHash,
      userAgent: userAgent ?? null,
      expiresAt,
    },
  })

  return token
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// ── SESSION VERIFICATION ──────────────────────────────────────
// Verifies the JWT signature AND checks the corresponding Session row
// still exists (not revoked) and hasn't expired. This double-check is
// what makes "deactivate this user immediately" actually immediate,
// rather than waiting up to 30 days for the JWT to naturally expire.
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const session = await prisma.session.findUnique({ where: { tokenHash } })
    if (!session || session.expiresAt < new Date()) return null

    return {
      userId: payload.userId as string,
      role: payload.role as Role,
      name: payload.name as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return verifySession(token)
}

export async function revokeSession(token: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  await prisma.session.deleteMany({ where: { tokenHash } })
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

// ── API ROUTE GUARD ───────────────────────────────────────────
// For App Router API routes (not middleware) — reads the cookie directly
// off the incoming request rather than next/headers, since route handlers
// receive the NextRequest object directly.
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  return verifySession(token)
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function forbiddenResponse(message = 'You do not have permission to do this') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── ROLE PERMISSIONS ───────────────────────────────────────────
// Central permission table. Every gated API route and every UI element
// check against this rather than hardcoding role checks inline, so the
// rules in one place match what's described in the work-assignment flow.
export const PERMISSIONS = {
  ADD_LEAD: ['ADMIN', 'LEAD_GEN', 'DATA_MANAGER', 'CLOSER'] as Role[],
  VIEW_LEADS_BASIC: ['ADMIN', 'LEAD_GEN', 'DATA_MANAGER', 'VIDEO_CREATOR', 'PPT_CREATOR', 'CLOSER'] as Role[],
  EDIT_LEAD: ['ADMIN', 'DATA_MANAGER', 'CLOSER'] as Role[],
  UPLOAD_CSV: ['ADMIN', 'DATA_MANAGER'] as Role[],
  RUN_RESEARCH: ['ADMIN', 'DATA_MANAGER', 'CLOSER'] as Role[],
  GENERATE_AUDIT: ['ADMIN', 'DATA_MANAGER', 'CLOSER'] as Role[],
  SCORE_LEAD: ['ADMIN', 'DATA_MANAGER', 'CLOSER'] as Role[],
  GENERATE_LOOM_SCRIPT: ['ADMIN', 'VIDEO_CREATOR', 'CLOSER'] as Role[],
  ATTACH_LOOM_URL: ['ADMIN', 'VIDEO_CREATOR', 'CLOSER'] as Role[],
  ATTACH_PPT_URL: ['ADMIN', 'PPT_CREATOR', 'CLOSER'] as Role[],
  VIEW_AUDIT: ['ADMIN', 'PPT_CREATOR', 'DATA_MANAGER', 'CLOSER'] as Role[],
  AI_CHAT_TOOLS: ['ADMIN', 'CLOSER'] as Role[],
  SEND_EMAIL: ['ADMIN', 'CLOSER'] as Role[],
  HANDLE_PAYMENTS: ['ADMIN', 'CLOSER'] as Role[],
  MANAGE_USERS: ['ADMIN'] as Role[],
  RATE_LEAD: ['ADMIN', 'CLOSER', 'DATA_MANAGER', 'VIDEO_CREATOR', 'PPT_CREATOR', 'LEAD_GEN'] as Role[],
} as const

export function hasPermission(role: Role, permission: keyof typeof PERMISSIONS): boolean {
  return (PERMISSIONS[permission] as Role[]).includes(role)
}

export function requirePermission(session: SessionPayload | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!session) return false
  return hasPermission(session.role, permission)
}
