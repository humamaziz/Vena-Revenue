const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function callGroq(system: string, user: string, temperature = 0.6, maxTokens = 2500): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, temperature, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  })
  if (!res.ok) { const t = await res.text(); throw new Error(`Groq ${res.status}: ${t}`) }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Groq returned empty content')
  return content
}

// ── SHARED LEAD TYPE ─────────────────────────────────────────
interface LeadCore {
  name: string
  website: string
  industry: string
  goal?: string | null
  location?: string | null
  revenue?: string | null
  adspend?: string | null
}

function locationContext(location?: string | null): string {
  if (!location) return ''
  return `\nBusiness Location: ${location}
  
LOCATION INTELLIGENCE MANDATE: This is critical. Use the location to:
1. Name the actual top 2-3 competitors dominating this market in ${location} right now
2. Reference local market dynamics, average pricing, and competitive density
3. Quantify what the market leader in ${location} is earning vs. what this business is earning
4. Make the loss feel local and real - not abstract`
}

// ── AUDIT PROMPT ─────────────────────────────────────────────
// Matches the exact structure of the Vena%Revenue $6K Audit Framework:
// competitor archetypes, 8-pillar deep audit, positioning chessboard,
// financial leakage table. This is the gold-standard format — do not simplify it.
export function buildAuditPrompt(lead: LeadCore & {
  budget?: string | null
  problem?: string | null
}): string {
  const hasAdSpend = lead.adspend && lead.adspend !== 'None' && lead.adspend.trim() !== ''
  const monthlyRevenueNum = parseRevenueToNumber(lead.revenue)
  const annualRevenueLabel = monthlyRevenueNum
    ? `$${(monthlyRevenueNum * 12).toLocaleString()}`
    : 'their stated revenue band'

  return `You are writing a COMPREHENSIVE REVENUE LEAK & GROWTH AUDIT for Vena%Revenue, a premium revenue engineering firm. This document is a $6,000 deliverable. The client is paying for elite-level, named, specific intelligence — not generic advice. You write like a senior consultant who has already studied this exact market and these exact competitors.

WRITING RULES - ZERO EXCEPTIONS:
- NEVER write "In today's digital landscape" — instant disqualification
- NEVER use: leverage, utilize, synergy, circle back, streamline, holistic
- NEVER write generic advice that could apply to any business in any city
- NEVER hedge with "may", "could potentially", "it seems", "might"
- Use tables and structured callouts exactly as instructed below — this is NOT a flowing essay
- Sound like you already know this market because you have audited businesses in it before
- Every number must be specific (a percentage, a dollar figure, a time duration) — never vague

${locationContext(lead.location)}

---

BUSINESS BEING AUDITED:
Name: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Primary Goal: ${lead.goal ?? 'not specified'}
Monthly Revenue: ${lead.revenue ?? 'not provided'}
Monthly Ad Spend: ${lead.adspend ?? 'not provided'}
Currently Running Paid Ads: ${hasAdSpend ? 'YES' : 'NO — this must be flagged as a missed acquisition channel, not just a leak'}
${lead.location ? `Location: ${lead.location}` : ''}
${lead.problem ? `Stated Challenge: ${lead.problem}` : ''}

---

Build the audit in this EXACT structure. Use these EXACT section headers. This is non-negotiable — the client has seen this format before and expects it.

# COMPREHENSIVE REVENUE LEAK & GROWTH AUDIT
Prepared for: [Owner name(s) if known, otherwise "${lead.name} Leadership"]
Target Platform: ${lead.website}
Framework Value: $6,000 Audit & Optimization Roadmap

## Executive Briefing: The Boutique Advantage vs. The Titans
Identify and NAME 3 real, plausible competitor archetypes that would actually exist in ${lead.industry}${lead.location ? ` in ${lead.location}` : ''}. Give each one a one-line characterization of their strategy (e.g., "The legacy volume leader holding structural domain authority" or "The data-first algorithmic terminal"). These should feel like real companies a buyer would recognize, not generic placeholders.

Then write 2-3 sentences identifying ${lead.name}'s ONE unfair structural advantage that none of these three titans can replicate — something inherent to their business model, niche specialization, personal expertise, or service combination. Name this advantage explicitly and frame the rest of the audit around helping them weaponize it.

## Pillar 1: Conversion Architecture
Sub-metrics to audit: CTA Placement, Above-Fold Audit, Trust Signals, Form Friction Score.

Format: "The Competitor Strategy:" [name one of the three titans and what they do well here] → "${lead.name}'s Current Leak:" [the specific problem, citing a Form Friction Score out of 10] → "The Friction Point:" [one concrete detail about what is broken] → "What You Achieve by Fixing It:" [specific percentage conversion lift estimate].

## Pillar 2: SEO + AI SEO Intelligence
Sub-metrics to audit: Keyword Gap Analysis, AI Search Visibility, Schema Markup Audit, Local SEO Score.

Format: "The Competitor Strategy:" [which titan dominates broad keywords and why] → "${lead.name}'s Current Leak:" [specific high-intent keyword phrases they should rank for but don't, tied to their actual expertise or niche] → "AI Search Invisibility:" [explain specifically why ChatGPT/Perplexity/Gemini cannot extract their data — usually missing schema] → give one example conversational query a buyer might ask an AI that should surface this business but currently does not → "What You Achieve by Fixing It:" [specific schema type to implement, e.g. the correct schema.org type for this industry].

## Pillar 3: Technical Performance
Sub-metrics to audit: Core Web Vitals, Mobile Speed Score, Broken Links/404s, Security/SSL.

Build an actual markdown table with these exact rows: Mobile Speed Score, Core Web Vitals (LCP), Broken Links/404s. Columns: Performance Metric | Current State | Target Benchmark | Business Impact. Use realistic but invented current-state numbers consistent with a business that has not invested in technical SEO (e.g., Mobile Speed ~40-50/100, LCP 4-5+ seconds). Each Business Impact cell must quantify lost traffic or lost conversions as a percentage.

After the table, write "What You Achieve by Fixing It:" connecting the fix to lower cost-per-lead on their specific ad platforms.

## Pillar 4: AI Integration Opportunity
Sub-metrics to audit: AI Content Updates, Personalization AI, Lead Quality Bot, AI Chat.

Format: "The Competitor Strategy:" [how one titan handles lead routing/response, and its limitation] → "${lead.name}'s Current Leak:" [specifically how off-hours or high-volume inquiries are being missed] → "The Unfair Advantage Engine:" propose ONE specific, creative AI tool unique to this business's actual offering (not generic chatbot — something tied to their specific service, like a cost estimator, an eligibility calculator, a yield projector, or a case value estimator depending on the industry). Show it as a simple flow diagram using this exact format:

[Standard Listing/Page View] ──> Toggle/Click "[Tool Name]" ──> AI Calculates:
[Specific output 1] + [Specific output 2 — make this a real metric like a percentage lift or dollar value]

Then: "What You Achieve by Fixing It:" [reframe their site from passive brochure to interactive financial/decision tool].

## Pillar 5: Booking & Lead System
Sub-metrics to audit: Booking Flow Audit, Calendar Integration, Follow-up Automation, CRM/Email Sync.

Format: "The Competitor Strategy:" [how titans handle routing, and the internal delay this introduces — give a specific minute range] → "${lead.name}'s Current Leak:" [their current passive contact method] → cite the specific statistic: if a lead is not engaged within 5-7 minutes, conversion probability drops by 78-80% → "What You Achieve by Fixing It:" [specific automation to implement, tied to their buyer's likely communication preference — WhatsApp, SMS, or calendar booking depending on industry and location].

## Pillar 6: Branding & Visual Design
Sub-metrics to audit: Typography Score, Brand Consistency, Visual Hierarchy, Color Psychology.

Format: "The Competitor Strategy:" [which titan wins on premium visual presentation] → "${lead.name}'s Current Leak:" [specific visual hierarchy problem — what gets buried that should stand out] → "What You Achieve by Fixing It:" [specific outcome tied to brand trust and premium positioning].

## Pillar 7: Competitive + Market Position
Sub-metrics to audit: Top 3 Competitor Audit, Positioning Gaps, Review/Social Proof, Lead Capture Compare.

Build the positioning chessboard exactly as an ASCII diagram using this format (fill in with the actual 3 named competitor archetypes from the executive briefing and this business's unique position):

\`\`\`
[THE ${lead.industry.toUpperCase()} CHESSBOARD — ${lead.location ? lead.location.toUpperCase() : 'THIS MARKET'}]

  HIGH TECH / DATA                                      HIGH LIFESTYLE
 ┌────────────────────────────────────────────────────────────────────┐
 │  [Competitor 2 name]                              [Competitor 3 name] │
 │  ([their characterization])                  ([their characterization]) │
 │                                                                    │
 │               ★ ${lead.name.toUpperCase()}'S UNFAIR ADVANTAGE ★               │
 │               "[A specific positioning statement]"                  │
 │               ([the unique combination/advantage])                  │
 │                                                                    │
 │  [Competitor 1 name]                                                │
 │  ([their characterization])                                        │
 └────────────────────────────────────────────────────────────────────┘
  LOW TECH / DATA                                       LOW LIFESTYLE
\`\`\`

Below the diagram, write "The Gaps Exposed:" one sentence per competitor naming their blind spot, then "What You Achieve by Fixing It:" framing this business's positioning as the clear category-of-one choice.

## Pillar 8: Psychology + Copy Audit
Sub-metrics to audit: Headline Strength, Pain Point Clarity, Pricing Psychology, Urgency + Scarcity.

Format: "The Competitor Strategy:" [how generic operators write copy — usually feature-focused] → "${lead.name}'s Current Leak:" [their current copy pattern] → show a concrete "Before:" and "After:" copy rewrite using realistic specifics for this industry (a real headline transformation from feature-listing to outcome/ROI-focused) → "What You Achieve by Fixing It:" [the psychological shift this creates in a serious buyer].

## Financial Projections: The Cost of Inaction
Use this annual revenue baseline for context: ${annualRevenueLabel} (derived from their stated monthly revenue).

Build exactly 3 named leak categories drawn from the pillars above (choose the 3 most damaging ones for this specific business), each with a specific annual dollar figure, using this exact arrow format:

\`\`\`
[Leak Category 1 Name] ───► $XXX,XXX / year ([one-line cause])
[Leak Category 2 Name] ───► $XXX,XXX / year ([one-line cause])
[Leak Category 3 Name] ───► $XXX,XXX / year ([one-line cause])
─────────────────────────────────────────────────────────────────────────────────
TOTAL ESTIMATED ANNUAL LEAKAGE: $XXX,XXX
\`\`\`

The three figures must sum exactly to the total. Size them realistically relative to their stated revenue (typically 10-20% of annual revenue in aggregate, never absurd). After the table, write one closing paragraph: connect the audit fee to a concrete proof point (e.g., "closing just one additional client at your average deal size entirely validates this investment") and end with one sentence repositioning them as the category leader in their specific niche and location, not a generic competitor in the broader market.

---

FINAL INSTRUCTION: Do not skip the ad spend assessment. ${hasAdSpend ? `This business spends ${lead.adspend} per month on ads — explicitly address in Pillar 3 and Pillar 4 how technical and AI leaks are actively wasting this specific ad budget.` : `This business is NOT currently running paid ads — explicitly note in the Executive Briefing or Pillar 7 that this is a missed acquisition channel competitors are likely using, and quantify what a conservative ad budget could unlock once the conversion architecture is fixed.`}`
}

