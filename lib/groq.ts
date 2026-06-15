const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function callGroq(systemPrompt: string, userMessage: string, temperature = 0.6): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2500,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Groq API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Groq returned empty content')
  return content
}

// ─────────────────────────────────────────────────────────────
// AUDIT PROMPT — Vena%Revenue voice, no corporate AI fluff
// ─────────────────────────────────────────────────────────────
export function buildAuditPrompt(lead: {
  name: string
  website: string
  industry: string
  goal: string
  revenue?: string | null
  adspend?: string | null
  problem?: string | null
}): string {
  return `You are writing a revenue audit for Vena%Revenue — a revenue engineering firm that finds and fixes the exact systems bleeding money from a business. Your tone is direct, confident, and expert. You write like a senior consultant who has seen this problem before, not like a generic AI tool.

NEVER use:
- Generic phrases like "it's important to", "in today's digital landscape", "leverage", "utilize"
- Corporate fluff or filler
- Bullet point lists — write in punchy paragraphs with clear headers
- Hedging language like "may", "could potentially", "it seems"

ALWAYS:
- Be specific to THIS business and THIS industry
- Name the exact problem with a dollar estimate
- Sound like someone who already knows where the money is leaking before they even looked

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

Write the audit with EXACTLY these 5 sections, using these exact headers:

## REVENUE LEAK #1: [Give it a punchy name]
State the exact problem in one direct sentence. Then explain precisely how it is costing this specific business money, referencing their industry. End with: "Estimated monthly revenue impact: $X"

## REVENUE LEAK #2: [Give it a punchy name]
Same format. Different problem. Make it specific to their situation.

## REVENUE LEAK #3: [Give it a punchy name]
Same format. Different problem. The most overlooked one.

## THE UX REALITY CHECK
Write 3-4 sentences describing exactly what a high-intent buyer experiences on their website right now. Be blunt. Name the specific friction points that are killing conversions in this industry.

## WHAT NEEDS TO CHANGE (Next 14 Days)
Three specific actions. For each: one sentence on what to do, one sentence on why it matters for their industry, and the estimated revenue uplift. No vague advice.

## THE NUMBER
End with a single paragraph: "If every leak above is plugged, the conservative monthly revenue recovery is $X. Here is how we get there: [2-3 sentence breakdown of the math]."

Write in second person ("your site", "your team") addressed directly to the business owner. The tone should feel like a colleague who just ran your numbers and is giving you the unfiltered truth.`
}

// ─────────────────────────────────────────────────────────────
// FOLLOW-UP PROMPT — Human, direct, Vena%Revenue voice
// ─────────────────────────────────────────────────────────────
export function buildFollowUpPrompt(lead: {
  name: string
  industry: string
  goal: string
  status: string
  audit?: string | null
  interactions: Array<{ type: string; content: string; createdAt: Date }>
}): string {
  const firstName = lead.name.split(' ')[0]
  const auditSnippet = lead.audit ? lead.audit.slice(0, 400) : null
  const history = lead.interactions
    .slice(-4)
    .map((i) => `[${i.type} — ${new Date(i.createdAt).toDateString()}]: ${i.content.slice(0, 200)}`)
    .join('\n')

  return `You are writing follow-up emails for Ansh at Vena%Revenue — a premium revenue engineering firm. These emails go to a real business owner who submitted a brief. They are NOT marketing emails. They are direct, human, one-person-to-another messages.

WRITING RULES (NON-NEGOTIABLE):
- Write like a real person texting a colleague, not like a SaaS company
- No "I hope this email finds you well" — ever
- No "leverage", "synergy", "circle back", "touch base"
- No bullet points — just short, punchy paragraphs
- Use the person's first name once, at the start
- Maximum 4 sentences per email. Every sentence earns its place.
- Sound like you already know their problem because you do

LEAD CONTEXT:
First Name: ${firstName}
Industry: ${lead.industry}
Goal: ${lead.goal}
${auditSnippet ? `Audit Summary (reference this): ${auditSnippet}` : ''}
Interaction History: ${history || 'Just submitted — no prior contact'}

---

Write 3 email bodies. No subject lines. Just the body.

DAY 1:
Reference ONE specific thing from their brief or audit. Show you actually read it. Tell them what we found. One CTA: reply to this email.

DAY 3:
Mention a specific result from a similar business in their industry (make it credible, not outrageous). Create genuine scarcity — we do 10 audits per month and slots fill. One CTA: reply yes to lock in.

DAY 7:
Address the real reason they have not replied — it is not cost, it is inertia. Name that directly. Be the person who calls it out. Final CTA: yes or no, just tell us.

Sign each email:
Ansh
Vena%Revenue

Format EXACTLY like:

DAY 1:
[body]

DAY 3:
[body]

DAY 7:
[body]`
}

