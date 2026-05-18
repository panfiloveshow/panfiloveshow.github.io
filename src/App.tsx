import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollProgress } from '@/components/primitives/ScrollProgress';
import { scrollToHashOnReady } from '@/lib/anchors';

const XwayInspiredLanding = lazy(() =>
  import('@/components/sections/XwayInspiredLanding').then((m) => ({
    default: m.XwayInspiredLanding,
  })),
);

const LegalPage = lazy(() =>
  import('@/components/legal/LegalPage').then((m) => ({ default: m.LegalPage })),
);

const CookieBanner = lazy(() =>
  import('@/components/shared/CookieBanner').then((m) => ({ default: m.CookieBanner })),
);

const COOKIE_CONSENT_STORAGE_KEY = 'sellico-cookie-consent';

export default function App() {
  const rawPath = typeof window === 'undefined' ? '/' : window.location.pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const legalPage = path === '/privacy' ? 'privacy' : path === '/personal-data-consent' ? 'consent' : null;
  const [shouldRenderCookieBanner, setShouldRenderCookieBanner] = useState(false);

  useEffect(() => {
    if (!legalPage) scrollToHashOnReady();
  }, [legalPage]);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)) {
        setShouldRenderCookieBanner(true);
      }
    } catch {
      setShouldRenderCookieBanner(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface-light text-ink-50">
      {!legalPage && <ScrollProgress />}
      <Header />
      {legalPage ? (
        <Suspense fallback={null}>
          <LegalPage type={legalPage} />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="min-h-screen bg-[#f4f7f3]" />}>
          <XwayInspiredLanding />
        </Suspense>
      )}
      <Footer />
      {shouldRenderCookieBanner && (
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      )}
    </div>
  );
}
