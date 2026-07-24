import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Layers3,
  Mail,
  Megaphone,
  Package,
  Pause,
  Phone,
  Play,
  Puzzle,
  Sparkles,
  Store,
  Users2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { REGISTER_URL, SECTION_IDS, scrollToSection } from '@/lib/anchors';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';

const OperationalWorkspaceDemo = lazy(() =>
  import('@/components/primitives/OperationalWorkspaceDemo').then((module) => ({
    default: module.OperationalWorkspaceDemo,
  })),
);

type ResponsiveAsset = {
  avif: string;
  webp: string;
  fallback: string;
  sizes: string;
  width: number;
  height: number;
};

const RESPONSIVE_ASSET_ROOT = '/assets/landing-v2/responsive';
const AI_PARTICLE_VECTOR_ROOT = '/assets/landing-v2/vector';

const AI_PARTICLE_LAYERS = {
  back: `${AI_PARTICLE_VECTOR_ROOT}/ai-particle-field-back.svg`,
  mid: `${AI_PARTICLE_VECTOR_ROOT}/ai-particle-field-mid.svg`,
  front: `${AI_PARTICLE_VECTOR_ROOT}/ai-particle-field-front.svg`,
} as const;

const ASSETS: Record<'funnel' | 'wb' | 'ozon', ResponsiveAsset> = {
  funnel: {
    avif: `${RESPONSIVE_ASSET_ROOT}/growth-funnel-768.avif 768w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1280.avif 1280w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1920.avif 1920w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-2560.avif 2560w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-3840.avif 3840w`,
    webp: `${RESPONSIVE_ASSET_ROOT}/growth-funnel-768.webp 768w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1280.webp 1280w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1920.webp 1920w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-2560.webp 2560w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-3840.webp 3840w`,
    fallback: `${RESPONSIVE_ASSET_ROOT}/growth-funnel-1920.webp`,
    sizes: '(min-width: 1664px) 1600px, (min-width: 1024px) calc(100vw - 8rem), calc(100vw - 2.5rem)',
    width: 3840,
    height: 1920,
  },
  wb: {
    avif: `${RESPONSIVE_ASSET_ROOT}/purple-bag-320.avif 320w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-480.avif 480w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-640.avif 640w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-950.avif 950w`,
    webp: `${RESPONSIVE_ASSET_ROOT}/purple-bag-320.webp 320w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-480.webp 480w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-640.webp 640w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-950.webp 950w`,
    fallback: `${RESPONSIVE_ASSET_ROOT}/purple-bag-640.webp`,
    sizes: '(min-width: 640px) 324px, 188px',
    width: 950,
    height: 1261,
  },
  ozon: {
    avif: `${RESPONSIVE_ASSET_ROOT}/blue-parcel-320.avif 320w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-480.avif 480w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-768.avif 768w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-1160.avif 1160w`,
    webp: `${RESPONSIVE_ASSET_ROOT}/blue-parcel-320.webp 320w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-480.webp 480w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-768.webp 768w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-1160.webp 1160w`,
    fallback: `${RESPONSIVE_ASSET_ROOT}/blue-parcel-768.webp`,
    sizes: '(min-width: 640px) 446px, 260px',
    width: 1160,
    height: 1117,
  },
} as const;

function PictureSources({ asset, media }: { asset: ResponsiveAsset; media?: string }) {
  return (
    <>
      <source media={media} type="image/avif" srcSet={asset.avif} sizes={asset.sizes} />
      <source media={media} type="image/webp" srcSet={asset.webp} sizes={asset.sizes} />
    </>
  );
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
} as const;

const proof = [
  {
    value: '15 минут',
    label: 'на подключение первого магазина',
    icon: CircleCheck,
  },
  {
    value: '4 млрд ₽',
    label: 'оборот под управлением',
    icon: BarChart3,
  },
  {
    value: 'Один кабинет',
    label: 'остатки, финансы и реклама',
    icon: Layers3,
  },
];

const heroModules = [
  {
    title: 'Финансы',
    subtitle: 'и аналитика',
    icon: BarChart3,
    placement: 'col-start-2 row-start-1',
  },
  {
    title: 'Остатки',
    subtitle: 'и поставки',
    icon: Package,
    placement: 'col-start-3 row-start-2',
  },
  {
    title: 'Реклама',
    subtitle: 'и продвижение',
    icon: Megaphone,
    placement: 'col-start-2 row-start-3',
  },
  {
    title: 'CRM',
    subtitle: 'и клиенты',
    icon: Users2,
    placement: 'col-start-1 row-start-2',
  },
] as const;

const heroSignalRoutes = [
  { id: 'finance', cx: [50, 50], cy: [34, 8] },
  { id: 'stock', cx: [66, 92], cy: [50, 50] },
  { id: 'ads', cx: [50, 50], cy: [66, 92] },
  { id: 'crm', cx: [34, 8], cy: [50, 50] },
];

const heroMotion = {
  cycle: 4.6,
  step: 1.12,
  signalDuration: 1.05,
  ease: [0.22, 1, 0.36, 1],
} as const;

const funnelSteps = [
  ['Аналитика', 'Понимаем прибыль и точки роста'],
  ['Остатки', 'Планируем закупки и поставки'],
  ['Реклама', 'Управляем ставками через экономику'],
  ['CRM', 'Превращаем сигналы в действия'],
  ['Прибыль', 'Масштабируем то, что работает'],
];

type SellerStory = {
  id: string;
  number: string;
  tone: 'rose' | 'dark' | 'mint';
  eyebrow: string;
  title: string;
  facts: string[];
  platforms: string[];
  task: string[];
  solution: string[];
  result: [string, string][];
  timeline: string;
};

const caseStories: SellerStory[] = [
  {
    id: 'fashion',
    number: 'Кейс 1',
    tone: 'rose',
    eyebrow: 'Бренд одежды',
    title: 'Продажи росли, а нужные размеры постоянно заканчивались',
    facts: [
      '2 магазина на Wildberries',
      '1 400 SKU с размерной сеткой',
      'поставки планировались вручную раз в неделю',
    ],
    platforms: ['WILDBERRIES'],
    task: [
      'увидеть дефицит по размерам до потери продаж',
      'не рекламировать товары без достаточного запаса',
      'собирать план поставок без ручной сверки таблиц',
    ],
    solution: [
      'объединили остатки, продажи и рекламу в одном контуре',
      'настроили сигналы по критичным размерам',
      'связали рекламные ставки с доступностью товара',
    ],
    result: [
      ['+38%', 'выручка за 8 недель'],
      ['18 → 7%', 'товаров в дефиците'],
    ],
    timeline: '12 дней до запуска автоплана',
  },
  {
    id: 'home',
    number: 'Кейс 2',
    tone: 'dark',
    eyebrow: 'Товары для дома',
    title: 'Оборот был большим, но часть ассортимента продавалась в минус',
    facts: [
      'собственное производство',
      'WB, Ozon и Яндекс Маркет',
      'комиссии и логистика считались в разных отчётах',
    ],
    platforms: ['WILDBERRIES', 'OZON', 'ЯНДЕКС МАРКЕТ'],
    task: [
      'посчитать реальную прибыль каждого SKU',
      'найти товары, которые съедают оборотный капитал',
      'сформировать понятный план цен и производства',
    ],
    solution: [
      'пересчитали себестоимость с комиссиями и возвратами',
      'разделили ассортимент по прибыли и оборачиваемости',
      'скорректировали цены и производственный план',
    ],
    result: [
      ['+8,6 п.п.', 'к чистой марже'],
      ['34 → 9', 'убыточных SKU'],
    ],
    timeline: '21 день до первой полной модели прибыли',
  },
  {
    id: 'agency',
    number: 'Кейс 3',
    tone: 'mint',
    eyebrow: 'Marketplace-агентство',
    title: 'Менеджеры тратили пятницу на сбор клиентских отчётов',
    facts: [
      '18 кабинетов у 7 клиентов',
      'команда из 11 менеджеров',
      'задачи, отчёты и переписка жили отдельно',
    ],
    platforms: ['WILDBERRIES', 'OZON'],
    task: [
      'собирать отчёты по всем кабинетам автоматически',
      'видеть просроченные задачи и ответственных',
      'давать клиенту понятный итог без десяти файлов',
    ],
    solution: [
      'собрали кабинеты и роли команды в одном пространстве',
      'создали единый шаблон еженедельного отчёта',
      'настроили задачи из сигналов по рекламе и остаткам',
    ],
    result: [
      ['6 ч → 40 мин', 'подготовка отчёта'],
      ['×2,1', 'скорость обработки задач'],
    ],
    timeline: '9 дней до подключения всей команды',
  },
];


