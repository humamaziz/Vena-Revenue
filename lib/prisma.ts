import { PrismaClient } from '@prisma/client'

// CRITICAL: this cache must work in production too, not just dev.
// On Vercel, each warm serverless function instance reuses its module
// scope across invocations — so caching the client on `globalThis` means
// one instance = one PrismaClient = one small connection pool, instead
// of a fresh PrismaClient (and a fresh pool) on every request. The old
// version of this file only populated the cache when NODE_ENV !==
// 'production', which meant production builds got a brand new client
// (and new connections) far more often than necessary, and is exactly
// what exhausted Supabase's pool_size=15 limit under any real traffic.
//
// This does NOT eliminate the need for a pooled connection string
// (pgbouncer=true&connection_limit=1 in DATABASE_URL) — that's still
// required, see .env.example — but without this cache, the connection
// string alone isn't enough because you can still end up with many
// concurrent client instances each holding their one connection open.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

globalForPrisma.prisma = prisma