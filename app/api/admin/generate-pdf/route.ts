// Dynamic import ensures @react-pdf/renderer never runs at build time
// Only executes at request time in the serverless function

interface LeadInput {
  name: string
  email: string
  website: string
  industry: string
  goal: string
  audit: string
  createdAt: Date
}

export async function generateAuditPDF(lead: LeadInput): Promise<Buffer> {
  // Dynamically import to prevent build-time execution
  const ReactPDF = await import('@react-pdf/renderer')
  const React = await import('react')

  const { Document, Page, Text, View, StyleSheet, renderToBuffer } = ReactPDF

  const colors = ['#00F5D4', '#7B61FF', '#FF4D6D', '#F59E0B', '#34D399', '#60A5FA']

  const styles = StyleSheet.create({
    page: { backgroundColor: '#0B0F1A', padding: 48, fontFamily: 'Helvetica' },
    header: {
      marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1E2535',
      paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    },
    logo: { fontSize: 18, fontWeight: 'bold', color: '#00F5D4' },
    logoSub: { fontSize: 9, color: '#8892A4', marginTop: 2 },
    dateText: { fontSize: 9, color: '#8892A4' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#E6E9F2', marginBottom: 4 },
    subtitle: { fontSize: 10, color: '#8892A4', marginBottom: 20 },
    metaCard: {
      backgroundColor: '#131823', borderRadius: 6, padding: 12,
      marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#00F5D4',
    },
    metaTitle: { fontSize: 9, fontWeight: 'bold', color: '#00F5D4', marginBottom: 6, textTransform: 'uppercase' },
    metaRow: { flexDirection: 'row', marginBottom: 3 },
    metaLabel: { fontSize: 9, color: '#8892A4', width: 80, fontWeight: 'bold' },
    metaValue: { fontSize: 9, color: '#C8CDD8', flex: 1 },
    sectionCard: {
      backgroundColor: '#131823', borderRadius: 6, padding: 12,
      marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#7B61FF',
    },
    sectionTitle: { fontSize: 9, fontWeight: 'bold', color: '#7B61FF', marginBottom: 5, textTransform: 'uppercase' },
    bodyText: { fontSize: 9, color: '#C8CDD8', lineHeight: 1.7 },
    footer: {
      position: 'absolute', bottom: 24, left: 48, right: 48,
      borderTopWidth: 1, borderTopColor: '#1E2535', paddingTop: 8,
      flexDirection: 'row', justifyContent: 'space-between',
    },
    footerText: { fontSize: 8, color: '#8892A4' },
  })

  // Parse audit into sections
  const lines = lead.audit.split('\n').filter((l: string) => l.trim())
  const sections: Array<{ title: string; content: string }> = []
  let current: { title: string; lines: string[] } | null = null

  for (const line of lines) {
    const t = line.trim()
    const isHeader = /^\d+[\.\)]\s/.test(t) || /^#{1,3}\s/.test(t) ||
      (t.length < 70 && t.length > 5 && t === t.toUpperCase())
    if (isHeader) {
      if (current) sections.push({ title: current.title, content: current.lines.join('\n') })
      current = { title: t.replace(/^[#\d\.\)\s]+/, '').trim(), lines: [] }
    } else if (current && t) {
      current.lines.push(t)
    } else if (t) {
      current = { title: 'Overview', lines: [t] }
    }
  }
  if (current) sections.push({ title: current.title, content: current.lines.join('\n') })
  const parsedSections = sections.filter((s) => s.content).slice(0, 8)

  const dateStr = new Date(lead.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const doc = React.createElement(
    Document,
    { title: `Revenue Audit — ${lead.name}`, author: 'Vena%Revenue' },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(
        View, { style: styles.header },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.logo }, 'Vena%Revenue'),
          React.createElement(Text, { style: styles.logoSub }, 'Revenue Intelligence Platform')
        ),
        React.createElement(Text, { style: styles.dateText }, dateStr)
      ),
      // Title
      React.createElement(Text, { style: styles.title }, 'Revenue Audit Report'),
      React.createElement(Text, { style: styles.subtitle }, `Prepared for ${lead.name} — Confidential`),
      // Meta
      React.createElement(View, { style: styles.metaCard },
        React.createElement(Text, { style: styles.metaTitle }, 'Business Details'),
        ...[
          ['Contact', `${lead.name} — ${lead.email}`],
          ['Website', lead.website],
          ['Industry', lead.industry],
          ['Goal', lead.goal],
        ].map(([label, value]) =>
          React.createElement(View, { style: styles.metaRow, key: label },
            React.createElement(Text, { style: styles.metaLabel }, label),
            React.createElement(Text, { style: styles.metaValue }, value)
          )
        )
      ),
      // Audit sections
      ...parsedSections.map((section, i) =>
        React.createElement(View, { style: { ...styles.sectionCard, borderLeftColor: colors[i % colors.length] }, key: i },
          React.createElement(Text, { style: { ...styles.sectionTitle, color: colors[i % colors.length] } }, section.title),
          React.createElement(Text, { style: styles.bodyText }, section.content)
        )
      ),
      // Footer
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, `© ${new Date().getFullYear()} Vena%Revenue — Confidential`),
        React.createElement(Text, {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages}`,
        })
      )
    )
  )

  const buffer = await renderToBuffer(doc as any)
  return buffer as unknown as Buffer
}