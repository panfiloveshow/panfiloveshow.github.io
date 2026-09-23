import { lazy, Suspense, useEffect } from 'react';
import type { SeoPageType } from '@/components/seo/SeoContentPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { scrollToHashOnReady } from '@/lib/anchors';

const ScrollProgress = lazy(() =>
  import('@/components/primitives/ScrollProgress').then((module) => ({ default: module.ScrollProgress })),
);
const XwayInspiredLanding = lazy(() =>
  import('@/components/sections/XwayInspiredLanding').then((module) => ({
    default: module.XwayInspiredLanding,
  })),
);
const CookieBanner = lazy(() =>
  import('@/components/shared/CookieBanner').then((module) => ({ default: module.CookieBanner })),
);
const LegalPage = lazy(() =>
  import('@/components/legal/LegalPage').then((m) => ({ default: m.LegalPage })),
);
const SeoContentPage = lazy(() =>
  import('@/components/seo/SeoContentPage').then((module) => ({ default: module.SeoContentPage })),
);

function NotFoundPage() {
  useEffect(() => {
    document.title = 'Страница не найдена — Sellico';
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, nofollow');
  }, []);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="grid min-h-[70vh] place-items-center bg-[#f4f8f6] px-6 pb-20 pt-36 text-center text-ink-950 outline-none"
    >
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Ошибка 404</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Такой страницы нет</h1>
        <p className="mt-5 text-base leading-relaxed text-ink-500">
          Проверьте адрес или вернитесь на главную страницу Sellico.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-brand-700 px-6 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          На главную
        </a>
      </div>
    </main>
  );
}

// Маршруты сайта. При добавлении страницы также заведите запись в scripts/site-routes.mjs —
// оттуда собираются пререндер, sitemap.xml и список индексируемых путей.
const LEGAL_ROUTES: Record<string, 'privacy' | 'consent'> = {
  '/privacy': 'privacy',
  '/personal-data-consent': 'consent',
};

const SEO_ROUTES: Record<string, SeoPageType> = {
  '/about': 'about',
  '/authors/danil-zubarev': 'authors/danil-zubarev',
  '/cases': 'cases',
  '/methodology': 'methodology',
  '/analytics-marketplaces': 'analytics-marketplaces',
  '/features': 'features',
  '/pricing': 'pricing',
  '/marketplaces': 'marketplaces',
  '/wildberries': 'wildberries',
  '/ozon': 'ozon',
  '/yandex-market': 'yandex-market',
  '/unit-economics': 'unit-economics',
  '/supply-planning': 'supply-planning',
  '/seo-cards': 'seo-cards',
  '/reviews': 'reviews',
  '/advertising': 'advertising',
  '/team': 'team',
  '/calculators': 'calculators',
  '/calculators/unit-economics': 'calculators/unit-economics',
  '/calculators/margin': 'calculators/margin',
  '/calculators/cost-price': 'calculators/cost-price',
  '/calculators/roi': 'calculators/roi',
  '/calculators/abc-xyz': 'calculators/abc-xyz',
  '/calculators/wildberries-logistics': 'calculators/wildberries-logistics',
  '/calculators/turnover': 'calculators/turnover',
  '/calculators/drr': 'calculators/drr',
  '/calculators/break-even': 'calculators/break-even',
  '/contacts': 'contacts',
  '/glossary': 'glossary',
  '/glossary/drr': 'glossary/drr',
  '/glossary/turnover': 'glossary/turnover',
  '/glossary/margin': 'glossary/margin',
  '/glossary/abc-analysis': 'glossary/abc-analysis',
  '/glossary/fbo-fbs': 'glossary/fbo-fbs',
  '/glossary/buyout-rate': 'glossary/buyout-rate',
  '/glossary/roi': 'glossary/roi',
  '/glossary/conversion': 'glossary/conversion',
  '/glossary/cost-price': 'glossary/cost-price',
  '/glossary/xyz-analysis': 'glossary/xyz-analysis',
  '/glossary/safety-stock': 'glossary/safety-stock',
  '/glossary/break-even': 'glossary/break-even',
  '/glossary/cpm-cpc-cpo': 'glossary/cpm-cpc-cpo',
  '/glossary/lost-sales': 'glossary/lost-sales',
};

export default function App() {
  const rawPath = typeof window === 'undefined' ? '/' : window.location.pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const legalPage = LEGAL_ROUTES[path] ?? null;
  const seoPage = SEO_ROUTES[path] ?? null;
  const notFound = path !== '/' && !legalPage && !seoPage;

  useEffect(() => {
    if (!legalPage && !seoPage && !notFound) return scrollToHashOnReady();
    return undefined;
  }, [legalPage, notFound, seoPage]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface-light text-ink-50">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[200] -translate-y-24 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink-950 shadow-xl transition-transform focus:translate-y-0"
      >
        Перейти к основному содержанию
      </a>
      {!legalPage && !seoPage && !notFound && (
        <Suspense fallback={null}>
          <ScrollProgress />
        </Suspense>
      )}
      <Header />
      {/* Страницы без Suspense намеренно: первый рендер идёт в startTransition (main.tsx),
          и до загрузки чанка на экране остаётся пререндер, а не пустой main или лоадер. */}
      {notFound ? (
        <NotFoundPage />
      ) : legalPage ? (
        <LegalPage type={legalPage} />
      ) : seoPage ? (
        <SeoContentPage type={seoPage} />
      ) : (
        <XwayInspiredLanding />
      )}
      <Footer />
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>
    </div>
  );
}