function parseRevenueToNumber(revenue?: string | null): number | null {
  if (!revenue) return null
  const cleaned = revenue.replace(/[^0-9.kKmM-]/g, '')
  const match = cleaned.match(/[\d.]+/)
  if (!match) return null
  let num = parseFloat(match[0])
  if (/[mM]/.test(cleaned)) num *= 1_000_000
  else if (/[kK]/.test(cleaned)) num *= 1_000
  return num || null
}

// ── FOLLOW-UP PROMPT ─────────────────────────────────────────
export function buildFollowUpPrompt(lead: LeadCore & {
  status: string
  audit?: string | null
  interactions: Array<{ type: string; content: string; createdAt: Date }>
}): string {
  const firstName = lead.name.split(' ')[0]
  const auditSnippet = lead.audit ? lead.audit.slice(0, 500) : null
  const history = lead.interactions.slice(-4)
    .map(i => `[${i.type} — ${new Date(i.createdAt).toDateString()}]: ${i.content.slice(0, 200)}`).join('\n')
  const loc = lead.location ? ` in ${lead.location}` : ''

  return `You are Ansh from Vena%Revenue writing follow-up emails to a real business owner. These are NOT marketing emails. They are short, direct, human messages — one person to another.

ABSOLUTE RULES — any violation makes the output unusable:
- NO "I hope this finds you well" or any variant — ever
- NO "I wanted to reach out" — ever
- NO bullet points in the email body — none
- MAXIMUM 4 sentences per email — every sentence earns its place
- NO corporate language — write like a text message, not a press release
- USE the first name ONCE at the start, never again
- Sound like you already know their problem — because you read the audit
- ONE clear CTA per email — low friction, not "let's schedule a call"
- Sign every email exactly: Ansh / Vena%Revenue

LEAD CONTEXT:
First Name: ${firstName}
Industry: ${lead.industry}${loc ? `\nLocation: ${lead.location}` : ''}
Goal: ${lead.goal ?? 'not specified'}
Status: ${lead.status}
${auditSnippet ? `Audit Findings (reference specific details from this): ${auditSnippet}` : ''}
History: ${history || 'First contact — no prior touchpoints'}

---

Write 3 email bodies. No subject lines. Just the body text.

DAY 1:
Reference ONE specific finding from their audit or one specific fact about their market${lead.location ? ` in ${lead.location}` : ''}. Prove you read it. Tell them what we found. CTA: reply to this to lock in a slot.

DAY 3:
Name a specific, credible result from a real client in a similar industry and location — keep the numbers conservative and believable (e.g., "$84K recovered in 60 days for a Houston PI firm"). Mention: 10 audits per month, 2 slots left. CTA: reply "yes" to hold the last slot.

DAY 7:
Call out the real reason they have not replied — it is not the money, it is inertia. Name it directly. No guilt, no pressure. Just: here is what happens if we fix this, here is what keeps happening if we do not. Final CTA: yes or no, just tell us.

Format EXACTLY like this:

DAY 1:
[body]

DAY 3:
[body]

DAY 7:
[body]`
}

