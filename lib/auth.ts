import { NextRequest } from 'next/server'

export function isAdminAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const adminKey = process.env.ADMIN_KEY
  if (!adminKey) return false
  return authHeader === `Bearer ${adminKey}`
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
