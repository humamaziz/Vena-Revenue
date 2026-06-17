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

type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'diagram'; lines: string[] }
  | { type: 'paragraph'; text: string }

export async function generateAuditPDF(lead: LeadInput): Promise<Buffer> {
  const ReactPDF = await import('@react-pdf/renderer')
  const React = await import('react')
  const { Document, Page, Text, View, StyleSheet, renderToBuffer } = ReactPDF

  const colors = ['#00F5D4', '#7B61FF', '#FF4D6D', '#F59E0B', '#34D399', '#60A5FA', '#A78BFA', '#FB923C']

  const styles = StyleSheet.create({
    page: { backgroundColor: '#0B0F1A', padding: 44, fontFamily: 'Helvetica' },
    header: {
      marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1E2535',
      paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    },
    logo: { fontSize: 17, fontWeight: 'bold', color: '#00F5D4' },
    logoSub: { fontSize: 8, color: '#8892A4', marginTop: 2 },
    dateText: { fontSize: 8, color: '#8892A4' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#E6E9F2', marginBottom: 3 },
    subtitle: { fontSize: 9, color: '#8892A4', marginBottom: 18 },
    metaCard: {
      backgroundColor: '#131823', borderRadius: 6, padding: 11,
      marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#00F5D4',
    },
    metaTitle: { fontSize: 8, fontWeight: 'bold', color: '#00F5D4', marginBottom: 5, textTransform: 'uppercase' },
    metaRow: { flexDirection: 'row', marginBottom: 2.5 },
    metaLabel: { fontSize: 8.5, color: '#8892A4', width: 78, fontWeight: 'bold' },
    metaValue: { fontSize: 8.5, color: '#C8CDD8', flex: 1 },

    h1: { fontSize: 13, fontWeight: 'bold', color: '#E6E9F2', marginTop: 14, marginBottom: 8 },
    h2Card: {
      backgroundColor: '#131823', borderRadius: 6, padding: 11,
      marginBottom: 9, marginTop: 4, borderLeftWidth: 3,
    },
    h2Title: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
    paragraph: { fontSize: 8.7, color: '#C8CDD8', lineHeight: 1.65, marginBottom: 6 },

    table: { marginVertical: 6, borderWidth: 0.5, borderColor: '#2A3142', borderRadius: 4, overflow: 'hidden' },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#1B2230' },
    tableRow: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#2A3142' },
    tableCellHeader: { flex: 1, padding: 5, fontSize: 7.5, fontWeight: 'bold', color: '#00F5D4' },
    tableCell: { flex: 1, padding: 5, fontSize: 7.5, color: '#C8CDD8' },

    diagramBox: {
      backgroundColor: '#0E1320', borderRadius: 4, borderWidth: 0.5, borderColor: '#2A3142',
      padding: 10, marginVertical: 8,
    },
    diagramLine: { fontFamily: 'Courier', fontSize: 6.3, color: '#8FE3D8', lineHeight: 1.3 },

    footer: {
      position: 'absolute', bottom: 22, left: 44, right: 44,
      borderTopWidth: 1, borderTopColor: '#1E2535', paddingTop: 7,
      flexDirection: 'row', justifyContent: 'space-between',
    },
    footerText: { fontSize: 7.5, color: '#8892A4' },
  })

  const blocks = parseAuditIntoBlocks(lead.audit)
  const dateStr = new Date(lead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  let colorIdx = 0
  const nextColor = () => colors[colorIdx++ % colors.length]

  const renderedBlocks: any[] = []
  blocks.forEach((block, i) => {
    if (block.type === 'h1') {
      renderedBlocks.push(React.createElement(Text, { style: styles.h1, key: `h1-${i}` }, block.text))
    } else if (block.type === 'h2') {
      const c = nextColor()
      renderedBlocks.push(
        React.createElement(View, { style: { ...styles.h2Card, borderLeftColor: c }, key: `h2-${i}` },
          React.createElement(Text, { style: { ...styles.h2Title, color: c } }, block.text)
        )
      )
    } else if (block.type === 'table') {
      renderedBlocks.push(
        React.createElement(View, { style: styles.table, key: `table-${i}` },
          React.createElement(View, { style: styles.tableHeaderRow },
            ...block.headers.map((h, hi) => React.createElement(Text, { style: styles.tableCellHeader, key: hi }, h))
          ),
          ...block.rows.map((row, ri) =>
            React.createElement(View, { style: styles.tableRow, key: ri },
              ...row.map((cell, ci) => React.createElement(Text, { style: styles.tableCell, key: ci }, cell))
            )
          )
        )
      )
    } else if (block.type === 'diagram') {
      renderedBlocks.push(
        React.createElement(View, { style: styles.diagramBox, key: `diagram-${i}` },
          ...block.lines.map((line, li) => React.createElement(Text, { style: styles.diagramLine, key: li }, line || ' '))
        )
      )
    } else {
      renderedBlocks.push(React.createElement(Text, { style: styles.paragraph, key: `p-${i}` }, block.text))
    }
  })

  const doc = React.createElement(
    Document,
    { title: `Revenue Audit — ${lead.name}`, author: 'Vena%Revenue' },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page, wrap: true },
      React.createElement(View, { style: styles.header },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.logo }, 'Vena%Revenue'),
          React.createElement(Text, { style: styles.logoSub }, 'Revenue Intelligence Platform')
        ),
        React.createElement(Text, { style: styles.dateText }, dateStr)
      ),
      React.createElement(Text, { style: styles.title }, 'Comprehensive Revenue Leak & Growth Audit'),
      React.createElement(Text, { style: styles.subtitle }, `Prepared for ${lead.name} — Confidential`),
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
      ...renderedBlocks,
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, `© ${new Date().getFullYear()} Vena%Revenue — Confidential`),
        React.createElement(Text, {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`,
        })
      )
    )
  )

  const buffer = await renderToBuffer(doc as any)
  return buffer as unknown as Buffer
}

function parseAuditIntoBlocks(audit: string): Block[] {
  const rawLines = audit.split('\n')
  const blocks: Block[] = []
  let paragraphBuffer: string[] = []
  let i = 0

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(' ').replace(/\s+/g, ' ').trim()
      if (text) blocks.push({ type: 'paragraph', text })
      paragraphBuffer = []
    }
  }

  while (i < rawLines.length) {
    const line = rawLines[i]
    const trimmed = line.trim()

    if (/^#\s/.test(trimmed)) { i++; continue }

    if (/^##\s/.test(trimmed)) {
      flushParagraph()
      blocks.push({ type: 'h1', text: trimmed.replace(/^##\s/, '').trim() })
      i++
      continue
    }

    if (/^\*\*.+\*\*:?\s*$/.test(trimmed) || /^(The Competitor Strategy|.+'s Current Leak|The Friction Point|AI Search Invisibility|The Unfair Advantage Engine|What You Achieve by Fixing It|The Gaps Exposed|Before|After):/i.test(trimmed)) {
      flushParagraph()
      const cleanLabel = trimmed.replace(/\*\*/g, '')
      blocks.push({ type: 'h2', text: cleanLabel.slice(0, 90) })
      i++
      continue
    }

    if (trimmed.startsWith('```')) {
      flushParagraph()
      i++
      const diagramLines: string[] = []
      while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
        diagramLines.push(rawLines[i])
        i++
      }
      i++
      blocks.push({ type: 'diagram', lines: diagramLines })
      continue
    }

    if (trimmed.startsWith('|') && rawLines[i + 1]?.trim().match(/^\|?[\s:|-]+\|?$/)) {
      flushParagraph()
      const headerCells = splitTableRow(trimmed)
      i += 2
      const rows: string[][] = []
      while (i < rawLines.length && rawLines[i].trim().startsWith('|')) {
        rows.push(splitTableRow(rawLines[i].trim()))
        i++
      }
      blocks.push({ type: 'table', headers: headerCells, rows })
      continue
    }

    if (!trimmed) {
      flushParagraph()
      i++
      continue
    }

    paragraphBuffer.push(trimmed)
    i++
  }
  flushParagraph()

  return blocks
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim().replace(/\*\*/g, ''))
}