// ── LEAD SCORE ───────────────────────────────────────────────
export function buildScorePrompt(lead: LeadCore & { budget?: string | null }): string {
  return `You are a lead scoring analyst at Vena%Revenue — a premium revenue engineering firm charging $2,500–$15,000 for audits and $25,000–$75,000 for builds.

Score this inbound lead from 0 to 100.

Scoring logic:
- Revenue ($1M+/mo = 90-100, $200K-$1M = 70-89, $50K-$200K = 40-69, under $50K = 10-39)
- Ad spend present = +15 (they have budget AND are losing money we can recover)
- Industry fit: PI law, medspa, B2B SaaS $2M-$30M ARR, boutique hotels, dental, orthodontics = excellent (+10). Generic SMB = neutral.
- Location quality: Major metro (Houston, Miami, London, Sydney, Dubai) = +5. Smaller market = neutral.
- Goal specificity: Knows exactly what they want = +10
- Budget stated $15K+ = high intent (+10)

LEAD:
Business: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Location: ${lead.location ?? 'not provided'}
Goal: ${lead.goal ?? 'not specified'}
Revenue: ${lead.revenue ?? 'unknown'}
Ad Spend: ${lead.adspend ?? 'none stated'}
Budget: ${lead.budget ?? 'not stated'}

Return ONLY valid JSON — no markdown, no code fences, nothing before or after the JSON:
{"score": <0-100>, "priority": "<low|medium|high>", "reasoning": "<one sharp sentence explaining the score>", "recommended_tier": "<Entry Diagnostic $2,500|Full Revenue Intelligence Report $6,000|Premium ARE Audit $12,000-$15,000>"}`
}

