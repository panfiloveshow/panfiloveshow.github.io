import { AiSection } from './landing/AiSection';
import { CasesSection } from './landing/CasesSection';
import { DemoSection } from './landing/DemoSection';
import { FunnelSection } from './landing/FunnelSection';
import { HelpAndStartSection } from './landing/HelpAndStartSection';
import { Hero } from './landing/Hero';
import { HomeDirectAnswer } from './landing/HomeDirectAnswer';
import { MarketplaceBanners } from './landing/MarketplaceBanners';
import { PricingSection } from './landing/PricingSection';
import { VideoSection } from './landing/VideoSection';

export function XwayInspiredLanding() {
  return (
    <main id="main-content" tabIndex={-1} className="overflow-hidden bg-white text-ink-950 outline-none">
      <Hero />
      <HomeDirectAnswer />
      <VideoSection />
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
