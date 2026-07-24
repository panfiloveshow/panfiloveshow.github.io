import { lazy, Suspense, useEffect } from 'react';
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

export default function App() {
  const rawPath = typeof window === 'undefined' ? '/' : window.location.pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const legalPage = path === '/privacy' ? 'privacy' : path === '/personal-data-consent' ? 'consent' : null;
  const seoPage =
    path === '/features'
      ? 'features'
      : path === '/pricing'
        ? 'pricing'
        : path === '/marketplaces'
          ? 'marketplaces'
          : null;
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
      {notFound ? (
        <NotFoundPage />
      ) : legalPage ? (
        <Suspense fallback={null}>
          <LegalPage type={legalPage} />
        </Suspense>
      ) : seoPage ? (
        <Suspense fallback={null}>
          <SeoContentPage type={seoPage} />
        </Suspense>
      ) : (
        <Suspense
          fallback={
            <main
              id="main-content"
              aria-busy="true"
              aria-label="Загрузка Sellico"
              className="min-h-screen bg-white pt-24"
            >
              <div className="mx-auto h-[620px] w-[calc(100%-2rem)] animate-pulse rounded-[28px] bg-[#edf4f0] lg:w-[calc(100%-8rem)]" />
            </main>
          }
        >
          <XwayInspiredLanding />
        </Suspense>
      )}
      <Footer />
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>
    </div>
  );
}
