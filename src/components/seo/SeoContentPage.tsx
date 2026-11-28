import { use, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  Megaphone,
  MessageCircle,
  Package,
  SearchCheck,
  Users,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { WorkspacePreview } from '@/components/primitives/WorkspacePreview';
import { AbcXyzCalculator } from '@/components/seo/AbcXyzCalculator';
import { SimpleCalculator } from '@/components/seo/SimpleCalculator';
import { UnitEconomicsCalculator } from '@/components/seo/UnitEconomicsCalculator';
import pagesIndex from '@/content/pages-index.json';
import {
  BRAND_THEME,
  loadPage,
  type DetailPage,
  type DetailPageType,
  type SeoPageType,
} from './page-types';

type PageTheme = NonNullable<DetailPage['theme']>;
import { ComparisonTable, DirectAnswer, EditorialInfo, FaqSection, FinalCta, PageHero } from './shared';
import { DirectoryHubPage, FeaturesPage, MarketplacesPage, PricingPage } from './templates/HubPages';
import { FeatureSection, MarketplaceDetailPage } from './templates/ProductPages';
import { ArticlePage, ComparisonPage, GlossaryTermPage } from './templates/EditorialPages';
import {
  AboutCompanyPage,
  AuthorProfilePage,
  CasesEvidencePage,
  ContactsPage,
  MethodologyProtocolPage,
} from './templates/CompanyPages';

export type { DetailPageType, SeoPageType };

const DETAIL_ICONS: Record<string, typeof BarChart3> = {
  BarChart3,
  Calculator,
  Package,
  SearchCheck,
  MessageCircle,
  Megaphone,
  Users,
};

const PAGE_META: Record<string, { title: string; description: string; canonical: string; lastmod: string }> = {
  ...Object.fromEntries(
    Object.entries(pagesIndex).map(([slug, page]) => [
      slug,
      {
        title: page.title,
        description: page.description,
        canonical: `https://sellico.ru/${slug}/`,
        lastmod: page.lastmod,
      },
    ]),
  ),
  features: {
    title: 'Возможности Sellico — финансы, поставки, SEO и команда',
    description:
      'Возможности Sellico для селлеров: финансы, юнит-экономика, остатки, поставки, реклама, SEO, отзывы, заявки и задачи команды.',
    canonical: 'https://sellico.ru/features/',
    lastmod: '2026-11-16',
  },
  pricing: {
    title: 'Тарифы Sellico — цены и лимиты для продавцов маркетплейсов',
    description:
      'Тарифы Sellico от 3 000 ₽ в месяц. Сравните лимиты магазинов, пользователей, товаров, SEO, отзывов и автопланирования поставок.',
    canonical: 'https://sellico.ru/pricing/',
    lastmod: '2026-11-16',
  },
  marketplaces: {
    title: 'Sellico для Wildberries, Ozon и Яндекс Маркета',
    description:
      'Единое рабочее пространство Sellico для магазинов на Wildberries, Ozon и Яндекс Маркете: финансы, остатки, реклама, SEO и команда.',
    canonical: 'https://sellico.ru/marketplaces/',
    lastmod: '2026-11-16',
  },
};

const CUSTOM_HERO_KINDS = new Set([
  'glossary',
  'author',
  'cases',
  'about',
  'methodology',
  'feature',
  'marketplace',
  'glossary-hub',
  'calculators-hub',
  'articles-hub',
  'compare-hub',
  'article',
  'comparison',
]);

function usePageMetadata(page: SeoPageType) {
  useEffect(() => {
    const meta = PAGE_META[page];
    document.title = meta.title;

    const setMeta = (selector: string, value: string, attribute = 'content') => {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[name="robots"]', 'index, follow, max-image-preview:large');
    setMeta('meta[property="og:title"]', meta.title);
    setMeta('meta[property="og:description"]', meta.description);
    setMeta('meta[property="og:url"]', meta.canonical);
    setMeta('meta[name="twitter:title"]', meta.title);
    setMeta('meta[name="twitter:description"]', meta.description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', meta.canonical);
  }, [page]);
}

function DefaultBlocksSection({ page, theme }: { page: DetailPage; theme: PageTheme }) {
  const Icon = page.icon ? DETAIL_ICONS[page.icon] : null;
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: theme.soft }} aria-labelledby="marketplace-blocks-title">
      <Container>
        <div className="flex max-w-3xl items-center gap-5">
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
            style={{ backgroundColor: theme.tile }}
          >
            {page.logo ? (
              <img src={page.logo} alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
            ) : Icon ? (
              <Icon size={28} style={{ color: theme.mark }} aria-hidden />
            ) : null}
          </span>
          <h2
            id="marketplace-blocks-title"
            className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl"
          >
            {page.blocksTitle}
          </h2>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">{page.blocksLead}</p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {page.blocks.map((block) => (
            <article key={block.title} className="rounded-[26px] border border-ink-950/[0.08] bg-white p-6 shadow-card">
              <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3>
              <p className="mt-4 text-sm leading-[1.7] text-ink-600">{block.text}</p>
              <ul className="mt-6 space-y-3">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: theme.mark }} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              {block.href && (
                <a
                  href={block.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                  style={{ color: theme.mark }}
                >
                  Читать про «{block.title}»
                  <ArrowRight size={14} aria-hidden />
                </a>
              )}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function renderDetailBody(page: DetailPage, type: DetailPageType, theme: PageTheme) {
  switch (page.kind) {
    case 'glossary':
      return <GlossaryTermPage page={page} theme={theme} slug={type} />;
    case 'article':
      return <ArticlePage page={page} />;
    case 'comparison':
      return <ComparisonPage page={page} />;
    case 'author':
      return <AuthorProfilePage page={page} />;
    case 'cases':
      return <CasesEvidencePage page={page} />;
    case 'about':
      return <AboutCompanyPage page={page} />;
    case 'methodology':
      return <MethodologyProtocolPage page={page} />;
    case 'glossary-hub':
    case 'calculators-hub':
    case 'articles-hub':
    case 'compare-hub':
      return <DirectoryHubPage page={page} type={type} />;
    case 'marketplace':
      return <MarketplaceDetailPage page={page} type={type} />;
    case 'contacts':
      return <ContactsPage page={page} />;
    case 'feature':
      return <FeatureSection page={page} type={type} />;
    default:
      return <DefaultBlocksSection page={page} theme={theme} />;
  }
}

function DetailPageView({ type }: { type: DetailPageType }) {
  const page = use(loadPage(type));
  const theme = page.theme ?? BRAND_THEME;

  return (
    <>
      {!CUSTOM_HERO_KINDS.has(page.kind) && (
        <>
          <PageHero
            eyebrow={page.eyebrow}
            title={page.h1}
            description={page.lead}
            parent={page.parent}
            theme={theme}
          />
          {page.kind !== 'calculator' && page.answer && (
            <DirectAnswer answer={page.answer} id={type} accent={theme.mark} background="#ffffff" />
          )}
        </>
      )}
      {page.kind === 'calculator' && (
        <>
          {page.calc === 'abc-xyz' ? (
            <AbcXyzCalculator />
          ) : page.calc ? (
            <SimpleCalculator spec={page.calc} />
          ) : (
            <UnitEconomicsCalculator />
          )}
          {page.answer && (
            <DirectAnswer answer={page.answer} id={type} accent={theme.mark} background="#ffffff" />
          )}
          {page.demo && <WorkspacePreview view={page.demo.view} caption={page.demo.caption} />}
        </>
      )}
      {renderDetailBody(page, type, theme)}
      {page.table && page.kind !== 'comparison' && <ComparisonTable table={page.table} />}
      <FaqSection title={`Частые вопросы — ${page.eyebrow}`} items={page.faq} theme={theme} />
      <section className="bg-white pb-20 lg:pb-24" aria-labelledby="related-title">
        <Container>
          <nav aria-label="Смежные страницы" id="related-title">
            <h2 className="text-xl font-semibold text-ink-950">Смотрите также</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {page.related.map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-ink-950/[0.1] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-current/40"
                    style={{ color: theme.mark }}
                  >
                    {label}
                    <ArrowRight size={14} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>
      <EditorialInfo type={type} lastmod={page.lastmod} />
      <FinalCta background={theme.cta} />
    </>
  );
}

export function SeoContentPage({ type }: { type: SeoPageType }) {
  usePageMetadata(type);

  return (
    <main id="main-content" tabIndex={-1} className="bg-white text-ink-950 outline-none">
      {/* Без Suspense намеренно: ожидание JSON страницы (use(loadPage)) уходит в первый рендер,
          который идёт в startTransition (main.tsx), — до загрузки на экране остаётся пререндер. */}
      {type === 'features' ? (
        <FeaturesPage lastmod={PAGE_META.features.lastmod} />
      ) : type === 'pricing' ? (
        <PricingPage lastmod={PAGE_META.pricing.lastmod} />
      ) : type === 'marketplaces' ? (
        <MarketplacesPage lastmod={PAGE_META.marketplaces.lastmod} />
      ) : (
        <DetailPageView type={type} />
      )}
    </main>
  );
}
