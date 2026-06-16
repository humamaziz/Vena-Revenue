const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function callGroq(system: string, user: string, temperature = 0.6): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, max_tokens: 2500, temperature, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  })
  if (!res.ok) { const t = await res.text(); throw new Error(`Groq ${res.status}: ${t}`) }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Groq returned empty content')
  return content
}

// ── AUDIT ────────────────────────────────────────────────────
export function buildAuditPrompt(lead: {
  name: string; website: string; industry: string; goal: string
  revenue?: string | null; adspend?: string | null; problem?: string | null
}): string {
  return `You are writing a Revenue Audit for Vena%Revenue — a premium revenue engineering firm. You write like a senior consultant who has already seen this problem before. Your voice is direct, authoritative, and specific. You never use AI-sounding language.

NEVER write:
- "In today's digital landscape" — ever
- "leverage", "utilize", "synergy", "circle back"
- Generic advice that could apply to any business
- Bullet point lists — use clear section headers and tight paragraphs
- Hedging language ("may", "could potentially", "it seems")
- Corporate fluff of any kind

ALWAYS:
- Name the exact problem with a specific dollar estimate
- Reference THIS industry's norms and failure patterns
- Sound like you audited this specific business, not "a business like this"
- Write in second person ("your site", "your team") — directly to the owner

---

BUSINESS BEING AUDITED:
Name: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Primary Goal: ${lead.goal}
Monthly Revenue: ${lead.revenue ?? 'not provided'}
Monthly Ad Spend: ${lead.adspend ?? 'not provided'}
Stated Challenge: ${lead.problem ?? 'not provided'}

---

Write EXACTLY these 5 sections with these EXACT headers:

## REVENUE LEAK #1: [Short punchy name — e.g., "The AI Invisibility Gap"]
One direct sentence naming the exact problem. Then 2-3 sentences on precisely how it costs this specific business money — reference the industry context. End with: "Estimated monthly revenue impact: $X,XXX"

## REVENUE LEAK #2: [Short punchy name]
Same structure. Different problem. Specific to their situation and industry.

## REVENUE LEAK #3: [Short punchy name]  
Same structure. The one most businesses never think to check.

## THE UX REALITY CHECK
3-4 sentences. Describe exactly what a high-intent buyer experiences on their website right now. Name the specific friction points. Be blunt. Reference what buyers in this industry expect vs. what they are getting.

## QUICK WINS — NEXT 14 DAYS
Three numbered actions. Each one: one sentence on what to do exactly, one sentence on why it matters specifically for this industry, and "Revenue uplift: $X,XXX".

## THE BOTTOM LINE
One paragraph. "If every leak above is plugged, the conservative monthly revenue recovery is $X. Here is how we arrive at that: [2-3 sentence breakdown connecting the specific leaks to the number]." End with one sentence on what happens if it is NOT fixed.`
}

// ── FOLLOW-UP ────────────────────────────────────────────────
export function buildFollowUpPrompt(lead: {
  name: string; industry: string; goal: string; status: string
  audit?: string | null
  interactions: Array<{ type: string; content: string; createdAt: Date }>
}): string {
  const firstName = lead.name.split(' ')[0]
  const auditSnippet = lead.audit ? lead.audit.slice(0, 500) : null
  const history = lead.interactions.slice(-4)
    .map(i => `[${i.type} — ${new Date(i.createdAt).toDateString()}]: ${i.content.slice(0, 200)}`).join('\n')

  return `You are Ansh from Vena%Revenue writing follow-up emails to a real business owner. These are not marketing emails. They are direct, one-person-to-another messages. Short. Human. Confident.

ABSOLUTE RULES — breaking any of these means the output is unusable:
- NO "I hope this finds you well" or any variant of it
- NO "I wanted to reach out" — ever
- NO bullet points anywhere in the email body
- NO more than 4 sentences per email
- NO corporate language — write like a text message, not a press release
- USE the person's first name ONCE at the start
- Sound like you already know their problem — because you do
- End with one clear, low-friction CTA — never "let's schedule a call"
- Sign every email: Ansh / Vena%Revenue

LEAD CONTEXT:
First Name: ${firstName}
Industry: ${lead.industry}
Goal: ${lead.goal}
Current Status: ${lead.status}
${auditSnippet ? `Audit Findings (reference these specifically): ${auditSnippet}` : ''}
History: ${history || 'First contact — no prior touchpoints'}

---

Write 3 email bodies. No subject lines. Just the body text.

DAY 1:
Reference one specific thing from their audit or brief — something that proves you actually read it, not a generic opener. Tell them one thing we found. End with: reply to this and we lock in your slot.

DAY 3:
Name a specific result from a real client in a similar industry — make it credible and specific (e.g., "$84K recovered in 60 days for a Houston PI firm"). Mention we run 10 audits per month, slots are almost gone. CTA: reply "yes" to hold the last slot.

DAY 7:
Call out the real reason they have not replied — it is not the money, it is inertia. Name it directly and calmly. No guilt. No pressure. Just: here is what happens if we fix this, here is what continues if we do not. Final CTA: yes or no, just tell us.

Format EXACTLY like this — no other text:

DAY 1:
[body]

DAY 3:
[body]

DAY 7:
[body]`
}

