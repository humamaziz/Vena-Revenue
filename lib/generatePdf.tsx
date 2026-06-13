import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'
import React from 'react'

// ✅ Register font (CRITICAL FIX)
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYwYZ8UA3J58.ttf',
})

// 🎨 Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0B0F1A',
    padding: 48,
    fontFamily: 'Inter',
  },

  header: {
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2535',
    paddingBottom: 16,
  },

  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00F5D4',
  },

  logoSub: {
    fontSize: 10,
    color: '#8892A4',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6E9F2',
    marginTop: 24,
  },

  subtitle: {
    fontSize: 11,
    color: '#8892A4',
    marginBottom: 24,
  },

  sectionCard: {
    backgroundColor: '#131823',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#00F5D4',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  bodyText: {
    fontSize: 10,
    color: '#C8CDD8',
    lineHeight: 1.6,
  },

  metaRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  metaLabel: {
    fontSize: 10,
    color: '#8892A4',
    width: 100,
    fontWeight: 'bold',
  },

  metaValue: {
    fontSize: 10,
    color: '#E6E9F2',
    flex: 1,
  },

  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#1E2535',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerText: {
    fontSize: 9,
    color: '#8892A4',
  },
})

// 🧠 Types
interface AuditPDFProps {
  lead: {
    name: string
    email: string
    website: string
    industry: string
    goal: string
    audit: string
    createdAt: Date | string
  }
}

// 🎯 Document Component
function AuditDocument({ lead }: AuditPDFProps) {
  const createdDate =
    typeof lead.createdAt === 'string'
      ? new Date(lead.createdAt)
      : lead.createdAt

  const sections = parseAuditSections(
    lead.audit || 'No audit data available.'
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Vena%Revenue</Text>
          <Text style={styles.logoSub}>Revenue Intelligence Platform</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Revenue Audit Report</Text>
        <Text style={styles.subtitle}>
          Prepared for {lead.name} ·{' '}
          {createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Business Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Contact</Text>
            <Text style={styles.metaValue}>
              {lead.name} · {lead.email}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Website</Text>
            <Text style={styles.metaValue}>{lead.website}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Industry</Text>
            <Text style={styles.metaValue}>{lead.industry}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Primary Goal</Text>
            <Text style={styles.metaValue}>{lead.goal}</Text>
          </View>
        </View>

        {/* Audit Sections */}
        {sections.map((section, i) => {
          const color = getSectionColor(i)

          return (
            <View
              key={i}
              style={[
                styles.sectionCard,
                { borderLeftColor: color },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: color },
                ]}
              >
                {section.title}
              </Text>

              <Text style={styles.bodyText}>
                {section.content}
              </Text>
            </View>
          )
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Vena%Revenue · Confidential
          </Text>

          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

// 🎨 Section colors
function getSectionColor(index: number): string {
  const colors = [
    '#00F5D4',
    '#7B61FF',
    '#FF4D6D',
    '#F59E0B',
    '#34D399',
  ]
  return colors[index % colors.length]
}

// 🧠 Parse AI audit text into sections
function parseAuditSections(
  audit: string
): Array<{ title: string; content: string }> {
  const lines = audit.split('\n').filter((l) => l.trim())

  const sections: Array<{
    title: string
    content: string
  }> = []

  let current: {
    title: string
    content: string[]
  } | null = null

  for (const line of lines) {
    const isHeader =
      /^\d+\./.test(line.trim()) ||
      /^[A-Z][A-Z\s]{5,}:/.test(line.trim())

    if (isHeader) {
      if (current) {
        sections.push({
          title: current.title,
          content: current.content.join('\n'),
        })
      }

      current = {
        title: line.trim(),
        content: [],
      }
    } else if (current) {
      current.content.push(line.trim())
    } else {
      current = {
        title: 'Overview',
        content: [line.trim()],
      }
    }
  }

  if (current) {
    sections.push({
      title: current.title,
      content: current.content.join('\n'),
    })
  }

  return sections.slice(0, 8)
}

// 🚀 MAIN EXPORT FUNCTION
export async function generateAuditPDF(lead: {
  name: string
  email: string
  website: string
  industry: string
  goal: string
  audit: string
  createdAt: Date | string
}): Promise<Buffer> {
  const doc = React.createElement(AuditDocument, { lead })

  const buffer = await renderToBuffer(doc as any)

  // ✅ Safe buffer conversion
  return Buffer.from(buffer)
}