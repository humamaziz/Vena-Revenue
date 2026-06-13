'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const floatingCards = [
  { label: 'Leads Recovered', value: '$84K', sub: 'in 60 days · PI Law Firm', color: '#00F5D4', pos: { top: '8%', left: '0%' } },
  { label: 'Win Rate Increase', value: '+41%', sub: 'AI-integrated outbound', color: '#7B61FF', pos: { top: '55%', right: '0%' } },
  { label: 'Deal Cycle', value: '-28%', sub: 'compressed timeline', color: '#FF4D6D', pos: { bottom: '5%', left: '10%' } },
]

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 120])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const colors = ['#00F5D4', '#7B61FF', '#FF4D6D']
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width
        p.y = (p.y + p.vy + canvas.height) % canvas.height
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((q) => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = '#00F5D4'
            ctx.globalAlpha = (1 - dist / 110) * 0.07
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  const words1 = "We Don't Build Websites.".split(' ')
  const words2 = "We Engineer Revenue.".split(' ')

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,245,212,0.06) 0%, rgba(123,97,255,0.06) 50%, transparent 70%)' }} />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass border border-[#00F5D4]/20 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
              <span className="text-[#00F5D4] text-xs font-semibold tracking-widest uppercase">GEO + AI Agent Orchestration Platform</span>
            </motion.div>

            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-[1.05] mb-6">
              <div className="flex flex-wrap gap-x-3 mb-1">
                {words1.map((word, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={word === 'Build' ? 'text-[#8892A4] line-through decoration-[#FF4D6D]/60' : 'text-white'}>
                    {word}
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3">
                {words2.map((word, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={word === 'Revenue.' ? 'gradient-text' : 'text-white'}>
                    {word}
                  </motion.span>
                ))}
              </div>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.8 }}
              className="text-[#8892A4] text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
            >
              80% of B2B buyers decide before they ever touch your CRM. They are asking AI engines who the best provider is. Your competitors appear. You{" don't"}. We fix that — and build the autonomous sales infrastructure that converts that intent on arrival.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/contact" className="btn-primary text-base py-4 px-8">
                <span>Get Your Revenue Audit →</span>
              </Link>
              <Link href="#how-it-works" className="btn-ghost text-base py-4 px-8">
                See the System
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-[#8892A4]"
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★★★★★</span>
                <span>5.0 client satisfaction</span>
              </div>
              <div className="w-px h-4 bg-white/10 hidden sm:block" />
              <span>48-hr audit delivery</span>
              <div className="w-px h-4 bg-white/10 hidden sm:block" />
              <span>2× ROI guarantee</span>
              <div className="w-px h-4 bg-white/10 hidden sm:block" />
              <span>60–90 day full build</span>
            </motion.div>
          </div>

          {/* Floating proof cards */}
          <div className="relative h-[480px] hidden lg:block">
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #00F5D4, #7B61FF, #FF4D6D, #00F5D4)', opacity: 0.12, filter: 'blur(30px)' }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full glass border border-[#00F5D4]/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-display font-bold gradient-text">V<span style={{color:'#FFD700'}}>%</span>R</div>
                <div className="text-xs text-[#8892A4]">Live</div>
              </div>
            </div>
            {floatingCards.map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
                transition={{
                  opacity: { delay: 0.8 + i * 0.2, duration: 0.5 },
                  scale: { delay: 0.8 + i * 0.2, duration: 0.5 },
                  y: { delay: i * 0.3, duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="absolute glass border border-white/10 rounded-2xl p-4 min-w-[160px]"
                style={card.pos}
              >
                <div className="text-xs text-[#8892A4] mb-1">{card.label}</div>
                <div className="font-display font-bold text-2xl" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs text-[#8892A4] mt-0.5">{card.sub}</div>
              </motion.div>
            ))}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15">
              <line x1="50%" y1="50%" x2="18%" y2="18%" stroke="#00F5D4" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="88%" y2="62%" stroke="#7B61FF" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="32%" y2="88%" stroke="#FF4D6D" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#8892A4] text-xs"
        >
          <span className="tracking-widest uppercase">Scroll to discover</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-[#00F5D4] to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