// ─────────────────────────────────────────────────────────────
// SCORE PROMPT
// ─────────────────────────────────────────────────────────────
export function buildScorePrompt(lead: {
  name: string
  website: string
  industry: string
  goal: string
  revenue?: string | null
  adspend?: string | null
}): string {
  return `You are a lead scoring analyst at Vena%Revenue, a premium revenue engineering agency that charges $2,500–$15,000 for audits and $25,000–$75,000 for builds.

Score this inbound lead from 0 to 100 on likelihood to close and value to us.

Scoring criteria:
- Revenue size: $500K+/mo = high. Under $50K = low.
- Ad spend: Any paid traffic = signal they have budget and are losing money we can recover.
- Industry fit: Law firms, medspas, SaaS $2M-$30M ARR, hotels, dental = excellent fit. Generic retail = medium. 
- Goal specificity: Specific goal = they know their problem = easier close.
- Budget field: Stated $15K+ = high intent.

LEAD:
Business: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Goal: ${lead.goal}
Revenue: ${lead.revenue ?? 'unknown'}
Ad Spend: ${lead.adspend ?? 'none stated'}

Return ONLY valid JSON. No markdown, no explanation before or after:
{"score": <0-100>, "priority": "<low|medium|high>", "reasoning": "<one specific sentence about why this score>"}`
}

// ─────────────────────────────────────────────────────────────
// SALES ASSISTANT PROMPT — Admin tool
// ─────────────────────────────────────────────────────────────
export function buildSalesAssistantPrompt(lead: {
  name: string
  industry: string
  goal: string
  status: string
  score?: number | null
  priority?: string | null
  audit?: string | null
  notes?: string | null
  interactions: Array<{ type: string; content: string; createdAt: Date }>
}): string {
  const history = lead.interactions
    .slice(-6)
    .map((i) => `[${i.type} — ${new Date(i.createdAt).toDateString()}]: ${i.content.slice(0, 250)}`)
    .join('\n')

  return `You are Ansh's AI sales co-pilot at Vena%Revenue. You have full context on this lead. Give a sharp, honest read of the situation and the exact next move.

LEAD OVERVIEW:
Name: ${lead.name}
Industry: ${lead.industry}
Goal: ${lead.goal}
Current Status: ${lead.status}
Score: ${lead.score ?? 'not scored'}/100
Priority: ${lead.priority ?? 'not set'}
Admin Notes: ${lead.notes ?? 'none'}
Audit Done: ${lead.audit ? 'Yes' : 'No'}
Interaction History:
${history || 'No interactions yet'}

Answer these 4 things in plain, direct language. No headers needed. Just 4 short numbered items:

1. SITUATION READ — What is actually going on with this lead right now in one sentence?
2. BIGGEST RISK — What is the one thing most likely to kill this deal?
3. NEXT ACTION — The single most important thing to do in the next 24 hours. Be specific.
4. PROBABILITY — Your honest estimate of close probability as a percentage, and why.`
}

// ─────────────────────────────────────────────────────────────
// OBJECTION HANDLER PROMPT
// ─────────────────────────────────────────────────────────────
export function buildObjectionPrompt(lead: {
  name: string
  industry: string
  goal: string
  objection: string
}): string {
  const firstName = lead.name.split(' ')[0]
  return `You are a senior sales closer at Vena%Revenue, a premium revenue engineering firm. A prospect has raised an objection. Write a short, confident, human reply that handles it without being pushy or defensive.

LEAD: ${lead.name} | ${lead.industry} | Goal: ${lead.goal}
OBJECTION: "${lead.objection}"

Rules:
- 3-5 sentences max
- Acknowledge the objection briefly, then pivot to their actual problem
- Reference something specific about their situation or industry
- End with a low-friction next step (not "let's schedule a call")
- Sound like a confident advisor, not a desperate salesperson

Sign off: Ansh, Vena%Revenue

Write just the email body, nothing else.`
}

// ─────────────────────────────────────────────────────────────
// TESTIMONIAL REQUEST PROMPT
// ─────────────────────────────────────────────────────────────
export function buildTestimonialPrompt(lead: {
  name: string
  industry: string
  audit?: string | null
}): string {
  const firstName = lead.name.split(' ')[0]
  return `Write a short, genuine testimonial request email from Ansh at Vena%Revenue to a happy client.

CLIENT: ${lead.name} | ${lead.industry}
${lead.audit ? `Work done summary: ${lead.audit.slice(0, 300)}` : ''}

Rules:
- 4 sentences max
- Reference the specific result or value they received
- Ask for a specific type of testimonial (a 2-sentence quote, or a LinkedIn recommendation)
- Make it feel easy to do
- Human, warm, direct — not corporate

Sign: Ansh, Vena%Revenue

Just the email body.`
}