import { lazy, Suspense, useEffect } from 'react';
import type { DetailPageType, SeoPageType } from '@/components/seo/SeoContentPage';
import pagesIndex from '@/content/pages-index.json';
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

const HUB_SEO_ROUTES: Record<string, SeoPageType> = {
  '/features': 'features',
  '/pricing': 'pricing',
  '/marketplaces': 'marketplaces',
};

const SEO_ROUTES: Record<string, SeoPageType> = {
  ...HUB_SEO_ROUTES,
  ...Object.fromEntries(
    (Object.keys(pagesIndex) as DetailPageType[]).map((slug) => [`/${slug}`, slug]),
  ),
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
        className="skip-link fixed left-4 top-3 z-[200] -translate-y-24 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink-950 shadow-xl transition-transform focus:translate-y-0"
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