// ── LEAD SCORE ───────────────────────────────────────────────
export function buildScorePrompt(lead: {
  name: string; website: string; industry: string; goal: string
  revenue?: string | null; adspend?: string | null; budget?: string | null
}): string {
  return `You are a lead scoring analyst at Vena%Revenue — a premium revenue engineering firm that charges $2,500-$15,000 for audits and $25,000-$75,000 for builds.

Score this inbound lead from 0 to 100 based on:
- Revenue ($1M+/mo = 90-100, $200K-$1M = 70-89, $50K-$200K = 40-69, under $50K = 0-39)
- Ad spend (running ads = +15 points — they have budget AND are losing money we can recover)
- Industry fit (PI law, medspa, B2B SaaS $2M-$30M ARR, hotels, dental = excellent; generic SMB = lower)
- Goal specificity (knows exactly what they want = +10)
- Budget stated ($15K+ = high intent, +10)
- ICP match (are they the exact buyer this firm serves best?)

LEAD:
Business: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Goal: ${lead.goal}
Revenue: ${lead.revenue ?? 'unknown'}
Ad Spend: ${lead.adspend ?? 'none stated'}
Budget: ${lead.budget ?? 'not stated'}

Return ONLY valid JSON. No markdown, no code fences, nothing before or after:
{"score": <0-100>, "priority": "<low|medium|high>", "reasoning": "<one sharp sentence on why this score>", "recommended_tier": "<Entry Diagnostic $2,500|Full Revenue Intelligence Report $6,000|Premium ARE Audit $12,000-$15,000>"}`
}

// ── SALES ASSISTANT ──────────────────────────────────────────
export function buildSalesAssistantPrompt(lead: {
  name: string; industry: string; goal: string; status: string
  score?: number | null; priority?: string | null
  audit?: string | null; notes?: string | null
  interactions: Array<{ type: string; content: string; createdAt: Date }>
}): string {
  const history = lead.interactions.slice(-6)
    .map(i => `[${i.type} — ${new Date(i.createdAt).toDateString()}]: ${i.content.slice(0, 250)}`).join('\n')
  return `You are Ansh's AI sales co-pilot at Vena%Revenue. Give a sharp, honest read of this deal — no fluff, no filler.

LEAD:
Name: ${lead.name} | Industry: ${lead.industry} | Goal: ${lead.goal}
Status: ${lead.status} | Score: ${lead.score ?? 'not scored'}/100 | Priority: ${lead.priority ?? 'not set'}
Audit done: ${lead.audit ? 'Yes' : 'No'}
Admin notes: ${lead.notes ?? 'none'}
Interaction history:
${history || 'No interactions yet'}

Answer exactly 4 things. Number them. No headers, just direct numbered answers:

1. SITUATION: What is actually happening with this deal right now in one sentence?
2. RISK: The single thing most likely to kill this deal.
3. NEXT MOVE: The one specific thing to do in the next 24 hours. Be precise — not "follow up", tell me exactly what to say or do.
4. CLOSE PROBABILITY: Your honest percentage and why.`
}