// ── SALES ASSISTANT ──────────────────────────────────────────
export function buildSalesAssistantPrompt(lead: LeadCore & {
  status: string
  score?: number | null
  priority?: string | null
  audit?: string | null
  notes?: string | null
  interactions: Array<{ type: string; content: string; createdAt: Date }>
}): string {
  const history = lead.interactions.slice(-6)
    .map(i => `[${i.type} — ${new Date(i.createdAt).toDateString()}]: ${i.content.slice(0, 250)}`).join('\n')
  return `You are Ansh's AI sales co-pilot at Vena%Revenue. Give a sharp, honest read. No fluff.

LEAD:
Name: ${lead.name} | Industry: ${lead.industry} | Location: ${lead.location ?? 'unknown'}
Goal: ${lead.goal ?? 'not specified'} | Status: ${lead.status} | Score: ${lead.score ?? 'not scored'}/100 | Priority: ${lead.priority ?? 'not set'}
Audit done: ${lead.audit ? 'Yes' : 'No'} | Notes: ${lead.notes ?? 'none'}
History:
${history || 'No interactions yet'}

Answer exactly 4 things. Number them. No headers.

1. SITUATION: What is actually happening with this deal right now in one sentence?
2. RISK: The single thing most likely to kill this deal.
3. NEXT MOVE: The one specific thing to do in the next 24 hours. Exact action, not vague advice.
4. CLOSE PROBABILITY: Your honest percentage and a one-sentence reason.`
}

