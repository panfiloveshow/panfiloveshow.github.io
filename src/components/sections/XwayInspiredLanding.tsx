import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Activity,
  ClipboardList,
  Layers3,
  Megaphone,
  MessageSquareText,
  PackageCheck,
  Radar,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users2,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { REGISTER_URL, SECTION_IDS, scrollToHashOnReady, scrollToSection } from '@/lib/anchors';
import { track } from '@/lib/analytics';

const OperationalWorkspaceDemo = lazy(() =>
  import('@/components/primitives/OperationalWorkspaceDemo').then((m) => ({
    default: m.OperationalWorkspaceDemo,
  })),
);

const LandingFinalSections = lazy(() =>
  import('@/components/sections/LandingFinalSections').then((m) => ({
    default: m.LandingFinalSections,
  })),
);

const fade = {
  initial: false,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-90px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const stats = [
  {
    title: 'WB',
    label: 'товары, остатки, заказы, карточки и рекламные данные',
    type: 'wb',
  },
  {
    title: 'Ozon',
    label: 'каталог, остатки, продажи, кампании и коммуникации',
    type: 'ozon',
  },
  {
    title: 'Я.Маркет',
    label: 'ассортимент, поставки, заказы и операционные события',
    type: 'market',
  },
  {
    title: 'API',
    label: 'единый контур данных для CRM, финансов и команды',
    type: 'api',
  },
];

const heroProofStats = [
  ['3 маркетплейса', 'WB, Ozon и Яндекс Маркет в едином рабочем контуре'],
  ['5 минут', 'быстрое подключение магазинов и ролей команды'],
  ['14 дней', 'бесплатный старт без привязки карты'],
];

const funnel = [
  {
    title: 'CRM и продажи',
    text: 'Лиды, клиенты, заявки и воронка продаж не теряются между чатами и таблицами.',
    icon: Users2,
    asset: '/visual-kit/team-768.webp',
  },
  {
    title: 'Товары и каталог',
    text: 'Карточки, остатки, себестоимость и синхронизация товаров из маркетплейсов.',
    icon: ShoppingBag,
    asset: '/visual-kit/warehouse-768.webp',
  },
  {
    title: 'Финансы',
    text: 'Выручка, расходы, прибыльность, ABC-анализ, транзакции и отчеты.',
    icon: BarChart3,
    asset: '/visual-kit/features/finance.webp',
  },
  {
    title: 'Поставки',
    text: 'Автопланы, рекомендации, согласование поставок и экспорт для команды.',
    icon: Truck,
    asset: '/visual-kit/features/supply.webp',
  },
  {
    title: 'Задачи и команда',
    text: 'Канбан, дедлайны, роли, подзадачи и обсуждения в одном рабочем пространстве.',
    icon: ClipboardList,
    asset: '/visual-kit/features/team.webp',
  },
  {
    title: 'SEO и карточки',
    text: 'Аудит карточек, AI-генерация и массовое редактирование описаний.',
    icon: Search,
    asset: '/visual-kit/features/seo.webp',
  },
  {
    title: 'Реклама',
    text: 'Кампании, ставки, фразы, рекомендации и эффективность рекламы по данным.',
    icon: Megaphone,
    asset: '/visual-kit/features/ads.webp',
  },
  {
    title: 'Отзывы и связи',
    text: 'Автоответы, шаблоны, почта, чат и уведомления для клиентов и команды.',
    icon: MessageSquareText,
    asset: '/visual-kit/automation/expenses-768.webp',
  },
];

const tools = [
  ['CRM → сделка', 'Заявки превращаются в лиды, клиентов, задачи и сделки без потери контекста.'],
  ['Каталог → остатки', 'Товары, карточки, себестоимость и остатки связаны с продажами и поставками.'],
  ['Финансы → прибыль', 'Комиссии, расходы, выручка, ABC и транзакции показывают реальную экономику.'],
  ['Поставки → план', 'Автопланы и рекомендации помогают пополнять склады вовремя.'],
  ['Команда → контроль', 'Канбан, роли, дедлайны и обсуждения держат операционные процессы в порядке.'],
  ['AI → ускорение', 'SEO, отзывы, реклама и автопланы получают подсказки и генерацию там, где это нужно.'],
];

const funnelStages = [
  {
    step: 'Этап 1',
    title: 'Подключаете магазины и каналы',
    asset: '/visual-kit/stages/analysis.webp',
    goal: 'Собрать маркетплейсы, обращения, товары и команду в единое рабочее пространство.',
    metric: 'Магазины, заявки, товары, роли',
    tool: 'Интеграции + CRM',
    work: [
      'подключаете WB, Ozon, Яндекс Маркет и API-источники',
      'настраиваете рабочие пространства, роли и доступы',
      'заявки и коммуникации начинают попадать в CRM',
    ],
  },
  {
    step: 'Этап 2',
    title: 'Собираем товары, остатки, заказы и финансы',
    asset: '/visual-kit/stages/seo.webp',
    goal: 'Видеть каталог, себестоимость, остатки, выручку и расходы в одной связанной модели.',
    metric: 'SKU, остатки, прибыль, ABC',
    tool: 'Каталог + финансы',
    work: [
      'синхронизируем карточки, остатки и себестоимость',
      'собираем транзакции, расходы и отчеты',
      'показываем прибыльность по товарам и категориям',
    ],
  },
  {
    step: 'Этап 3',
    title: 'Команда работает через задачи, CRM и коммуникации',
    asset: '/visual-kit/stages/ads.webp',
    goal: 'Каждый видит свои заявки, дедлайны, обсуждения, подзадачи и ответственность.',
    metric: 'Лиды, задачи, дедлайны, SLA',
    tool: 'CRM + канбан + коммуникации',
    work: [
      'заявки конвертируются в лиды и клиентов',
      'задачи проходят канбан, роли и подзадачи',
      'почта, чат, отзывы и уведомления не выпадают из процесса',
    ],
  },
  {
    step: 'Этап 4',
    title: 'Система помогает планировать поставки, рекламу и карточки',
    asset: '/visual-kit/stages/supply.webp',
    goal: 'Использовать AI там, где он ускоряет операционку: SEO, отзывы, реклама и автопланы.',
    metric: 'План поставки, SEO, отзывы, реклама',
    tool: 'AI-модули Sellico',
    work: [
      'формируем автопланы поставок и рекомендации',
      'генерируем описания и помогаем с аудитом карточек',
      'подсказываем действия по отзывам и рекламным кампаниям',
    ],
  },
];

const pluginPoints = [
  'Показывает прибыль, ROI и комиссии прямо рядом с товарами',
  'Подсвечивает слабые карточки, позиции и рекламные риски',
  'Помогает быстро найти SKU в выдаче и сравнить его с конкурентами',
  'Собирает историю спроса, ключи и рекомендации без выгрузок',
  'Передает находки в Sellico OS как задачи для команды',
];

const automationTools = [
  {
    num: '1',
    title: 'CRM и заявки',
    text: 'Лиды, клиенты, воронка и конвертация обращений в сделки.',
    asset: '/visual-kit/automation/metrics.webp',
  },
  {
    num: '2',
    title: 'Канбан и задачи',
    text: 'Дедлайны, роли, подзадачи и обсуждения внутри команды.',
    asset: '/visual-kit/automation/bidder.webp',
  },
  {
    num: '3',
    title: 'Товары и каталог',
    text: 'Синхронизация карточек, остатков и себестоимости.',
    asset: '/visual-kit/automation/clusters.webp',
  },
  {
    num: '4',
    title: 'Отзывы и почта',
    text: 'Шаблоны, автоответы, чат и уведомления в одном контуре.',
    asset: '/visual-kit/automation/heatmap.webp',
  },
  {
    num: '5',
    title: 'SEO и генерация',
    text: 'AI-аудит карточек, описания и массовое редактирование.',
    asset: '/visual-kit/automation/stock.webp',
  },
  {
    num: '6',
    title: 'Ads Intelligence',
    text: 'Кампании, ставки, фразы, рекомендации и эффективность.',
    asset: '/visual-kit/automation/expenses-768.webp',
  },
];

const aiOrbitCards = [
  { title: 'SEO', text: 'AI-генерация описаний', pos: 'left-[8%] top-[18%]', icon: Sparkles },
  { title: 'Отзывы', text: 'шаблоны и автоответы', pos: 'right-[8%] top-[20%]', icon: MessageSquareText },
  { title: 'Реклама', text: 'рекомендации по ставкам', pos: 'left-[10%] bottom-[18%]', icon: Megaphone },
  { title: 'Поставки', text: 'автопланы и согласование', pos: 'right-[10%] bottom-[16%]', icon: PackageCheck },
];

const hypeSignals = [
  ['Новая заявка', 'попала в CRM и воронку'],
  ['Задача', 'назначена ответственному'],
  ['Остатки', 'синхронизированы с каталогом'],
  ['Поставка', 'ожидает согласования'],
  ['Отзыв', 'готов шаблон ответа'],
  ['Реклама', 'есть рекомендация по кампании'],
];

function HypeRail() {
  return (
    <div className="overflow-hidden border-y border-ink-950/10 bg-[#07120e] py-3 text-white">
      <div className="flex w-max animate-marquee gap-2.5">
        {[...hypeSignals, ...hypeSignals].map(([value, label], index) => (
          <div
            key={`${value}-${index}`}
            className="flex min-w-[255px] items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]"
          >
            <span className="text-[15px] font-semibold text-emerald-300">{value}</span>
            <span className="text-xs text-white/55">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceLogo({ type }: { type: string }) {
  if (type === 'wb') {
    return (
      <div className="relative flex h-20 w-full max-w-full items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#b51cff_0%,#6c2cff_55%,#9d23ff_100%)] shadow-[0_24px_54px_-34px_rgba(137,36,255,.9)]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.35),transparent_34%)]" />
        <span className="relative text-[1.65rem] font-black tracking-[-0.08em] text-white">wildberries</span>
      </div>
    );
  }

  if (type === 'ozon') {
    return (
      <div className="relative flex h-20 w-full max-w-full items-center justify-center overflow-hidden rounded-xl bg-[#005bff] shadow-[0_24px_54px_-34px_rgba(0,91,255,.95)]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,.28),transparent_34%)]" />
        <span className="relative text-[2.05rem] font-black tracking-normal text-white">OZON</span>
      </div>
    );
  }

  if (type === 'market') {
    return (
      <div className="relative flex h-20 w-full max-w-full items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_24px_54px_-38px_rgba(15,23,42,.55)] ring-1 ring-ink-950/10">
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fc3f1d] text-[1.9rem] font-black leading-none text-white shadow-[0_14px_28px_-18px_rgba(252,63,29,.9)]">
            Я
          </span>
          <span className="text-[1.35rem] font-black tracking-[-0.06em] text-black">Маркет</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-20 w-full max-w-full items-center justify-center overflow-hidden rounded-xl bg-[#10241c] shadow-[0_24px_54px_-34px_rgba(16,36,28,.85)]">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(91,228,155,.32),transparent_34%)]" />
      <div className="relative flex items-center gap-3 text-emerald-300">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/30 bg-emerald-300/10 font-mono text-lg font-bold">{'{}'}</span>
        <span className="text-[1.65rem] font-black tracking-[0.02em]">API</span>
      </div>
    </div>
  );
}

function AiWowCore() {
  const reduced = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#06100c] p-8 text-white shadow-[0_50px_160px_-80px_rgba(0,0,0,.9)] lg:p-12">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_55%_54%,rgba(91,228,155,.28),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(44,186,102,.18),transparent_26%)]" />
      <div aria-hidden className="absolute inset-0 grid-bg-dark opacity-45 [background-size:58px_58px]" />

      <div className="relative z-20 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="max-w-[560px]">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">AI command center</p>
          <h3 className="mt-5 text-4xl font-semibold leading-[0.95] tracking-[-0.04em] lg:text-5xl">
            AI помогает там, где в операционке больше всего ручной работы.
          </h3>
          
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {aiOrbitCards.map(({ title, text, icon: IconComponent }) => (
              <div
                key={title}
                className="group flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.02] p-3.5 backdrop-blur-md transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.8rem] border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 transition-colors group-hover:bg-emerald-500/20">
                  <IconComponent size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-[12px] text-white/50">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center lg:justify-end">
          <motion.img
            src="/visual-kit/story/ai-command-core.webp"
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[115%] max-w-[650px] select-none drop-shadow-[0_40px_70px_rgba(91,228,155,.15)] lg:-mr-[10%] lg:w-[125%] lg:max-w-none"
          />
        </div>
      </div>
    </div>
  );
}

function HeroBentoBlocks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const warehouseY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [24, -26]);
  const teamY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [12, -36]);

  return (
    <div ref={ref} className="relative flex w-full flex-col gap-4 lg:gap-5">
      {/* Top Block: Dashboard + AI */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="group relative h-[360px] w-full overflow-hidden rounded-[1.75rem] border border-ink-950/10 bg-white shadow-[0_30px_90px_-55px_rgba(15,23,42,.75)] transition-shadow hover:shadow-[0_34px_110px_-60px_rgba(15,23,42,.9)] sm:h-[500px] lg:rounded-[2rem]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_8%,rgba(45,187,144,0.14),transparent_44%),linear-gradient(180deg,#ffffff_0%,#f4faf6_100%)]" />
        <div className="relative z-20 flex items-start justify-between gap-4 p-5 sm:p-7 lg:p-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
              CRM + товары + финансы
            </span>
            <h3 className="mt-4 max-w-[360px] text-[1.65rem] font-semibold leading-none tracking-[-0.03em] text-ink-950 sm:text-4xl">
              Рабочий центр продаж
            </h3>
          </div>
          <div className="hidden rounded-2xl border border-ink-950/10 bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">чистая прибыль</p>
            <p className="mt-1 font-mono text-2xl font-bold text-ink-950">+18%</p>
          </div>
        </div>
        
        <picture>
          <source
            type="image/avif"
            srcSet="/visual-kit/dashboard-480.avif 480w, /visual-kit/dashboard-768.avif 768w, /visual-kit/dashboard-960.avif 960w, /visual-kit/dashboard-1200.avif 1200w, /visual-kit/dashboard.avif 1536w"
            sizes="(min-width: 640px) 48vw, 118vw"
          />
          <source
            type="image/webp"
            srcSet="/visual-kit/dashboard-480.webp 480w, /visual-kit/dashboard-768.webp 768w, /visual-kit/dashboard-960.webp 960w, /visual-kit/dashboard-1200.webp 1200w, /visual-kit/dashboard.webp 1536w"
            sizes="(min-width: 640px) 48vw, 118vw"
          />
          <motion.img
            src="/visual-kit/dashboard.webp"
            alt="Dashboard"
            loading="eager"
            decoding="async"
            width={1536}
            height={1024}
            animate={reduced ? undefined : { y: [0, -10, 0] }}
            transition={reduced ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-[6%] left-[-9%] w-[118%] select-none drop-shadow-[0_24px_48px_rgba(15,23,42,0.18)] transition-transform duration-700 group-hover:scale-[1.03] sm:-bottom-[13%] sm:left-auto sm:right-[-8%] sm:w-[96%]"
            draggable={false}
          />
        </picture>
        
        <picture>
          <source
            type="image/avif"
            srcSet="/visual-kit/ai-card-480.avif 480w, /visual-kit/ai-card-768.avif 768w, /visual-kit/ai-card-960.avif 960w, /visual-kit/ai-card-1200.avif 1200w, /visual-kit/ai-card.avif 1536w"
            sizes="(min-width: 640px) 34vw, 50vw"
          />
          <source
            type="image/webp"
            srcSet="/visual-kit/ai-card-480.webp 480w, /visual-kit/ai-card-768.webp 768w, /visual-kit/ai-card-960.webp 960w, /visual-kit/ai-card-1200.webp 1200w, /visual-kit/ai-card.webp 1536w"
            sizes="(min-width: 640px) 34vw, 50vw"
          />
          <motion.img
            src="/visual-kit/ai-card.webp"
            alt="AI Features"
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            animate={reduced ? undefined : { y: [0, -15, 0] }}
            transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-[30%] left-[4%] z-20 w-[50%] select-none drop-shadow-[0_22px_34px_rgba(15,23,42,0.18)] sm:bottom-[28%] sm:left-[7%] sm:w-[34%]"
            draggable={false}
          />
        </picture>
      </motion.div>

      {/* Bottom Block: Merged Team + Warehouse */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="group relative flex h-[220px] w-full overflow-hidden rounded-[1.75rem] border border-ink-950/10 bg-[#101821] shadow-[0_26px_80px_-58px_rgba(15,23,42,.95)] transition-shadow hover:shadow-xl sm:h-[300px] lg:rounded-[2rem]"
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(45,187,144,.24),transparent_38%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,17,25,.96)_0%,rgba(10,17,25,.80)_38%,rgba(10,17,25,.18)_76%)]" />
        <div className="relative z-10 w-[58%] p-5 sm:p-8">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Команда и поставки</h3>
          <p className="mt-3 max-w-[250px] text-sm leading-relaxed text-[#c8d8d2] sm:text-base">
            Задачи, роли, остатки и автопланы в одном контуре.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            без таблиц и ручных сверок
          </div>
        </div>

        <picture>
          <source
            type="image/avif"
            srcSet="/visual-kit/warehouse-480.avif 480w, /visual-kit/warehouse-768.avif 768w, /visual-kit/warehouse-960.avif 960w, /visual-kit/warehouse-1200.avif 1200w, /visual-kit/warehouse.avif 1536w"
            sizes="(min-width: 640px) 34vw, 68vw"
          />
          <source
            type="image/webp"
            srcSet="/visual-kit/warehouse-480.webp 480w, /visual-kit/warehouse-768.webp 768w, /visual-kit/warehouse-960.webp 960w, /visual-kit/warehouse-1200.webp 1200w, /visual-kit/warehouse.webp 1536w"
            sizes="(min-width: 640px) 34vw, 68vw"
          />
          <motion.img
            src="/visual-kit/warehouse.webp"
            alt="Warehouse"
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            style={{ y: warehouseY }}
            className="absolute -bottom-[18%] right-[16%] z-20 w-[68%] select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.22)] transition-transform duration-700 group-hover:scale-105 sm:-bottom-[18%] sm:right-[30%] sm:w-[58%]"
            draggable={false}
          />
        </picture>

        <picture>
          <source
            type="image/avif"
            srcSet="/visual-kit/team-480.avif 480w, /visual-kit/team-768.avif 768w, /visual-kit/team-960.avif 960w, /visual-kit/team-1200.avif 1200w, /visual-kit/team.avif 1536w"
            sizes="(min-width: 640px) 34vw, 72vw"
          />
          <source
            type="image/webp"
            srcSet="/visual-kit/team-480.webp 480w, /visual-kit/team-768.webp 768w, /visual-kit/team-960.webp 960w, /visual-kit/team-1200.webp 1200w, /visual-kit/team.webp 1536w"
            sizes="(min-width: 640px) 34vw, 72vw"
          />
          <motion.img
            src="/visual-kit/team.webp"
            alt="Team"
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            style={{ y: teamY }}
            className="absolute -bottom-[14%] -right-[18%] z-30 w-[72%] select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.24)] transition-transform duration-700 group-hover:scale-105 sm:-bottom-[8%] sm:-right-[8%] sm:w-[58%]"
            draggable={false}
          />
        </picture>

      </motion.div>
    </div>
  );
}

function MediaAssetSection() {
  const reduced = useReducedMotion();

  return (
    <motion.div {...fade} className="mb-10 overflow-hidden rounded-2xl border border-ink-950/10 bg-white shadow-[0_30px_110px_-80px_rgba(15,23,42,.8)]">
      <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="p-6 lg:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">/ операционная карта</p>
          <h3 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.035em] text-black sm:text-4xl lg:text-5xl">
            Система связывает обращения, товары, деньги и задачи.
          </h3>
          <p className="mt-5 text-lg leading-relaxed text-ink-500">
            Sellico показывает не отдельный отчет, а путь от заявки и SKU до прибыли, поставки, рекламы и ответственности команды.
          </p>
        </div>
        <div className="relative min-h-[360px] overflow-hidden bg-[#f6f8f5] sm:min-h-[480px]">
          <div aria-hidden className="absolute inset-6 rounded-2xl bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" />
          <div aria-hidden className="absolute bottom-8 left-8 right-8 h-48 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,.14),transparent_62%)] blur-xl" />
          <motion.img
            src="/visual-kit/dashboard.webp"
            alt="Интерфейс Sellico"
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[-8%] top-5 z-20 w-[92%] drop-shadow-[0_32px_45px_rgba(15,23,42,.18)] sm:right-[3%] sm:top-[3%] sm:w-[70%]"
          />
          <motion.img
            src="/visual-kit/warehouse.webp"
            alt=""
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            animate={reduced ? undefined : { y: [0, 8, 0] }}
            transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[2%] left-[1%] z-30 w-[46%] drop-shadow-[0_24px_34px_rgba(15,23,42,.18)] sm:bottom-[8%] sm:left-[4%] sm:w-[34%]"
          />
          <motion.img
            src="/visual-kit/ai-card.webp"
            alt=""
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={reduced ? undefined : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[8%] top-[42%] z-40 w-[40%] drop-shadow-[0_22px_32px_rgba(15,23,42,.16)] sm:left-[30%] sm:top-[45%] sm:w-[28%]"
          />
          <motion.img
            src="/visual-kit/team.webp"
            alt=""
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
            animate={reduced ? undefined : { y: [0, 7, 0] }}
            transition={reduced ? undefined : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[-1%] right-[-8%] z-30 w-[54%] drop-shadow-[0_24px_36px_rgba(15,23,42,.18)] sm:bottom-[3%] sm:right-[2%] sm:w-[34%]"
          />
        </div>
      </div>
    </motion.div>
  );
}

function DemoSkeleton() {
  return (
    <div
      aria-hidden
      className="min-h-[620px] overflow-hidden rounded-[1.35rem] border border-ink-950/10 bg-white shadow-[0_42px_140px_-78px_rgba(15,23,42,.8)] lg:rounded-[1.75rem]"
    >
      <div className="h-16 border-b border-ink-950/10 bg-[#f8fbf8]" />
      <div className="grid gap-4 p-4 lg:grid-cols-[0.72fr_1.28fr] lg:p-6">
        <div className="space-y-3">
          <div className="h-16 rounded-2xl bg-[#eef5ef]" />
          <div className="h-16 rounded-2xl bg-[#eef5ef]" />
          <div className="h-16 rounded-2xl bg-[#eef5ef]" />
        </div>
        <div className="min-h-[420px] rounded-2xl bg-[#f3f7f4]" />
      </div>
    </div>
  );
}

function DeferredOperationalWorkspaceDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shouldLoad) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '700px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <Suspense fallback={<DemoSkeleton />}>
          <OperationalWorkspaceDemo />
        </Suspense>
      ) : (
        <DemoSkeleton />
      )}
    </div>
  );
}

function FinalSectionsSkeleton() {
  return (
    <>
      <section id={SECTION_IDS.proof} className="content-auto bg-white py-24 lg:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="h-32 max-w-3xl flex-1 rounded-2xl bg-[#eef5ef]" />
            <div className="h-24 w-full max-w-md rounded-2xl bg-[#eef5ef]" />
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-56 rounded-2xl border border-ink-950/10 bg-[#f7f8f5]" />
            ))}
          </div>
        </Container>
      </section>

      <section id={SECTION_IDS.pricing} className="content-auto py-24 lg:py-32">
        <Container>
          <div className="mx-auto mb-12 h-32 max-w-2xl rounded-2xl bg-white" />
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[420px] rounded-2xl bg-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] ring-1 ring-ink-950/5" />
            ))}
          </div>
        </Container>
      </section>

      <section id={SECTION_IDS.cta} className="content-auto px-4 pb-24">
        <Container>
          <div className="h-80 rounded-2xl bg-black/90" />
        </Container>
      </section>
    </>
  );
}

