const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama3-70b-8192'

export async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
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
  return data.choices?.[0]?.message?.content ?? ''
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
  return `Analyze this business and provide a detailed revenue audit:

Business: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Goal: ${lead.goal}
Monthly Revenue: ${lead.revenue ?? 'not provided'}
Monthly Ad Spend: ${lead.adspend ?? 'not provided'}
Main Challenge: ${lead.problem ?? 'not provided'}

Provide:
1. TOP 3 CONVERSION LEAKS — specific, named issues with their revenue impact
2. UX/UI PROBLEMS — what is broken or creating friction on the site
3. MESSAGING GAPS — where the copy fails to convert intent into action
4. QUICK WINS — 3 things they can fix in under 2 weeks with estimated uplift
5. REVENUE OPPORTUNITY — conservative estimate of recoverable revenue if all fixes are implemented

Be specific, actionable, and direct. No generic advice. Reference their industry and situation.`
}

export function buildScorePrompt(lead: {
  name: string
  website: string
  industry: string
  goal: string
  revenue?: string | null
  adspend?: string | null
}): string {
  return `Score this business lead for a revenue optimization agency:

Business: ${lead.name}
Website: ${lead.website}
Industry: ${lead.industry}
Goal: ${lead.goal}
Revenue: ${lead.revenue ?? 'unknown'}
Ad Spend: ${lead.adspend ?? 'none'}

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{"score": <number 0-100>, "priority": "<low|medium|high>", "reasoning": "<2 sentence explanation>"}`
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
    .map((i) => `[${i.type} - ${i.createdAt.toDateString()}]: ${i.content.slice(0, 200)}`)
    .join('\n')

  return `Generate 3 follow-up email drafts for this lead:

Name: ${lead.name}
Industry: ${lead.industry}
Goal: ${lead.goal}
Current Status: ${lead.status}
Recent Interactions:
${history || 'None yet'}

Generate:
1. DAY 1 FOLLOW-UP — value-focused, reference their specific goal
2. DAY 3 FOLLOW-UP — urgency + social proof angle
3. DAY 7 FOLLOW-UP — objection handling + final push

Each draft should be 3–5 sentences, professional, and specific to their industry. Do not include subject lines. Just the email body for each.

Format as:
DAY 1:
<text>

DAY 3:
<text>

DAY 7:
<text>`
}
