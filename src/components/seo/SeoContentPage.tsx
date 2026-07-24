import { useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  ClipboardList,
  Megaphone,
  MessageCircle,
  Package,
  SearchCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL } from '@/lib/anchors';

export type SeoPageType = 'features' | 'pricing' | 'marketplaces';

const PAGE_META: Record<SeoPageType, { title: string; description: string; canonical: string }> = {
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
    icon: BarChart3,
    title: 'Финансы и юнит-экономика',
    description:
      'Сводите выручку, комиссии, логистику, себестоимость и другие расходы, чтобы оценивать результат по магазину и SKU.',
    points: ['Финансовая сводка', 'Показатели по товарам', 'ABC-анализ и маржинальность'],
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Остатки и поставки',
    description:
      'Контролируйте доступный запас и планируйте поставки на основе данных подключённых кабинетов.',
    points: ['Единый список остатков', 'Планирование поставок', 'Сигналы по дефициту'],
  },
  {
    id: 'advertising',
    icon: Megaphone,
    title: 'Реклама и цены',
    description:
      'Сопоставляйте рекламные показатели с экономикой товара и управляйте рабочими действиями в одном контуре.',
    points: ['Кампании и ставки', 'Связь с экономикой SKU', 'Контроль изменений'],
  },
  {
    id: 'seo',
    icon: SearchCheck,
    title: 'SEO карточек',
    description:
      'Проверяйте качество карточек, находите зоны улучшения и готовьте описания с помощью AI-инструментов.',
    points: ['SEO-аудит', 'Проверка карточек', 'AI-генерация описаний'],
  },
  {
    id: 'communications',
    icon: MessageCircle,
    title: 'Отзывы и заявки',
    description:
      'Собирайте обращения и отзывы в рабочих очередях, чтобы команда быстрее распределяла и обрабатывала их.',
    points: ['Отзывы маркетплейсов', 'Входящие заявки', 'Очереди и статусы'],
  },
  {
    id: 'team',
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
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d4d35] pb-20 pt-36 text-white lg:pb-28 lg:pt-44">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_8%,rgba(100,213,184,.3),transparent_32%),linear-gradient(145deg,#145a41_0%,#0b3c2c_70%,#082c20_100%)]"
      />
      <Container>
        <nav aria-label="Хлебные крошки" className="text-sm text-white/70">
          <a href="/" className="underline-offset-4 hover:text-white hover:underline">Главная</a>
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{eyebrow}</p>
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
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURE_GROUPS.map(({ id, icon: Icon, title, description, points }) => (
              <article id={id} key={id} className="rounded-[26px] border border-ink-950/[0.08] bg-white p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-800">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-ink-950">{title}</h3>
                <p className="mt-4 text-sm leading-[1.7] text-ink-600">{description}</p>
                <ul className="mt-6 space-y-3">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-ink-700">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-700" aria-hidden />
                      {point}
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
    </>
  );
}

function MarketplacesPage() {
  return (
    <>
      <PageHero
        eyebrow="Маркетплейсы"
        title="Wildberries, Ozon и Яндекс Маркет — в одном кабинете"
        description="Подключайте магазины разных площадок и работайте с их данными в общей финансовой, товарной и командной модели Sellico."
      />
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
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {MARKETPLACES.map((marketplace) => (
              <article
                id={marketplace.id}
                key={marketplace.id}
                className={`rounded-[28px] border border-ink-950/[0.08] p-6 sm:p-8 ${marketplace.color}`}
              >
                <img src={marketplace.logo} alt="" width={56} height={56} className="h-14 w-14" />
                <h3 className="mt-7 text-3xl font-semibold tracking-[-0.045em] text-ink-950">{marketplace.name}</h3>
                <p className="mt-4 text-sm leading-[1.75] text-ink-700">{marketplace.description}</p>
                <ul className="mt-7 space-y-3">
                  {marketplace.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm font-medium text-ink-800">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-800" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-12 grid gap-4 rounded-[28px] bg-[#f4f8f6] p-6 md:grid-cols-3 sm:p-8">
            {[
              [ClipboardList, 'Одна модель данных', 'Сравнивайте процессы площадок в общей структуре.'],
              [CalendarCheck, 'Единая работа команды', 'Ставьте задачи и контролируйте сроки независимо от источника.'],
              [BarChart3, 'Общая финансовая картина', 'Смотрите магазины вместе и переходите к деталям.'],
            ].map(([Icon, title, description]) => (
              <div key={title as string} className="rounded-2xl bg-white p-5">
                <Icon size={20} className="text-brand-800" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-ink-950">{title as string}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{description as string}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

export function SeoContentPage({ type }: { type: SeoPageType }) {
  usePageMetadata(type);

  return (
    <main id="main-content" tabIndex={-1} className="bg-white text-ink-950 outline-none">
      {type === 'features' ? <FeaturesPage /> : type === 'pricing' ? <PricingPage /> : <MarketplacesPage />}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="seo-page-cta-title">
        <Container>
          <div className="rounded-[30px] bg-[#0b6b4d] px-6 py-12 text-white sm:px-10 lg:px-14">
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
    </main>
  );
}