// ── OBJECTION HANDLER ────────────────────────────────────────
export function buildObjectionPrompt(lead: { name: string; industry: string; location?: string | null; goal?: string | null; objection: string }): string {
  const loc = lead.location ? ` in ${lead.location}` : ''
  return `You are a senior closer at Vena%Revenue. Write a reply to this sales objection. Confident. Human. Not defensive.

LEAD: ${lead.name} | ${lead.industry}${loc} | Goal: ${lead.goal ?? 'not specified'}
OBJECTION: "${lead.objection}"

Rules:
- 3-5 sentences max
- Acknowledge in one phrase, immediately redirect to their actual problem
- Reference something specific about their industry or location if possible
- End with a low-friction next step — not "let's get on a call"
- Sound like someone who has heard this 100 times and knows exactly what is under it
- Sign: Ansh, Vena%Revenue

Write just the email body.`
}

// ── LOOM SCRIPT ──────────────────────────────────────────────
export function buildLoomScriptPrompt(lead: {
  name: string; website: string; industry: string; location?: string | null
  vector: string; competitorName?: string | null; specificLeak?: string | null
}): string {
  const loc = lead.location ?? 'their city'
  const vectorMap: Record<string, string> = {
    '1': `AI Invisibility — "${lead.name}" does not appear in ChatGPT or Perplexity when buyers search for ${lead.industry} in ${loc}. A named competitor does.`,
    '2': `Ghosted Lead Bleed — no intake automation, leads going cold before anyone on the team responds. In ${lead.industry}, leads go cold in under 4 hours.`,
    '3': `Form Friction — too many form fields or a clunky intake process. High-intent buyers are abandoning right before submit.`,
    '4': `Ad Spend Hemorrhage — paying for clicks that bounce because the landing page loads in 5+ seconds or tracking is broken.`,
    '5': `Booking Crisis — manual confirmation or third-party redirect losing mobile users to faster competitors in ${loc}.`,
  }
  const vectorContext = lead.specificLeak || vectorMap[lead.vector] || vectorMap['1']
  const competitor = lead.competitorName || `the top-ranked ${lead.industry} provider in ${loc}`

  return `Write a 90-second Loom video script for Ansh at Vena%Revenue to record and send to ${lead.name} (${lead.industry}${lead.location ? `, ${lead.location}` : ''}).

THE SPECIFIC LEAK: ${vectorContext}
COMPETITOR TO REFERENCE: ${competitor}
THEIR WEBSITE: ${lead.website}

Follow this EXACT timed structure:

[COLD OPEN — 0:00-0:08]
One sentence. Uncomfortable to ignore. Start with "I want to show you..." — reference their specific situation and location.

[SCREEN SHARE REVEAL — 0:09-0:30]
Walk through exactly what to show on screen. The specific evidence of the leak. Use concrete details — a real search query, a real result, a real page. Reference ${competitor} and ${loc} directly.

[THE MECHANISM — 0:31-0:52]
WHY this is happening — the technical or structural reason. Make it feel inevitable and fixable. Reference what this costs specifically in the ${lead.industry} market.

[COMPETITOR CONTRAST — 0:53-1:05]
What ${competitor} is doing differently. Factual. Calm. This is market reality, not trash talk.

[THE CLOSE — 1:06-1:25]
Exactly this wording: "The Triage Audit is $1,500. We map the complete fix in 48 hours. If we do not identify at least 2x that in recoverable revenue leaks, it is fully refunded. The link is directly below this video. We have 2 slots left this month."

Include [SCREEN:] annotations throughout for what to show on camera. Write for ONE specific person, not a broadcast.`
}