const pricingPlans = [
  {
    name: 'Старт',
    price: '3 000 ₽',
    description: 'Для одного магазина',
    scale: [
      ['API', '1'],
      ['человека', '3'],
      ['товаров', '50'],
    ],
    inherits: null,
    features: [
      'Юнит-экономика',
      'Задачи и координация (CRM)',
      'Массовое редактирование описаний',
      'Отзывы — 100 в день',
      'SEO-генерация — 20 в месяц',
      'SEO-аудит — 50 в месяц',
      'Автопланирование — 1 поставка',
    ],
    cta: 'Выбрать Старт',
    featured: false,
  },
  {
    name: 'Про',
    price: '8 000 ₽',
    description: 'Для растущей команды',
    scale: [
      ['API', '3'],
      ['человек', '10'],
      ['товаров', '150'],
    ],
    inherits: 'Всё из Старт, плюс',
    features: [
      'Финансовая отчётность',
      'Отзывы — 250 в день на площадку',
      'SEO-генерация — 100 в месяц',
      'SEO-аудит — 150 в месяц',
      'Автопланирование — 4 поставки',
    ],
    cta: 'Выбрать Про',
    featured: false,
  },
  {
    name: 'Бизнес',
    price: '15 000 ₽',
    description: 'Для бренда или агентства',
    scale: [
      ['API', '6'],
      ['человек', '20'],
      ['товаров', '300'],
    ],
    inherits: 'Всё из Про, плюс',
    features: [
      'Заявки и лиды',
      'Sellico Meet — видеосвязь',
      'Отзывы — без ограничений (Ozon — 250 в день)',
      'SEO-генерация — 200 в месяц',
      'SEO-аудит — 300 в месяц',
      'Автопланирование — 8 поставок',
    ],
    cta: 'Выбрать Бизнес',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'от 40 000 ₽',
    description: 'Для крупного бизнеса',
    scale: [
      ['API', '∞'],
      ['люди', '∞'],
      ['товары', '∞'],
    ],
    inherits: 'Всё из Бизнес, плюс',
    features: [
      'Роадмап',
      'Договорные лимиты — товары, интеграции, пользователи',
      'Договорные SEO и автопланирование',
      'Индивидуальные условия внедрения',
    ],
    cta: 'Обсудить внедрение',
    featured: false,
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'Что такое Sellico?',
    answer:
      'Sellico — российская операционная система для продавцов и команд, управляющих магазинами на Wildberries, Ozon и Яндекс Маркете. Сервис объединяет финансы, юнит-экономику, остатки, поставки, рекламу, SEO карточек, отзывы и задачи команды в одном рабочем пространстве.',
  },
  {
    question: 'С какими маркетплейсами работает Sellico?',
    answer:
      'Sellico поддерживает Wildberries, Ozon и Яндекс Маркет. Данные подключённых магазинов собираются в одном кабинете, чтобы команда могла сравнивать показатели и управлять ежедневными процессами без отдельных таблиц для каждой площадки.',
  },
  {
    question: 'Какие задачи продавца решает Sellico?',
    answer:
      'В Sellico можно анализировать выручку и прибыль по SKU, контролировать остатки и поставки, работать с рекламой, отзывами и SEO карточек, а также ставить задачи сотрудникам. Набор функций и лимиты зависят от выбранного тарифа.',
  },
  {
    question: 'Сколько времени занимает подключение магазина?',
    answer:
      'Первый магазин можно подключить примерно за 15 минут. Для старта не требуется переносить рабочие таблицы или привязывать банковскую карту: достаточно выбрать тариф, подключить кабинет маркетплейса и дождаться синхронизации доступных данных.',
  },
  {
    question: 'Есть ли бесплатный период?',
    answer:
      'Да. Для тарифов Sellico предусмотрено 3 дня бесплатного доступа без привязки банковской карты. За это время можно подключить магазин, познакомиться с интерфейсом и проверить доступные для выбранного тарифа инструменты на своих данных.',
  },
  {
    question: 'Сколько стоит Sellico?',
    answer:
      'Тариф «Старт» стоит 3 000 ₽ в месяц, «Про» — 8 000 ₽, «Бизнес» — 15 000 ₽. Enterprise начинается от 40 000 ₽ в месяц и рассчитывается с учётом количества интеграций, пользователей, товаров и задач внедрения.',
  },
  {
    question: 'Кому подходит тариф Enterprise?',
    answer:
      'Enterprise предназначен для крупного бизнеса, агентств и команд со сложным контуром данных. В него входят договорные лимиты, индивидуальные условия SEO и автопланирования, настройка ролей и интеграций, а также согласованный сценарий внедрения.',
  },
] as const;

type RemotePromoBanner = {
  id: number;
  image: string;
  image_mobile?: string | null;
  link?: string | null;
  alt?: string | null;
};

