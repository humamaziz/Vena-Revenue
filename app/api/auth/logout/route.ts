import { NextRequest, NextResponse } from 'next/server'
import { revokeSession, clearSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('vena_session')?.value
  if (token) {
    await revokeSession(token)
  }
  await clearSessionCookie()
  return NextResponse.json({ success: true })
}
