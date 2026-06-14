import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vena%Revenue — Revenue Engineering for Modern Businesses',
  description:
    "We don't build websites. We build revenue systems. Audit, fix, and scale your business with AI-powered infrastructure.",
  keywords: ['revenue optimization', 'GEO', 'AI sales automation', 'web development', 'lead generation'],
  openGraph: {
    title: 'Vena%Revenue',
    description: 'Revenue Engineering for Modern Businesses',
    type: 'website',
  },
}

// Root layout has NO Navbar — each route group adds its own layout.
// (site)/* → gets Navbar via app/(site)/layout.tsx
// /admin    → gets NO Navbar (bare layout, own full-screen UI)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-bg text-textPrimary font-body antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
