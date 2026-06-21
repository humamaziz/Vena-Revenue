import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSVWithHeaders } from '@/lib/csv'
import { getSessionFromRequest, unauthorizedResponse, hasPermission } from '@/lib/auth'

// Expected CSV fields and the header text variants we'll auto-match,
// per the spec: companyName, website, contactName, email, phone,
// industry, notes. `name` is mapped from contactName since that's what
// the rest of the app calls the Lead.name field.
const HEADER_ALIASES: Record<string, string[]> = {
  name: ['contactName', 'contact name', 'name', 'contact', 'fullName', 'full name'],
  company: ['companyName', 'company name', 'company', 'business', 'businessName', 'business name'],
  website: ['website', 'url', 'site', 'web'],
  email: ['email', 'emailAddress', 'email address'],
  phone: ['phone', 'phoneNumber', 'phone number', 'mobile', 'contactNumber', 'contact number'],
  industry: ['industry', 'niche', 'category', 'sector'],
  notes: ['notes', 'note', 'comment', 'comments', 'remarks'],
  location: ['location', 'city', 'address'],
}

const MAX_ROWS = 5000 // sane ceiling so one bad upload can't take down the DB connection

interface RowResult {
  rowNumber: number
  status: 'valid' | 'duplicate' | 'invalid'
  reason?: string
  data: Record<string, string>
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorizedResponse()
  if (!hasPermission(session.role, 'UPLOAD_CSV')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { csvText, mode } = body as { csvText: string; mode: 'preview' | 'commit' }

    if (!csvText || typeof csvText !== 'string') {
      return NextResponse.json({ error: 'csvText is required' }, { status: 400 })
    }

    const { rows, unmappedHeaders } = parseCSVWithHeaders(csvText, HEADER_ALIASES)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 })
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `CSV has ${rows.length} rows, which exceeds the ${MAX_ROWS}-row limit per upload. Split into smaller files.` },
        { status: 400 }
      )
    }

    // Pull existing emails/websites once, up front, rather than querying
    // per-row — this is the difference between an O(1) and an O(n) DB
    // round-trip count on a 5,000-row file.
    const candidateEmails = rows.map((r) => r.data.email?.toLowerCase().trim()).filter(Boolean)
    const candidateWebsites = rows.map((r) => r.data.website?.trim()).filter(Boolean)

    const existing = await prisma.lead.findMany({
      where: {
        OR: [
          candidateEmails.length ? { email: { in: candidateEmails } } : undefined,
          candidateWebsites.length ? { website: { in: candidateWebsites } } : undefined,
        ].filter(Boolean) as any,
      },
      select: { email: true, website: true },
    })
    const existingEmails = new Set(existing.map((e) => e.email.toLowerCase()))
    const existingWebsites = new Set(existing.map((e) => e.website))

    // Also catch duplicates *within the file itself* (same list, uploaded twice
    // by accident, or the same lead appearing under two rows)
    const seenInFile = new Set<string>()

    const results: RowResult[] = rows.map((row) => {
      const { rowNumber, data } = row
      const email = data.email?.toLowerCase().trim() ?? ''
      const website = data.website?.trim() ?? ''
      const name = data.name?.trim() ?? ''

      if (!name || !email) {
        return { rowNumber, status: 'invalid', reason: 'Missing required field (name/contact and email)', data }
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { rowNumber, status: 'invalid', reason: 'Malformed email address', data }
      }

      const dupKey = `${email}|${website}`
      if (existingEmails.has(email) || (website && existingWebsites.has(website))) {
        return { rowNumber, status: 'duplicate', reason: 'Email or website already exists in database', data }
      }
      if (seenInFile.has(dupKey)) {
        return { rowNumber, status: 'duplicate', reason: 'Duplicate row within this CSV file', data }
      }
      seenInFile.add(dupKey)

      return { rowNumber, status: 'valid', data }
    })

    const summary = {
      total: results.length,
      valid: results.filter((r) => r.status === 'valid').length,
      duplicate: results.filter((r) => r.status === 'duplicate').length,
      invalid: results.filter((r) => r.status === 'invalid').length,
      unmappedHeaders,
    }

    // PREVIEW MODE — just return the analysis, write nothing.
    if (mode !== 'commit') {
      return NextResponse.json({
        success: true,
        mode: 'preview',
        summary,
        preview: results.slice(0, 50), // cap the payload sent back to the browser
      })
    }

    // COMMIT MODE — batch insert only the valid rows.
    const validRows = results.filter((r) => r.status === 'valid')

    const BATCH_SIZE = 200
    let inserted = 0
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE)
      await prisma.lead.createMany({
        data: batch.map((r) => ({
          name: r.data.name,
          company: r.data.company || null,
          email: r.data.email.toLowerCase().trim(),
          phone: r.data.phone || null,
          website: r.data.website || '',
          industry: r.data.industry || 'Unspecified',
          location: r.data.location || null,
          notes: r.data.notes || null,
          status: 'new',
          source: 'csv_import',
          createdByRole: session.role,
        })),
        skipDuplicates: true,
      })
      inserted += batch.length
    }

    return NextResponse.json({
      success: true,
      mode: 'commit',
      summary: { ...summary, inserted },
    })
  } catch (error) {
    console.error('[upload-csv]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 })
  }
}
