import { use } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  Gauge,
  Megaphone,
  MessageCircle,
  Package,
  SearchCheck,
  Users,
} from 'lucide-react';
import { useBillingPrices } from '@/hooks/useBillingPrices';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL } from '@/lib/anchors';
import hubFaq from '@/content/hub-faq.json';
import hubContent from '@/content/hub-content.json';
import pricingCatalog from '@/content/pricing.json';
import { BRAND_THEME, loadPage, pluralRu, type DetailPage } from '../page-types';
import { ComparisonTable, DirectAnswer, EditorialInfo, FaqSection, FinalCta, PageHero } from '../shared';

const PLATFORM_MARKS = ['#7A2FA8', '#1D4ED8', '#A16207'];

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

const PLANS = pricingCatalog.plans;

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

const LIST_HUBS: Record<string, { label: string; forms: [string, string, string] }> = {
  glossary: { label: 'Справочник', forms: ['термин', 'термина', 'терминов'] },
  articles: { label: 'Разборы', forms: ['статья', 'статьи', 'статей'] },
  compare: { label: 'Выбор системы', forms: ['разбор', 'разбора', 'разборов'] },
};

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

export function FeaturesPage({ lastmod }: { lastmod: string }) {
  return (
    <>
      <PageHero
        eyebrow="Возможности"
        title="Вся операционная работа продавца — в одном пространстве"
        description="Sellico объединяет данные маркетплейсов и ежедневные процессы команды: от финансовой сводки и запасов до SEO, отзывов и задач."
      />
      <DirectAnswer answer={hubContent.features.answer} id="features" accent={BRAND_THEME.mark} background="#ffffff" />
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
      <EditorialInfo type="features" lastmod={lastmod} />
      <FinalCta />
    </>
  );
}

