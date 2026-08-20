import { AiSection } from './landing/AiSection';
import { CasesSection } from './landing/CasesSection';
import { DemoSection } from './landing/DemoSection';
import { FunnelSection } from './landing/FunnelSection';
import { HelpAndStartSection } from './landing/HelpAndStartSection';
import { Hero } from './landing/Hero';
import { MarketplaceBanners } from './landing/MarketplaceBanners';
import { PricingSection } from './landing/PricingSection';
import { PromoBanner } from './landing/PromoBanner';

export function XwayInspiredLanding() {
  return (
    <main id="main-content" tabIndex={-1} className="overflow-hidden bg-white text-ink-950 outline-none">
      <PromoBanner />
      <Hero />
      <AiSection />
      <FunnelSection />
      <DemoSection />
      <MarketplaceBanners />
      <CasesSection />
      <PricingSection />
      <HelpAndStartSection />
    </main>
  );
}
