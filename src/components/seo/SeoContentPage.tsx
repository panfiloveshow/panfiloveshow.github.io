import { lazy, Suspense, use, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  Braces,
  Check,
  Calculator,
  Code2,
  Database,
  FileCheck2,
  Gauge,
  Layers3,
  Megaphone,
  MessageCircle,
  Package,
  SearchCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL } from '@/lib/anchors';
import pagesIndex from '@/content/pages-index.json';
import hubFaq from '@/content/hub-faq.json';
import hubContent from '@/content/hub-content.json';
import { UnitEconomicsCalculator } from '@/components/seo/UnitEconomicsCalculator';
import { SimpleCalculator } from '@/components/seo/SimpleCalculator';
import { AbcXyzCalculator } from '@/components/seo/AbcXyzCalculator';
import { MiniCalc } from '@/components/seo/MiniCalc';
import {
  EDITORIAL_AUTHOR,
  EDITORIAL_METHODOLOGY_URL,
  getEditorialSources,
} from '@/content/editorial';

// Индекс страниц (заголовки и описания) грузится сразу — он маленький. Тело страницы
// приезжает отдельным чанком: иначе читатель одного термина качает контент всех 25 страниц.
export type DetailPageType = keyof typeof pagesIndex;
export type SeoPageType = 'features' | 'pricing' | 'marketplaces' | DetailPageType;

type DetailPage = {
  kind: string;
  lastmod: string;
  eyebrow: string;
  /** Промежуточная крошка вида ['Глоссарий', '/glossary/'] для вложенных страниц */
  parent?: string[];
  logo?: string;
  icon?: string;
  theme?: PageTheme;
  title: string;
  description: string;
  h1: string;
  lead: string;
  /** Самостоятельный ответ на основной запрос страницы — читается без соседнего контекста. */
  answer?: { title: string; text: string; points: string[] };
  /** Короткое определение для страниц глоссария — крупным планом под шапкой */
  definition?: string;
  formula?: { rows: { label: string; expression: string }[]; note: string };
  actions?: { label: string; value: string; href: string; note: string }[];
  requisites?: { title: string; rows: string[][]; note: string };
  /** Какой калькулятор показать: свой у юнит-экономики, остальные — общий компонент */
  calc?: string;
  /** Живой экран продукта — только там, где раздел совпадает с темой страницы */
  demo?: { view: string; caption: string };
  blocksTitle: string;
  blocksLead: string;
  blocks: { title: string; text: string; items: string[]; href?: string }[];
  faq: string[][];
  related: string[][];
};

type PageTheme = {
  /** background страницы-героя целиком */
  hero: string;
  /** цвет надзаголовка и хлебных крошек на тёмном фоне */
  eyebrow: string;
  /** подложка плитки с логотипом */
  tile: string;
  /** акцент списков и ссылок */
  mark: string;
  /** светлая заливка секций */
  soft: string;
  /** фон нижнего блока с призывом */
  cta: string;
};

// Фирменная зелёная тема. Страницы маркетплейсов переопределяют её своими цветами,
// чтобы /wildberries, /ozon и /yandex-market не выглядели одной страницей с разным текстом.
const BRAND_THEME: PageTheme = {
  hero: 'radial-gradient(circle at 82% 8%, rgba(100,213,184,.3), transparent 32%), linear-gradient(145deg,#145a41 0%,#0b3c2c 70%,#082c20 100%)',
  eyebrow: '#A7F3D0',
  tile: '#E6F8F3',
  mark: '#11543F',
  soft: '#F4F8F6',
  cta: '#0B6B4D',
};

type FeatureLayout = 'matrix' | 'ledger' | 'control' | 'studio' | 'inbox' | 'flow' | 'workspace';

type FeatureSignature = {
  number: string;
  label: string;
  layout: FeatureLayout;
  accent: string;
  soft: string;
  hero: string;
};

// У каждой продуктовой страницы свой визуальный язык, связанный с задачей раздела.
// Цвет здесь — лишь часть различия: ниже меняются ритм, сетка и способ чтения блоков.
const FEATURE_SIGNATURES: Record<string, FeatureSignature> = {
  'analytics-marketplaces': {
    number: '01',
    label: 'Контур данных',
    layout: 'matrix',
    accent: '#70E1BC',
    soft: '#EAF8F3',
    hero: 'radial-gradient(circle at 78% 24%,rgba(39,189,151,.24),transparent 26%),linear-gradient(135deg,#071712 0%,#103f31 100%)',
  },
  'unit-economics': {
    number: '02',
    label: 'Финансовая модель',
    layout: 'ledger',
    accent: '#F2C96D',
    soft: '#FBF5E8',
    hero: 'radial-gradient(circle at 80% 18%,rgba(242,201,109,.2),transparent 28%),linear-gradient(135deg,#17140d 0%,#413616 100%)',
  },
  advertising: {
    number: '03',
    label: 'Контур управления',
    layout: 'control',
    accent: '#FF9072',
    soft: '#FFF0EB',
    hero: 'radial-gradient(circle at 80% 18%,rgba(255,144,114,.22),transparent 28%),linear-gradient(135deg,#1b0f0c 0%,#54251b 100%)',
  },
  'seo-cards': {
    number: '04',
    label: 'Контент-студия',
    layout: 'studio',
    accent: '#B6A7FF',
    soft: '#F2EFFE',
    hero: 'radial-gradient(circle at 78% 18%,rgba(182,167,255,.24),transparent 29%),linear-gradient(135deg,#110f1d 0%,#30285d 100%)',
  },
  reviews: {
    number: '05',
    label: 'Входящие',
    layout: 'inbox',
    accent: '#7FD3FF',
    soft: '#EAF7FD',
    hero: 'radial-gradient(circle at 80% 20%,rgba(127,211,255,.24),transparent 28%),linear-gradient(135deg,#08151b 0%,#163f52 100%)',
  },
  'supply-planning': {
    number: '06',
    label: 'Цепочка поставки',
    layout: 'flow',
    accent: '#A8D56A',
    soft: '#F0F7E7',
    hero: 'radial-gradient(circle at 80% 20%,rgba(168,213,106,.22),transparent 28%),linear-gradient(135deg,#10170a 0%,#334b1c 100%)',
  },
  team: {
    number: '07',
    label: 'Рабочее пространство',
    layout: 'workspace',
    accent: '#FFA9C1',
    soft: '#FCEEF2',
    hero: 'radial-gradient(circle at 80% 20%,rgba(255,169,193,.22),transparent 28%),linear-gradient(135deg,#1a0d12 0%,#4e2532 100%)',
  },
};

type MarketplaceSignature = {
  label: string;
  art: string;
  alt: string;
  accent: string;
  ink: string;
  soft: string;
};

const MARKETPLACE_SIGNATURES: Record<string, MarketplaceSignature> = {
  wildberries: {
    label: 'Fashion commerce system',
    art: 'wildberries-system',
    alt: 'Трёхмерная композиция склада одежды, заказов и поставок Wildberries в едином рабочем контуре',
    accent: '#E9B5FF',
    ink: '#260C32',
    soft: '#F7EEFA',
  },
  ozon: {
    label: 'Order engineering system',
    art: 'ozon-system',
    alt: 'Трёхмерная инженерная схема заказов, складов и FBO/FBS-потоков магазина Ozon',
    accent: '#BFD5FF',
    ink: '#081D42',
    soft: '#ECF3FF',
  },
  'yandex-market': {
    label: 'Connected commerce map',
    art: 'yandex-market-system',
    alt: 'Трёхмерная карта товарных, складских и командных процессов магазина Яндекс Маркета',
    accent: '#FFD34D',
    ink: '#261B05',
    soft: '#FFF6D5',
  },
};

const pageLoaders = import.meta.glob<{ default: DetailPage }>('../../content/pages/**/*.json');
const pageCache = new Map<string, Promise<DetailPage>>();

function loadPage(slug: string): Promise<DetailPage> {
  let promise = pageCache.get(slug);
  if (!promise) {
    const loader = pageLoaders[`../../content/pages/${slug}.json`];
    promise = loader().then((module) => module.default);
    pageCache.set(slug, promise);
  }
  return promise;
}

// Акцентные цвета площадок для заголовков таблицы сравнения
const PLATFORM_MARKS = ['#7A2FA8', '#1D4ED8', '#A16207'];


// Экраны рабочего пространства грузятся отдельным чанком: они тяжёлые и нужны
// только на четырёх страницах функций.
const DEMO_VIEWS: Record<string, ReturnType<typeof lazy>> = {
  FinanceView: lazy(() =>
    import('@/components/primitives/workspace-demo/FinanceView').then((m) => ({ default: m.FinanceView })),
  ),
  SeoView: lazy(() =>
    import('@/components/primitives/workspace-demo/SeoView').then((m) => ({ default: m.SeoView })),
  ),
  ReviewsView: lazy(() =>
    import('@/components/primitives/workspace-demo/ReviewsView').then((m) => ({ default: m.ReviewsView })),
  ),
  CoordinationView: lazy(() =>
    import('@/components/primitives/workspace-demo/CoordinationView').then((m) => ({
      default: m.CoordinationView,
    })),
  ),
};