// ── OUTREACH EMAIL TEMPLATE ──────────────────────────────────
export function buildEmailTemplatePrompt(lead: {
  name: string; industry: string; website: string; location?: string | null
  vector: string; ownerName?: string | null; specificLeak?: string | null
}): string {
  const loc = lead.location ?? 'your city'
  const first = lead.ownerName?.split(' ')[0] || 'there'
  const subjectMap: Record<string, string> = {
    '1': `${first}, an AI just sent your ${loc} leads to your competitor`,
    '2': `${first}, your leads are dying in your inbox`,
    '3': `${first}, your intake form is rejecting clients`,
    '4': `${first}, you are funding Google. Google is not funding you back.`,
    '5': `${first}, your booking flow is losing ${loc} clients to faster competitors`,
  }
  const hintMap: Record<string, string> = {
    '1': `zero AI schema architecture, invisible in ChatGPT/Perplexity searches for ${lead.industry} in ${loc}`,
    '2': `no intake automation, leads going cold before a human responds`,
    '3': `form friction — high-intent buyers abandoning at the submit step`,
    '4': `ad funnel integrity failure — slow load or broken tracking eating the spend`,
    '5': `manual booking flow losing mobile users to instant-confirmation competitors`,
  }
  const subject = subjectMap[lead.vector] || subjectMap['1']
  const leak = lead.specificLeak || hintMap[lead.vector] || hintMap['1']

  return `Write a cold outbound email for Ansh at Vena%Revenue to send to the owner of ${lead.name} (${lead.industry}${lead.location ? `, ${lead.location}` : ''}).

SUBJECT LINE: ${subject}
SPECIFIC LEAK TO REFERENCE: ${leak}
OWNER NAME: ${first}
THEIR WEBSITE: ${lead.website}
THEIR LOCATION: ${loc}

Email rules (none optional):
- 5 sentences MAX in the body
- No pleasantries, no "I hope this message finds you well"
- Open with the specific pain — not an introduction
- Bold the core leak finding using **bold**
- Reference their location and market naturally
- End with the Loom video placeholder: [LOOM VIDEO LINK]
- P.S. line: mention 10 audits per month, 2 slots left, tie urgency to their specific problem
- Sign: [Name] / Vena%Revenue

Format:

SUBJECT: ${subject}

[email body]

P.S. [scarcity line]`
}