function PromoBanner() {
  const [slide, setSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  // null — ещё не знаем (идёт запрос), [] — точно нет баннеров, иначе — список
  const [banners, setBanners] = useState<RemotePromoBanner[] | null>(null);

  useEffect(() => {
    fetch('/api/public/promo-banners')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        const list: RemotePromoBanner[] = Array.isArray(data) ? data : data?.data;
        const valid = Array.isArray(list) && list.every((b) => typeof b?.image === 'string') ? list : [];
        setBanners(valid);
      })
      .catch(() => setBanners([]));
  }, []);

  // Автопрокрутка; зависимость от slide перезапускает таймер после ручного переключения
  useEffect(() => {
    if (hovered || focused || autoPaused || reducedMotion || (banners?.length ?? 0) < 2) return;
    const id = window.setInterval(() => setSlide((value) => value + 1), 6000);
    return () => window.clearInterval(id);
  }, [autoPaused, banners, focused, hovered, reducedMotion, slide]);

  // Пока не пришёл ответ или баннеров нет — блок не рендерим вовсе (не показываем текстовую заглушку)
  if (!banners || banners.length === 0) return null;

  const count = banners.length;
  const index = slide % count;
  const banner = banners[index];

  const changeSlide = (direction: number) => {
    setSlide((value) => (value + direction + count) % count);
  };

  return (
    <section aria-label="Предложения Sellico" className="pt-24 lg:pt-[92px]">
      {/* ponytail: без потолка ширины баннер на широких мониторах растягивается сильнее, чем даёт resolution картинки 2400×320 — размывается на Retina. Кап держит апскейл в пределах ~1.3x вместо ~2x */}
      <Container className="lg:max-w-[1800px] lg:px-16">
        <div
          // Пауза только для настоящего курсора: на тач-устройствах тап эмулирует mouseenter без mouseleave — hovered залипал бы навсегда и автопрокрутка умирала
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          <motion.div
            {...reveal}
            className="relative isolate aspect-[3/1] overflow-hidden rounded-[30px] border border-[#dcebe3] bg-[#edf7f1] sm:aspect-[15/2]"
          >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_77%_18%,rgba(255,255,255,.9),transparent_28%),linear-gradient(100deg,#e5f4ec_0%,#f8fbf9_58%,#e7f5ed_100%)]"
          />

          <motion.div
            key={banner.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {(() => {
              const img = (
                <picture>
                  {banner.image_mobile && <source media="(max-width: 639px)" srcSet={banner.image_mobile} />}
                  <img
                    src={banner.image}
                    alt={banner.alt ?? ''}
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                  />
                </picture>
              );
              return banner.link ? (
                <a href={banner.link} className="block h-full w-full" aria-label={banner.alt ?? 'Открыть предложение'}>
                  {img}
                </a>
              ) : (
                img
              );
            })()}
          </motion.div>

          {count > 1 && (
          <button
            type="button"
            onClick={() => changeSlide(-1)}
            className="absolute left-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink-950/8 bg-white/80 text-ink-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Предыдущее предложение"
          >
            <ChevronLeft size={18} />
          </button>
          )}

          {count > 1 && (
          <button
            type="button"
            onClick={() => changeSlide(1)}
            className="absolute right-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink-950/8 bg-white/80 text-ink-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Следующее предложение"
          >
            <ChevronRight size={18} />
          </button>
          )}

          {count > 1 && (
            <button
              type="button"
              onClick={() => setAutoPaused((value) => !value)}
              className="absolute bottom-4 right-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-ink-950/10 bg-white/85 text-ink-800 shadow-sm backdrop-blur transition hover:bg-white"
              aria-label={autoPaused ? 'Продолжить автоматическую смену предложений' : 'Остановить автоматическую смену предложений'}
              aria-pressed={autoPaused}
            >
              {autoPaused ? <Play size={17} aria-hidden /> : <Pause size={17} aria-hidden />}
            </button>
          )}
          </motion.div>

          {count > 1 && (
            <div
              className="mt-2 flex items-center justify-center gap-0.5"
              aria-label="Номер предложения"
            >
              {Array.from({ length: count }, (_, dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={() => setSlide(dot)}
                  className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`Показать предложение ${dot + 1}`}
                  aria-current={dot === index ? 'true' : undefined}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      dot === index ? 'w-6 bg-brand-800' : 'w-1.5 bg-brand-800/30',
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

const STOCK_ROWS = [
  { name: 'Wildberries', base: 8342, logo: '/brand/marketplaces/wildberries.svg' },
  { name: 'Ozon', base: 4156, logo: '/brand/marketplaces/ozon.svg' },
  { name: 'Яндекс Маркет', base: 1842, logo: '/brand/marketplaces/yandex-market.svg' },
];

const formatStock = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function formatSyncAge(seconds: number) {
  if (seconds < 15) return 'Обновлено только что';
  if (seconds < 60) return `Обновлено ${seconds} сек назад`;
  return `Обновлено ${Math.floor(seconds / 60)} мин назад`;
}

function StockSyncCard() {
  const [values, setValues] = useState(() => STOCK_ROWS.map((row) => row.base));
  const [syncAge, setSyncAge] = useState(120);

  useEffect(() => {
    const ageId = window.setInterval(() => setSyncAge((s) => s + 15), 15000);
    const syncId = window.setInterval(() => {
      setValues((prev) =>
        prev.map((value, index) => {
          if (Math.random() > 0.6) return value;
          // ponytail: продажи понемногу списывают остаток, ниже base-40 «приходит поставка» — числа колеблются, а не растут
          if (value <= STOCK_ROWS[index].base - 40) return value + 20 + Math.floor(Math.random() * 40);
          return value - 1 - Math.floor(Math.random() * 5);
        }),
      );
      setSyncAge(0);
    }, 7000);
    return () => {
      window.clearInterval(ageId);
      window.clearInterval(syncId);
    };
  }, []);

  return (
    <div className="rounded-[26px] border border-[#dfe6e2] bg-white p-5 shadow-[0_22px_45px_-38px_rgba(20,66,46,.35)] sm:p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.035em] text-[#17211c]">Остатки синхронизированы</h2>
        <p className="mt-1 text-xs text-[#7d8982]">{formatSyncAge(syncAge)}</p>
      </div>

      <ul className="mt-6 divide-y divide-[#e8ece9]">
        {STOCK_ROWS.map(({ name, logo }, index) => (
          <li key={name} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 py-3.5 first:pt-0 last:pb-0">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl">
              <img src={logo} alt="" aria-hidden="true" className="h-full w-full object-contain" width="40" height="40" />
            </span>
            <span className="min-w-0 truncate text-[13px] font-medium text-[#39433e]">{name}</span>
            <span className="font-mono text-[13px] font-semibold tabular-nums text-[#17211c]">{formatStock(values[index])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  const heroDiagramRef = useRef<HTMLDivElement>(null);
  const heroDiagramInView = useInView(heroDiagramRef, { amount: 0.35 });
  const prefersReducedMotion = useReducedMotion();
  const heroMotionEnabled = heroDiagramInView && !prefersReducedMotion;

  return (
    <section
      id={SECTION_IDS.hero}
      // ponytail: хедер fixed — этот отступ обычно даёт PromoBanner своим pt-24; если баннеров нет и его не в DOM, Hero становится первым ребёнком main и сам отвечает за просвет под хедер
      className="relative overflow-hidden bg-white pb-16 pt-6 first:pt-24 lg:pb-24 lg:pt-8 lg:first:pt-[92px]"
    >
      <Container className="lg:max-w-none lg:px-16">
        <motion.div
          {...reveal}
          className="min-w-0 rounded-[28px] border border-[#dfe7e2] bg-[#f7f9f7] p-3 shadow-[0_30px_90px_-72px_rgba(20,66,46,.28)] sm:rounded-[34px] sm:p-4"
        >
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,.92fr)_minmax(430px,1.08fr)] xl:grid-cols-[minmax(340px,.9fr)_minmax(440px,1.08fr)_minmax(270px,.66fr)]">
            <div className="relative isolate flex min-h-[590px] min-w-0 flex-col overflow-hidden rounded-[26px] bg-[#0d4d35] px-6 py-7 text-white sm:px-9 sm:py-9 lg:min-h-[620px]">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_0%,rgba(103,194,137,.24),transparent_34%),radial-gradient(circle_at_5%_100%,rgba(117,219,151,.11),transparent_35%),linear-gradient(145deg,#13583f_0%,#0a3c2b_62%,#0b4933_100%)]"
              />
              <div
                aria-hidden
                className="absolute -right-24 -top-20 -z-10 h-72 w-72 rounded-full border border-white/[0.05] shadow-[0_0_0_34px_rgba(255,255,255,.025),0_0_0_68px_rgba(255,255,255,.018)]"
              />

              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-50 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c8f44d]" />
                Wildberries · Ozon · Яндекс Маркет
              </p>

              <h1 className="mt-10 text-[clamp(2.9rem,12vw,4.15rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-white lg:text-[clamp(3.05rem,4.25vw,4rem)]">
                <span className="mb-5 block max-w-md text-sm font-semibold leading-snug tracking-[-0.015em] text-emerald-100 sm:text-base">
                  Операционная система для продавцов маркетплейсов
                </span>
                Управляйте
                <span className="block">прибылью.</span>
                <span className="mt-2 block text-[#b9ef6a]">Не таблицами.</span>
              </h1>

              <p className="mt-7 max-w-[34rem] text-[15px] leading-[1.7] text-white/68 sm:text-base">
                Sellico — операционная система для продавцов на Wildberries, Ozon и Яндекс Маркете. Финансы, остатки, реклама, SEO и задачи команды работают в одном пространстве.
              </p>

              <div className="mt-auto pt-9">
                <div className="flex flex-col gap-3">
                  <Button
                    as="a"
                    href={REGISTER_URL}
                    variant="dark"
                    size="lg"
                    className="min-w-0 w-full justify-between rounded-xl border-[#d5ff68] bg-[#c8f44d] px-4 text-sm text-[#123525] shadow-[0_16px_35px_-20px_rgba(200,244,77,.7)] hover:border-[#ddff8a] hover:bg-[#d3fb6c] sm:px-5 sm:text-base"
                    iconRight={<ArrowRight size={18} />}
                    onClick={() => track('cta_click_hero', { target: 'register' })}
                  >
                    <span className="sm:hidden">Подключить магазин</span>
                    <span className="hidden sm:inline">Подключить магазин бесплатно</span>
                  </Button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium text-white/62 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8f44d]"
                    onClick={() => scrollToSection(SECTION_IDS.demo)}
                  >
                    Смотреть интерфейс
                    <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-white/80">
                  <span className="inline-flex items-center gap-1.5"><CircleCheck size={13} className="text-[#b9ef6a]" />15 минут</span>
                  <span className="inline-flex items-center gap-1.5"><CircleCheck size={13} className="text-[#b9ef6a]" />3 дня бесплатно</span>
                  <span className="inline-flex items-center gap-1.5"><CircleCheck size={13} className="text-[#b9ef6a]" />без карты</span>
                </div>
              </div>
            </div>

            <div className="relative flex min-w-0 items-center justify-center overflow-hidden rounded-[26px] bg-[#f7f9f7] px-2 py-7 sm:px-5 sm:py-8 lg:min-h-[620px]">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_49%,rgba(29,116,77,.1),transparent_25%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,.96),transparent_70%)]"
              />

              <div
                ref={heroDiagramRef}
                className="relative grid aspect-square w-full max-w-[500px] grid-cols-3 grid-rows-3 items-center justify-items-center gap-2 p-1.5 sm:gap-3 sm:p-3"
              >
                <svg aria-hidden className="pointer-events-none absolute inset-[7%] h-[86%] w-[86%]" viewBox="0 0 100 100">
                  <defs>
                    <filter id="hero-signal-glow" x="-250%" y="-250%" width="600%" height="600%">
                      <feGaussianBlur stdDeviation="1.25" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <motion.circle
                    data-hero-orbit="outer"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#91a69b"
                    strokeWidth=".34"
                    strokeDasharray="1.15 1.55"
                    animate={{ rotate: heroMotionEnabled ? 360 : 0 }}
                    transition={heroMotionEnabled ? { duration: 36, ease: 'linear', repeat: Infinity } : { duration: 0 }}
                    style={{ transformOrigin: '50% 50%' }}
                  />
                  <motion.circle
                    data-hero-orbit="inner"
                    cx="50"
                    cy="50"
                    r="27.5"
                    fill="none"
                    stroke="#b2c0b9"
                    strokeWidth=".3"
                    strokeDasharray=".9 1.4"
                    animate={{ rotate: heroMotionEnabled ? -360 : 0 }}
                    transition={heroMotionEnabled ? { duration: 26, ease: 'linear', repeat: Infinity } : { duration: 0 }}
                    style={{ transformOrigin: '50% 50%' }}
                  />
                  <path d="M50 8V33M92 50H67M50 92V67M8 50H33" stroke="#cedad4" strokeWidth=".5" />
                  <circle cx="50" cy="8" r="1.3" fill="#1a6b49" stroke="#f7f9f7" strokeWidth=".65" />
                  <circle cx="92" cy="50" r="1.3" fill="#1a6b49" stroke="#f7f9f7" strokeWidth=".65" />
                  <circle cx="50" cy="92" r="1.3" fill="#1a6b49" stroke="#f7f9f7" strokeWidth=".65" />
                  <circle cx="8" cy="50" r="1.3" fill="#1a6b49" stroke="#f7f9f7" strokeWidth=".65" />
                  {heroSignalRoutes.map(({ id, cx, cy }, index) => (
                    <motion.circle
                      key={id}
                      data-hero-signal={id}
                      cx={cx[0]}
                      cy={cy[0]}
                      r=".9"
                      fill="#40b97d"
                      filter="url(#hero-signal-glow)"
                      initial={{ opacity: 0, r: 0.75 }}
                      animate={
                        heroMotionEnabled
                          ? { cx, cy, opacity: [0, 1, 0], r: [0.75, 1.15, 0.8] }
                          : { cx: cx[0], cy: cy[0], opacity: 0, r: 0.75 }
                      }
                      transition={
                        heroMotionEnabled
                          ? {
                              duration: heroMotion.signalDuration,
                              delay: heroMotion.step * index,
                              ease: heroMotion.ease,
                              repeat: Infinity,
                              repeatDelay: heroMotion.cycle - heroMotion.signalDuration,
                            }
                          : { duration: 0 }
                      }
                    />
                  ))}
                </svg>

                <motion.div
                  className="relative z-20 col-start-2 row-start-2 grid aspect-square w-[88%] max-w-[148px] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_25%,#2c875d_0%,#10563b_48%,#073c29_100%)] shadow-[0_24px_50px_-26px_rgba(10,73,48,.7)]"
                  initial={{ opacity: 0, scale: 0.86 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.span
                    aria-hidden
                    data-hero-hub-pulse
                    className="absolute inset-[-7%] rounded-full border border-[#51bd84]/45"
                    animate={
                      heroMotionEnabled
                        ? { opacity: [0, 0.5, 0], scale: [0.88, 1.08, 1.2] }
                        : { opacity: 0, scale: 1 }
                    }
                    transition={
                      heroMotionEnabled
                        ? { duration: heroMotion.cycle, ease: heroMotion.ease, repeat: Infinity }
                        : { duration: 0 }
                    }
                  />
                  <motion.span
                    className="relative z-10 grid aspect-square w-[55%] place-items-center bg-white [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)]"
                    animate={heroMotionEnabled ? { scale: [1, 1.035, 1] } : { scale: 1 }}
                    transition={
                      heroMotionEnabled
                        ? { duration: heroMotion.cycle, ease: 'easeInOut', repeat: Infinity }
                        : { duration: 0 }
                    }
                  >
                    <img src="/logo.svg" alt="Sellico" className="w-[58%]" />
                  </motion.span>
                </motion.div>

                {heroModules.map(({ title, subtitle, icon: Icon, placement }, index) => (
                  <motion.div
                    key={title}
                    className={cn(
                      'relative z-10 flex aspect-[1.02/1] w-[92%] max-w-[126px] flex-col items-center justify-center self-center rounded-[18px] border border-[#dfe6e2] bg-white/95 px-1.5 text-center shadow-[0_22px_42px_-32px_rgba(20,66,46,.38)] backdrop-blur sm:rounded-[22px] sm:px-2',
                      placement,
                    )}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.08 * index }}
                  >
                    <motion.span
                      aria-hidden
                      data-hero-card-pulse={title}
                      className="pointer-events-none absolute inset-[-1px] rounded-[18px] border border-[#36a974] shadow-[0_16px_34px_-22px_rgba(33,139,91,.72)] sm:rounded-[22px]"
                      animate={
                        heroMotionEnabled
                          ? { opacity: [0, 0.72, 0], scale: [1, 1.018, 1.025] }
                          : { opacity: 0, scale: 1 }
                      }
                      transition={
                        heroMotionEnabled
                          ? {
                              duration: 0.8,
                              delay: 0.72 + heroMotion.step * index,
                              ease: heroMotion.ease,
                              repeat: Infinity,
                              repeatDelay: heroMotion.cycle - 0.8,
                            }
                          : { duration: 0 }
                      }
                    />
                    <span className="relative z-10 grid h-8 w-8 place-items-center rounded-[10px] bg-[#eaf5ee] text-[#126643] sm:h-10 sm:w-10 sm:rounded-xl">
                      <Icon className="h-[18px] w-[18px] sm:h-[21px] sm:w-[21px]" strokeWidth={1.8} />
                    </span>
                    <p className="relative z-10 mt-1.5 text-[9px] font-semibold leading-[1.18] tracking-[-0.025em] text-[#15231c] min-[370px]:text-[10px] sm:mt-2 sm:text-[13px]">
                      {title}
                      <span className="block font-medium text-[#65736c]">{subtitle}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 xl:col-span-1 xl:grid-cols-1">
              <StockSyncCard />

              <div className="relative min-h-[250px] overflow-hidden rounded-[26px] border border-[#dfe6e2] bg-white p-5 shadow-[0_22px_45px_-38px_rgba(20,66,46,.35)] sm:p-6">
                <div className="relative z-10">
                  <p className="text-lg font-semibold tracking-[-0.035em] text-[#17211c]">Денежный поток</p>
                  <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.06em] text-[#126643]">+23%</p>
                  <p className="mt-1 text-xs text-[#7d8982]">за последние 30 дней</p>
                </div>
                <svg aria-hidden className="absolute inset-x-4 bottom-4 h-[46%] w-[calc(100%_-_2rem)]" viewBox="0 0 260 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="hero-cashflow-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#62ad82" stopOpacity=".28" />
                      <stop offset="1" stopColor="#62ad82" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M4 106C18 101 25 88 38 91C50 94 56 83 68 86C82 88 91 61 108 61C124 61 129 74 143 70C155 66 160 56 174 59C192 63 198 41 212 36C231 29 239 18 256 8V116H4Z" fill="url(#hero-cashflow-area)" />
                  <path d="M4 106C18 101 25 88 38 91C50 94 56 83 68 86C82 88 91 61 108 61C124 61 129 74 143 70C155 66 160 56 174 59C192 63 198 41 212 36C231 29 239 18 256 8" fill="none" stroke="#377a56" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="256" cy="8" r="4.5" fill="#5ba679" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[24px] border border-[#dfe6e2] bg-white lg:grid-cols-4">
            {proof.map(({ value, label, icon: Icon }, index) => (
              <div
                key={value}
                className={cn(
                  'flex min-h-[138px] min-w-0 items-center gap-4 border-[#e5ebe7] p-4 sm:p-5 xl:px-7',
                  index % 2 === 0 && 'border-r',
                  index < 2 && 'border-b lg:border-b-0',
                  index > 0 && 'lg:border-l',
                )}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#edf5f0] text-[#166544] sm:h-14 sm:w-14">
                  <Icon size={25} strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xl font-semibold leading-none tracking-[-0.05em] text-[#17211c] sm:text-2xl">{value}</p>
                  <p className="mt-2 max-w-[18ch] text-[11px] leading-snug text-[#738078] sm:text-xs">{label}</p>
                </div>
              </div>
            ))}

            <div className="flex min-h-[138px] min-w-0 items-center gap-4 p-4 sm:p-5 xl:px-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#edf5f0] text-[#166544] sm:h-14 sm:w-14">
                <Puzzle size={25} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-[-0.025em] text-[#17211c]">Интеграции</p>
                <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[#2e704f] sm:text-xs">Wildberries, Ozon, Яндекс Маркет</p>
                <p className="mt-1 text-[10px] text-[#89938e]">без миграции данных</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function AiSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const backLayerY = useTransform(scrollYProgress, [0, 1], [16, -16]);
  const backLayerX = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const midLayerY = useTransform(scrollYProgress, [0, 1], [110, -110]);
  const midLayerX = useTransform(scrollYProgress, [0, 1], [-28, 28]);
  const frontLayerY = useTransform(scrollYProgress, [0, 1], [190, -190]);
  const frontLayerX = useTransform(scrollYProgress, [0, 1], [48, -48]);

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.wow}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eef8f3_18%,#eef8f3_100%)] lg:h-[clamp(560px,46vw,760px)] lg:bg-[#eef8f3] lg:bg-none"
    >
      <div
        aria-hidden
        className="ai-particle-viewport relative h-[190px] w-full overflow-hidden sm:h-[280px] md:h-[320px] lg:absolute lg:inset-0 lg:h-full"
      >
        <motion.div
          data-ai-parallax="back"
          className="absolute -left-20 -top-[220px] h-[calc(100%+440px)] w-[calc(100%+160px)] will-change-transform"
          style={reduced ? undefined : { x: backLayerX, y: backLayerY }}
        >
          <img
            src={AI_PARTICLE_LAYERS.back}
            alt=""
            width={2400}
            height={720}
            className="h-full w-full object-cover object-left"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <motion.div
          data-ai-parallax="mid"
          className="absolute -left-20 -top-[220px] h-[calc(100%+440px)] w-[calc(100%+160px)] will-change-transform"
          style={reduced ? undefined : { x: midLayerX, y: midLayerY }}
        >
          <img
            src={AI_PARTICLE_LAYERS.mid}
            alt=""
            width={2400}
            height={720}
            className="h-full w-full object-cover object-left"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <motion.div
          data-ai-parallax="front"
          className="absolute -left-20 -top-[220px] h-[calc(100%+440px)] w-[calc(100%+160px)] will-change-transform"
          style={reduced ? undefined : { x: frontLayerX, y: frontLayerY }}
        >
          <img
            src={AI_PARTICLE_LAYERS.front}
            alt=""
            width={2400}
            height={720}
            className="h-full w-full object-cover object-left"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>

      <Container className="relative z-10 -mt-10 flex items-start justify-center pb-20 sm:-mt-12 lg:mt-0 lg:h-full lg:max-w-none lg:items-center lg:justify-end lg:px-16 lg:pb-0">
        <motion.div
          {...reveal}
          className="w-full max-w-xl rounded-[26px] border border-ink-950/[0.06] bg-white p-6 shadow-[0_30px_80px_-48px_rgba(15,73,52,.32)] sm:p-8 lg:rounded-[28px] lg:p-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">AI для роста</p>
          <h2 className="mt-5 text-[clamp(1.95rem,9.6vw,2.35rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink-950 md:text-5xl lg:text-6xl">
            Искусственный интеллект в каждом решении
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-600">
            Sellico анализирует данные, находит точки роста и предлагает конкретные действия — от новой поставки до корректировки рекламы.
          </p>
          <Button as="a" href={REGISTER_URL} className="mt-8 w-full justify-center rounded-xl sm:w-auto" iconRight={<ArrowRight size={16} />}>
            Попробовать бесплатно
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}

function FunnelSection() {
  const reduced = useReducedMotion();
  const funnelRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: funnelRef, offset: ['start end', 'end start'] });
  const imageScale = useTransform(scrollYProgress, [0.15, 0.8], [0.96, 1.03]);
  const imageY = useTransform(scrollYProgress, [0, 1], [35, -35]);

  return (
    <section
      ref={funnelRef}
      id={SECTION_IDS.how}
      className="relative -mt-7 overflow-hidden rounded-t-[44px] bg-[#03110c] py-20 text-white lg:rounded-t-[68px] lg:py-28"
    >
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="relative z-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">Единая система роста</p>
          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            От данных до прибыли — один непрерывный процесс
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg">
            Каждый сигнал превращается в понятное действие, а каждое действие связано с экономикой бизнеса.
          </p>
        </motion.div>

        <motion.div
          {...reveal}
          className="relative mx-auto mt-8 max-w-[1600px] rounded-[28px] border border-white/[0.08] bg-[#071a13] lg:overflow-hidden lg:rounded-[32px]"
        >
          <picture className="relative block aspect-[2/1] overflow-hidden rounded-[27px] md:aspect-[3/1] lg:hidden">
            <PictureSources asset={ASSETS.funnel} />
            <img
              src={ASSETS.funnel.fallback}
              alt="Этапы работы Sellico: аналитика, остатки, реклама, CRM и прибыль"
              width={ASSETS.funnel.width}
              height={ASSETS.funnel.height}
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <motion.picture
            className="relative hidden lg:block"
            style={reduced ? undefined : { scale: imageScale, y: imageY }}
          >
            <PictureSources asset={ASSETS.funnel} />
            <img
              src={ASSETS.funnel.fallback}
              alt="Этапы работы Sellico: аналитика, остатки, реклама, CRM и прибыль"
              width={ASSETS.funnel.width}
              height={ASSETS.funnel.height}
              className="h-auto w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </motion.picture>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 aspect-[2/1] bg-gradient-to-b from-transparent via-transparent to-[#03110c]/95 lg:inset-0 lg:aspect-auto" />
          <div className="relative -mt-4 grid grid-cols-2 gap-2 p-3 pt-0 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:grid-cols-5 lg:p-8">
            {funnelSteps.map(([title, text], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className={cn(
                  'rounded-2xl border border-white/10 bg-[#061710]/95 p-4 backdrop-blur-md lg:bg-black/30',
                  index === funnelSteps.length - 1 && 'col-span-2 lg:col-span-1',
                )}
              >
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/78">{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function DemoSection() {
  const demoLoadRef = useRef<HTMLDivElement>(null);
  const shouldLoadDemo = useInView(demoLoadRef, { once: true, margin: '800px 0px' });

  return (
    <section id={SECTION_IDS.demo} className="content-auto bg-white py-24 lg:py-32">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Командная работа</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-ink-950 sm:text-6xl lg:text-7xl">
            Интерфейс команды — как в Sellico
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-600">
            Интерактивная копия рабочего пространства: задачи, организатор, заявки, отзывы, финансы, SEO, координация
            и чат собраны на одной странице. Изменены только демонстрационные данные.
          </p>
        </motion.div>

        <motion.div ref={demoLoadRef} {...reveal} className="mt-10 min-w-0 sm:mt-14">
          {shouldLoadDemo ? (
            <Suspense
              fallback={
                <div
                  role="status"
                  className="grid min-h-[760px] place-items-center rounded-[28px] border border-ink-950/[0.08] bg-[#f8faf9] text-sm font-medium text-ink-600"
                >
                  Загружаем интерактивный интерфейс…
                </div>
              }
            >
              <OperationalWorkspaceDemo />
            </Suspense>
          ) : (
            <div
              aria-hidden="true"
              className="min-h-[760px] rounded-[28px] border border-ink-950/[0.08] bg-[linear-gradient(135deg,#f8faf9,#eef7f2)]"
            />
          )}
        </motion.div>
      </Container>
    </section>
  );
}

function MarketplaceBanners() {
  const reduced = useReducedMotion();
  const bannersRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: bannersRef, offset: ['start end', 'end start'] });
  const firstY = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const secondY = useTransform(scrollYProgress, [0, 1], [-24, 30]);

  return (
    <section ref={bannersRef} className="content-auto bg-white pb-24 lg:pb-32">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Готовые сценарии</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-0.05em] text-ink-950 sm:text-6xl">
              Растите на каждом маркетплейсе
            </h2>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-ink-500">
            Общая экономика и процессы — с учетом правил каждой площадки.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2">
          <motion.article
            {...reveal}
            className="relative isolate min-h-[520px] overflow-hidden rounded-[32px] bg-[#7c20df] p-6 text-white sm:min-h-[355px] sm:p-10"
          >
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_12%,rgba(255,255,255,.24),transparent_32%),linear-gradient(135deg,#8f2cf1_0%,#6310c7_100%)]" />
            <div className="relative z-10 max-w-[350px]">
              <p className="text-3xl font-black tracking-[-0.04em]">wildberries</p>
              <h3 className="mt-8 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] sm:mt-10 sm:text-4xl">
                Управляйте продажами увереннее
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/72">
                Остатки, маржа, карточки и реклама Wildberries — в одном контуре.
              </p>
              <Button as="a" href={REGISTER_URL} variant="secondary" className="mt-7 rounded-xl text-ink-950" iconRight={<ArrowRight size={15} />}>
                Подключить WB
              </Button>
            </div>
            <picture className="pointer-events-none relative -mb-16 -mr-10 ml-auto mt-6 block h-[250px] w-auto sm:hidden">
              <PictureSources asset={ASSETS.wb} />
              <img
                src={ASSETS.wb.fallback}
                alt=""
                width={ASSETS.wb.width}
                height={ASSETS.wb.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <motion.picture
              className="pointer-events-none absolute -bottom-24 -right-12 hidden h-[430px] w-auto object-contain sm:block"
              style={reduced ? undefined : { y: firstY }}
            >
              <PictureSources asset={ASSETS.wb} />
              <img
                src={ASSETS.wb.fallback}
                alt=""
                width={ASSETS.wb.width}
                height={ASSETS.wb.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </motion.picture>
          </motion.article>

          <motion.article
            {...reveal}
            className="relative isolate min-h-[520px] overflow-hidden rounded-[32px] bg-[#075eff] p-6 text-white sm:min-h-[355px] sm:p-10"
          >
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_20%,rgba(255,255,255,.25),transparent_30%),linear-gradient(135deg,#1674ff_0%,#0049dd_100%)]" />
            <div className="relative z-10 max-w-[330px]">
              <p className="text-3xl font-black tracking-[-0.04em]">OZON</p>
              <h3 className="mt-8 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] sm:mt-10 sm:text-4xl">
                Продавайте больше без лишних расходов
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/72">
                Цены, остатки, поставки и эффективность рекламы Ozon в одном окне.
              </p>
              <Button as="a" href={REGISTER_URL} variant="secondary" className="mt-7 rounded-xl text-ink-950" iconRight={<ArrowRight size={15} />}>
                Подключить Ozon
              </Button>
            </div>
            <picture className="pointer-events-none relative -mb-16 -mr-10 ml-auto mt-6 block h-[250px] w-auto sm:hidden">
              <PictureSources asset={ASSETS.ozon} />
              <img
                src={ASSETS.ozon.fallback}
                alt=""
                width={ASSETS.ozon.width}
                height={ASSETS.ozon.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <motion.picture
              className="pointer-events-none absolute -bottom-24 -right-10 hidden h-[430px] w-auto object-contain sm:block"
              style={reduced ? undefined : { y: secondY }}
            >
              <PictureSources asset={ASSETS.ozon} />
              <img
                src={ASSETS.ozon.fallback}
                alt=""
                width={ASSETS.ozon.width}
                height={ASSETS.ozon.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </motion.picture>
          </motion.article>
        </div>
      </Container>
    </section>
  );
}

function CasesSection() {
  const platformClass = (platform: string) => {
    if (platform === 'WILDBERRIES') return 'text-[#a91fb6]';
    if (platform === 'OZON') return 'text-[#1769ff]';
    return 'text-ink-950';
  };

  return (
    <section id={SECTION_IDS.proof} className="content-auto border-y border-ink-950/[0.06] bg-[#f3f8f5] py-16 lg:py-24">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Типовые сценарии</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-ink-950 sm:text-6xl">
            Конкретная задача.
            <span className="block text-brand-700">Понятное решение.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg">
            Три модельные истории о том, как разные команды могут использовать Sellico в ежедневной работе.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {caseStories.map((item) => {
            const isDark = item.tone === 'dark';
            const shellClass =
              item.tone === 'rose'
                ? 'bg-[#f8dfdc] text-[#21173d]'
                : item.tone === 'dark'
                  ? 'bg-[#303149] text-white'
                  : 'bg-[#dff3e8] text-[#102b22]';

            return (
              <motion.article
                key={item.id}
                {...reveal}
                className={cn(
                  'flex min-w-0 flex-col overflow-hidden rounded-[28px] p-5 sm:p-7 lg:p-6 xl:p-8',
                  shellClass,
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={cn(
                          'rounded-full border px-3.5 py-2 text-xs font-bold',
                          isDark ? 'border-white/70 text-white' : 'border-current',
                        )}
                      >
                        {item.number}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-[0.15em]',
                          isDark ? 'text-white/76' : 'text-current/70',
                        )}
                      >
                        Модельная история
                      </span>
                    </div>

                    <p className={cn('mt-7 text-xs font-bold uppercase tracking-[0.14em]', isDark ? 'text-emerald-300' : 'text-brand-700')}>
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-3 break-words text-2xl font-semibold leading-[1.1] tracking-[-0.035em] lg:min-h-[106px] xl:text-[28px]">
                      {item.title}
                    </h3>

                    <ul className={cn('mt-6 space-y-2 text-sm font-medium leading-relaxed', isDark ? 'text-white/76' : 'text-current/78')}>
                      {item.facts.map((fact) => (
                        <li key={fact} className="flex gap-3">
                          <span aria-hidden>—</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex min-h-14 flex-wrap items-end gap-x-4 gap-y-2 pt-8">
                    {item.platforms.map((platform) => (
                      <span
                        key={platform}
                        className={cn(
                          'text-base font-black tracking-[-0.04em] xl:text-lg',
                          isDark && platform === 'ЯНДЕКС МАРКЕТ' ? 'text-white' : platformClass(platform),
                        )}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid min-w-0 content-start gap-3">
                  <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                    <div className="flex items-start justify-between gap-5">
                      <h4 className="text-xl font-semibold tracking-[-0.025em]">Задача</h4>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff1bc] text-sm font-bold text-[#8c6d00]">?</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-[13px] leading-relaxed text-[#39334f]">
                      {item.task.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span aria-hidden>—</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                    <div className="flex items-start justify-between gap-5">
                      <h4 className="text-xl font-semibold tracking-[-0.025em]">Что сделали</h4>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d8f7e7] text-lg text-[#1b8b61]">→</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-[13px] leading-relaxed text-[#39334f]">
                      {item.solution.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span aria-hidden>—</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                      <div className="flex items-start justify-between gap-5">
                        <h4 className="text-xl font-semibold tracking-[-0.025em]">Возможный эффект</h4>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e2f1ff] text-sm font-bold text-[#3175ae]">✓</span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-4">
                        {item.result.map(([value, label]) => (
                          <div key={label}>
                            <p className="text-2xl font-semibold tracking-[-0.05em] text-brand-700 xl:text-3xl">{value}</p>
                            <p className="mt-1 text-xs leading-snug text-[#666078]">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                      <div className="flex items-start justify-between gap-5">
                        <h4 className="text-xl font-semibold tracking-[-0.025em]">Срок</h4>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f1e5fb] text-sm font-bold text-[#8f51b9]">◷</span>
                      </div>
                      <p className="mt-5 text-sm font-medium leading-relaxed text-[#39334f]">{item.timeline}</p>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

      </Container>
    </section>
  );
}

function PricingSection() {
  const [enterpriseFormOpen, setEnterpriseFormOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('enterprise') === '1') {
      setEnterpriseFormOpen(true);
    }
  }, []);

  return (
    <section id={SECTION_IDS.pricing} className="content-auto bg-[#f4f8f6] py-24 lg:py-32">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Тарифы Sellico</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">
              Выберите масштаб. Возможности уже внутри.
            </h2>
          </div>
          <div className="rounded-[22px] border border-ink-950/[0.08] bg-white px-5 py-4 shadow-[0_18px_55px_-46px_rgba(8,44,31,.55)]">
            <p className="text-sm font-semibold text-ink-900">Все цены указаны за месяц</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">Каждый следующий тариф включает всё из предыдущего. Лимиты видны до подключения.</p>
          </div>
        </motion.div>

        <div className="-mx-4 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:pb-0 xl:grid-cols-4">
          {pricingPlans.map((plan, index) => (
            <motion.article
              key={plan.name}
              {...reveal}
              transition={{ ...reveal.transition, delay: index * 0.07 }}
              className={cn(
                'relative flex w-[84vw] max-w-[360px] shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border p-6 sm:w-[350px] sm:p-7 lg:w-auto lg:max-w-none',
                plan.featured
                  ? 'border-[#153d2e] bg-[#09271c] text-white shadow-[0_34px_85px_-52px_rgba(4,61,39,.85)]'
                  : 'border-ink-950/[0.08] bg-white text-ink-950 shadow-[0_24px_70px_-56px_rgba(8,44,31,.5)] transition-shadow duration-300 hover:shadow-[0_30px_80px_-50px_rgba(8,44,31,.65)]',
              )}
            >
              {plan.featured && (
                <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-[#6de6b4] to-emerald-300" />
              )}

              <div className="flex items-start justify-between gap-4">
                <h3 className={cn('text-xs font-bold uppercase tracking-[0.18em]', plan.featured ? 'text-emerald-300' : 'text-brand-700')}>{plan.name}</h3>
                {plan.featured && (
                  <span className="rounded-full border border-emerald-200/25 bg-emerald-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-200">
                    Полный контур
                  </span>
                )}
              </div>
              <p className={cn('mt-2 text-sm', plan.featured ? 'text-white/72' : 'text-ink-600')}>{plan.description}</p>

              <p className="mt-7 flex items-baseline gap-2 whitespace-nowrap">
                <span className="text-[clamp(2.1rem,2.6vw,2.9rem)] font-semibold leading-none tracking-[-0.06em]">{plan.price}</span>
                <span className={cn('text-xs font-medium', plan.featured ? 'text-white/72' : 'text-ink-600')}>в месяц</span>
              </p>

              {plan.name === 'Enterprise' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="mt-6 w-full rounded-xl !border-ink-950/10 !bg-transparent !text-ink-950 hover:!border-ink-950 hover:!bg-ink-950 hover:!text-white"
                  onClick={() => {
                    track('pricing_select', { plan: plan.name });
                    setEnterpriseFormOpen(true);
                  }}
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  as="a"
                  href={REGISTER_URL}
                  variant={plan.featured ? 'primary' : 'outline'}
                  size="lg"
                  className={cn(
                    'mt-6 w-full rounded-xl',
                    plan.featured
                      ? '!border-[#d5ff68] !bg-[#c8f44d] !text-[#123525] hover:!bg-[#d3fb6c]'
                      : '!border-ink-950/10 !bg-transparent !text-ink-950 hover:!border-ink-950 hover:!bg-ink-950 hover:!text-white',
                  )}
                  onClick={() => track('pricing_select', { plan: plan.name })}
                >
                  {plan.cta}
                </Button>
              )}

              <div
                className={cn(
                  'mt-7 grid grid-cols-3 divide-x rounded-2xl border text-center',
                  plan.featured ? 'divide-white/10 border-white/10 bg-white/[0.03]' : 'divide-ink-950/[0.07] border-ink-950/[0.08] bg-[#fafcfb]',
                )}
              >
                {plan.scale.map(([label, value]) => (
                  <div key={label} className="min-w-0 px-2 py-3.5">
                    <p className="font-mono text-lg font-semibold leading-none tabular-nums tracking-[-0.04em]">{value}</p>
                    <p className={cn('mt-1.5 truncate text-[10px] font-medium', plan.featured ? 'text-white/72' : 'text-ink-600')}>{label}</p>
                  </div>
                ))}
              </div>

              <p className={cn('mt-7 text-[10px] font-bold uppercase tracking-[0.16em]', plan.featured ? 'text-white/72' : 'text-ink-600')}>
                {plan.inherits ?? 'Что внутри'}
              </p>
              <ul className="mt-3.5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-snug">
                    <span
                      className={cn(
                        'mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full',
                        plan.featured ? 'bg-emerald-300/15 text-emerald-300' : 'bg-brand-50 text-brand-700',
                      )}
                    >
                      <Check size={11} strokeWidth={3.5} />
                    </span>
                    <span className={plan.featured ? 'text-white/88' : 'text-ink-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <motion.p {...reveal} className="mt-9 text-center text-sm text-ink-500">
          Каждый тариф: <span className="font-semibold text-ink-800">3 дня бесплатно</span> · подключение за 15 минут · без привязки карты
        </motion.p>
      </Container>
      {enterpriseFormOpen && typeof document !== 'undefined'
        ? createPortal(
            <EnterpriseImplementationForm onClose={() => setEnterpriseFormOpen(false)} />,
            document.body,
          )
        : null}
    </section>
  );
}

type EnterpriseLead = {
  name: string;
  email: string;
  contact: string;
  company: string;
  teamSize: string;
  stores: string;
  marketplaces: string[];
  goal: string;
};

const EMPTY_ENTERPRISE_LEAD: EnterpriseLead = {
  name: '',
  email: '',
  contact: '',
  company: '',
  teamSize: '',
  stores: '',
  marketplaces: [],
  goal: '',
};

function EnterpriseImplementationForm({ onClose }: { onClose: () => void }) {
  const [lead, setLead] = useState<EnterpriseLead>(EMPTY_ENTERPRISE_LEAD);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(true, dialogRef, onClose);

  const updateField = (field: keyof EnterpriseLead, value: string) => {
    setLead((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const toggleMarketplace = (marketplace: string) => {
    setLead((current) => ({
      ...current,
      marketplaces: current.marketplaces.includes(marketplace)
        ? current.marketplaces.filter((item) => item !== marketplace)
        : [...current.marketplaces, marketplace],
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lead.name.trim() || !lead.company.trim()) {
      setError('Укажите ваше имя и компанию.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) {
      setError('Введите корректный рабочий email.');
      return;
    }
    if (!lead.goal.trim()) {
      setError('Коротко опишите задачу внедрения.');
      return;
    }
    if (!consent) {
      setError('Подтвердите согласие на обработку данных.');
      return;
    }

    const message = [
      'Запрос на внедрение Sellico Enterprise',
      '',
      `Имя: ${lead.name.trim()}`,
      `Компания: ${lead.company.trim()}`,
      `Рабочий email: ${lead.email.trim()}`,
      `Телефон или Telegram: ${lead.contact.trim() || 'не указан'}`,
      `Команда: ${lead.teamSize || 'не указано'}`,
      `Магазины: ${lead.stores || 'не указано'}`,
      `Маркетплейсы: ${lead.marketplaces.join(', ') || 'не указаны'}`,
      '',
      'Задача внедрения:',
      lead.goal.trim(),
    ].join('\n');

    track('lead_submit', { source: 'enterprise_implementation' });
    window.location.href = `mailto:hello@sellico.ru?subject=${encodeURIComponent('Внедрение Sellico Enterprise')}&body=${encodeURIComponent(message)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#041d14]/70 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enterprise-form-title"
        aria-describedby="enterprise-form-description"
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto grid max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white shadow-[0_40px_120px_-35px_rgba(0,25,16,.75)] sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-[0.78fr_1.22fr] lg:overflow-hidden"
      >
        <button
          type="button"
          aria-label="Закрыть форму"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-ink-950/10 bg-white/90 text-ink-700 shadow-sm transition hover:bg-white hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:right-5 sm:top-5"
        >
          <X size={19} />
        </button>

        <aside className="relative isolate overflow-hidden bg-[#09271c] px-6 pb-8 pt-16 text-white sm:px-9 sm:pb-10 sm:pt-20 lg:px-10 lg:py-12">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_8%,rgba(105,229,174,.3),transparent_34%),radial-gradient(circle_at_5%_90%,rgba(75,177,130,.2),transparent_38%)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Sellico Enterprise</p>
          <h2 id="enterprise-form-title" className="mt-4 max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-4xl">
            Обсудим внедрение под ваш бизнес
          </h2>
          <p id="enterprise-form-description" className="mt-5 max-w-sm text-sm leading-relaxed text-white/62">
            Расскажите о текущем масштабе и задаче. Мы подготовим сценарий запуска, состав интеграций и условия сопровождения.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              [Store, 'Магазины и кабинеты', 'Учтём все площадки и юрлица'],
              [Users2, 'Команда и роли', 'Настроим доступы и процессы'],
              [Puzzle, 'Интеграции', 'Соберём нужный контур данных'],
            ].map(([Icon, title, description]) => (
              <div key={title as string} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-300/12 text-emerald-300">
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title as string}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-white/72">{description as string}</span>
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-white/70">
            Обычно отвечаем в течение рабочего дня.
          </p>
        </aside>

        <form onSubmit={submit} className="px-5 pb-7 pt-7 sm:px-9 sm:pb-9 sm:pt-9 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:px-10 lg:pb-10 lg:pt-12">
          <div className="pr-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Запрос на консультацию</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink-950">Несколько деталей о проекте</h3>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Ваше имя <span className="sr-only">(обязательно)</span>
              <span className="relative">
                <Users2 aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  autoFocus
                  required
                  value={lead.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Как к вам обращаться"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Компания <span className="sr-only">(обязательно)</span>
              <span className="relative">
                <Building2 aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  required
                  value={lead.company}
                  onChange={(event) => updateField('company', event.target.value)}
                  placeholder="Название компании"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Рабочий email <span className="sr-only">(обязательно)</span>
              <span className="relative">
                <Mail aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  required
                  type="email"
                  inputMode="email"
                  value={lead.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="name@company.ru"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Телефон или Telegram
              <span className="relative">
                <Phone aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  value={lead.contact}
                  onChange={(event) => updateField('contact', event.target.value)}
                  placeholder="+7 или @username"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Размер команды
              <select
                value={lead.teamSize}
                onChange={(event) => updateField('teamSize', event.target.value)}
                className="h-12 rounded-xl border border-ink-950/10 bg-[#f8faf9] px-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">Выберите</option>
                <option>1–5 человек</option>
                <option>6–20 человек</option>
                <option>21–50 человек</option>
                <option>Больше 50</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Количество магазинов
              <select
                value={lead.stores}
                onChange={(event) => updateField('stores', event.target.value)}
                className="h-12 rounded-xl border border-ink-950/10 bg-[#f8faf9] px-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">Выберите</option>
                <option>1–3 магазина</option>
                <option>4–10 магазинов</option>
                <option>11–30 магазинов</option>
                <option>Больше 30</option>
              </select>
            </label>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-ink-800">Маркетплейсы</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Wildberries', 'Ozon', 'Яндекс Маркет', 'Другие'].map((marketplace) => {
                const selected = lead.marketplaces.includes(marketplace);
                return (
                  <button
                    key={marketplace}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleMarketplace(marketplace)}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      selected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-ink-950/10 bg-[#f8faf9] text-ink-600 hover:border-brand-500/40 hover:text-brand-800',
                    )}
                  >
                    {selected && <Check className="mr-1 inline" size={13} strokeWidth={3} />}
                    {marketplace}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="mt-5 grid gap-1.5 text-sm font-medium text-ink-800">
            Что нужно внедрить? <span className="sr-only">(обязательно)</span>
            <textarea
              required
              rows={4}
              value={lead.goal}
              onChange={(event) => updateField('goal', event.target.value)}
              placeholder="Например: объединить 12 магазинов, настроить финансовую аналитику и работу команды…"
              className="min-h-28 resize-y rounded-xl border border-ink-950/10 bg-[#f8faf9] px-4 py-3 text-sm leading-relaxed text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-500">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setError('');
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#16865d]"
            />
            <span>
              Я согласен на обработку персональных данных в соответствии с{' '}
              <a href="/privacy/" className="font-medium text-brand-700 underline-offset-2 hover:underline">
                политикой конфиденциальности
              </a>
              .
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" className="w-full rounded-xl sm:w-auto" iconRight={<ArrowRight size={17} />}>
              Отправить запрос
            </Button>
            <p className="text-xs leading-relaxed text-ink-600">
              Откроем почту с уже заполненной заявкой.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function HelpAndStartSection() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Введите корректный email.');
      return;
    }
    if (!consent) {
      setError('Подтвердите согласие на обработку данных.');
      return;
    }
    track('lead_submit', { source: 'landing_v2_final_cta' });
    window.location.href = `${REGISTER_URL}?email=${encodeURIComponent(email)}`;
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className="content-auto bg-white px-4 py-20 lg:py-28">
      <Container className="lg:max-w-none lg:px-12">
        <motion.div
          {...reveal}
          className="overflow-hidden rounded-[34px] border border-ink-950/[0.08] bg-white shadow-[0_36px_110px_-82px_rgba(8,44,31,.62)]"
        >
          <div className="grid gap-6 border-b border-ink-950/[0.08] px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.52fr)] lg:items-end lg:px-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Вопросы и быстрый старт</p>
              <h2 id="faq-title" className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-ink-950 sm:text-6xl">
                Всё важное перед подключением
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
              Сначала проверьте условия, затем подключите магазин — всё в одном месте, без переходов между секциями.
            </p>
          </div>

          <div className="grid lg:grid-cols-[minmax(330px,.78fr)_minmax(0,1.22fr)]">
            <aside
              id={SECTION_IDS.cta}
              className="relative isolate order-2 overflow-hidden bg-[#086447] px-6 py-10 text-white sm:px-9 sm:py-12 lg:order-1 lg:px-10 lg:py-12 xl:px-12"
            >
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_86%_2%,rgba(127,241,190,.42),transparent_32%),radial-gradient(circle_at_8%_96%,rgba(23,154,108,.45),transparent_34%),linear-gradient(145deg,#0b7955_0%,#075f43_58%,#064b36_100%)]"
              />
              <div className="lg:sticky lg:top-28">
                <div className="flex items-center gap-3 text-emerald-100">
                  <Sparkles size={17} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em]">3 дня бесплатно</p>
                </div>
                <h3 className="mt-5 max-w-lg text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-[3.35rem]">
                  Перейдите от вопросов к своим данным
                </h3>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/72 sm:text-base">
                  Подключите магазин и увидьте финансы, остатки, рекламу и задачи в одном рабочем центре.
                </p>

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-white/82">
                  {['Без привязки карты', 'Подключение около 15 минут'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <CircleCheck size={15} className="text-emerald-200" />
                      {item}
                    </span>
                  ))}
                </div>

                <form onSubmit={submit} className="mt-8 rounded-[22px] border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <div className="flex flex-col gap-3">
                    <label className="sr-only" htmlFor="final-email">Рабочий email</label>
                    <input
                      id="final-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Рабочий email"
                      autoComplete="email"
                      className="h-14 min-w-0 w-full rounded-xl border border-white/10 bg-white px-4 text-base text-ink-950 outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-emerald-300"
                      aria-invalid={Boolean(error)}
                      required
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="lg"
                      className="w-full rounded-xl !border-transparent !bg-[#c8f44d] !text-[#123525] !shadow-[0_12px_32px_-16px_rgba(200,244,77,.72)] hover:!bg-[#d5ff68]"
                      iconRight={<ArrowRight size={16} />}
                    >
                      Подключить магазин
                    </Button>
                  </div>
                  <label className="mt-3 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-white/82">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => {
                        setConsent(event.target.checked);
                        if (error) setError('');
                      }}
                      className="mt-0.5 h-4 w-4 rounded accent-[#c8f44d]"
                      required
                    />
                    <span>Согласен с <a href="/privacy/" className="text-white underline underline-offset-2">политикой обработки данных</a>.</span>
                  </label>
                  {error && <p role="alert" className="mt-2 rounded-lg bg-white/10 px-2.5 py-2 text-xs font-medium text-rose-100">{error}</p>}
                </form>
              </div>
            </aside>

            <div className="order-1 px-6 py-2 sm:px-9 lg:order-2 lg:px-10 lg:py-5 xl:px-12">
              <div className="divide-y divide-ink-950/[0.08]">
                {FAQ_ITEMS.map((item, index) => (
                  <details
                    key={item.question}
                    className="group py-1"
                    open={index === 0}
                    onToggle={(event) => {
                      if (event.currentTarget.open) track('faq_open', { question: item.question });
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-base font-semibold tracking-[-0.025em] text-ink-950 marker:content-none sm:text-lg [&::-webkit-details-marker]:hidden">
                      <h3 className="text-inherit font-inherit">{item.question}</h3>
                      <span
                        aria-hidden
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink-950/10 bg-[#f4f8f6] text-brand-700 transition-transform duration-200 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="max-w-3xl pb-6 pr-8 text-[15px] leading-[1.7] text-ink-500 sm:pr-12 sm:text-base">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export function XwayInspiredLanding() {
  return (
    <main id="main-content" tabIndex={-1} className="overflow-hidden bg-white text-ink-950 outline-none">
      <PromoBanner />
      <Hero />
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
