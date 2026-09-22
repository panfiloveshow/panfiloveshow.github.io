import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CircleCheck,
  Layers3,
  Megaphone,
  Package,
  Puzzle,
  Users2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL, SECTION_IDS, scrollToSection } from '@/lib/anchors';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { reveal } from './data';

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
        <p className="mt-1 text-xs text-[#65736c]">{formatSyncAge(syncAge)}</p>
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

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const heroMotionEnabled = prefersReducedMotion !== true;

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
                </span>{' '}
                Управляйте{' '}
                <span className="block">прибылью.</span>{' '}
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
                  <span className="inline-flex items-center gap-1.5"><CircleCheck size={13} className="text-[#b9ef6a]" />зарегистрировано в Роспатенте</span>
                </div>
              </div>
            </div>

            <div className="relative flex min-w-0 items-center justify-center overflow-hidden rounded-[26px] bg-[#f7f9f7] px-2 py-7 sm:px-5 sm:py-8 lg:min-h-[620px]">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_49%,rgba(29,116,77,.1),transparent_25%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,.96),transparent_70%)]"
              />

              <div className="relative grid aspect-square w-full max-w-[500px] grid-cols-3 grid-rows-3 items-center justify-items-center gap-2 p-1.5 sm:gap-3 sm:p-3">
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
                  <circle
                    data-hero-orbit="outer"
                    className="hero-orbit hero-orbit--outer"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#91a69b"
                    strokeWidth=".34"
                    strokeDasharray="1.15 1.55"
                  />
                  <circle
                    data-hero-orbit="inner"
                    className="hero-orbit hero-orbit--inner"
                    cx="50"
                    cy="50"
                    r="27.5"
                    fill="none"
                    stroke="#b2c0b9"
                    strokeWidth=".3"
                    strokeDasharray=".9 1.4"
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
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                  <p className="mt-1 text-xs text-[#65736c]">за последние 30 дней</p>
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
                  <p className="mt-2 max-w-[18ch] text-[11px] leading-snug text-[#65736c] sm:text-xs">{label}</p>
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
                <p className="mt-1 text-[10px] text-[#65736c]">без миграции данных</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