// ── LEAD RESEARCH PROFILE ────────────────────────────────────
export function buildResearchPrompt(lead: LeadCore & { budget?: string | null; notes?: string | null }): string {
  return `You are a Revenue Intelligence Analyst at Vena%Revenue building a complete client research profile. This profile is used by our sales team to close the deal and by our audit team to write a more precise diagnosis.

Be specific. Be realistic. If you do not have exact data, make informed industry estimates and label them "(est.)".

BUSINESS TO PROFILE:
Name: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Location: ${lead.location ?? 'not provided'}
Goal: ${lead.goal ?? 'not specified'}
Revenue: ${lead.revenue ?? 'unknown'}
Ad Spend: ${lead.adspend ?? 'unknown'}
Budget: ${lead.budget ?? 'not stated'}
Notes: ${lead.notes ?? 'none'}

${lead.location ? `LOCATION RESEARCH MANDATE:
- Identify the top 3 actual competitors in the ${lead.industry} space in ${lead.location}
- Estimate what the top competitor in ${lead.location} is earning monthly
- Note the competitive density of this market (how saturated is this niche in this location)
- Flag any geographic-specific opportunities (e.g., underserved suburb, dominant local player)` : ''}

REVENUE LEAKAGE CALCULATION — DO THIS FIRST, BEFORE WRITING ANY JSON:
Take the business's stated monthly revenue (or your best estimate if not given). Revenue-leak audits in this industry typically uncover 10%-25% of monthly revenue in recoverable leaks (lost leads, slow response, poor conversion, missed AI-search visibility, weak booking flow). Calculate a concrete LOW and HIGH dollar figure for THIS business using that range, then write that exact range into "estimatedMonthlyLeakage" below. This field is mandatory — never leave it blank, never write "N/A", never omit it. If revenue is truly unknown, infer a plausible monthly revenue from the industry and location first, state that assumption inside the value itself, e.g. "$8,000-$15,000/mo (assuming ~$60k/mo revenue based on industry size)".

Return ONLY valid JSON. No markdown, no code fences, no explanation. Put estimatedMonthlyLeakage as the SECOND key, right after icpMatch, so it is never truncated or skipped:
{
  "icpMatch": "<Tier 1 — Perfect ICP|Tier 2 — Strong ICP|Tier 3 — Weak ICP>",
  "estimatedMonthlyLeakage": "<low>-<high> dollar range, mandatory, never blank>",
  "leakageReasoning": "<one sentence showing the math: revenue x leak% = this range>",
  "estimatedLTV": "<dollar range over 12 months>",
  "primaryVector": "<1|2|3|4|5>",
  "vectorName": "<AI Invisibility|Ghosted Lead Bleed|Form Friction|Ad Spend Hemorrhage|Booking Crisis>",
  "topCompetitors": [
    {"name": "<competitor name>", "estimatedRevenue": "<monthly est.>", "whyTheyWin": "<one sentence>"},
    {"name": "<competitor name>", "estimatedRevenue": "<monthly est.>", "whyTheyWin": "<one sentence>"},
    {"name": "<competitor name>", "estimatedRevenue": "<monthly est.>", "whyTheyWin": "<one sentence>"}
  ],
  "marketDensity": "<low|medium|high>",
  "geographicOpportunity": "<one sentence insight about their specific location>",
  "industryBenchmarks": {
    "avgConversionRate": "<percentage>",
    "avgResponseTime": "<time>",
    "avgCPL": "<dollar range>",
    "avgClientLTV": "<dollar range>",
    "topPerformerRevenue": "<monthly range for top operator in this niche>"
  },
  "gapVsTopCompetitor": "<what the top competitor has that this business is missing — one sentence>",
  "closingHook": "<the single most emotionally and financially compelling sentence to open a sales conversation with this specific owner>",
  "suggestedAuditTier": "<Entry Diagnostic $2,500|Full Revenue Intelligence Report $6,000|Premium ARE Audit $12,000-$15,000>",
  "loomVector": "<1|2|3|4|5>",
  "redFlags": ["<concern about this lead>"],
  "strengthSignals": ["<positive buying signal>"],
  "clientAvatar": {
    "decisionMaker": "<who actually makes the buying decision>",
    "mainFear": "<what they are most afraid of when buying a service like ours>",
    "mainDesire": "<what outcome they actually want>",
    "objectionToExpect": "<the most likely objection in the sales conversation>"
  }
}`
}

