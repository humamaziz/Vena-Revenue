# Complete Vercel + Supabase Fix Guide

## The Problem

Port 5432 (Session mode) on Supabase blocks connections from local machines.
Port 6543 (Transaction mode) is for Vercel serverless only — not for migrations.

You have two options. Option A is easiest.

---

## ✅ OPTION A — Run SQL directly in Supabase (RECOMMENDED — No local connection needed)

### Step 1: Open Supabase SQL Editor

Go to:
https://supabase.com/dashboard/project/ngwyurzusrbncdazmasl/sql/new

### Step 2: Paste and run this SQL

```sql
-- Create Lead table
CREATE TABLE IF NOT EXISTS "Lead" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "website" TEXT NOT NULL,
  "industry" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "revenue" TEXT,
  "adspend" TEXT,
  "budget" TEXT,
  "problem" TEXT,
  "audit" TEXT,
  "preview" TEXT,
  "score" INTEGER,
  "priority" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "paid" BOOLEAN NOT NULL DEFAULT false,
  "pdfUrl" TEXT,
  "loomUrl" TEXT,
  "source" TEXT,
  "notes" TEXT,
  "lastContact" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- Create Interaction table
CREATE TABLE IF NOT EXISTS "Interaction" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Interaction_leadId_fkey" FOREIGN KEY ("leadId")
    REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Lead_email_idx" ON "Lead"("email");
CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "Interaction_leadId_idx" ON "Interaction"("leadId");
```

### Step 3: Click "Run" — you should see "Success. No rows returned"

### Step 4: Update Vercel environment variables

Go to: https://vercel.com → your project → Settings → Environment Variables

**DELETE** the current `DATABASE_URL` (the wrong https://supabase.com one)

**ADD these two variables:**

---

**To get the correct connection strings:**
1. Go to: https://supabase.com/dashboard/project/ngwyurzusrbncdazmasl/settings/database
2. Scroll to "Connection string"
3. Click the **URI** tab

**DATABASE_URL** → Select "Transaction" mode (shows port **6543**)
Copy it — looks like:
```
postgresql://postgres.ngwyurzusrbncdazmasl:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**DIRECT_URL** → Select "Session" mode (shows port **5432**)
Copy it — looks like:
```
postgresql://postgres.ngwyurzusrbncdazmasl:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

Replace `[PASSWORD]` with your actual Supabase database password.

> **How to find your password:** Supabase dashboard → Settings → Database → scroll to "Database password" → Reset if forgotten

---

**Also fix these variables while you are there:**

| Variable | Correct Value |
|----------|--------------|
| `NEXT_PUBLIC_BASE_URL` | `https://vena-revenue.vercel.app` (remove the /admin at the end) |
| `DATABASE_URL` | Transaction pooler string (port 6543) |
| `DIRECT_URL` | Session string (port 5432) — ADD this new one |

**Remove these — they are not used in the code:**
- `NEXT_PUBLIC_ADMIN_SECRET`
- `ADMIN_SECRET`

### Step 5: Redeploy on Vercel

Vercel → Deployments → click the 3 dots on latest → Redeploy

---

## ✅ OPTION B — Local connection (if you want to run prisma db push locally)

Supabase provides a special **IPv4 direct connection** for local use.

1. Go to: https://supabase.com/dashboard/project/ngwyurzusrbncdazmasl/settings/database
2. Scroll to "Connection string"
3. Select **"Direct connection"** tab (not Transaction, not Session)
4. Copy the string — it uses port **5432** with a direct host (not pooler)

Set this in your `.env.local` as `DATABASE_URL` temporarily:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ngwyurzusrbncdazmasl.supabase.co:5432/postgres"
```

Then run:
```bash
npx prisma db push
```

Then switch `DATABASE_URL` back to the Transaction pooler string for Vercel.

---

## Verification

After SQL runs and Vercel is redeployed, test in this order:

1. Visit `/contact` → fill the form → submit → should say "Brief received"
2. Visit `/admin` → enter `Humam0786` → should load with "No leads yet" or show your test lead
3. Click a lead → "Generate Audit (AI)" → should work in ~10 seconds
4. Visit `/client` → enter your email → should show your submission

---

## Still getting errors?

**"relation Lead does not exist"** → SQL did not run. Go back to Step 2.

**"Invalid admin key"** → Check Vercel has `ADMIN_KEY=Humam0786` exactly (no spaces).

**"Internal server error" on /client** → DATABASE_URL is still wrong. Make sure it starts with `postgresql://` not `https://`.

**"P1001 Can't reach database"** → You are using Session pooler (5432) locally. Use Option B's direct connection string instead.


**lead loss = Location