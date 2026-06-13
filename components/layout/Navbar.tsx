'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/client', label: 'Client Portal' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled ? 'glass border-b border-white/[0.06] py-3' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-display font-bold text-xl text-white tracking-tight">Vena</span>
            <span className="font-display font-bold text-xl" style={{ color: '#FFD700' }}>%</span>
            <span className="font-display font-bold text-xl text-white tracking-tight">Revenue</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 relative group ${
                  pathname === link.href ? 'text-[#00F5D4]' : 'text-[#8892A4] hover:text-white'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-px bg-gradient-to-r from-[#00F5D4] to-[#7B61FF] transition-all duration-300 ${
                  pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/contact" className="btn-primary text-sm py-2.5 px-5">
              <span>Get Your Audit →</span>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <motion.span animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-white" />
            <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-0.5 bg-white" />
            <motion.span animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-white" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99] glass-strong flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.div key={link.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-display text-3xl font-bold ${pathname === link.href ? 'gradient-text' : 'text-white'}`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Link href="/contact" className="btn-primary mt-4" onClick={() => setMobileOpen(false)}>
                <span>Get Your Audit →</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
