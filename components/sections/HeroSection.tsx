'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const floatingCards = [
  { label: 'Lead Recovered', value: '$84K', sub: 'in 60 days', color: '#00F5D4', delay: 0 },
  { label: 'Response Time', value: '< 90s', sub: 'was 8 hours', color: '#7B61FF', delay: 0.2 },
  { label: 'Conversion Rate', value: '+312%', sub: 'after audit', color: '#FF4D6D', delay: 0.4 },
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

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Array<{
      x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string
    }> = []

    const colors = ['#00F5D4', '#7B61FF', '#FF4D6D']
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((q) => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = '#00F5D4'
            ctx.globalAlpha = (1 - dist / 120) * 0.08
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  const headline1 = "We Don't Build Websites.".split(' ')
  const headline2 = "We Engineer Revenue.".split(' ')

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-40" />

      {/* Radial glow bg */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,245,212,0.06) 0%, rgba(123,97,255,0.06) 50%, transparent 70%)' }} />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass border border-aqua/20 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-aqua animate-pulse" />
              <span className="text-aqua text-xs font-semibold tracking-widest uppercase">Revenue Intelligence Platform</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-[1.05] mb-6">
              <div className="flex flex-wrap gap-x-3 mb-1">
                {headline1.map((word, i) => (
                  <motion.span key={i} custom={i} variants={wordVariants} initial="hidden" animate="visible"
                    className={word === 'Build' ? 'text-textMuted line-through decoration-pink/60' : 'text-textPrimary'}>
                    {word}
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3">
                {headline2.map((word, i) => (
                  <motion.span key={i} custom={i + headline1.length} variants={wordVariants} initial="hidden" animate="visible"
                    className={word === 'Revenue.' ? 'gradient-text' : 'text-textPrimary'}>
                    {word}
                  </motion.span>
                ))}
              </div>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="text-textMuted text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
            >
              Your business isn't losing traffic. It's losing <em className="text-textPrimary not-italic font-semibold">money silently</em> — through broken funnels, slow responses, and AI invisibility. We find it, fix it, and scale it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/contact" className="btn-primary text-base py-4 px-8">
                <span>Get Your $1,500 Audit →</span>
              </Link>
              <Link href="#how-it-works" className="btn-ghost text-base py-4 px-8">
                See How It Works
              </Link>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-6 mt-10 text-sm text-textMuted"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-base">★</span>
                  ))}
                </div>
                <span>5.0 client satisfaction</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span>48-hr delivery</span>
              <div className="w-px h-4 bg-white/10" />
              <span>2× ROI guarantee</span>
            </motion.div>
          </div>

          {/* Right: Floating proof cards */}
          <div className="relative h-[480px] hidden lg:block">
            {/* Central orb */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #00F5D4, #7B61FF, #FF4D6D, #00F5D4)', opacity: 0.15, filter: 'blur(30px)' }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full glass border border-aqua/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-display font-bold gradient-text">V%R</div>
                <div className="text-xs text-textMuted">Active</div>
              </div>
            </div>

            {/* Floating metric cards */}
            {floatingCards.map((card, i) => {
              const positions = [
                { top: '8%', left: '0%' },
                { top: '55%', right: '0%' },
                { bottom: '5%', left: '15%' },
              ]
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                  transition={{
                    opacity: { delay: 0.8 + card.delay, duration: 0.5 },
                    scale: { delay: 0.8 + card.delay, duration: 0.5 },
                    y: { delay: card.delay, duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="absolute glass border border-white/10 rounded-2xl p-4 min-w-[160px]"
                  style={positions[i]}
                >
                  <div className="text-xs text-textMuted mb-1">{card.label}</div>
                  <div className="font-display font-bold text-2xl" style={{ color: card.color }}>{card.value}</div>
                  <div className="text-xs text-textMuted mt-0.5">{card.sub}</div>
                </motion.div>
              )
            })}

            {/* Connecting lines (decorative) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#00F5D4" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="90%" y2="65%" stroke="#7B61FF" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="35%" y2="88%" stroke="#FF4D6D" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-textMuted text-xs"
        >
          <span className="tracking-widest uppercase">Scroll to discover</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-aqua to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
