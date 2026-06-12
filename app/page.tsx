import HeroSection from '@/components/sections/HeroSection'
import TickerStrip from '@/components/sections/TickerStrip'
import ProblemSection from '@/components/sections/ProblemSection'
import SystemSection from '@/components/sections/SystemSection'
import ResultsSection from '@/components/sections/ResultsSection'
import OfferSection from '@/components/sections/OfferSection'
import FinalCTA from '@/components/sections/FinalCTA'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TickerStrip />
      <ProblemSection />
      <TickerStrip />
      <SystemSection />
      <ResultsSection />
      <OfferSection />
      <FinalCTA />
      <Footer />
    </>
  )
}
