// Updated model — llama3-70b-8192 and llama3-8b-8192 are decommissioned as of June 2026
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables')

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      temperature: 0.7,
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

export function buildAuditPrompt(lead: {
  name: string
  website: string
  industry: string
  goal: string
  revenue?: string | null
  adspend?: string | null
  problem?: string | null
}): string {
  return `You are an elite Revenue Engineering analyst at Vena%Revenue. Analyze this business and produce a structured audit report.

BUSINESS DETAILS:
- Name: ${lead.name}
- Website: ${lead.website}
- Industry: ${lead.industry}
- Primary Goal: ${lead.goal}
- Monthly Revenue: ${lead.revenue ?? 'not provided'}
- Monthly Ad Spend: ${lead.adspend ?? 'not provided'}
- Main Challenge: ${lead.problem ?? 'not provided'}

Produce a complete Revenue Audit Report with these exact sections:

1. TOP 3 CONVERSION LEAKS
For each leak: name it, explain exactly how it's losing money, estimate the monthly revenue impact in dollars.

2. UX / UI PROBLEMS
Identify specific friction points in their web experience that are causing drop-off. Be concrete and reference their industry.

3. MESSAGING GAPS
Where does their copy fail to convert intent into action? What is missing from their positioning?

4. QUICK WINS (Next 14 Days)
List 3 specific changes they can implement immediately, each with an estimated revenue uplift.

5. REVENUE OPPORTUNITY
Conservative estimate: if all identified issues are fixed, what monthly revenue recovery is realistic? Show your reasoning.

Be direct, specific, and actionable. No generic filler. Reference their industry norms and numbers. Write in confident, expert tone.`
}

export function buildScorePrompt(lead: {
  name: string
  website: string
  industry: string
  goal: string
  revenue?: string | null
  adspend?: string | null
}): string {
  return `You are a lead scoring expert at a premium revenue optimization agency. Score this inbound lead.

LEAD DETAILS:
- Business: ${lead.name}
- Website: ${lead.website}
- Industry: ${lead.industry}
- Goal: ${lead.goal}
- Monthly Revenue: ${lead.revenue ?? 'unknown'}
- Monthly Ad Spend: ${lead.adspend ?? 'none'}

Score this lead from 0 to 100 based on:
- Business size and revenue potential (are they big enough to have real leaks?)
- Ad spend presence (do they have budget being wasted we can recover?)
- Industry fit (law, medspa, SaaS, hospitality = high value)
- Urgency signals (specific goal = ready to buy)
- Likelihood to pay for a premium audit

Classify priority as: low (0-40), medium (41-70), high (71-100)

Respond with ONLY valid JSON, no markdown, no code fences, no explanation:
{"score": <integer 0-100>, "priority": "<low|medium|high>", "reasoning": "<2 sentences explaining the score>"}`
}

export function buildFollowUpPrompt(lead: {
  name: string
  industry: string
  goal: string
  status: string
  interactions: Array<{ type: string; content: string; createdAt: Date }>
}): string {
  const history = lead.interactions
    .slice(-5)
    .map((i) => `[${i.type} — ${new Date(i.createdAt).toDateString()}]: ${i.content.slice(0, 300)}`)
    .join('\n')

  return `You are an expert B2B sales copywriter for Vena%Revenue, a premium revenue engineering agency. Write 3 follow-up email bodies for this lead.

LEAD:
- Name: ${lead.name}
- Industry: ${lead.industry}
- Goal: ${lead.goal}
- Current Status: ${lead.status}
- Recent Interactions:
${history || 'None yet'}

Write 3 follow-up email bodies (no subject lines, just the body text):

DAY 1 FOLLOW-UP:
Value-focused. Reference their specific goal. Show you understand their exact pain point. 3-4 sentences max.

DAY 3 FOLLOW-UP:
Urgency angle + social proof from a similar industry client. Mention that audit slots are capped at 10/month. 3-4 sentences max.

DAY 7 FOLLOW-UP:
Handle the most likely objection (cost, timing, or "we have someone for that"). Final push. Be direct and confident. 3-4 sentences max.

Format your response EXACTLY like this with these exact headers:

DAY 1:
[email body]

DAY 3:
[email body]

DAY 7:
[email body]`
}