// Deterministic fallback so the dashboard never shows a blank leakage
// figure even if the model omits the field or returns something the
// parser can't use. Mirrors the 10%-25%-of-revenue heuristic given to
// the model itself, so the displayed number stays consistent with what
// the AI was instructed to calculate.
export function estimateMonthlyLeakageFallback(revenue?: string | null): string {
  const monthly = parseMonthlyRevenue(revenue)
  if (!monthly) return '$3,000-$8,000/mo (est. — no revenue figure provided)'
  const low = Math.round((monthly * 0.10) / 100) * 100
  const high = Math.round((monthly * 0.25) / 100) * 100
  return `$${low.toLocaleString()}-$${high.toLocaleString()}/mo (est.)`
}

function parseMonthlyRevenue(revenue?: string | null): number | null {
  if (!revenue) return null
  // Handles inputs like "$50,000", "50k", "$50K-$100K" (takes the midpoint), "1M"
  const cleaned = revenue.replace(/[, ]/g, '')
  const matches = cleaned.match(/(\d+(?:\.\d+)?)(k|m)?/gi)
  if (!matches || matches.length === 0) return null

  const toNumber = (m: string): number => {
    const numMatch = m.match(/(\d+(?:\.\d+)?)(k|m)?/i)
    if (!numMatch) return 0
    let val = parseFloat(numMatch[1])
    const suffix = numMatch[2]?.toLowerCase()
    if (suffix === 'k') val *= 1_000
    if (suffix === 'm') val *= 1_000_000
    return val
  }

  const values = matches.map(toNumber).filter((v) => v > 0)
  if (values.length === 0) return null
  if (values.length === 1) return values[0]
  return (values[0] + values[1]) / 2 // midpoint of a range like "$50K-$100K"
}

// ── TESTIMONIAL REQUEST ──────────────────────────────────────
export function buildTestimonialPrompt(lead: { name: string; industry: string; location?: string | null; audit?: string | null }): string {
  const firstName = lead.name.split(' ')[0]
  const loc = lead.location ? ` in ${lead.location}` : ''
  return `Write a short genuine testimonial request from Ansh at Vena%Revenue to a satisfied client.

CLIENT: ${lead.name} | ${lead.industry}${loc}
${lead.audit ? `Work done: ${lead.audit.slice(0, 300)}` : ''}

Rules: 4 sentences max. Reference the specific result they got. Ask for a 2-sentence quote or a LinkedIn recommendation. Make it feel easy and fast. Warm but not gushing. Sign: Ansh, Vena%Revenue. Just the email body.`
}

// ── QUICK EMAIL ──────────────────────────────────────────────
export function buildQuickEmailPrompt(
  lead: { name: string; industry: string; location?: string | null; goal?: string | null; status: string },
  instruction: string
): string {
  return `Write a short email for Ansh at Vena%Revenue to send to ${lead.name} (${lead.industry}${lead.location ? `, ${lead.location}` : ''}).

Instruction: "${instruction}"
Context: Their goal is ${lead.goal ?? 'not specified'}. Current status: ${lead.status}.

Rules: Human tone, 3-4 sentences max, no corporate language, direct. Sign as "Ansh, Vena%Revenue". Just the email body.`
}