function DeferredFinalSections() {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shouldLoad) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1100px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <Suspense fallback={<FinalSectionsSkeleton />}>
          <LandingFinalSections />
        </Suspense>
      ) : (
        <FinalSectionsSkeleton />
      )}
    </div>
  );
}

export function XwayInspiredLanding() {
  const reduced = useReducedMotion();

  useEffect(() => {
    scrollToHashOnReady();
  }, []);

  return (
    <div className="bg-[#f4f7f3] text-ink-950">
      <section id={SECTION_IDS.hero} className="relative isolate overflow-hidden border-b border-ink-950/10 bg-[#f5f8f4] pb-10 pt-24 sm:pt-28 lg:pb-12 lg:pt-24">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_2%,rgba(45,187,144,0.20),transparent_46%),radial-gradient(ellipse_at_10%_85%,rgba(17,84,63,0.08),transparent_42%),linear-gradient(180deg,#f8faf7_0%,#edf6ef_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-bg-light opacity-40 [background-size:60px_60px]" />
        
        <Container className="max-w-none px-4 sm:px-6 lg:px-16">
          <div className="grid items-center gap-7 lg:min-h-[760px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 xl:min-h-[820px]">
            
            {/* Left Side: Information */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full min-w-0 overflow-hidden pt-4 sm:pt-10 lg:pt-0"
            >
              {/* Badge */}
              <div className="mb-6 flex">
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-ink-950/10 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase leading-snug tracking-[0.10em] text-ink-700 shadow-sm backdrop-blur-md sm:text-xs sm:tracking-[0.14em]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600"></span>
                  </span>
                  <span className="sm:hidden">Операционная платформа</span>
                  <span className="hidden sm:inline">Операционная платформа для marketplace-команд</span>
                </span>
              </div>
              
              {/* Title */}
              <h1 className="max-w-[720px] text-[clamp(2.12rem,8.4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink-950 sm:text-6xl sm:tracking-[-0.035em] lg:text-[4.7rem]">
                <span className="sm:hidden">
                  <span className="block">Прибыль и остатки</span>
                  <span className="block text-brand-700">по WB, Ozon</span>
                  <span className="block text-brand-700">и Маркету</span>
                  <span className="block">в одном столе</span>
                </span>
                <span className="hidden sm:inline">
                  Прибыль, остатки и реклама
                  <span className="block text-brand-700">по WB, Ozon и Маркету</span>
                  <span className="block">в одном рабочем столе</span>
                </span>
              </h1>
              
              {/* Description */}
              <p className="mt-5 max-w-[610px] text-base leading-relaxed text-ink-700 sm:mt-6 sm:text-xl">
                Sellico собирает CRM, каталог, заказы, финансы, поставки, задачи, SEO и коммуникации так, чтобы команда каждый день видела следующий прибыльный шаг.
              </p>
              
              {/* Buttons */}
              <div className="mt-7 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:items-center sm:mt-8">
                <a
                  href={REGISTER_URL}
                  onClick={() => track('cta_click_hero', { target: 'register' })}
                  className="group relative flex h-14 w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-600 px-4 text-[15px] font-semibold text-white shadow-[0_16px_34px_-18px_rgba(32,150,114,0.9)] transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_20px_42px_-18px_rgba(32,150,114,1)] min-[520px]:w-auto sm:px-7 sm:text-base"
                >
                  Подключить магазин бесплатно
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </a>
                <button
                  onClick={() => scrollToSection(SECTION_IDS.demo)}
                  className="group flex h-14 items-center justify-center gap-2 rounded-xl border border-ink-950/12 bg-white px-7 text-base font-semibold text-ink-950 shadow-sm transition-all hover:border-ink-950/20 hover:bg-ink-50/70 min-[520px]:w-auto"
                >
                  Смотреть интерфейс
                  <ChevronRight size={18} className="text-ink-400 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 min-[520px]:grid-cols-3 sm:mt-7">
                {heroProofStats.map(([value, label]) => (
                  <div key={value} className="rounded-2xl border border-ink-950/10 bg-white/72 p-4 shadow-sm backdrop-blur">
                    <p className="font-mono text-xl font-bold tracking-[-0.02em] text-ink-950">{value}</p>
                    <p className="mt-2 text-xs leading-snug text-ink-600">{label}</p>
                  </div>
                ))}
              </div>

              {/* Trust markers */}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-ink-700">
                {['14 дней бесплатно', 'Без привязки карты', 'Поддержка в Telegram'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-brand-500" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
            
            {/* Right Side: The Bento Blocks */}
            <div className="w-full min-w-0">
              <HeroBentoBlocks />
            </div>

          </div>
        </Container>
      </section>

      <section className="border-y border-ink-950/10 bg-white">
        <Container className="max-w-none px-4 sm:px-6 lg:px-16">
          <div className="grid gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">интеграционный слой</p>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {stats.map(({ title, label, type }) => (
                  <div key={title} className="rounded-2xl border border-ink-950/10 bg-[#f6f8f5] p-3 shadow-sm">
                    <MarketplaceLogo type={type} />
                    <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-black">{title}</p>
                    <p className="mt-2 max-w-[230px] text-[13px] leading-relaxed text-ink-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ['Одна модель данных', 'SKU, расходы, остатки, заказы, задачи и обращения связаны между собой, а не лежат в разных отчетах.'],
                ['Операционный контроль', 'Команда видит ответственных, дедлайны, роли и события по каждому магазину без ручных сверок.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-ink-950/10 bg-[#07120e] p-5 text-white shadow-[0_18px_50px_-36px_rgba(15,23,42,.9)]">
                  <p className="text-lg font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/62">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <HypeRail />

      <section id={SECTION_IDS.wow} className="bg-[#f4f7f3] py-20 lg:py-28">
        <Container>
          <motion.div {...fade} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">модули платформы</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl lg:text-6xl">
                Рабочий контур для роста, а не набор разрозненных сервисов.
              </h2>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-ink-700">
              <p>
                Sellico закрывает путь от обращения клиента до SKU, остатков, прибыли, поставки и задачи для команды.
              </p>
              <p>
                Каждый модуль показывает не просто отчет, а следующее действие: где теряется маржа, какой товар пополнить, какую кампанию остановить и кому назначить задачу.
              </p>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {funnel.map(({ title, text, asset }, index) => (
              <motion.div
                key={title}
                {...fade}
                transition={{ ...fade.transition, delay: index * 0.06 }}
                className="group relative min-h-[390px] overflow-hidden rounded-2xl border border-ink-950/10 bg-white p-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,.55)] transition hover:-translate-y-1 hover:shadow-[0_24px_78px_-50px_rgba(15,23,42,.7)]"
              >
                <div className="relative z-10 flex aspect-[1.15] w-full items-center justify-center overflow-hidden rounded-xl bg-[#eef5ef]">
                  <div aria-hidden className="absolute inset-x-5 bottom-4 h-16 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,.13),transparent_62%)] blur-lg" />
                  <span className="absolute left-3 top-3 z-20 rounded-full bg-white/80 px-2.5 py-1 font-mono text-xs font-bold text-ink-950 shadow-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <img
                    src={asset}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    width={1536}
                    height={1024}
                    className="relative z-10 h-full w-full scale-110 object-contain drop-shadow-[0_20px_30px_rgba(15,23,42,.14)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.18]"
                  />
                </div>
                <h3 className="relative z-20 mt-6 text-xl font-semibold tracking-[-0.02em] text-black">{title}</h3>
                <p className="relative z-20 mt-3 text-sm leading-relaxed text-ink-600">{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade} className="mt-16">
            <AiWowCore />
          </motion.div>
        </Container>
      </section>

      <section id={SECTION_IDS.features} className="relative overflow-hidden bg-[#07120e] py-20 text-white lg:py-28">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_82%_14%,rgba(45,187,144,.18),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(45,187,144,.10),transparent_30%)]" />
        <Container>
          <div className="relative z-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div {...fade} className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">операционный центр</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Продажи, товары, деньги и команда работают в одном цикле.
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/58">
                Сильный SaaS выглядит как командный cockpit: метрики, действия, владельцы процессов и AI-подсказки на одном экране.
              </p>
              <Button as="a" href={REGISTER_URL} size="lg" className="mt-9 w-full max-w-[320px] rounded-xl px-6 shadow-[0_16px_34px_-18px_rgba(44,186,102,0.9)] sm:w-auto sm:px-8">
                Получить доступ
              </Button>
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tools.map(([title, text]) => (
                <motion.div key={title} {...fade} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur">
                  <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 text-ink-950">
                    <Check size={18} />
                  </div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div {...fade} className="relative z-10 mt-14 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:min-h-[430px] lg:p-8">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,228,155,.18),transparent_32%)]" />
              <div className="relative z-20 flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-300 text-black">
                  <Radar size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold leading-tight sm:text-xl">Связанный контур данных</p>
                  <p className="mt-1 text-sm leading-snug text-white/50">заявка, товар, остаток, расход и задача живут в одной модели</p>
                </div>
              </div>
              <motion.img
                src="/visual-kit/story/stack-to-sellico.webp"
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                width={1536}
                height={1024}
                animate={reduced ? undefined : { y: [0, -12, 0], scale: [1, 1.02, 1] }}
                transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-5 left-[3%] z-0 w-[94%] max-w-none select-none drop-shadow-[0_42px_70px_rgba(91,228,155,.18)] sm:bottom-[-12%] sm:left-[-2%] sm:w-[106%]"
              />
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-emerald-300/25 bg-emerald-300 p-6 text-black lg:p-8">
              <Activity size={28} />
              <p className="mt-10 text-5xl font-semibold tracking-[-0.04em]">24/7</p>
              <p className="relative z-10 mt-4 text-lg leading-relaxed text-black/70">
                Sellico держит события по CRM, товарам, остаткам, задачам, отзывам и рекламе в режиме реального времени.
              </p>
              <img
                src="/visual-kit/story/pricing-helper.webp"
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                width={1536}
                height={1024}
                className="pointer-events-none absolute -bottom-16 -right-20 w-[85%] opacity-35 mix-blend-multiply"
              />
            </div>
          </motion.div>
        </Container>
      </section>

      <section id={SECTION_IDS.how} className="bg-white py-20 lg:py-28">
        <Container>
          <motion.div {...fade} className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">как работает</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl lg:text-6xl">
              От подключения магазинов до управляемой операционки.
            </h2>
            <div className="mt-8 grid gap-3 md:grid-cols-4">
              {funnel.map(({ title, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-ink-950/10 bg-[#f5f8f4] p-4">
                  <Icon size={18} className="text-brand-700" />
                  <p className="mt-4 text-sm font-semibold text-black">{title}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <MediaAssetSection />

          <motion.div
            {...fade}
            className="relative overflow-hidden rounded-2xl border border-ink-950/10 bg-white p-4 shadow-[0_34px_130px_-90px_rgba(15,23,42,.9)] lg:p-6"
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(44,186,102,.12),transparent_30%),radial-gradient(circle_at_15%_100%,rgba(15,23,42,.08),transparent_34%)]" />
            <div className="relative z-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="rounded-2xl bg-[#07120e] p-6 text-white lg:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Operating flow</p>
                <h3 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                  Один цикл вместо четырех разрозненных процессов.
                </h3>
                <p className="mt-6 text-base leading-relaxed text-white/58">
                  Sellico собирает данные, превращает их в рабочие сценарии и доводит команду до конкретных действий.
                </p>
                <div className="mt-8 space-y-3">
                  {funnelStages.map((stage, index) => (
                    <div key={stage.step} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.08]">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300 text-sm font-bold text-black">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{stage.title}</p>
                        <p className="mt-1 text-xs text-white/42">{stage.tool}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#f4f7f2] p-4 lg:p-6">
                <div aria-hidden className="absolute inset-0 grid-bg-light opacity-55 [background-size:54px_54px]" />
                <div aria-hidden className="absolute left-1/2 top-[46%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="relative z-10 grid gap-3 md:grid-cols-2">
                  {funnelStages.map((stage) => (
                    <div key={stage.title} className="flex flex-col justify-between rounded-2xl border border-ink-950/10 bg-white/80 p-5 backdrop-blur-xl">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">{stage.step}</p>
                        <h4 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.03em] text-black">
                          {stage.title}
                        </h4>
                        <p className="mt-3 text-[13px] leading-relaxed text-ink-500">{stage.goal}</p>
                      </div>
                      
                      <div className="mt-5 flex flex-col gap-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl bg-[#f5f7f3] p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Метрика</p>
                            <p className="mt-1 text-[13px] font-semibold leading-snug text-black">{stage.metric}</p>
                          </div>
                          <div className="rounded-xl bg-[#f5f7f3] p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">Инструмент</p>
                            <p className="mt-1 text-[13px] font-semibold leading-snug text-brand-700">{stage.tool}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {stage.work.slice(0, 2).map((item) => (
                            <span key={item} className="flex items-start gap-2 text-[12px] font-medium text-ink-600">
                              <span className="mt-[3px] flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                                <Check size={8} strokeWidth={3} />
                              </span>
                              <span className="leading-snug">{item}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 mt-4 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-[#07120e] p-8 text-center lg:p-10">
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(91,228,155,.15),transparent_70%)]" />
                  <div className="relative">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">Рабочее пространство</p>
                    <h4 className="mx-auto mt-4 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] text-white lg:text-4xl">
                      Все этапы сходятся в одном рабочем столе.
                    </h4>
                    <Button as="a" href={REGISTER_URL} size="lg" className="mx-auto mt-8 w-full max-w-[320px] rounded-2xl px-6 shadow-[0_16px_34px_-18px_rgba(44,186,102,0.9),0_0_20px_rgba(44,186,102,0.2)] sm:w-auto sm:px-8">
                      Попробовать бесплатно
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fade} className="mt-6 rounded-2xl border border-ink-950/10 bg-[#f5f8f4] p-6 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.03em] text-black lg:text-5xl">CRM и продажи</h3>
                <p className="mt-4 text-ink-500">Лиды, клиенты, заявки, воронка и конвертация обращений в сделки без потери контекста.</p>
              </div>
              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.03em] text-black lg:text-5xl">Товары, остатки и прибыль</h3>
                <p className="mt-4 text-ink-500">Каталог, себестоимость, ABC-анализ, транзакции и поставки помогают понимать реальную экономику.</p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="overflow-hidden pb-24 lg:pb-32">
        <Container className="max-w-none px-4 sm:px-6 lg:px-16">
          <motion.div {...fade} className="mb-14 overflow-hidden rounded-2xl border border-ink-950/10 bg-white p-6 shadow-[0_24px_80px_-60px_rgba(15,23,42,.6)] lg:p-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-6 flex gap-3 text-xs font-bold uppercase tracking-widest text-brand-600">
                  <span>SEO</span>
                  <span className="text-ink-300">•</span>
                  <span>Отзывы</span>
                  <span className="text-ink-300">•</span>
                  <span>Реклама</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl lg:text-5xl">
                  AI помогает карточкам, отзывам и рекламе работать быстрее.
                </h2>
                
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  {pluginPoints.slice(0, 4).map((point) => (
                    <div key={point} className="flex flex-col gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <p className="text-sm leading-relaxed text-ink-600">{point}</p>
                    </div>
                  ))}
                </div>

                <Button as="a" href={REGISTER_URL} size="lg" className="mt-10 w-full max-w-[360px] rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:w-auto">
                  Открыть рабочее пространство
                </Button>
              </div>
              
              <div className="relative flex w-full items-center justify-center pt-8 lg:justify-end lg:pt-0">
                <motion.img
                  src="/visual-kit/story/plugin-workspace-v2.webp"
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  width={1536}
                  height={1024}
                  animate={reduced ? undefined : { y: [0, -10, 0] }}
                  transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[115%] max-w-none select-none drop-shadow-[0_30px_60px_rgba(15,23,42,.15)] lg:w-[120%] lg:translate-x-8"
                />
              </div>
            </div>
          </motion.div>

          <motion.div {...fade} className="mb-16 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-[#07120e] p-6 text-white lg:p-8">
              <Layers3 size={28} className="text-emerald-300" />
              <h3 className="mt-10 text-3xl font-semibold leading-none tracking-[-0.04em] sm:text-4xl">
                Коммуникации без разрывов.
              </h3>
              <p className="mt-5 text-white/55">
                Отзывы, почта, чат, уведомления и задачи не живут отдельно. Команда видит контекст клиента, товара и ответственного.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-ink-950/10 bg-white p-6 lg:p-8">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Отзыв', 'готов шаблон ответа'],
                  ['Письмо', 'создана задача'],
                  ['Карточка', 'обновить описание'],
                ].map(([title, value], index) => (
                  <motion.div
                    key={title}
                    animate={reduced ? undefined : { scale: [1, 1.03, 1] }}
                    transition={reduced ? undefined : { duration: 3 + index, repeat: Infinity, ease: 'easeInOut' }}
                    className="rounded-2xl border border-ink-950/10 bg-[#f5f7f3] p-5"
                  >
                    <p className="text-sm font-semibold text-ink-500">{title}</p>
                    <p className="mt-8 text-3xl font-semibold tracking-[-0.03em] text-brand-700">{value}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                aria-hidden
                animate={reduced ? undefined : { x: ['-20%', '110%'] }}
                transition={reduced ? undefined : { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent"
              />
            </div>
          </motion.div>

          <div id={SECTION_IDS.demo} className="scroll-mt-28" />
          <motion.div {...fade} className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">/ интерфейс</p>
              <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl lg:text-6xl">
                Командный центр вместо копии всего кабинета.
              </h2>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-ink-500">
              Переключайте рабочие сценарии: прибыль, остатки, рекламу и задачи. Блок остается кликабельным, но показывает только то, что помогает принять решение.
            </p>
          </motion.div>
          <motion.div {...fade} className="relative">
            <DeferredOperationalWorkspaceDemo />
          </motion.div>

          <motion.div {...fade} className="mt-16">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">/ еще в операционке</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {automationTools.map(({ num, title, text, asset }) => (
                <div key={title} className="rounded-2xl border border-ink-950/10 bg-white p-5 shadow-[0_18px_60px_-54px_rgba(15,23,42,.7)]">
                  <div className="relative aspect-square overflow-hidden rounded-[1.15rem] bg-[#f5f7f3]">
                    <span className="absolute left-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">{num}</span>
                    <div aria-hidden className="absolute inset-x-6 bottom-6 h-12 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,.14),transparent_62%)] blur-lg" />
                    <img
                      src={asset}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      width={1536}
                      height={1024}
                      className="absolute left-1/2 top-1/2 z-10 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_20px_30px_rgba(15,23,42,.13)]"
                    />
                  </div>
                  <h3 className="mt-7 text-xl font-semibold text-black">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      <DeferredFinalSections />
    </div>
  );
}
