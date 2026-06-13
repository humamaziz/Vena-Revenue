# Vena%Revenue — Complete Revenue Engineering Platform

Full-stack Next.js 14 website + admin CRM + AI audit system for **Vena%Revenue**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# 3. Initialize database
npx prisma db push

# 4. Run development server
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
app/
  page.tsx                    → Home (cinematic 5-chapter story)
  about/page.tsx              → About + mission + market data
  services/page.tsx           → 3-phase service breakdown + pricing
  projects/page.tsx           → 5 case studies mapped to 5 vectors
  contact/page.tsx            → 3-step animated lead form
  client/page.tsx             → Client portal (email lookup)
  admin/page.tsx              → Full CRM dashboard (auth required)
  success/page.tsx            → Post-payment confirmation
  privacy-policy/page.tsx     → Privacy policy
  terms/page.tsx              → Terms of service

  api/
    audit/route.ts            → Public form submission → saves lead to DB
    admin/
      leads/route.ts          → GET all leads (admin only)
      generate-audit/route.ts → Groq AI audit generation (admin only)
      score-lead/route.ts     → AI lead scoring 0–100 (admin only)
      generate-followup/      → AI follow-up drafts (admin only)
      send-email/route.ts     → Send audit email to client (admin only)
      send-followup/route.ts  → Send follow-up email (admin only)
      update-lead/route.ts    → Save audit edits + status (admin only)
      save-notes/route.ts     → Save admin notes (admin only)
      add-loom/route.ts       → Save Loom video URL (admin only)
      generate-pdf/route.ts   → Generate PDF report (admin only)
    client/
      get-data/route.ts       → Client portal data lookup
    checkout/route.ts         → Stripe checkout session
    webhook/route.ts          → Stripe webhook → mark lead as paid

lib/
  prisma.ts                   → Prisma client singleton
  groq.ts                     → Groq AI prompts + API helper
  email.ts                    → Nodemailer email functions
  generatePdf.ts              → @react-pdf/renderer PDF generation
  auth.ts                     → Admin bearer token auth

prisma/
  schema.prisma               → Lead + Interaction models (SQLite)

components/
  layout/Navbar.tsx           → Sticky navbar with mobile menu
  layout/Footer.tsx           → Footer with all correct links
  sections/
    HeroSection.tsx           → Particle canvas + animated headline
    TickerStrip.tsx           → Auto-scrolling marquee
    ProblemSection.tsx        → 5 revenue leak vectors
    SystemSection.tsx         → 3-phase loop + 8-pillar callout
    ResultsSection.tsx        → Counters + 4 case studies + market stats
    OfferSection.tsx          → 3-tier pricing + guarantee card
    FinalCTA.tsx              → Closing + live shadow query block
  ui/
    AnimatedSection.tsx       → Scroll-triggered reveal wrapper
    GlowCard.tsx              → 3D tilt + radial hover glow card
    Counter.tsx               → Eased number animation on scroll
    ScrollProgress.tsx        → Gradient scroll progress bar
```

---

## 🔐 Admin Dashboard

Access at `/admin` — requires the `ADMIN_KEY` env variable.

All AI actions are **manually triggered** — nothing fires automatically:

| Action | What it does |
|--------|-------------|
| Generate Audit (AI) | Calls Groq LLaMA-70B with 8-pillar prompt |
| Score Lead (AI) | Returns 0–100 score + priority classification |
| Generate Follow-ups | Creates 3 draft emails (Day 1, Day 3, Day 7) |
| Save & Approve Audit | Editable textarea → saves to DB → status: approved |
| Generate PDF | Renders styled PDF via @react-pdf/renderer |
| Send Email | Manual trigger only → sends audit + Loom to client |
| Send Follow-up | Manual trigger → sends any draft to client |
| Add Loom URL | Stored in DB, included in next email send |
| Admin Notes | Internal notes, never sent to client |

---

## 💳 Stripe Setup

1. Create a product in Stripe dashboard
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env.local`
3. Configure webhook endpoint: `https://your-domain.com/api/webhook`
4. Webhook event: `checkout.session.completed`

---

## 📧 Email Setup (Gmail)

1. Enable 2FA on your Google account
2. Generate an App Password at myaccount.google.com/apppasswords
3. Set `EMAIL_USER` and `EMAIL_PASS` in `.env.local`

---

## 🗄️ Database

Uses SQLite via Prisma (zero-config local development).

```bash
# Push schema changes
npm run db:push

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

To switch to PostgreSQL for production, change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#0B0F1A` |
| Aqua accent | `#00F5D4` |
| Purple accent | `#7B61FF` |
| Pink accent | `#FF4D6D` |
| Gold % symbol | `#FFD700` |
| Text primary | `#E6E9F2` |
| Text muted | `#8892A4` |

---

## 🔑 Key Business Rules (Do Not Break)

- **NO automatic emails** — every send is admin-triggered
- **NO automatic AI calls** — every generation is admin-triggered  
- **NO fake data** — all stats sourced from real market research
- The **%** in Vena%Revenue is always rendered in **gold** (`#FFD700`)
