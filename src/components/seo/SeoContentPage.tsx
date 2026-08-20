import { lazy, Suspense, use, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  Calculator,
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
import { MiniCalc } from '@/components/seo/MiniCalc';

// Индекс страниц (заголовки и описания) грузится сразу — он маленький. Тело страницы
// приезжает отдельным чанком: иначе читатель одного термина качает контент всех 25 страниц.
export type DetailPageType = keyof typeof pagesIndex;
export type SeoPageType = 'features' | 'pricing' | 'marketplaces' | DetailPageType;

type DetailPage = {
  kind: string;
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

const PAGE_META: Record<string, { title: string; description: string; canonical: string }> = {
  ...Object.fromEntries(
    Object.entries(pagesIndex).map(([slug, page]) => [
      slug,
      { title: page.title, description: page.description, canonical: `https://sellico.ru/${slug}/` },
    ]),
  ),
  features: {
    title: 'Возможности Sellico — финансы, поставки, SEO и команда',
    description:
      'Возможности Sellico для продавцов маркетплейсов: финансы и юнит-экономика, остатки, поставки, реклама, SEO, отзывы, заявки и задачи команды.',
    canonical: 'https://sellico.ru/features/',
  },
  pricing: {
    title: 'Тарифы Sellico — цены и лимиты для продавцов маркетплейсов',
    description:
      'Тарифы Sellico от 3 000 ₽ в месяц. Сравните лимиты магазинов, пользователей, товаров, SEO, отзывов и автопланирования поставок.',
    canonical: 'https://sellico.ru/pricing/',
  },
  marketplaces: {
    title: 'Sellico для Wildberries, Ozon и Яндекс Маркета',
    description:
      'Единое рабочее пространство Sellico для магазинов на Wildberries, Ozon и Яндекс Маркете: финансы, остатки, реклама, SEO и команда.',
    canonical: 'https://sellico.ru/marketplaces/',
  },
};

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
                <Button
                  as="a"
                  href={plan.name === 'Enterprise' ? '/?enterprise=1#pricing' : REGISTER_URL}
                  variant={plan.featured ? 'primary' : 'outline'}
                  className="mt-8 w-full rounded-xl"
                >
                  {plan.name === 'Enterprise' ? 'Обсудить внедрение' : `Выбрать ${plan.name}`}
                </Button>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-[24px] border border-ink-950/[0.08] bg-white p-6 text-sm leading-relaxed text-ink-600">
            <h2 className="text-xl font-semibold text-ink-950">Как выбрать тариф</h2>
            <p className="mt-3">
              Ориентируйтесь на количество подключаемых API, пользователей и товаров. Для сложного контура данных и индивидуальной настройки используйте Enterprise — заявка откроется через кнопку «Обсудить внедрение» на главной странице.
            </p>
          </div>
        </Container>
      </section>
      <ComparisonTable table={hubContent.pricing.table} />
      <HubExtraSection hub="pricing" />
      <FaqSection title="Частые вопросы о тарифах" items={hubFaq.pricing} />
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
        <div className="mt-10 overflow-x-auto rounded-[24px] border border-ink-950/[0.08] bg-white">
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

// Страницы функций читаются сверху вниз чередующимися рядами: слева тезис, справа детали.
// Плитка одинаковых карточек делала шесть таких страниц неразличимыми.
function FeatureDetailPage({ page }: { page: DetailPage }) {
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="feature-blocks-title">
      <Container>
        <div className="max-w-3xl">
          <h2 id="feature-blocks-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
            {page.blocksTitle}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-600">{page.blocksLead}</p>
        </div>

        <div className="mt-14 space-y-px overflow-hidden rounded-[28px] border border-ink-950/[0.08] bg-ink-950/[0.06]">
          {page.blocks.map((block, index) => (
            <article
              key={block.title}
              className="grid gap-6 bg-white px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12"
            >
              <div className="flex gap-5">
                <span className="mt-1 text-sm font-bold tabular-nums text-brand-700/60">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-[28px]">
                  {block.title}
                </h3>
              </div>
              <div>
                <p className="text-base leading-[1.8] text-ink-600">{block.text}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#f4f8f6] px-3 py-1.5 text-[13px] font-medium text-ink-700"
                    >
                      <Check size={13} className="shrink-0 text-brand-700" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
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

  return (
    <>
      {page.kind !== 'glossary' && (
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
          {page.calc ? <SimpleCalculator spec={page.calc} /> : <UnitEconomicsCalculator />}
          {page.demo && <ProductScreen demo={page.demo} />}
        </>
      )}
      {page.kind === 'glossary' ? (
        <GlossaryTermPage page={page} theme={theme} slug={type} />
      ) : page.kind === 'contacts' ? (
        <ContactsPage page={page} />
      ) : page.kind === 'feature' ? (
        <>
          <FeatureDetailPage page={page} />
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
      <FinalCta background={theme.cta} />
    </>
  );
}

export function SeoContentPage({ type }: { type: SeoPageType }) {
  usePageMetadata(type);

  return (
    <main id="main-content" tabIndex={-1} className="bg-white text-ink-950 outline-none">
      <Suspense fallback={<div className="min-h-[70vh] animate-pulse bg-[#f4f8f6]" aria-busy="true" />}>
        {type === 'features' ? (
          <FeaturesPage />
        ) : type === 'pricing' ? (
          <PricingPage />
        ) : type === 'marketplaces' ? (
          <MarketplacesPage />
        ) : (
          <DetailPageView type={type} />
        )}
      </Suspense>
    </main>
  );
}
