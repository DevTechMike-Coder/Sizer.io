import NavBar from "@/components/uiComponents/NavBar";
import { TradingViewTickerWebComponent } from "@/components/marketSummaryComp/trading-view-ticker";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractivePositionSizer } from "@/components/landing/InteractivePositionSizer";
import { MarketTerminalSection } from "@/components/landing/MarketTerminalSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Top Sticky Navigation */}
      <NavBar />

      {/* Real-time Ticker Tape directly under Navbar */}
      <TradingViewTickerWebComponent />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection />
        <InteractivePositionSizer />
        <MarketTerminalSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
}