function ProductScreen({ demo }: { demo: { view: string; caption: string } }) {
  const View = DEMO_VIEWS[demo.view];
  if (!View) return null;

  return (
    <section className="bg-[#0b1512] py-16 lg:py-20" aria-labelledby="product-screen-title">
      <Container>
        <h2 id="product-screen-title" className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
          Как это выглядит в Sellico
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{demo.caption}</p>
        <figure className="mt-8">
          <div className="overflow-hidden rounded-[22px] border border-white/12 bg-[#f6f8f7] shadow-[0_40px_90px_-60px_rgba(0,0,0,.9)]">
            <div className="flex items-center gap-1.5 border-b border-ink-950/[0.07] bg-white px-4 py-3">
              {['#e5564e', '#e8b33c', '#43b95f'].map((color) => (
                <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              ))}
              <span className="ml-3 text-xs font-medium text-ink-500">Рабочее пространство Sellico</span>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              <Suspense
                fallback={<div className="h-[420px] animate-pulse bg-[#edf4f0]" aria-label="Загрузка экрана" />}
              >
                <View />
              </Suspense>
            </div>
          </div>
          <figcaption className="mt-4 text-xs text-white/45">
            Интерфейс продукта с демонстрационными данными — цифры на экране модельные.
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}

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
      'Возможности Sellico для продавцов маркетплейсов: финансы и юнит-экономика, остатки, поставки, реклама, SEO, отзывы, заявки и задачи команды.',
    canonical: 'https://sellico.ru/features/',
    lastmod: '2026-08-25',
  },
  pricing: {
    title: 'Тарифы Sellico — цены и лимиты для продавцов маркетплейсов',
    description:
      'Тарифы Sellico от 3 000 ₽ в месяц. Сравните лимиты магазинов, пользователей, товаров, SEO, отзывов и автопланирования поставок.',
    canonical: 'https://sellico.ru/pricing/',
    lastmod: '2026-09-22',
  },
  marketplaces: {
    title: 'Sellico для Wildberries, Ozon и Яндекс Маркета',
    description:
      'Единое рабочее пространство Sellico для магазинов на Wildberries, Ozon и Яндекс Маркете: финансы, остатки, реклама, SEO и команда.',
    canonical: 'https://sellico.ru/marketplaces/',
    lastmod: '2026-08-25',
  },
};

function formatEditorialDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function EditorialInfo({ type, lastmod }: { type: string; lastmod: string }) {
  const sources = getEditorialSources(type);

  return (
    <section className="border-y border-ink-950/[0.07] bg-[#f4f8f6] py-12" aria-labelledby="editorial-info-title">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Редакционная информация</p>
            <h2 id="editorial-info-title" className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-ink-950">
              Проверено по первичным источникам
            </h2>
            <dl className="mt-5 space-y-2 text-sm text-ink-600">
              <div className="flex flex-wrap gap-x-2">
                <dt>Автор:</dt>
                <dd>
                  <a className="font-semibold text-brand-800 underline-offset-4 hover:underline" href={EDITORIAL_AUTHOR.url}>
                    {EDITORIAL_AUTHOR.name}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>Обновлено:</dt>
                <dd>
                  <time dateTime={lastmod}>{formatEditorialDate(lastmod)}</time>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>Как проверяем:</dt>
                <dd>
                  <a className="font-semibold text-brand-800 underline-offset-4 hover:underline" href={EDITORIAL_METHODOLOGY_URL}>
                    методология Sellico
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-950">Источники</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-ink-950/[0.08] bg-white px-4 py-3 text-sm leading-relaxed text-ink-700 transition hover:border-brand-700/30 hover:text-brand-800"
                  >
                    <span className="block font-semibold">{source.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{source.publisher}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-ink-600">
              Состав данных конкретного кабинета зависит от API площадки, периода и тарифа Sellico.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

const FEATURE_GROUPS = [
  {
    id: 'finance',
    href: '/unit-economics/',
    icon: BarChart3,
    title: 'Финансы и юнит-экономика',
    description:
      'Сводите выручку, комиссии, логистику, себестоимость и другие расходы, чтобы оценивать результат по магазину и SKU.',
    points: ['Финансовая сводка', 'Показатели по товарам', 'ABC-анализ и маржинальность'],
  },
  {
    id: 'inventory',
    href: '/supply-planning/',
    icon: Package,
    title: 'Остатки и поставки',
    description:
      'Контролируйте доступный запас и планируйте поставки на основе данных подключённых кабинетов.',
    points: ['Единый список остатков', 'Планирование поставок', 'Сигналы по дефициту'],
  },
  {
    id: 'advertising',
    href: '/advertising/',
    icon: Megaphone,
    title: 'Реклама и цены',
    description:
      'Сопоставляйте рекламные показатели с экономикой товара и управляйте рабочими действиями в одном контуре.',
    points: ['Кампании и ставки', 'Связь с экономикой SKU', 'Контроль изменений'],
  },
  {
    id: 'seo',
    href: '/seo-cards/',
    icon: SearchCheck,
    title: 'SEO карточек',
    description:
      'Проверяйте качество карточек, находите зоны улучшения и готовьте описания с помощью AI-инструментов.',
    points: ['SEO-аудит', 'Проверка карточек', 'AI-генерация описаний'],
  },
  {
    id: 'communications',
    href: '/reviews/',
    icon: MessageCircle,
    title: 'Отзывы и заявки',
    description:
      'Собирайте обращения и отзывы в рабочих очередях, чтобы команда быстрее распределяла и обрабатывала их.',
    points: ['Отзывы маркетплейсов', 'Входящие заявки', 'Очереди и статусы'],
  },
  {
    id: 'team',
    href: '/team/',
    icon: Users,
    title: 'Команда и задачи',
    description:
      'Организуйте работу команды через задачи, канбан, календарь, чат и роли внутри единого пространства.',
    points: ['Канбан и календарь', 'Ответственные и сроки', 'Чаты и организатор'],
  },
] as const;

const PLANS = [
  {
    name: 'Старт',
    featured: false,
    price: '3 000 ₽',
    description: 'Для одного магазина',
    limits: ['1 API-интеграция', '3 пользователя', '50 товаров'],
    features: ['Юнит-экономика', 'Задачи и координация', '20 SEO-генераций в месяц', '1 автоплан поставки'],
  },
  {
    name: 'Про',
    featured: false,
    price: '8 000 ₽',
    description: 'Для растущей команды',
    limits: ['3 API-интеграции', '10 пользователей', '150 товаров'],
    features: ['Всё из «Старт»', 'Финансовая отчётность', '100 SEO-генераций в месяц', '4 автоплана поставок'],
  },
  {
    name: 'Бизнес',
    price: '15 000 ₽',
    description: 'Для бренда или агентства',
    limits: ['6 API-интеграций', '20 пользователей', '300 товаров'],
    features: ['Всё из «Про»', 'Заявки и лиды', 'Sellico Meet', '8 автопланов поставок'],
    featured: true,
  },
  {
    name: 'Enterprise',
    featured: false,
    price: 'от 40 000 ₽',
    description: 'Для крупного бизнеса',
    limits: ['Договорные интеграции', 'Договорные пользователи', 'Договорные товары'],
    features: ['Всё из «Бизнес»', 'Индивидуальные лимиты', 'Настройка ролей и интеграций', 'Сценарий внедрения'],
  },
] as const;

const MARKETPLACES = [
  {
    id: 'wildberries',
    name: 'Wildberries',
    logo: '/brand/marketplaces/wildberries.svg',
    color: 'bg-[#f7edff]',
    description:
      'Контролируйте экономику, остатки, карточки и отзывы Wildberries вместе с задачами ответственных.',
    points: ['Финансовые показатели', 'Остатки и поставки', 'SEO карточек и отзывы'],
  },
  {
    id: 'ozon',
    name: 'Ozon',
    logo: '/brand/marketplaces/ozon.svg',
    color: 'bg-[#eef5ff]',
    description:
      'Собирайте данные Ozon в едином кабинете и сопоставляйте продажи, расходы, запас и качество карточек.',
    points: ['Юнит-экономика', 'Планирование запаса', 'Реклама и SEO'],
  },
  {
    id: 'yandex-market',
    name: 'Яндекс Маркет',
    logo: '/brand/marketplaces/yandex-market.svg',
    color: 'bg-[#fff8dc]',
    description:
      'Добавляйте магазин Яндекс Маркета в общий операционный контур вместе с другими площадками.',
    points: ['Общая финансовая сводка', 'Остатки и товары', 'Командные процессы'],
  },
] as const;

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

function PageHero({
  eyebrow,
  title,
  description,
  parent,
  theme = BRAND_THEME,
}: {
  eyebrow: string;
  title: string;
  description: string;
  parent?: string[];
  theme?: PageTheme;
}) {
  return (
    <section
      className="relative isolate overflow-hidden pb-20 pt-36 text-white lg:pb-28 lg:pt-44"
      style={{ background: theme.hero }}
    >
      <Container>
        <nav aria-label="Хлебные крошки" className="text-sm text-white/70">
          <a href="/" className="underline-offset-4 hover:text-white hover:underline">Главная</a>
          <span aria-hidden className="mx-2">/</span>
          {parent && (
            <>
              <a href={parent[1]} className="underline-offset-4 hover:text-white hover:underline">
                {parent[0]}
              </a>
              <span aria-hidden className="mx-2">/</span>
            </>
          )}
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: theme.eyebrow }}>
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-7 max-w-3xl text-base leading-[1.75] text-white/76 sm:text-lg">{description}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>
            Подключить магазин
          </Button>
          <Button as="a" href="/#demo" variant="dark" size="lg" className="rounded-xl border-white/20">
            Посмотреть интерфейс
          </Button>
        </div>
      </Container>
    </section>
  );
}

function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Возможности"
        title="Вся операционная работа продавца — в одном пространстве"
        description="Sellico объединяет данные маркетплейсов и ежедневные процессы команды: от финансовой сводки и запасов до SEO, отзывов и задач."
      />
      <section className="bg-[#f4f8f6] py-20 lg:py-28" aria-labelledby="features-list-title">
        <Container>
          <div className="max-w-3xl">
            <h2 id="features-list-title" className="text-4xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-6xl">
              Модули Sellico
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-600">
              Доступность функций и лимиты зависят от тарифа. Ниже — назначение каждого рабочего контура без обещаний функций, которых нет в продукте.
            </p>
          </div>
          {/* Указатель разделов, а не ещё одна плитка карточек: шесть строк с переходом внутрь. */}
          <div className="mt-12 overflow-hidden rounded-[28px] border border-ink-950/[0.08] bg-white">
            {FEATURE_GROUPS.map(({ id, href, icon: Icon, title, description, points }, index) => (
              <a
                key={id}
                id={id}
                href={href}
                className={`group grid gap-4 px-6 py-7 transition-colors hover:bg-[#f4f8f6] sm:px-9 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)_auto] lg:items-center lg:gap-10 ${
                  index > 0 ? 'border-t border-ink-950/[0.07]' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-800">
                    <Icon size={19} aria-hidden />
                  </span>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-2xl">{title}</h3>
                </div>
                <div>
                  <p className="text-sm leading-[1.7] text-ink-600">{description}</p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {points.map((point) => (
                      <li key={point} className="text-[13px] font-medium text-ink-500">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800 lg:justify-self-end">
                  Подробнее
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>
      <HubExtraSection hub="features" />
      <FaqSection title="Частые вопросы о возможностях" items={hubFaq.features} />
      <EditorialInfo type="features" lastmod={PAGE_META.features.lastmod} />
      <FinalCta />
    </>
  );
}

function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Тарифы"
        title="Прозрачные тарифы для магазина, команды и агентства"
        description="3 дня бесплатного доступа без привязки банковской карты. Все цены указаны за месяц, а лимиты видны до подключения."
      />
      <section className="bg-[#f4f8f6] py-20 lg:py-28" aria-labelledby="pricing-list-title">
        <Container>
          <h2 id="pricing-list-title" className="text-4xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-6xl">
            Сравнение тарифов
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-[26px] border p-6 ${
                  plan.featured
                    ? 'border-[#153d2e] bg-[#09271c] text-white shadow-[0_34px_85px_-52px_rgba(4,61,39,.85)]'
                    : 'border-ink-950/[0.08] bg-white text-ink-950 shadow-card'
                }`}
              >
                <h3 className={`text-sm font-bold uppercase tracking-[0.16em] ${plan.featured ? 'text-emerald-200' : 'text-brand-800'}`}>
                  {plan.name}
                </h3>
                <p className={`mt-2 text-sm ${plan.featured ? 'text-white/72' : 'text-ink-600'}`}>{plan.description}</p>
                <p className="mt-7 text-4xl font-semibold tracking-[-0.055em]">{plan.price}</p>
                <p className={`mt-1 text-xs ${plan.featured ? 'text-white/72' : 'text-ink-600'}`}>в месяц</p>
                <ul className="mt-7 space-y-3">
                  {plan.limits.map((limit) => (
                    <li key={limit} className={`flex gap-2 text-sm ${plan.featured ? 'text-white/88' : 'text-ink-700'}`}>
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-400" aria-hidden />
                      {limit}
                    </li>
                  ))}
                </ul>
                <div className={`my-6 h-px ${plan.featured ? 'bg-white/12' : 'bg-ink-950/[0.08]'}`} />
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`text-sm leading-relaxed ${plan.featured ? 'text-white/82' : 'text-ink-600'}`}>
                      {feature}
                    </li>
                  ))}
                </ul>
                {/* На светлых карточках outline-вариант невидим (text-ink-100 — светлый тон палитры),
                    поэтому явные оверрайды под светлую поверхность — как в landing/PricingSection. */}
                <Button
                  as="a"
                  href={plan.name === 'Enterprise' ? '/?enterprise=1#pricing' : REGISTER_URL}
                  variant={plan.featured ? 'primary' : 'outline'}
                  className={`mt-8 w-full rounded-xl ${
                    plan.featured
                      ? ''
                      : '!border-ink-950/10 !bg-transparent !text-ink-950 hover:!border-ink-950 hover:!bg-ink-950 hover:!text-white'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Обсудить внедрение' : `Выбрать ${plan.name}`}
                </Button>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <ComparisonTable table={hubContent.pricing.table} />
      <HubExtraSection hub="pricing" />
      <FaqSection title="Частые вопросы о тарифах" items={hubFaq.pricing} />
      <EditorialInfo type="pricing" lastmod={PAGE_META.pricing.lastmod} />
      <FinalCta />
    </>
  );
}

function FinalCta({ background = BRAND_THEME.cta }: { background?: string }) {
  return (
    <section className="bg-white py-16 lg:py-24" aria-labelledby="seo-page-cta-title">
      <Container>
        <div
          className="rounded-[30px] px-6 py-12 text-white sm:px-10 lg:px-14"
          style={{ backgroundColor: background }}
        >
          <h2 id="seo-page-cta-title" className="max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Проверьте Sellico на данных своего магазина
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/76">
            Первый магазин можно подключить примерно за 15 минут. Бесплатный период — 3 дня, без привязки банковской карты.
          </p>
          <Button as="a" href={REGISTER_URL} size="lg" className="mt-8 rounded-xl" iconRight={<ArrowRight size={17} />}>
            Начать бесплатно
          </Button>
        </div>
      </Container>
    </section>
  );
}

function ComparisonTable({
  table,
  accents,
}: {
  table: { title: string; lead: string; columns: string[]; rows: string[][]; highlight?: number };
  accents?: string[];
}) {
  return (
    <section className="py-20 lg:py-24" style={{ backgroundColor: '#f4f8f6' }} aria-labelledby="comparison-title">
      <Container>
        <h2 id="comparison-title" className="max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
          {table.title}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">{table.lead}</p>
        {/* Таблица шире мобильного экрана (min-w-[680px]): градиент и подпись подсказывают горизонтальный скролл */}
        <div className="relative mt-10">
          <div className="overflow-x-auto rounded-[24px] border border-ink-950/[0.08] bg-white">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr>
                {table.columns.map((column, index) => (
                  <th
                    key={column || 'row-title'}
                    scope="col"
                    className={`border-b border-ink-950/[0.08] px-5 py-4 text-sm font-semibold text-ink-950 ${
                      index === table.highlight ? 'bg-brand-50' : ''
                    }`}
                    style={accents && index > 0 ? { color: accents[index - 1] } : undefined}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row[0]} className="align-top">
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className={`border-b border-ink-950/[0.05] px-5 py-4 text-sm leading-[1.6] ${
                        index === 0 ? 'font-semibold text-ink-900' : 'text-ink-600'
                      } ${index === table.highlight ? 'bg-brand-50/60 font-semibold text-ink-900' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-14 rounded-r-[24px] bg-gradient-to-l from-[#f4f8f6] via-[#f4f8f6]/70 to-transparent md:hidden"
          />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-500 md:hidden">
          Листайте таблицу по горизонтали
          <ArrowRight size={12} aria-hidden />
        </p>
      </Container>
    </section>
  );
}

function MarketplacesPage() {
  const loaded = use(
    Promise.all((['wildberries', 'ozon', 'yandex-market'] as const).map((slug) => loadPage(slug))),
  );
  const platforms = (['wildberries', 'ozon', 'yandex-market'] as const).map((slug, index) => ({
    slug,
    page: loaded[index],
    card: MARKETPLACES.find((item) => item.id === slug)!,
  }));
  const { table } = hubContent.marketplaces;

  return (
    <>
      <PageHero
        eyebrow="Маркетплейсы"
        title="Wildberries, Ozon и Яндекс Маркет — в одном кабинете"
        description="Подключайте магазины разных площадок и работайте с их данными в общей финансовой, товарной и командной модели Sellico."
      />

      {/* Каждая площадка — панель в своих цветах, а не одинаковая карточка с логотипом. */}
      <section className="bg-white py-20 lg:py-28" aria-labelledby="marketplaces-list-title">
        <Container>
          <div className="max-w-3xl">
            <h2 id="marketplaces-list-title" className="text-4xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-6xl">
              Поддерживаемые площадки
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-600">
              Набор доступных данных определяется API площадки и выбранным тарифом Sellico.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {platforms.map(({ slug, page, card }) => {
              const theme = page.theme ?? BRAND_THEME;
              return (
                <article
                  key={slug}
                  id={slug}
                  className="relative isolate overflow-hidden rounded-[30px] p-7 text-white sm:p-10 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10"
                  style={{ background: theme.hero }}
                >
                  <div>
                    <span
                      className="grid h-14 w-14 place-items-center rounded-2xl"
                      style={{ backgroundColor: theme.tile }}
                    >
                      <img src={card.logo} alt="" width={34} height={34} className="h-[34px] w-[34px]" />
                    </span>
                    <h3 className="mt-6 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{card.name}</h3>
                    <p className="mt-4 max-w-xl text-sm leading-[1.75] text-white/75 sm:text-base">{page.lead}</p>
                    <a
                      href={`/${slug}/`}
                      className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-ink-950"
                      style={{ backgroundColor: theme.eyebrow }}
                    >
                      Sellico для {card.name}
                      <ArrowRight size={15} aria-hidden />
                    </a>
                  </div>
                  <ul className="mt-8 grid gap-2.5 lg:mt-0">
                    {page.blocks.slice(0, 4).map((block) => (
                      <li
                        key={block.title}
                        className="rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-sm font-medium text-white/88 backdrop-blur-sm"
                      >
                        {block.title}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <ComparisonTable table={table} accents={PLATFORM_MARKS} />

      <HubExtraSection hub="marketplaces" />
      <FaqSection title="Частые вопросы о площадках" items={hubFaq.marketplaces} />
      <EditorialInfo type="marketplaces" lastmod={PAGE_META.marketplaces.lastmod} />
      <FinalCta />
    </>
  );
}

function HubExtraSection({ hub }: { hub: keyof typeof hubContent }) {
  const { title, lead, sections } = hubContent[hub];

  return (
    <section className="bg-white py-20 lg:py-24" aria-labelledby="hub-extra-title">
      <Container>
        <h2 id="hub-extra-title" className="max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">{lead}</p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[26px] border border-ink-950/[0.08] bg-[#f4f8f6] p-6"
            >
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink-950">{section.title}</h3>
              <p className="mt-4 text-sm leading-[1.7] text-ink-600">{section.text}</p>
              <ul className="mt-5 space-y-2.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-700" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FaqSection({
  title,
  items,
  theme = BRAND_THEME,
}: {
  title: string;
  items: readonly (readonly string[])[];
  theme?: PageTheme;
}) {
  return (
    <section className="bg-white py-20 lg:py-24" aria-labelledby="page-faq-title">
      <Container>
        <h2 id="page-faq-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
          {title}
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map(([question, answer]) => (
            <article
              key={question}
              className="rounded-[24px] border border-ink-950/[0.08] p-6"
              style={{ backgroundColor: theme.soft }}
            >
              <h3 className="text-lg font-semibold text-ink-950">{question}</h3>
              <p className="mt-3 text-sm leading-[1.75] text-ink-600">{answer}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function DirectAnswer({
  answer,
  id,
  accent,
  background = '#ffffff',
}: {
  answer: NonNullable<DetailPage['answer']>;
  id: string;
  accent: string;
  background?: string;
}) {
  const titleId = `${id}-direct-answer-title`;

  return (
    <section
      className="border-y border-ink-950/[0.08] py-14 lg:py-16"
      style={{ backgroundColor: background }}
      aria-labelledby={titleId}
      data-direct-answer
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(180px,.42fr)_minmax(0,1.58fr)] lg:gap-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
            Короткий ответ
          </p>
          <div>
            <h2 id={titleId} className="max-w-4xl text-3xl font-semibold tracking-[-0.045em] text-ink-950 sm:text-4xl">
              {answer.title}
            </h2>
            <p className="mt-5 max-w-4xl text-base leading-[1.8] text-ink-600 sm:text-lg">{answer.text}</p>
            <ul className="mt-8 grid border-t border-ink-950/10 sm:grid-cols-3">
              {answer.points.map((point) => (
                <li
                  key={point}
                  className="border-b border-ink-950/10 py-4 text-sm font-medium leading-relaxed text-ink-800 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Термин глоссария подаётся иначе, чем страница продукта: сначала определение и формула
// крупным планом, затем разбор в одну колонку — читать, а не просматривать плитку карточек.
function GlossaryTermPage({ page, theme, slug }: { page: DetailPage; theme: PageTheme; slug: string }) {
  return (
    <>
      {/* Термину не нужен экран высотой в пол-окна: определение должно быть видно сразу. */}
      <section className="border-b border-ink-950/[0.07] bg-white pb-14 pt-32 lg:pt-36" aria-labelledby="term-title">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-ink-500">
            <a href="/" className="underline-offset-4 hover:text-ink-900 hover:underline">
              Главная
            </a>
            <span aria-hidden className="mx-2">
              /
            </span>
            <a href="/glossary/" className="underline-offset-4 hover:text-ink-900 hover:underline">
              Глоссарий
            </a>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span aria-current="page" className="text-ink-900">
              {page.eyebrow}
            </span>
          </nav>
          <h1
            id="term-title"
            className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-ink-950 sm:text-6xl"
          >
            {page.h1}
          </h1>
          <p className="mt-6 max-w-4xl text-xl font-medium leading-[1.5] tracking-[-0.015em] text-ink-700 sm:text-2xl">
            {page.definition}
          </p>
        </Container>
      </section>

      <section className="bg-white py-14 lg:py-16" aria-labelledby="term-formula-title">
        <Container>
          <h2 id="term-formula-title" className="sr-only">
            Формула
          </h2>

          {page.formula && (
            <div className="mt-10 overflow-hidden rounded-[26px] border border-ink-950/[0.1] bg-[#0b1512]">
              <p className="border-b border-white/10 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-300 sm:px-8">
                Формула
              </p>
              <dl className="divide-y divide-white/[0.07]">
                {page.formula.rows.map((row) => (
                  <div key={row.label} className="gap-2 px-6 py-5 sm:flex sm:items-baseline sm:gap-6 sm:px-8">
                    <dt className="shrink-0 text-sm font-semibold text-white/60 sm:w-[240px]">{row.label}</dt>
                    <dd className="mt-1.5 font-mono text-[15px] leading-relaxed text-white sm:mt-0 sm:text-lg">
                      {row.expression}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="border-t border-white/10 px-6 py-4 text-sm text-white/55 sm:px-8">{page.formula.note}</p>
            </div>
          )}
        </Container>
      </section>

      <MiniCalc slug={slug} />

      <section className="py-16 lg:py-20" style={{ backgroundColor: theme.soft }} aria-labelledby="term-detail-title">
        <Container>
          <h2 id="term-detail-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-4xl">
            {page.blocksTitle}
          </h2>
          <div className="mt-10 max-w-3xl space-y-10">
            {page.blocks.map((block) => (
              <article key={block.title}>
                <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3>
                <p className="mt-3 text-base leading-[1.8] text-ink-600">{block.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-ink-950/[0.08] bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function FeatureHero({ page, signature }: { page: DetailPage; signature: FeatureSignature }) {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-36 text-white lg:pb-28 lg:pt-44" style={{ background: signature.hero }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:42px_42px]" />
      <Container>
        <nav aria-label="Хлебные крошки" className="text-sm text-white/58">
          <a href="/" className="underline-offset-4 hover:text-white hover:underline">Главная</a>
          <span aria-hidden className="mx-2">/</span>
          <a href="/features/" className="underline-offset-4 hover:text-white hover:underline">Возможности</a>
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page">{page.eyebrow}</span>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>
              <span>{signature.number}</span>
              <span className="h-px w-8" style={{ backgroundColor: signature.accent }} aria-hidden />
              <span>{signature.label}</span>
            </div>
            <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{page.h1}</h1>
            <p className="mt-7 max-w-3xl text-base leading-[1.75] text-white/72 sm:text-lg">{page.lead}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить магазин</Button>
              <Button as="a" href="/#demo" variant="dark" size="lg" className="rounded-xl border-white/20">Посмотреть интерфейс</Button>
            </div>
          </div>

          <div className="relative hidden min-h-[280px] overflow-hidden rounded-[28px] border border-white/14 bg-white/[0.055] p-7 lg:block">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <span>Sellico / module</span>
              <span>{signature.number}</span>
            </div>
            <div className="mt-12 grid grid-cols-4 gap-2" aria-hidden>
              {[78, 46, 92, 64, 38, 84, 56, 100].map((height, index) => (
                <span key={`${height}-${index}`} className="relative h-16 overflow-hidden rounded-lg bg-white/[0.06]">
                  <span className="absolute inset-x-0 bottom-0 rounded-lg opacity-75" style={{ height: `${height}%`, backgroundColor: signature.accent }} />
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: signature.accent }} />
              <span className="text-xs text-white/52">Данные → решение → действие</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureItems({ items, signature }: { items: string[]; signature: FeatureSignature }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-950/[0.07] bg-white/75 px-3 py-1.5 text-[13px] font-medium text-ink-700">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: signature.accent }} aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeatureDetailPage({ page, type }: { page: DetailPage; type: string }) {
  const signature = FEATURE_SIGNATURES[type] ?? FEATURE_SIGNATURES['analytics-marketplaces'];

  const heading = (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent === '#F2C96D' ? '#8A6817' : '#176B54' }}>{signature.label}</p>
      <h2 id="feature-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2>
      <p className="mt-5 text-base leading-relaxed text-ink-600">{page.blocksLead}</p>
    </div>
  );

  if (signature.layout === 'ledger') {
    return (
      <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="mt-14 overflow-hidden border-y border-ink-950/15 bg-white/55">
            {page.blocks.map((block, index) => (
              <article key={block.title} className="grid gap-6 border-b border-ink-950/10 px-1 py-8 last:border-0 sm:px-5 lg:grid-cols-[80px_minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-10">
                <span className="font-mono text-sm text-ink-400">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3>
                <div>
                  <p className="text-base leading-[1.8] text-ink-600">{block.text}</p>
                  <FeatureItems items={block.items} signature={signature} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'flow') {
    return (
      <section className="bg-white py-20 lg:py-28" aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="relative mt-16 max-w-5xl lg:ml-auto">
            <div aria-hidden className="absolute bottom-10 left-[23px] top-10 w-px bg-ink-950/12 sm:left-[31px]" />
            <div className="space-y-5">
              {page.blocks.map((block, index) => (
                <article key={block.title} className="relative grid gap-5 pl-16 sm:pl-20 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-14">
                  <span className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full border-4 border-white text-xs font-bold sm:h-16 sm:w-16" style={{ backgroundColor: signature.soft, color: '#304817' }}>{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="pt-2 text-2xl font-semibold tracking-[-0.035em] text-ink-950 sm:pt-4">{block.title}</h3>
                  <div className="rounded-[22px] border border-ink-950/[0.08] p-6 sm:p-7">
                    <p className="text-base leading-[1.8] text-ink-600">{block.text}</p>
                    <FeatureItems items={block.items} signature={signature} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'inbox') {
    return (
      <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="feature-blocks-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">{heading}</div>
            <div className="overflow-hidden rounded-[28px] border border-ink-950/[0.09] bg-white shadow-[0_28px_70px_-55px_rgba(7,35,48,.55)]">
              <div className="flex items-center justify-between border-b border-ink-950/[0.07] px-6 py-4 text-xs font-semibold text-ink-500">
                <span>Единая очередь обращений</span><span>{page.blocks.length} контуров</span>
              </div>
              {page.blocks.map((block, index) => (
                <article key={block.title} className="group border-b border-ink-950/[0.07] px-6 py-7 last:border-0 sm:px-8">
                  <div className="flex gap-5">
                    <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ backgroundColor: signature.soft, color: '#195A76' }}>{index + 1}</span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3>
                      <p className="mt-3 text-sm leading-[1.75] text-ink-600">{block.text}</p>
                      <FeatureItems items={block.items} signature={signature} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'control') {
    return (
      <section className="bg-white py-20 lg:py-28" aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="mt-14 space-y-5">
            {page.blocks.map((block, index) => (
              <article key={block.title} className={`grid overflow-hidden rounded-[26px] border border-ink-950/[0.08] lg:grid-cols-2 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
                <div className="flex min-h-[210px] flex-col justify-between p-7 sm:p-9" style={{ backgroundColor: index % 2 ? '#25130F' : signature.soft, color: index % 2 ? 'white' : '#151915' }}>
                  <span className={`text-xs font-bold uppercase tracking-[0.18em] ${index % 2 ? 'text-white/45' : 'text-ink-400'}`}>Сценарий {String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-12 text-3xl font-semibold tracking-[-0.04em]">{block.title}</h3>
                </div>
                <div className="p-7 sm:p-9">
                  <p className="text-base leading-[1.8] text-ink-600">{block.text}</p>
                  <FeatureItems items={block.items} signature={signature} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'studio') {
    const [primary, ...rest] = page.blocks;
    return (
      <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            {primary && (
              <article className="relative min-h-[430px] overflow-hidden rounded-[30px] bg-[#171329] p-7 text-white sm:p-10">
                <Braces className="absolute -right-6 -top-8 h-48 w-48 text-white/[0.055]" strokeWidth={1} aria-hidden />
                <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>Основной контур</span>
                <h3 className="mt-20 max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{primary.title}</h3>
                <p className="mt-6 max-w-xl text-base leading-[1.8] text-white/65">{primary.text}</p>
                <ul className="mt-8 space-y-3">
                  {primary.items.map((item) => <li key={item} className="flex items-center gap-3 text-sm text-white/82"><Check size={15} style={{ color: signature.accent }} aria-hidden />{item}</li>)}
                </ul>
              </article>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {rest.map((block, index) => (
                <article key={block.title} className={`rounded-[24px] border border-ink-950/[0.08] p-6 sm:p-7 ${index === rest.length - 1 ? 'bg-white' : 'bg-white/65'}`}>
                  <span className="font-mono text-xs text-ink-400">{String(index + 2).padStart(2, '0')}</span>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3>
                  <p className="mt-3 text-sm leading-[1.7] text-ink-600">{block.text}</p>
                  <FeatureItems items={block.items} signature={signature} />
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const isWorkspace = signature.layout === 'workspace';
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="feature-blocks-title">
      <Container>
        {heading}
        <div className={`mt-14 grid gap-4 md:grid-cols-2 ${isWorkspace ? 'lg:grid-cols-6' : 'lg:grid-cols-3'}`}>
          {page.blocks.map((block, index) => {
            const span = isWorkspace
              ? index === 0 || index === page.blocks.length - 1 ? 'lg:col-span-4' : 'lg:col-span-2'
              : index === 0 || index === 4 ? 'lg:col-span-2' : '';
            const dark = (isWorkspace && index === 0) || (!isWorkspace && index === 0);
            return (
              <article key={block.title} className={`${span} min-h-[260px] rounded-[26px] border p-7 sm:p-8 ${dark ? 'border-transparent bg-[#151116] text-white' : 'border-ink-950/[0.08] text-ink-950'}`} style={!dark ? { backgroundColor: index % 2 ? signature.soft : 'white' } : undefined}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs ${dark ? 'text-white/40' : 'text-ink-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                  {isWorkspace ? <Layers3 size={18} style={{ color: signature.accent }} aria-hidden /> : <Database size={18} style={{ color: signature.accent }} aria-hidden />}
                </div>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h3>
                <p className={`mt-4 text-sm leading-[1.75] ${dark ? 'text-white/62' : 'text-ink-600'}`}>{block.text}</p>
                <FeatureItems items={block.items} signature={signature} />
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function MarketplaceArtwork({
  signature,
  className = '',
}: {
  signature: MarketplaceSignature;
  className?: string;
}) {
  const base = `/assets/marketplaces/generated/${signature.art}`;
  return (
    <picture className={className} data-marketplace-art={signature.art}>
      <source
        type="image/avif"
        srcSet={`${base}-640.avif 640w, ${base}-960.avif 960w, ${base}-1536.avif 1536w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px"
      />
      <source
        type="image/webp"
        srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w, ${base}-1536.webp 1536w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px"
      />
      <img
        src={`${base}-960.webp`}
        alt={signature.alt}
        width={1536}
        height={1024}
        decoding="async"
        fetchPriority="high"
        className="h-auto w-full select-none object-contain"
      />
    </picture>
  );
}

function MarketplaceBreadcrumbs({ page, light = true }: { page: DetailPage; light?: boolean }) {
  const color = light ? 'text-white/58' : 'text-ink-500';
  const hover = light ? 'hover:text-white' : 'hover:text-ink-950';
  return (
    <nav aria-label="Хлебные крошки" className={`text-sm ${color}`}>
      <a href="/" className={`underline-offset-4 hover:underline ${hover}`}>Главная</a>
      <span aria-hidden className="mx-2">/</span>
      <a href="/marketplaces/" className={`underline-offset-4 hover:underline ${hover}`}>Маркетплейсы</a>
      <span aria-hidden className="mx-2">/</span>
      <span aria-current="page">{page.eyebrow}</span>
    </nav>
  );
}

function MarketplaceHero({ page, type, signature }: { page: DetailPage; type: string; signature: MarketplaceSignature }) {
  if (type === 'wildberries') {
    return (
      <section className="relative isolate overflow-hidden bg-[#240b31] pb-0 pt-32 text-white lg:pt-40 xl:min-h-[800px] xl:pb-12 xl:pt-32" aria-labelledby="marketplace-title">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_60%,rgba(207,92,255,.18),transparent_33%),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,48px_48px,48px_48px]" />
        <Container>
          <MarketplaceBreadcrumbs page={page} />
          <div className="relative z-10 mt-10 max-w-3xl xl:max-w-[46%]">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>
              {page.logo && <span className="grid h-11 w-11 place-items-center rounded-xl bg-white"><img src={page.logo} alt="" width={28} height={28} className="h-7 w-7" /></span>}
              <span>{signature.label}</span>
            </div>
            <h1 id="marketplace-title" className="mt-7 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-6xl xl:text-[4rem]">{page.h1}</h1>
            <p className="mt-7 max-w-2xl text-base leading-[1.75] text-white/68 sm:text-lg">{page.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить магазин</Button>
              <Button as="a" href="/#demo" variant="dark" size="lg" className="rounded-xl border-white/20">Интерфейс</Button>
            </div>
          </div>
        </Container>
        <figure className="pointer-events-none relative mt-12 h-[300px] sm:mt-16 sm:h-[420px] lg:h-[440px] xl:absolute xl:bottom-[-50px] xl:left-[52%] xl:right-[-4%] xl:top-[140px] xl:mt-0 xl:h-auto">
          <div aria-hidden className="absolute bottom-[12%] left-1/2 h-[58%] w-[70%] -translate-x-1/2 rounded-full bg-[#C264E7]/12 blur-[90px]" />
          <MarketplaceArtwork signature={signature} className="absolute left-[-8%] top-0 block w-[116%] max-w-none drop-shadow-[0_36px_55px_rgba(9,0,13,.38)] sm:left-[-3%] sm:w-[106%] xl:bottom-[-11%] xl:left-0 xl:top-auto xl:w-[112%]" />
          <figcaption className="absolute bottom-7 left-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/46 sm:left-12 xl:bottom-24 xl:left-[8%]">
            <span className="h-px w-9 bg-[#D98DF7]/70" aria-hidden />
            Товары → остатки → поставки → экономика
          </figcaption>
        </figure>
      </section>
    );
  }

  if (type === 'ozon') {
    return (
      <section className="relative isolate overflow-hidden bg-[#061B3F] pb-0 pt-32 text-white lg:pt-40 xl:min-h-[800px] xl:pb-12 xl:pt-32" aria-labelledby="marketplace-title">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_52%,rgba(50,117,255,.2),transparent_34%),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,42px_42px,42px_42px]" />
        <Container>
          <MarketplaceBreadcrumbs page={page} />
          <div className="relative z-10 mt-10 max-w-3xl xl:ml-auto xl:max-w-[43%]">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>
              {page.logo && <span className="grid h-11 w-11 place-items-center rounded-xl bg-white"><img src={page.logo} alt="" width={28} height={28} className="h-7 w-7" /></span>}
              <span>{signature.label}</span>
            </div>
            <h1 id="marketplace-title" className="mt-7 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-6xl xl:text-[4rem]">{page.h1}</h1>
            <p className="mt-7 text-base leading-[1.75] text-white/68 sm:text-lg">{page.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить Ozon</Button>
              <Button as="a" href="/#demo" variant="dark" size="lg" className="rounded-xl border-white/20">Интерфейс</Button>
            </div>
          </div>
        </Container>
        <figure className="pointer-events-none relative mt-12 h-[300px] sm:mt-16 sm:h-[420px] lg:h-[440px] xl:absolute xl:bottom-[-50px] xl:left-[-4%] xl:right-[55%] xl:top-[140px] xl:mt-0 xl:h-auto">
          <div aria-hidden className="absolute bottom-[14%] left-[46%] h-[58%] w-[68%] -translate-x-1/2 rounded-full bg-[#2F66DA]/14 blur-[100px]" />
          <MarketplaceArtwork signature={signature} className="absolute left-[-8%] top-0 block w-[116%] max-w-none drop-shadow-[0_34px_52px_rgba(0,8,31,.45)] sm:left-[-3%] sm:w-[106%] xl:bottom-[-6%] xl:left-auto xl:right-0 xl:top-auto xl:w-[112%]" />
          <figcaption className="absolute left-8 top-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/48 sm:left-12 xl:left-[18%] xl:top-24">
            <Database size={14} style={{ color: signature.accent }} aria-hidden />
            FBO + FBS в одной модели
          </figcaption>
        </figure>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#FFF6D5] pb-0 pt-32 text-[#241A06] lg:pt-40 xl:min-h-[800px] xl:pb-12 xl:pt-32" aria-labelledby="marketplace-title">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_68%,rgba(255,202,43,.25),transparent_38%),linear-gradient(rgba(82,55,0,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(82,55,0,.045)_1px,transparent_1px)] [background-size:auto,54px_54px,54px_54px]" />
      <Container>
        <MarketplaceBreadcrumbs page={page} light={false} />
        <div className="relative z-10 mx-auto mt-10 max-w-5xl text-center xl:mx-0 xl:max-w-[46%] xl:text-left">
          <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#805B00]">
            {page.logo && <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#8B6500]/10 bg-white"><img src={page.logo} alt="" width={28} height={28} className="h-7 w-7" /></span>}
            <span>{signature.label}</span>
          </div>
          <h1 id="marketplace-title" className="mt-7 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl xl:text-6xl 2xl:text-7xl">{page.h1}</h1>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-[1.75] text-[#5C4B27] sm:text-lg">{page.lead}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row xl:justify-start">
            <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить магазин</Button>
            <Button as="a" href="/#demo" variant="outline" size="lg" className="rounded-xl border-[#241A06]/12 bg-white/70 !text-[#241A06]">Интерфейс</Button>
          </div>
        </div>
      </Container>
      <figure className="pointer-events-none relative mt-12 h-[320px] sm:mt-16 sm:h-[430px] lg:h-[440px] xl:absolute xl:bottom-[-50px] xl:left-[52%] xl:right-[-4%] xl:top-[140px] xl:mt-0 xl:h-auto">
        <div aria-hidden className="absolute bottom-[12%] left-1/2 h-[55%] w-[64%] -translate-x-1/2 rounded-full bg-[#FFCB2F]/18 blur-[100px]" />
        <MarketplaceArtwork signature={signature} className="absolute left-[-8%] top-0 block w-[116%] max-w-none drop-shadow-[0_34px_52px_rgba(90,61,0,.2)] sm:left-[-3%] sm:w-[106%] xl:bottom-[-10%] xl:left-0 xl:top-auto xl:w-[112%]" />
        <figcaption className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] text-[#6D5100]/58 xl:bottom-24">
          <span className="h-px w-9 bg-[#A77B00]/45" aria-hidden />
          Магазин внутри общей картины продаж
          <span className="h-px w-9 bg-[#A77B00]/45" aria-hidden />
        </figcaption>
      </figure>
    </section>
  );
}

function MarketplaceDetailPage({ page, type }: { page: DetailPage; type: string }) {
  const signature = MARKETPLACE_SIGNATURES[type] ?? MARKETPLACE_SIGNATURES.ozon;

  if (type === 'ozon') {
    return (
      <>
        <MarketplaceHero page={page} type={type} signature={signature} />
        {page.answer && <DirectAnswer answer={page.answer} id={type} accent={signature.accent} />}
        <section className="bg-white py-20 lg:py-28" aria-labelledby="marketplace-blocks-title">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[.58fr_1.42fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1D4ED8]">Система Ozon</p>
                <h2 id="marketplace-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2>
                <p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p>
              </div>
              <div className="border-t border-ink-950/14">
                {page.blocks.map((block, index) => (
                  <article key={block.title} className="grid gap-5 border-b border-ink-950/12 py-9 sm:grid-cols-[70px_1fr]">
                    <span className="font-mono text-xl text-[#2F66DA]">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3>
                      <p className="mt-4 text-base leading-[1.8] text-ink-600">{block.text}</p>
                      <ul className="mt-6 grid gap-2 sm:grid-cols-3">{block.items.map((item) => <li key={item} className="border-l-2 border-[#AFC9FF] pl-3 text-sm text-ink-700">{item}</li>)}</ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </>
    );
  }

  if (type === 'wildberries') {
    return (
      <>
        <MarketplaceHero page={page} type={type} signature={signature} />
        {page.answer && <DirectAnswer answer={page.answer} id={type} accent={signature.accent} background={signature.soft} />}
        <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="marketplace-blocks-title">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A2FA8]">Рабочие контуры WB</p><h2 id="marketplace-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2></div>
              <p className="max-w-2xl text-base leading-[1.75] text-ink-600 lg:justify-self-end">{page.blocksLead}</p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {page.blocks.map((block, index) => {
                const span = index === 0 || index === 3 ? 'lg:col-span-4' : index === 6 ? 'lg:col-span-6' : 'lg:col-span-2';
                const dark = index === 0 || index === 6;
                return (
                  <article key={block.title} className={`${span} min-h-[270px] overflow-hidden rounded-[30px] border p-7 sm:p-9 ${dark ? 'border-transparent bg-[#2D1039] text-white' : 'border-[#3B1648]/10 bg-white text-ink-950'}`}>
                    <div className="flex items-center justify-between"><span className={`font-mono text-xs ${dark ? 'text-white/40' : 'text-ink-400'}`}>{String(index + 1).padStart(2, '0')}</span><span className="h-2.5 w-2.5 rounded-full bg-[#C264E7]" aria-hidden /></div>
                    <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h3>
                    <p className={`mt-4 text-sm leading-[1.8] ${dark ? 'text-white/65' : 'text-ink-600'}`}>{block.text}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">{block.items.map((item) => <li key={item} className={`rounded-full px-3 py-1.5 text-xs font-medium ${dark ? 'bg-white/10 text-white/78' : 'bg-[#F7EEFA] text-[#5F2A73]'}`}>{item}</li>)}</ul>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <MarketplaceHero page={page} type={type} signature={signature} />
      {page.answer && <DirectAnswer answer={page.answer} id={type} accent="#8A6200" background="#FFFDF6" />}
      <section className="bg-[#FFFDF6] py-20 lg:py-28" aria-labelledby="marketplace-blocks-title">
        <Container>
          <div className="mx-auto max-w-4xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A6200]">Карта процессов</p><h2 id="marketplace-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mx-auto mt-5 max-w-3xl text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.blocks.map((block, index) => {
              const featured = index === 4;
              const wide = index === 0 || index === 6;
              return (
                <article key={block.title} className={`${featured ? 'lg:col-span-2 lg:row-span-2 bg-[#28200F] text-white' : wide ? 'lg:col-span-2' : ''} rounded-[28px] border border-[#5E4600]/10 p-7 sm:p-8 ${featured ? '' : index % 2 ? 'bg-[#FFF3BD] text-ink-950' : 'bg-white text-ink-950'}`}>
                  <div className="flex items-center justify-between"><span className={`font-mono text-xs ${featured ? 'text-white/42' : 'text-[#9B7611]'}`}>{String(index + 1).padStart(2, '0')}</span>{featured ? <Layers3 size={18} className="text-[#FFD34D]" aria-hidden /> : <span className="h-2.5 w-2.5 rounded-sm bg-[#FFD34D]" aria-hidden />}</div>
                  <h3 className={`mt-9 font-semibold tracking-[-0.035em] ${featured ? 'max-w-xl text-3xl sm:text-4xl' : 'text-2xl'}`}>{block.title}</h3>
                  <p className={`mt-4 text-sm leading-[1.8] ${featured ? 'max-w-2xl text-white/66' : 'text-ink-600'}`}>{block.text}</p>
                  <ul className={`mt-6 ${featured ? 'grid gap-3 sm:grid-cols-3' : 'flex flex-wrap gap-2'}`}>{block.items.map((item) => <li key={item} className={featured ? 'border-t border-white/12 pt-3 text-sm text-white/78' : 'rounded-full border border-[#6C5100]/10 bg-white/65 px-3 py-1.5 text-xs font-medium text-[#6C5100]'}>{item}</li>)}</ul>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}

function AuthorProfilePage({ page }: { page: DetailPage }) {
  const [product, experience, expertise, feedback] = page.blocks;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#071712] pb-20 pt-32 text-white lg:pb-28 lg:pt-40" aria-labelledby="author-title">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div aria-hidden className="absolute -right-24 top-20 -z-10 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-white/55">
            <a href="/" className="underline-offset-4 hover:text-white hover:underline">Главная</a><span aria-hidden className="mx-2">/</span>
            <a href="/about/" className="underline-offset-4 hover:text-white hover:underline">О Sellico</a><span aria-hidden className="mx-2">/</span>
            <span aria-current="page">Данил Зубарев</span>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/18 bg-emerald-200/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                <Code2 size={14} aria-hidden /> Разработчик Sellico
              </div>
              <h1 id="author-title" className="mt-7 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{page.h1}</h1>
              <p className="mt-7 max-w-3xl text-lg leading-[1.75] text-white/70 sm:text-xl">{page.lead}</p>
              <a href="mailto:hello@sellico.ru" className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 underline-offset-4 hover:underline">Обсудить продукт <ArrowRight size={15} aria-hidden /></a>
            </div>

            <aside className="relative overflow-hidden rounded-[32px_32px_8px_32px] border border-white/13 bg-white/[0.055] p-7 sm:p-9" aria-label="Опыт в электронной коммерции">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/38"><span>e-commerce</span><span>experience</span></div>
              <p className="mt-8 text-[clamp(6rem,12vw,9.5rem)] font-semibold leading-none tracking-[-0.09em] text-emerald-200">12+</p>
              <p className="mt-1 text-lg font-medium text-white">лет практического опыта</p>
              <div className="mt-8 grid grid-cols-3 gap-2" aria-hidden>
                {['product', 'data', 'team'].map((label) => <span key={label} className="rounded-lg border border-white/10 bg-black/10 px-2 py-3 text-center font-mono text-[10px] text-white/45">{label}</span>)}
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-[#eef4ef] py-20 lg:py-28" aria-labelledby="author-work-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-800">Профиль</p>
              <h2 id="author-work-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2>
              <p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p>
            </div>
            {product && (
              <article className="relative overflow-hidden rounded-[30px] bg-[#0d2d23] p-7 text-white sm:p-10">
                <Code2 className="absolute -right-5 -top-9 h-44 w-44 text-white/[0.055]" strokeWidth={1} aria-hidden />
                <span className="font-mono text-xs text-emerald-200/65">01 / build</span>
                <h3 className="mt-12 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{product.title}</h3>
                <p className="mt-5 max-w-2xl text-base leading-[1.8] text-white/65">{product.text}</p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                  {product.items.map((item) => <li key={item} className="rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm text-white/80">{item}</li>)}
                </ul>
              </article>
            )}
          </div>

          {experience && (
            <article className="mt-5 grid gap-8 rounded-[30px] border border-ink-950/[0.08] bg-white p-7 sm:p-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-14">
              <div><span className="font-mono text-xs text-ink-400">02 / experience</span><h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-ink-950">{experience.title}</h3></div>
              <div><p className="text-base leading-[1.8] text-ink-600">{experience.text}</p><ul className="mt-6 flex flex-wrap gap-2">{experience.items.map((item) => <li key={item} className="rounded-full bg-[#eef4ef] px-4 py-2 text-sm font-medium text-ink-700">{item}</li>)}</ul></div>
            </article>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            {expertise && (
              <article className="rounded-[30px] border border-ink-950/[0.08] bg-white p-7 sm:p-9">
                <span className="font-mono text-xs text-ink-400">03 / focus</span><h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-ink-950">{expertise.title}</h3><p className="mt-4 text-sm leading-[1.8] text-ink-600">{expertise.text}</p>
                <ul className="mt-7 grid gap-2 sm:grid-cols-2">{expertise.items.map((item) => <li key={item} className="flex items-center gap-2 border-t border-ink-950/[0.08] pt-3 text-sm text-ink-700"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />{item}</li>)}</ul>
              </article>
            )}
            {feedback && (
              <article className="rounded-[30px_30px_30px_8px] bg-[#d9ece5] p-7 sm:p-9">
                <span className="font-mono text-xs text-ink-400">04 / contact</span><h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-ink-950">{feedback.title}</h3><p className="mt-4 text-sm leading-[1.8] text-ink-600">{feedback.text}</p>
                <a href="mailto:hello@sellico.ru" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-900 underline-offset-4 hover:underline">hello@sellico.ru <ArrowRight size={14} aria-hidden /></a>
              </article>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

function CasesEvidencePage({ page }: { page: DetailPage }) {
  const [status, ...rest] = page.blocks;
  const scenarios = rest.slice(0, 3);
  const [standard, submit] = rest.slice(3);

  return (
    <>
      <section className="border-b border-[#d8d2c4] bg-[#f3efe5] pb-20 pt-32 lg:pb-24 lg:pt-40" aria-labelledby="cases-title">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-ink-500"><a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">Кейсы и результаты</span></nav>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#805f1e]">Публичный журнал доказательств</p>
              <h1 id="cases-title" className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">{page.h1}</h1>
              <p className="mt-7 max-w-3xl text-lg leading-[1.75] text-ink-600">{page.lead}</p>
            </div>
            <div className="border-l border-ink-950/15 pl-7">
              <p className="text-[7rem] font-semibold leading-none tracking-[-0.09em] text-[#b58a31]">0</p>
              <p className="mt-2 max-w-[230px] text-sm font-semibold leading-relaxed text-ink-800">подтверждённых клиентских кейсов на 25 августа 2026 года</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 lg:py-28" aria-labelledby="cases-process-title">
        <Container>
          <div className="max-w-3xl"><h2 id="cases-process-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div>
          {status && (
            <article className="mt-14 grid gap-8 rounded-[30px] bg-[#15130f] p-7 text-white sm:p-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
              <div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e5bf6b]"><FileCheck2 size={15} aria-hidden /> Текущий статус</span><h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">{status.title}</h3></div>
              <div><p className="text-base leading-[1.8] text-white/65">{status.text}</p><ul className="mt-6 grid gap-3 sm:grid-cols-3">{status.items.map((item) => <li key={item} className="border-t border-white/12 pt-3 text-sm text-white/78">{item}</li>)}</ul></div>
            </article>
          )}

          <div className="mt-16">
            <div className="flex items-end justify-between gap-6 border-b border-ink-950/15 pb-5"><h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">Модельные сценарии</h3><span className="hidden font-mono text-xs text-ink-400 sm:block">НЕ ЯВЛЯЮТСЯ ОТЗЫВАМИ</span></div>
            {scenarios.map((block, index) => (
              <article key={block.title} className="grid gap-6 border-b border-ink-950/10 py-9 lg:grid-cols-[100px_minmax(0,.78fr)_minmax(0,1.22fr)] lg:gap-10">
                <span className="font-mono text-3xl text-[#b58a31]">{String(index + 1).padStart(2, '0')}</span><h4 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h4><div><p className="text-base leading-[1.8] text-ink-600">{block.text}</p><ul className="mt-5 flex flex-wrap gap-2">{block.items.map((item) => <li key={item} className="rounded-full bg-[#f3efe5] px-3.5 py-2 text-[13px] font-medium text-ink-700">{item}</li>)}</ul></div>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            {standard && <article className="rounded-[28px] bg-[#f3efe5] p-7 sm:p-9"><p className="font-mono text-xs text-[#805f1e]">STANDARD / 01</p><h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-ink-950">{standard.title}</h3><p className="mt-4 text-sm leading-[1.8] text-ink-600">{standard.text}</p><ol className="mt-7 grid gap-3 sm:grid-cols-2">{standard.items.map((item, index) => <li key={item} className="flex gap-3 border-t border-ink-950/10 pt-3 text-sm text-ink-700"><span className="font-mono text-[#b58a31]">{index + 1}</span>{item}</li>)}</ol></article>}
            {submit && <article className="rounded-[28px_28px_8px_28px] bg-[#b58a31] p-7 text-white sm:p-9"><p className="font-mono text-xs text-white/60">SUBMIT / CASE</p><h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em]">{submit.title}</h3><p className="mt-4 text-sm leading-[1.8] text-white/75">{submit.text}</p><a href="mailto:hello@sellico.ru?subject=Кейс%20Sellico" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">Предложить кейс <ArrowRight size={14} aria-hidden /></a></article>}
          </div>
        </Container>
      </section>
    </>
  );
}

function AboutCompanyPage({ page }: { page: DetailPage }) {
  return (
    <>
      <section className="relative overflow-hidden bg-white pb-20 pt-32 lg:pb-28 lg:pt-40" aria-labelledby="about-title">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-ink-500"><a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">О Sellico</span></nav>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-brand-800">Продукт / компания / редакция</p>
          <h1 id="about-title" className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-ink-950 sm:text-6xl lg:text-8xl">{page.h1}</h1>
          <div className="mt-10 grid gap-8 border-t border-ink-950/12 pt-8 lg:grid-cols-[1fr_1fr]"><p className="max-w-2xl text-lg leading-[1.75] text-ink-600">{page.lead}</p><div className="grid grid-cols-3 gap-3"><span className="rounded-2xl bg-[#efe7ff] p-4 text-sm font-semibold text-ink-800">WB</span><span className="rounded-2xl bg-[#e9f1ff] p-4 text-sm font-semibold text-ink-800">Ozon</span><span className="rounded-2xl bg-[#fff2c5] p-4 text-sm font-semibold text-ink-800">Market</span></div></div>
        </Container>
      </section>
      <section className="bg-[#edf3ef] py-20 lg:py-28" aria-labelledby="about-facts-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.62fr_1.38fr] lg:gap-20"><div><h2 id="about-facts-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div><div className="grid gap-5 sm:grid-cols-2">{page.blocks.map((block, index) => <article key={block.title} className={`${index === 0 || index === 3 ? 'sm:col-span-2' : ''} rounded-[28px] p-7 sm:p-9 ${index === 0 ? 'bg-[#0d3d2e] text-white' : index === 3 ? 'bg-[#181d1a] text-white' : 'border border-ink-950/[0.08] bg-white text-ink-950'}`}><span className={`font-mono text-xs ${index === 0 || index === 3 ? 'text-white/45' : 'text-ink-400'}`}>{String(index + 1).padStart(2, '0')}</span><h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h3><p className={`mt-4 text-sm leading-[1.8] ${index === 0 || index === 3 ? 'text-white/65' : 'text-ink-600'}`}>{block.text}</p><ul className="mt-6 flex flex-wrap gap-2">{block.items.map((item) => <li key={item} className={`rounded-full px-3 py-1.5 text-xs font-medium ${index === 0 || index === 3 ? 'bg-white/10 text-white/78' : 'bg-[#edf3ef] text-ink-700'}`}>{item}</li>)}</ul></article>)}</div></div>
        </Container>
      </section>
    </>
  );
}

function MethodologyProtocolPage({ page }: { page: DetailPage }) {
  return (
    <>
      <section className="bg-[#e9f0ec] pb-20 pt-32 lg:pb-24 lg:pt-40" aria-labelledby="method-title"><Container><nav aria-label="Хлебные крошки" className="text-sm text-ink-500"><a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">Методология</span></nav><div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end"><div><div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-800"><SearchCheck size={15} aria-hidden /> Редакционный протокол</div><h1 id="method-title" className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">{page.h1}</h1><p className="mt-7 max-w-3xl text-lg leading-[1.75] text-ink-600">{page.lead}</p></div><div className="rounded-[26px] border border-ink-950/10 bg-white/60 p-6"><div className="flex items-center justify-between"><FileCheck2 size={23} className="text-brand-800" aria-hidden /><span className="font-mono text-xs text-ink-400">v.2026.08</span></div><p className="mt-9 text-sm font-semibold text-ink-900">Проверяемость по умолчанию</p><p className="mt-2 text-xs leading-relaxed text-ink-500">Факты, формулы, даты, источники и ограничения.</p></div></div></Container></section>
      <section className="bg-white py-20 lg:py-28" aria-labelledby="protocol-title"><Container><div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-20"><div className="lg:sticky lg:top-28 lg:self-start"><h2 id="protocol-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div><ol className="border-t border-ink-950/14">{page.blocks.map((block, index) => <li key={block.title} className="grid gap-5 border-b border-ink-950/12 py-9 sm:grid-cols-[70px_1fr]"><span className="font-mono text-xl text-brand-700">{String(index + 1).padStart(2, '0')}</span><article><h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3><p className="mt-4 text-base leading-[1.8] text-ink-600">{block.text}</p><ul className="mt-6 grid gap-2 sm:grid-cols-3">{block.items.map((item) => <li key={item} className="border-l-2 border-brand-300 pl-3 text-sm text-ink-700">{item}</li>)}</ul></article></li>)}</ol></div></Container></section>
    </>
  );
}

function DirectoryHubPage({ page, type }: { page: DetailPage; type: string }) {
  const isGlossary = type === 'glossary';
  if (isGlossary) {
    return (
      <>
        <section className="border-b border-ink-950/[0.08] bg-white pb-16 pt-32 lg:pt-40" aria-labelledby="directory-title"><Container><nav aria-label="Хлебные крошки" className="text-sm text-ink-500"><a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">Глоссарий</span></nav><p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-brand-800">Справочник / 09 терминов</p><h1 id="directory-title" className="mt-5 max-w-5xl text-4xl font-semibold tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">{page.h1}</h1><p className="mt-7 max-w-3xl text-lg leading-[1.75] text-ink-600">{page.lead}</p></Container></section>
        <section className="bg-[#f4f6f3] py-16 lg:py-20" aria-labelledby="directory-list-title"><Container><div className="flex items-end justify-between gap-8"><div><h2 id="directory-list-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-4 max-w-2xl text-base text-ink-600">{page.blocksLead}</p></div><SearchCheck className="hidden text-brand-700 sm:block" size={38} strokeWidth={1.4} aria-hidden /></div><div className="mt-12 border-t border-ink-950/15">{page.blocks.map((block, index) => <a key={block.title} href={block.href} className="group grid gap-4 border-b border-ink-950/12 py-7 transition-colors hover:bg-white/75 sm:px-4 lg:grid-cols-[70px_.55fr_1fr_auto] lg:items-center lg:gap-8"><span className="font-mono text-xs text-ink-400">{String(index + 1).padStart(2, '0')}</span><h3 className="text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3><p className="text-sm leading-[1.65] text-ink-600">{block.text}</p><ArrowRight size={16} className="text-brand-700 transition-transform group-hover:translate-x-1" aria-hidden /></a>)}</div></Container></section>
      </>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#0a1814] pb-20 pt-32 text-white lg:pb-24 lg:pt-40" aria-labelledby="calculators-title"><div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:38px_38px]" /><Container className="relative"><nav aria-label="Хлебные крошки" className="text-sm text-white/50"><a href="/" className="underline-offset-4 hover:text-white hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">Калькуляторы</span></nav><div className="mt-10 grid gap-10 lg:grid-cols-[1fr_260px] lg:items-end"><div><div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-200"><Gauge size={15} aria-hidden /> Инструменты расчёта</div><h1 id="calculators-title" className="mt-6 max-w-5xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">{page.h1}</h1><p className="mt-7 max-w-3xl text-lg leading-[1.75] text-white/66">{page.lead}</p></div><div className="grid grid-cols-2 gap-2">{['₽', '%', 'SKU', 'day'].map((unit) => <span key={unit} className="grid h-20 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] font-mono text-sm text-emerald-200">{unit}</span>)}</div></div></Container></section>
      <section className="bg-[#edf4f0] py-20 lg:py-28" aria-labelledby="tools-list-title"><Container><div className="grid gap-12 lg:grid-cols-[.58fr_1.42fr] lg:gap-20"><div><h2 id="tools-list-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div><div className="grid gap-4">{page.blocks.map((block, index) => <a key={block.title} href={block.href} className="group grid gap-5 rounded-[25px] border border-ink-950/[0.08] bg-white p-6 transition-transform hover:-translate-y-0.5 sm:p-8 lg:grid-cols-[58px_1fr_auto] lg:items-start"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#0d3d2e] font-mono text-sm text-emerald-200">{String(index + 1).padStart(2, '0')}</span><div><h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3><p className="mt-3 text-sm leading-[1.75] text-ink-600">{block.text}</p><ul className="mt-5 flex flex-wrap gap-2">{block.items.map((item) => <li key={item} className="rounded-lg bg-[#edf4f0] px-3 py-1.5 text-xs font-medium text-ink-700">{item}</li>)}</ul></div><ArrowRight size={18} className="text-brand-700 transition-transform group-hover:translate-x-1" aria-hidden /></a>)}</div></div></Container></section>
    </>
  );
}

// На странице контактов главное — способы связи, а не текст о них: каналы кликабельны,
// реквизиты вынесены отдельным блоком.
function ContactsPage({ page }: { page: DetailPage }) {
  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="contacts-title">
      <Container>
        <h2 id="contacts-title" className="sr-only">
          Способы связи
        </h2>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {page.actions?.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="group flex flex-col justify-between rounded-[26px] border border-ink-950/[0.08] bg-[#f4f8f6] p-6 transition-colors hover:border-brand-700/30 hover:bg-brand-50 sm:p-7"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">{action.label}</p>
                  <p className="mt-4 break-all text-xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-2xl">
                    {action.value}
                  </p>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-ink-600">{action.note}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800">
                  Написать
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            ))}
          </div>

          {page.requisites && (
            <div className="rounded-[26px] border border-ink-950/[0.08] bg-[#0b1512] p-6 text-white sm:p-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
                {page.requisites.title}
              </h3>
              <dl className="mt-6 space-y-4">
                {page.requisites.rows.map(([label, value]) => (
                  <div key={label} className="border-b border-white/[0.08] pb-4 last:border-0 last:pb-0">
                    <dt className="text-xs text-white/45">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-xs leading-relaxed text-white/45">{page.requisites.note}</p>
            </div>
          )}
        </div>

        <div className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-4xl">{page.blocksTitle}</h2>
          <div className="mt-8 grid gap-x-12 gap-y-9 md:grid-cols-2">
            {page.blocks.map((block) => (
              <article key={block.title}>
                <h3 className="text-lg font-semibold text-ink-950">{block.title}</h3>
                <p className="mt-3 text-sm leading-[1.75] text-ink-600">{block.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function DetailPageView({ type }: { type: DetailPageType }) {
  const page = use(loadPage(type));
  const Icon = page.icon ? DETAIL_ICONS[page.icon] : null;
  const theme = page.theme ?? BRAND_THEME;
  const hasCustomHero = ['author', 'cases', 'about', 'methodology', 'feature', 'marketplace', 'glossary-hub', 'calculators-hub'].includes(page.kind);

  return (
    <>
      {page.kind !== 'glossary' && !hasCustomHero && (
        <PageHero
          eyebrow={page.eyebrow}
          title={page.h1}
          description={page.lead}
          parent={page.parent}
          theme={theme}
        />
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
          {page.demo && <ProductScreen demo={page.demo} />}
        </>
      )}
      {page.kind === 'glossary' ? (
        <GlossaryTermPage page={page} theme={theme} slug={type} />
      ) : page.kind === 'author' ? (
        <AuthorProfilePage page={page} />
      ) : page.kind === 'cases' ? (
        <CasesEvidencePage page={page} />
      ) : page.kind === 'about' ? (
        <AboutCompanyPage page={page} />
      ) : page.kind === 'methodology' ? (
        <MethodologyProtocolPage page={page} />
      ) : page.kind === 'glossary-hub' || page.kind === 'calculators-hub' ? (
        <DirectoryHubPage page={page} type={type} />
      ) : page.kind === 'marketplace' ? (
        <MarketplaceDetailPage page={page} type={type} />
      ) : page.kind === 'contacts' ? (
        <ContactsPage page={page} />
      ) : page.kind === 'feature' ? (
        <>
          <FeatureHero page={page} signature={FEATURE_SIGNATURES[type] ?? FEATURE_SIGNATURES['analytics-marketplaces']} />
          {page.answer && (
            <DirectAnswer
              answer={page.answer}
              id={type}
              accent={FEATURE_SIGNATURES[type]?.accent ?? FEATURE_SIGNATURES['analytics-marketplaces'].accent}
              background={FEATURE_SIGNATURES[type]?.soft ?? FEATURE_SIGNATURES['analytics-marketplaces'].soft}
            />
          )}
          <FeatureDetailPage page={page} type={type} />
          {page.demo && <ProductScreen demo={page.demo} />}
        </>
      ) : (
      <section className="py-20 lg:py-28" style={{ backgroundColor: theme.soft }} aria-labelledby="marketplace-blocks-title">
        <Container>
          <div className="flex max-w-3xl items-center gap-5">
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
              style={{ backgroundColor: theme.tile }}
            >
              {page.logo ? (
                <img src={page.logo} alt="" width={40} height={40} className="h-10 w-10" />
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
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">
            {page.blocksLead}
          </p>
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
      )}
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
          который идёт в startTransition (main.tsx), — до загрузки на экране остаётся пререндер.
          Лоадер здесь на мгновение укорачивал страницу, и подвал прыгал (CLS 0.3). */}
      {type === 'features' ? (
        <FeaturesPage />
      ) : type === 'pricing' ? (
        <PricingPage />
      ) : type === 'marketplaces' ? (
        <MarketplacesPage />
      ) : (
        <DetailPageView type={type} />
      )}
    </main>
  );
}