// ── OBJECTION HANDLER ────────────────────────────────────────
export function buildObjectionPrompt(lead: { name: string; industry: string; goal: string; objection: string }): string {
  const firstName = lead.name.split(' ')[0]
  return `You are a senior closer at Vena%Revenue writing a reply to a sales objection. Confident. Human. Not defensive. Not pushy.

LEAD: ${lead.name} | ${lead.industry} | Goal: ${lead.goal}
OBJECTION THEY RAISED: "${lead.objection}"

Rules:
- 3-5 sentences max
- Acknowledge the objection in ONE word or short phrase, then immediately redirect to their actual problem
- Reference something specific about their situation or industry
- End with a low-friction next step — not "let's get on a call", something easier
- Sound like a trusted advisor who has heard this 100 times and knows exactly what is underneath it
- Sign off: Ansh, Vena%Revenue

Write just the email body. Nothing before or after.`
}

// ── LOOM SCRIPT GENERATOR ────────────────────────────────────
export function buildLoomScriptPrompt(lead: {
  name: string; website: string; industry: string
  vector: string; competitorName?: string | null; specificLeak?: string | null
}): string {
  const vectorScripts: Record<string, string> = {
    '1': 'AI Invisibility — they are missing from ChatGPT/Perplexity results for their primary service keywords',
    '2': 'Ghosted Lead Bleed — no intake automation, leads going cold before anyone responds',
    '3': 'Form Friction — too many fields, high-intent buyers abandoning at the submit step',
    '4': 'Ad Spend Hemorrhage — paying for clicks that bounce due to slow load speed or broken tracking',
    '5': 'Booking Crisis — manual booking flow losing mobile users to faster competitors',
  }
  const vectorContext = vectorScripts[lead.vector] || vectorScripts['1']

  return `Write a 90-second Loom video script for Ansh at Vena%Revenue to record and send to ${lead.name} (${lead.industry}).

The specific leak we found: ${lead.specificLeak || vectorContext}
${lead.competitorName ? `Competitor who is beating them: ${lead.competitorName}` : ''}
Their website: ${lead.website}

The script must follow this EXACT structure — these are timed beats, do not deviate:

[COLD OPEN — 0:00-0:08]
One sentence. Make it uncomfortable to ignore. Start with "I want to show you..." — reference their specific situation.

[SCREEN SHARE REVEAL — 0:09-0:30]
Walk through what you are showing on screen. Describe the specific evidence of the leak. Use concrete details — not generic statements. Mention a real number or a real competitor if applicable.

[THE MECHANISM — 0:31-0:52]
Explain WHY this is happening — the technical or structural reason. Make it feel inevitable and fixable, not random. Reference what this costs in their specific industry context.

[COMPETITOR CONTRAST — 0:53-1:05]
Show or describe what the competitor is doing differently. Keep it factual and calm — this is not trash talk, it is market reality.

[THE CLOSE — 1:06-1:25]
Exactly: "The Triage Audit is $1,500. We map the complete fix in 48 hours. If we do not identify at least 2x that in recoverable revenue leaks, it is fully refunded. The link to lock in your slot is directly below this video. We have [2] slots left this month."

Write the full script with [SCREEN:] annotations for what to show. Make it feel like Ansh is talking to ONE person, not broadcasting.`
}