export function PricingPage({ lastmod }: { lastmod: string }) {
  const priceFor = useBillingPrices();
  const table = {
    ...hubContent.pricing.table,
    rows: hubContent.pricing.table.rows.map((row) =>
      row[0] === 'Цена в месяц'
        ? row.map((cell, index) => (index === 0 ? cell : priceFor(hubContent.pricing.table.columns[index], cell)))
        : row,
    ),
  };
  const pricingFaq = hubFaq.pricing.map(([question, answer]) => [
    question,
    question === 'Сколько стоит Sellico?'
      ? `${PLANS.map((plan) => `${plan.name} — ${priceFor(plan.name, plan.price)}`).join('; ')}. Цены указаны за месяц; актуальная сумма подтверждается в кабинете до оплаты.`
      : answer,
  ]);
  return (
    <>
      <PageHero
        eyebrow="Тарифы"
        title="Прозрачные тарифы для магазина, команды и агентства"
        description="Пробный период — 3 дня с создания пространства, включая загрузку истории, без карты. Финансы, юнит-экономика, SEO, отзывы, задачи и координация в пределах лимитов. Базовые цены указаны за месяц; актуальная сумма подтверждается в кабинете до оплаты."
      />
      <DirectAnswer answer={hubContent.pricing.answer} id="pricing" accent={BRAND_THEME.mark} background="#ffffff" />
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
                <p className="mt-7 text-4xl font-semibold tracking-[-0.055em]">{priceFor(plan.name, plan.price)}</p>
                <p className={`mt-1 text-xs ${plan.featured ? 'text-white/72' : 'text-ink-600'}`}>в месяц</p>
                <ul className="mt-7 space-y-3">
                  {plan.limitsSummary.map((limit) => (
                    <li key={limit} className={`flex gap-2 text-sm ${plan.featured ? 'text-white/88' : 'text-ink-700'}`}>
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-400" aria-hidden />
                      {limit}
                    </li>
                  ))}
                </ul>
                <div className={`my-6 h-px ${plan.featured ? 'bg-white/12' : 'bg-ink-950/[0.08]'}`} />
                <ul className="flex-1 space-y-3">
                  {plan.pricingPageFeatures.map((feature) => (
                    <li key={feature} className={`text-sm leading-relaxed ${plan.featured ? 'text-white/82' : 'text-ink-600'}`}>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  as="a"
                  href={plan.name === 'Enterprise' ? '/?enterprise=1#pricing' : `${REGISTER_URL}?plan=${plan.id}`}
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
      <ComparisonTable table={table} />
      <HubExtraSection hub="pricing" />
      <FaqSection title="Частые вопросы о тарифах" items={pricingFaq} />
      <EditorialInfo type="pricing" lastmod={lastmod} />
      <FinalCta />
    </>
  );
}

export function MarketplacesPage({ lastmod }: { lastmod: string }) {
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
      <DirectAnswer answer={hubContent.marketplaces.answer} id="marketplaces" accent={BRAND_THEME.mark} background={BRAND_THEME.soft} />

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
                      <img src={card.logo} alt="" aria-hidden="true" width={34} height={34} className="h-[34px] w-[34px]" />
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
      <EditorialInfo type="marketplaces" lastmod={lastmod} />
      <FinalCta />
    </>
  );
}

export function DirectoryHubPage({ page, type }: { page: DetailPage; type: string }) {
  const listHub = LIST_HUBS[type];
  if (listHub) {
    const count = page.blocks.length;
    return (
      <>
        <section className="border-b border-ink-950/[0.08] bg-white pb-16 pt-32 lg:pt-40" aria-labelledby="directory-title">
          <Container>
            <nav aria-label="Хлебные крошки" className="text-sm text-ink-500">
              <a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a>
              <span aria-hidden className="mx-2">/</span>
              <span aria-current="page">{page.eyebrow}</span>
            </nav>
            <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-brand-800">
              {listHub.label} / {String(count).padStart(2, '0')} {pluralRu(count, listHub.forms)}
            </p>
            <h1 id="directory-title" className="mt-5 max-w-5xl text-4xl font-semibold tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">
              {page.h1}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-[1.75] text-ink-600">{page.lead}</p>
          </Container>
        </section>
        {page.answer && <DirectAnswer answer={page.answer} id={type} accent={BRAND_THEME.mark} background="#ffffff" />}
        <section className="bg-[#f4f6f3] py-16 lg:py-20" aria-labelledby="directory-list-title">
          <Container>
            <div className="flex items-end justify-between gap-8">
              <div>
                <h2 id="directory-list-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
                  {page.blocksTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base text-ink-600">{page.blocksLead}</p>
              </div>
              <SearchCheck className="hidden text-brand-700 sm:block" size={38} strokeWidth={1.4} aria-hidden />
            </div>
            <div className="mt-12 border-t border-ink-950/15">
              {page.blocks.map((block, index) => (
                <a
                  key={block.title}
                  href={block.href}
                  className={`group grid gap-4 border-b border-ink-950/12 py-7 transition-colors hover:bg-white/75 sm:px-4 lg:items-center lg:gap-8 ${
                    block.image ? 'lg:grid-cols-[220px_.55fr_1fr_auto]' : 'lg:grid-cols-[70px_.55fr_1fr_auto]'
                  }`}
                >
                  {block.image ? (
                    <img
                      src={`${block.image}-800.webp`}
                      width={800}
                      height={420}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-auto w-full max-w-sm rounded-2xl border border-ink-950/[0.08]"
                    />
                  ) : (
                    <span className="font-mono text-xs text-ink-400">{String(index + 1).padStart(2, '0')}</span>
                  )}
                  <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3>
                  <p className="text-sm leading-[1.65] text-ink-600">{block.text}</p>
                  <ArrowRight size={16} className="text-brand-700 transition-transform group-hover:translate-x-1" aria-hidden />
                </a>
              ))}
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#0a1814] pb-20 pt-32 text-white lg:pb-24 lg:pt-40" aria-labelledby="calculators-title">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:38px_38px]"
        />
        <Container className="relative">
          <nav aria-label="Хлебные крошки" className="text-sm text-white/50">
            <a href="/" className="underline-offset-4 hover:text-white hover:underline">Главная</a>
            <span aria-hidden className="mx-2">/</span>
            <span aria-current="page">Калькуляторы</span>
          </nav>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_260px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-200">
                <Gauge size={15} aria-hidden /> Инструменты расчёта
              </div>
              <h1 id="calculators-title" className="mt-6 max-w-5xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                {page.h1}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-[1.75] text-white/66">{page.lead}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['₽', '%', 'SKU', 'day'].map((unit) => (
                <span key={unit} className="grid h-20 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] font-mono text-sm text-emerald-200">
                  {unit}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>
      {page.answer && <DirectAnswer answer={page.answer} id={type} accent={BRAND_THEME.mark} background="#ffffff" />}
      <section className="bg-[#edf4f0] py-20 lg:py-28" aria-labelledby="tools-list-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.58fr_1.42fr] lg:gap-20">
            <div>
              <h2 id="tools-list-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
                {page.blocksTitle}
              </h2>
              <p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p>
            </div>
            <div className="grid gap-4">
              {page.blocks.map((block, index) => (
                <a
                  key={block.title}
                  href={block.href}
                  className="group grid gap-5 rounded-[25px] border border-ink-950/[0.08] bg-white p-6 transition-transform hover:-translate-y-0.5 sm:p-8 lg:grid-cols-[58px_1fr_auto] lg:items-start"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#0d3d2e] font-mono text-sm text-emerald-200">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3>
                    <p className="mt-3 text-sm leading-[1.75] text-ink-600">{block.text}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {block.items.map((item) => (
                        <li key={item} className="rounded-lg bg-[#edf4f0] px-3 py-1.5 text-xs font-medium text-ink-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ArrowRight size={18} className="text-brand-700 transition-transform group-hover:translate-x-1" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
