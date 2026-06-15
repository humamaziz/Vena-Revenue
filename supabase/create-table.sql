-- ============================================================
-- Vena%Revenue — Database Setup SQL
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- URL: https://supabase.com/dashboard/project/ngwyurzusrbncdazmasl/sql/new
-- ============================================================

-- Drop existing tables if you need a clean reset (comment out if not needed)
-- DROP TABLE IF EXISTS "Interaction";
-- DROP TABLE IF EXISTS "Lead";

-- ── Lead table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Lead" (
  "id"          TEXT        NOT NULL,
  "name"        TEXT        NOT NULL,
  "email"       TEXT        NOT NULL,
  "website"     TEXT        NOT NULL,
  "industry"    TEXT        NOT NULL,
  "goal"        TEXT        NOT NULL,
  "revenue"     TEXT,
  "adspend"     TEXT,
  "budget"      TEXT,
  "problem"     TEXT,
  "audit"       TEXT,
  "preview"     TEXT,
  "score"       INTEGER,
  "priority"    TEXT,
  "status"      TEXT        NOT NULL DEFAULT 'new',
  "paid"        BOOLEAN     NOT NULL DEFAULT false,
  "pdfUrl"      TEXT,
  "loomUrl"     TEXT,
  "source"      TEXT,
  "notes"       TEXT,
  "lastContact" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- ── Interaction table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Interaction" (
  "id"        TEXT         NOT NULL,
  "leadId"    TEXT         NOT NULL,
  "type"      TEXT         NOT NULL,
  "content"   TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Interaction_leadId_fkey"
    FOREIGN KEY ("leadId")
    REFERENCES "Lead"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Lead_email_idx"        ON "Lead"("email");
CREATE INDEX IF NOT EXISTS "Lead_status_idx"       ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "Lead_priority_idx"     ON "Lead"("priority");
CREATE INDEX IF NOT EXISTS "Lead_paid_idx"         ON "Lead"("paid");
CREATE INDEX IF NOT EXISTS "Interaction_leadId_idx" ON "Interaction"("leadId");

-- ── Done ────────────────────────────────────────────────────
-- You should see: "Success. No rows returned."
-- Tables are now ready. Redeploy Vercel and test /contact