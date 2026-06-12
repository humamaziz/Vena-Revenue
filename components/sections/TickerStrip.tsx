'use client'

const items = [
  'Revenue Engineering',
  'GEO Intelligence',
  'AI Agent Systems',
  'Leak Detection',
  'Funnel Architecture',
  'Intake Automation',
  'Schema Optimization',
  'Conversion Systems',
  'Pipeline Defense',
  '48-Hour Delivery',
]

export default function TickerStrip() {
  const doubled = [...items, ...items]

  return (
    <div className="ticker-wrap py-4 bg-[rgba(0,245,212,0.02)] overflow-hidden">
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 mr-6 text-sm font-medium text-textMuted uppercase tracking-widest whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-aqua inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
