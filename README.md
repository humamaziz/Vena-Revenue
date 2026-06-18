# Vena%Revenue v0.4 — Complete Revenue Engineering Platform

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in all values
npx prisma db push            # creates tables (or run supabase/create-tables.sql)
npm run dev
```

---

## What Changed in v0.4

### Contact Form
- **Removed**: "Describe your biggest leak / problem" step — the client does NOT know their leak, that is what they are paying to find out
- **Added**: Business Location field (city, state, country) — powers hyper-local competitor comparison in the audit
- **Reduced**: 3 steps → 2 clean steps

### Audit System — Complete Rebuild
The audit prompt now produces the **Vena%Revenue $6,000 Comprehensive Audit Framework** matching the Algebra Group sample exactly:

| Section | What it produces |
|---------|-----------------|
| Executive Briefing | Names 3 real competitor archetypes + the client's unfair advantage |
| Pillar 1: Conversion Architecture | CTA, above-fold, trust signals, Form Friction Score /10 |
| Pillar 2: SEO + AI SEO | Keyword gaps, AI search invisibility, schema audit, local SEO |
| Pillar 3: Technical Performance | Markdown table with Mobile Speed, LCP, 404s, Business Impact |
| Pillar 4: AI Integration | Specific AI tool proposal with flow diagram using → notation |
| Pillar 5: Booking + Lead System | Response time stats, automation recommendation |
| Pillar 6: Branding + Visual Design | Typography, hierarchy, brand consistency |
| Pillar 7: Competitive + Market Position | ASCII positioning chessboard + gap analysis |
| Pillar 8: Psychology + Copy Audit | Before/After copy rewrite with real specifics |
| Financial Projections | 3-line leakage table with exact dollar figures + total |

### AI Output Quality
- All prompts updated with `Vena%Revenue voice` rules — no "leverage", no "utilize", no "in today's digital landscape"
- Location used throughout: competitor names, local benchmarks, geo-specific urgency
- Ad spend detection: flagged explicitly in audit if running ads (wasted budget) or not running ads (missed channel)
- Token budget increased to 4,500 for audit generation (was 2,500)
- Follow-ups now reference audit findings for specificity

### PDF Generator
- Rebuilt to handle markdown tables → styled HTML table components
- ASCII diagrams → monospace code blocks with dark background
- ## headers → colored pillar cards
- Before/After callouts → styled contrast blocks

### Admin Dashboard — New Features
| Tab | New tools |
|-----|-----------|
| Outreach | Vector selector (V1-V5), Loom script generator, Cold email generator |
| AI Tools | Sales intelligence, Objection handler, Quick email writer, Testimonial request |
| Research | Full AI research profile: ICP match, competitors + estimated revenue, closing hook, client avatar |
| Details | Payment link copy, Activity timeline |

---

## Folder Structure

```
app/
  (site)/
    page.tsx              Home
    contact/page.tsx      2-step form (no problem field, has location)
    pay/page.tsx          Tier selection + Stripe checkout
    client/page.tsx       Client portal (email lookup)
    about/page.tsx
    services/page.tsx
    projects/page.tsx
    success/page.tsx
    privacy-policy/page.tsx
    terms/page.tsx
  admin/
    page.tsx              Full CRM (5 tabs, all AI tools)
  api/
    audit/route.ts        Saves lead (no AI, no email)
    admin/
      generate-audit/     Full 8-pillar audit (4500 tokens)
      score-lead/         0-100 score + tier recommendation
      research-lead/      Full intelligence profile with competitors
      generate-followup/  3-email sequence (Day 1/3/7)
      sales-assistant/    Situation, risk, next move, close %
      handle-objection/   Confident reply to any objection
      quick-email/        Any instruction → human email draft
      request-testimonial/
      create-loom-script/ 90-sec Loom script by vector (V1-V5)
      generate-email-template/ Cold outreach email by vector
      send-email/         Manual trigger — sends audit to client
      send-followup/      Manual trigger — sends follow-up
      generate-pdf/       Streams PDF binary (Vercel compatible)
      update-lead/        Save audit edits
      save-notes/         Internal notes
      add-loom/           Loom URL
      mark-paid/          Toggle paid status manually
      leads/              List all leads (sidebar)
    checkout/route.ts     Stripe checkout
    webhook/route.ts      Stripe paid → mark lead paid
    client/get-data/      Client portal lookup

lib/
  groq.ts       All AI prompts (audit, followup, score, research, objection, loom, email, testimonial, quick email)
  email.ts      Admin notification + audit email (with HTML renderer for new format) + followup
  generatePdf.ts  PDF generator (handles tables, diagrams, pillars)
  prisma.ts     DB client
  auth.ts       Admin bearer token check

prisma/
  schema.prisma   Lead + Interaction (PostgreSQL, has location field)

supabase/
  create-tables.sql  Run this in Supabase SQL editor to create tables
```

---

## Environment Variables

```env
DATABASE_URL="postgresql://..."       # Supabase Transaction pooler (port 6543)
DIRECT_URL="postgresql://..."         # Supabase Session/direct (port 5432)
GROQ_API_KEY="gsk_..."
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"      # Gmail App Password
ADMIN_EMAIL="admin@yourcompany.com"
ADMIN_KEY="your-secret-key"
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
```

---

## Deploying to Vercel

1. Push code to GitHub
2. Import repo in Vercel
3. Add all environment variables
4. Run `supabase/create-tables.sql` in Supabase SQL editor (one time)
5. Deploy — build command is `prisma generate && next build` (set in package.json)

### If upgrading from v3 (tables already exist):
Run this in Supabase SQL editor to add the new column:
```sql
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "location" TEXT;
```