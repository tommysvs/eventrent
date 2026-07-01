import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { ProductSection } from "@/components/product-section"
import { ProblemSection } from "@/components/problem-section"
import { UrgencyBanner } from "@/components/urgency-banner"
import { OpportunitySection } from "@/components/opportunity-section"
import { RisksSection } from "@/components/risks-section"
import { AudienceSection } from "@/components/audience-section"
import { DodSection } from "@/components/dod-section"
import { MetricsSection } from "@/components/metrics-section"
import { TimelineSection } from "@/components/timeline-section"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        <ProductSection />
        <ProblemSection />
        <UrgencyBanner />
        <OpportunitySection />
        <RisksSection />
        <AudienceSection />
        <DodSection />
        <MetricsSection />
        <TimelineSection />
      </main>
      <SiteFooter />
    </div>
  )
}
