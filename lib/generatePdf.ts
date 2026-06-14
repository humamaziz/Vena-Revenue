import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0B0F1A',
    padding: 48,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2535',
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00F5D4',
  },
  logoSub: {
    fontSize: 9,
    color: '#8892A4',
    marginTop: 2,
  },
  dateText: {
    fontSize: 9,
    color: '#8892A4',
    textAlign: 'right',
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E6E9F2',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#8892A4',
  },
  metaCard: {
    backgroundColor: '#131823',
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#00F5D4',
  },
  metaTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#00F5D4',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 9,
    color: '#8892A4',
    width: 90,
    fontWeight: 'bold',
  },
  metaValue: {
    fontSize: 9,
    color: '#C8CDD8',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#131823',
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7B61FF',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7B61FF',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bodyText: {
    fontSize: 9,
    color: '#C8CDD8',
    lineHeight: 1.7,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#1E2535',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#8892A4',
  },
})

const SECTION_COLORS = ['#00F5D4', '#7B61FF', '#FF4D6D', '#F59E0B', '#34D399', '#60A5FA']

function parseAuditIntoSections(audit: string): Array<{ title: string; content: string }> {
  const lines = audit.split('\n').filter((l) => l.trim())
  const sections: Array<{ title: string; content: string[] }> = []
  let current: { title: string; content: string[] } | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    // Section headers: numbered (1. 2. 3.) or ALL CAPS words
    const isHeader =
      /^\d+[\.\)]\s/.test(trimmed) ||
      /^#{1,3}\s/.test(trimmed) ||
      (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && trimmed.length > 5)

    if (isHeader) {
      if (current) sections.push({ title: current.title, content: current.content })
      current = {
        title: trimmed.replace(/^#+\s/, '').replace(/^\d+[\.\)]\s/, ''),
        content: [],
      }
    } else if (current) {
      if (trimmed) current.content.push(trimmed)
    } else {
      current = { title: 'Overview', content: [trimmed] }
    }
  }
  if (current) sections.push({ title: current.title, content: current.content })

  // Filter out empty sections, max 8
  return sections
    .filter((s) => s.content.length > 0)
    .slice(0, 8)
    .map((s) => ({ title: s.title, content: s.content.join('\n') }))
}

interface LeadInput {
  name: string
  email: string
  website: string
  industry: string
  goal: string
  audit: string
  createdAt: Date
}

function AuditPDFDocument({ lead }: { lead: LeadInput }) {
  const sections = parseAuditIntoSections(lead.audit)
  const dateStr = new Date(lead.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return React.createElement(
    Document,
    { title: `Revenue Audit — ${lead.name}`, author: 'Vena%Revenue' },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.logo }, 'Vena%Revenue'),
          React.createElement(Text, { style: styles.logoSub }, 'Revenue Intelligence Platform')
        ),
        React.createElement(Text, { style: styles.dateText }, `Prepared: ${dateStr}`)
      ),

      // Title
      React.createElement(
        View,
        { style: styles.titleBlock },
        React.createElement(Text, { style: styles.title }, 'Revenue Audit Report'),
        React.createElement(Text, { style: styles.subtitle }, `Prepared exclusively for ${lead.name}`)
      ),

      // Business details
      React.createElement(
        View,
        { style: styles.metaCard },
        React.createElement(Text, { style: styles.metaTitle }, 'Business Details'),
        React.createElement(
          View, { style: styles.metaRow },
          React.createElement(Text, { style: styles.metaLabel }, 'Contact'),
          React.createElement(Text, { style: styles.metaValue }, `${lead.name} — ${lead.email}`)
        ),
        React.createElement(
          View, { style: styles.metaRow },
          React.createElement(Text, { style: styles.metaLabel }, 'Website'),
          React.createElement(Text, { style: styles.metaValue }, lead.website)
        ),
        React.createElement(
          View, { style: styles.metaRow },
          React.createElement(Text, { style: styles.metaLabel }, 'Industry'),
          React.createElement(Text, { style: styles.metaValue }, lead.industry)
        ),
        React.createElement(
          View, { style: styles.metaRow },
          React.createElement(Text, { style: styles.metaLabel }, 'Goal'),
          React.createElement(Text, { style: styles.metaValue }, lead.goal)
        )
      ),

      // Audit sections
      ...sections.map((section, i) =>
        React.createElement(
          View,
          {
            key: i,
            style: [styles.sectionCard, { borderLeftColor: SECTION_COLORS[i % SECTION_COLORS.length] }],
          },
          React.createElement(
            Text,
            { style: [styles.sectionTitle, { color: SECTION_COLORS[i % SECTION_COLORS.length] }] },
            section.title
          ),
          React.createElement(Text, { style: styles.bodyText }, section.content)
        )
      ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, `© ${new Date().getFullYear()} Vena%Revenue — Confidential`),
        React.createElement(
          Text,
          {
            style: styles.footerText,
            render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Page ${pageNumber} of ${totalPages}`,
          }
        )
      )
    )
  )
}

export async function generateAuditPDF(lead: LeadInput): Promise<Buffer> {
  const element = React.createElement(AuditPDFDocument, { lead })
  // renderToBuffer returns Buffer in Node environment
  const buffer = await renderToBuffer(element as React.ReactElement)
  return buffer as Buffer
}