// ── EMAIL TEMPLATE GENERATOR ─────────────────────────────────
export function buildEmailTemplatePrompt(lead: {
  name: string; industry: string; website: string
  vector: string; ownerName?: string | null; specificLeak?: string | null
}): string {
  const vectorSubjects: Record<string, string> = {
    '1': `[Owner], an AI just sent your leads to your competitor`,
    '2': `[Owner], your leads are dying in your inbox`,
    '3': `your intake form is rejecting clients`,
    '4': `you're funding Google. Google isn't funding you back.`,
    '5': `your booking flow is losing clients to faster competitors`,
  }
  const subject = vectorSubjects[lead.vector] || vectorSubjects['1']
  const ownerFirstName = lead.ownerName?.split(' ')[0] || 'there'

  return `Write a cold outbound email for Ansh at Vena%Revenue to send to ${lead.name} (${lead.industry}).

VECTOR: ${lead.vector} — ${lead.specificLeak || 'revenue leak identified'}
Owner name to address: ${ownerFirstName}
Their website: ${lead.website}

Use this exact subject line (fill in [Owner] with their name): ${subject}

Email rules (non-negotiable):
- 5 sentences MAXIMUM in the body — every sentence must earn its place
- No pleasantries, no "I hope this message finds you well"
- Open with the specific pain, not an introduction
- Use bold on the core leak finding
- End with the Loom video link placeholder: [LOOM VIDEO LINK]
- Include P.S. with scarcity: "10 audits per month. 2 slots left. [relevant urgency tied to their specific problem]"
- Sign: [Name] / Vena%Revenue

Write the complete email including subject line. Format:

SUBJECT: [subject line]

[email body]`
}

// ── LEAD RESEARCH ────────────────────────────────────────────
export function buildResearchPrompt(lead: {
  name: string; website: string; industry: string; goal: string
  revenue?: string | null; adspend?: string | null; problem?: string | null
}): string {
  return `You are a revenue intelligence analyst at Vena%Revenue building a client research profile.

BUSINESS TO ANALYZE:
Name: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Stated Goal: ${lead.goal}
Revenue: ${lead.revenue ?? 'unknown'}
Ad Spend: ${lead.adspend ?? 'unknown'}
Problem: ${lead.problem ?? 'not stated'}

Based on this information and your knowledge of this industry, fill out a complete intelligence profile. Be specific. If you do not have exact data, make reasonable industry-informed estimates and label them as (est.).

Return ONLY valid JSON with this exact structure:
{
  "icpMatch": "<Tier 1 — Perfect ICP|Tier 2 — Strong ICP|Tier 3 — Weak ICP>",
  "estimatedLTV": "<dollar range>",
  "primaryVector": "<1|2|3|4|5>",
  "vectorName": "<AI Invisibility|Ghosted Lead Bleed|Form Friction|Ad Spend Hemorrhage|Booking Crisis>",
  "topCompetitors": ["<name>", "<name>", "<name>"],
  "industryBenchmarks": {
    "avgConversionRate": "<percentage>",
    "avgResponseTime": "<time>",
    "avgCPL": "<dollar range>",
    "avgClientValue": "<dollar range>"
  },
  "estimatedLeakage": "<monthly dollar range based on their revenue>",
  "closingHook": "<one sentence — the specific emotional and financial pain point most likely to close this deal>",
  "suggestedAuditTier": "<Entry Diagnostic $2,500|Full Revenue Intelligence Report $6,000|Premium ARE Audit $12,000-$15,000>",
  "redFlags": ["<any concern about this lead>"],
  "strengthSignals": ["<positive buying signal>"]
}`
}

// ── TESTIMONIAL REQUEST ──────────────────────────────────────
export function buildTestimonialPrompt(lead: { name: string; industry: string; audit?: string | null }): string {
  const firstName = lead.name.split(' ')[0]
  return `Write a short, genuine testimonial request from Ansh at Vena%Revenue to a satisfied client.

CLIENT: ${lead.name} | ${lead.industry}
${lead.audit ? `Work done: ${lead.audit.slice(0, 300)}` : ''}

Rules: 4 sentences max. Reference the specific result they got. Ask for a 2-sentence quote they can copy-paste or a LinkedIn recommendation. Make it feel easy and fast. Warm but not gushing.

Sign: Ansh, Vena%Revenue. Just the email body.`
}

// ── QUICK EMAIL ──────────────────────────────────────────────
export function buildQuickEmailPrompt(lead: { name: string; industry: string; goal: string; status: string }, instruction: string): string {
  return `Write a short email for Ansh at Vena%Revenue to send to ${lead.name} (${lead.industry}).

Instruction: "${instruction}"
Context: Their goal is ${lead.goal}. Current status: ${lead.status}.

Rules: Human tone, 3-4 sentences max, no corporate language, direct, sign as "Ansh, Vena%Revenue". Just the email body.`
}