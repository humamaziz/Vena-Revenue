'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const followerX = useMotionValue(-100)
  const followerY = useMotionValue(-100)

  const springX = useSpring(cursorX, { stiffness: 500, damping: 30 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 30 })
  const followerSpringX = useSpring(followerX, { stiffness: 150, damping: 20 })
  const followerSpringY = useSpring(followerY, { stiffness: 150, damping: 20 })

  const isHovering = useRef(false)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 6)
      cursorY.set(e.clientY - 6)
      followerX.set(e.clientX - 20)
      followerY.set(e.clientY - 20)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [data-cursor-hover]')) {
        isHovering.current = true
        if (dotRef.current) dotRef.current.style.transform = 'scale(2)'
        if (ringRef.current) {
          ringRef.current.style.transform = 'scale(1.5)'
          ringRef.current.style.borderColor = 'rgba(0,245,212,0.8)'
        }
      } else {
        isHovering.current = false
        if (dotRef.current) dotRef.current.style.transform = 'scale(1)'
        if (ringRef.current) {
          ringRef.current.style.transform = 'scale(1)'
          ringRef.current.style.borderColor = 'rgba(0,245,212,0.4)'
        }
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [cursorX, cursorY, followerX, followerY])

  return (
    <>
      <motion.div
        ref={dotRef}
        style={{ x: springX, y: springY }}
        className="fixed top-0 left-0 w-3 h-3 rounded-full bg-aqua z-[9999] pointer-events-none hidden md:block transition-transform duration-200"
      />
      <motion.div
        ref={ringRef}
        style={{ x: followerSpringX, y: followerSpringY }}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-aqua/40 z-[9998] pointer-events-none hidden md:block transition-all duration-300"
      />
    </>
  )
}
