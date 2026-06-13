'use client'

const items = [
  'GEO Intelligence',
  'AI Agent Orchestration',
  'Revenue Leak Detection',
  'Headless Architecture',
  'MCP Server Pipelines',
  'Entity-Graph Schema',
  'Citation Score Defense',
  'Intake Automation',
  'Algorithm Defense Retainer',
  '48-Hour Diagnostic',
  '2× ROI Guarantee',
  '60–90 Day Implementation',
]

export default function TickerStrip() {
  const doubled = [...items, ...items]
  return (
    <div className="ticker-wrap py-4 bg-[rgba(0,245,212,0.02)] overflow-hidden">
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 mr-6 text-xs font-semibold text-[#8892A4] uppercase tracking-widest whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-[#00F5D4] inline-block flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
