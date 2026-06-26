// Single source of truth for "give me a lead, but never its PDF bytes."
// Use this `select` object anywhere a route loads one lead to feed an AI
// prompt, send an email, score it, etc. — none of those operations need
// `pdfData` in memory, and loading it anyway was part of what caused the
// "Array buffer allocation failed" crash once leads had generated PDFs.
//
// Usage: prisma.lead.findUnique({ where: { id }, select: LEAD_SAFE_SELECT })
export const LEAD_SAFE_SELECT = {
  id: true,
  name: true,
  company: true,
  phone: true,
  email: true,
  website: true,
  industry: true,
  goal: true,
  location: true,
  revenue: true,
  adspend: true,
  budget: true,
  audit: true,
  preview: true,
  score: true,
  priority: true,
  status: true,
  paid: true,
  paymentId: true,
  paymentDate: true,
  pdfUrl: true,
  pdfGeneratedAt: true,
  // pdfData intentionally omitted
  loomUrl: true,
  pptUrl: true,
  source: true,
  notes: true,
  lastContact: true,
  createdAt: true,
  createdByRole: true,
} as const
