import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Middleware runs on the Edge runtime, which cannot use Prisma directly
// (no TCP sockets). So this layer only verifies the JWT signature and
// expiry — it is the fast first gate that blocks anonymous traffic and
// expired tokens before a request even reaches a route handler. The
// second, authoritative check (does the Session row still exist / has
// it been revoked, what is the live role) happens inside each route via
// getSessionFromRequest() in lib/auth.ts, which does hit the DB. Treat
// this middleware as "cheap perimeter fence", not the source of truth.

const COOKIE_NAME = 'vena_session'

const PUBLIC_ADMIN_PATHS = ['/admin/login']
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/logout', '/api/auth/me']

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? '')
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminPage = pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)
  const isAdminApi = pathname.startsWith('/api/admin') && !PUBLIC_API_PATHS.includes(pathname)

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
