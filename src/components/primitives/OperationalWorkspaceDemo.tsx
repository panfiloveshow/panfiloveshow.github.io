import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ClipboardCheck,
  Megaphone,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { REGISTER_URL } from '@/lib/anchors';
import { cn } from '@/lib/cn';

type Scenario = {
  id: string;
  label: string;
  short: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  metric: string;
  metricLabel: string;
  trend: string;
  insight: string;
  rows: Array<[string, string, string]>;
  events: Array<[string, string]>;
  tasks: Array<[string, string, boolean]>;
};

const scenarios: Scenario[] = [
  {
    id: 'profit',
    label: 'Прибыль',
    short: 'Маржа',
    title: 'Понять, где команда теряет деньги',
    description: 'Sellico связывает выручку, комиссии, логистику, хранение и рекламу с конкретными SKU.',
    icon: Wallet,
    accent: 'emerald',
    metric: '1,98 млн ₽',
    metricLabel: 'чистая прибыль',
    trend: '+11% к периоду',
    insight: 'У 18 SKU маржа ниже цели. Система предлагает поднять цену и сократить ДРР в WB-поиске.',
    rows: [
      ['Wildberries', '4,12 млн ₽', '35,5%'],
      ['Ozon', '2,78 млн ₽', '27,7%'],
      ['Яндекс Маркет', '1,08 млн ₽', '23,2%'],
    ],
    events: [
      ['Комиссии обновлены', '12 категорий'],
      ['Хранение пересчитано', 'за 30 дней'],
      ['Маржа просела', '18 SKU'],
    ],
    tasks: [
      ['Согласовать новую цену', 'сегодня', false],
      ['Проверить FBO-логистику', 'сегодня', true],
      ['Собрать отчет по марже', '16 мая', false],
    ],
  },
  {
    id: 'stock',
    label: 'Остатки',
    short: 'Склад',
    title: 'Не доводить ходовые товары до out-of-stock',
    description: 'Остатки, скорость продаж и ближайшие слоты поставок собираются в один план пополнения.',
    icon: PackageCheck,
    accent: 'sky',
    metric: '9 дней',
    metricLabel: 'до риска OOS',
    trend: '-4 SKU из риска',
    insight: 'Органайзер для кухни закончится раньше следующего окна. Подготовьте поставку на 420 единиц.',
    rows: [
      ['Органайзер', '426 шт.', 'риск'],
      ['Сыворотка C', '1 280 шт.', 'норма'],
      ['Бутылка Trail', '820 шт.', 'норма'],
    ],
    events: [
      ['Остатки WB', 'синхронизированы'],
      ['Слот поставки', 'через 5 дней'],
      ['Прогноз спроса', '+14%'],
    ],
    tasks: [
      ['Согласовать поставку', 'сегодня', true],
      ['Проверить упаковку', '15 мая', false],
      ['Обновить план закупки', '16 мая', false],
    ],
  },
  {
    id: 'ads',
    label: 'Реклама',
    short: 'ROAS',
    title: 'Управлять ставками через прибыль, а не на глаз',
    description: 'Рекламные кампании видны рядом с остатками, маржой и продажами по каждому товару.',
    icon: Megaphone,
    accent: 'blue',
    metric: '5.4x',
    metricLabel: 'ROAS за 7 дней',
    trend: '+0.8x после правок',
    insight: 'По WB-поиску можно увеличить бюджет на 18%, а нерентабельные фразы отправить на паузу.',
    rows: [
      ['WB / Поиск', '84 000 ₽', '5.4x'],
      ['Ozon / SKU', '51 200 ₽', '3.8x'],
      ['Маркет / РСЯ', '19 400 ₽', '2.6x'],
    ],
    events: [
      ['Фразы собраны', '312 шт.'],
      ['Бюджет изменен', '+18%'],
      ['Ставки снижены', '14 фраз'],
    ],
    tasks: [
      ['Принять рекомендацию WB', 'сегодня', false],
      ['Поставить лимит Ozon', 'сегодня', true],
      ['Проверить фразы без продаж', '17 мая', false],
    ],
  },
  {
    id: 'team',
    label: 'Команда',
    short: 'Задачи',
    title: 'Превращать сигналы в понятные действия',
    description: 'Лиды, отзывы, карточки, поставки и финансы сразу получают ответственного и срок.',
    icon: ClipboardCheck,
    accent: 'dark',
    metric: '7',
    metricLabel: 'задач на сегодня',
    trend: '3 просрочены',
    insight: 'Самые срочные действия связаны с поставкой, отзывами и обновлением цен на Ozon.',
    rows: [
      ['Отзывы', '18 шт.', 'ответить'],
      ['Карточки', '12 SKU', 'обновить'],
      ['CRM', '4 лида', 'в работу'],
    ],
    events: [
      ['Новый отзыв', 'нужен ответ'],
      ['Лид создан', 'из заявки'],
      ['Карточка слабая', 'низкий CTR'],
    ],
    tasks: [
      ['Ответить на отзывы 1-3 звезды', 'сегодня', false],
      ['Обновить цены на Ozon', 'сегодня', true],
      ['Подготовить КП BrandLab', '16 мая', false],
    ],
  },
];

const accentClasses: Record<string, { icon: string; soft: string; line: string; text: string }> = {
  emerald: {
    icon: 'bg-brand-50 text-brand-700 ring-brand-500/15',
    soft: 'bg-brand-50 text-brand-700',
    line: 'from-brand-500 to-emerald-300',
    text: 'text-brand-700',
  },
  sky: {
    icon: 'bg-sky-50 text-sky-700 ring-sky-500/15',
    soft: 'bg-sky-50 text-sky-700',
    line: 'from-sky-500 to-brand-300',
    text: 'text-sky-700',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700 ring-blue-500/15',
    soft: 'bg-blue-50 text-blue-700',
    line: 'from-blue-500 to-sky-300',
    text: 'text-blue-700',
  },
  dark: {
    icon: 'bg-ink-950 text-white ring-ink-950/15',
    soft: 'bg-ink-950 text-white',
    line: 'from-ink-950 to-brand-400',
    text: 'text-ink-950',
  },
};

function PanelTitle({
  icon: Icon,
  title,
  action,
  tone = 'light',
}: {
  icon: LucideIcon;
  title: string;
  action?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', tone === 'dark' ? 'bg-white/10 text-emerald-300' : 'bg-[#f2f6f3] text-ink-700')}>
          <Icon size={15} />
        </span>
        <p className={cn('truncate text-sm font-semibold', tone === 'dark' ? 'text-white' : 'text-ink-950')}>{title}</p>
      </div>
      {action ? <span className={cn('shrink-0 text-xs font-semibold', tone === 'dark' ? 'text-emerald-300' : 'text-brand-700')}>{action}</span> : null}
    </div>
  );
}

function ScenarioBody({
  active,
}: {
  active: Scenario;
}) {
  if (active.id === 'stock') {
    const stockItems = [
      ['Органайзер для кухни', '426 шт.', '84%', 'Поставка 420 шт.'],
      ['Сыворотка Vitamin C', '1 280 шт.', '32%', 'без риска'],
      ['Бутылка Trail', '820 шт.', '51%', 'стабильно'],
    ];

    return (
      <div className="grid gap-4">
        <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.75)]">
          <PanelTitle icon={Boxes} title="План пополнения склада" action="3 маркетплейса" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ['Сегодня', '426 шт.', 'остаток на WB'],
              ['Через 5 дней', 'слот FBO', 'можно отгрузить'],
              ['Через 9 дней', 'риск OOS', 'если не пополнить'],
            ].map(([date, value, text], index) => (
              <div key={date} className="relative rounded-xl border border-sky-500/15 bg-sky-50/55 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-700">{date}</p>
                <p className="mt-3 font-mono text-2xl font-bold tracking-[-0.03em] text-ink-950">{value}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{text}</p>
                {index < 2 ? <ArrowRight className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-sky-300 md:block" size={16} /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.62fr_0.38fr]">
          <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
            <PanelTitle icon={PackageCheck} title="SKU под контролем" action="автоплан" />
            <div className="mt-5 space-y-4">
              {stockItems.map(([name, count, risk, action]) => (
                <div key={name} className="rounded-xl bg-[#f7faf8] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-950">{name}</p>
                      <p className="mt-1 font-mono text-sm font-bold text-ink-700">{count}</p>
                    </div>
                    <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">{action}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-ink-950/6">
                    <span className="block h-full rounded-full bg-gradient-to-r from-sky-500 to-brand-400" style={{ width: risk }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink-950/8 bg-[#07120e] p-4 text-white shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
            <PanelTitle icon={TrendingUp} title="Рекомендация" action="создать" tone="dark" />
            <p className="mt-5 text-sm leading-relaxed text-white/68">{active.insight}</p>
            <div className="mt-6 grid gap-3">
              {active.tasks.map(([title, date, checked]) => (
                <div key={title} className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
                  <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded border', checked ? 'border-emerald-300 bg-emerald-300 text-ink-950' : 'border-white/25 text-transparent')}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-white/45">{date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (active.id === 'ads') {
    const campaigns = [
      ['WB / Поиск Vitamin C', '5.4x', '+18% бюджет', '84 000 ₽'],
      ['Ozon / SKU органайзер', '3.8x', 'лимит 51 200 ₽', '51 200 ₽'],
      ['Маркет / РСЯ бутылка', '2.6x', 'пауза 14 фраз', '19 400 ₽'],
    ];
    const keywords = [
      ['сыворотка витамин c', '8.9% CTR', 'в рост'],
      ['органайзер кухня', '4.1% CTR', 'держать'],
      ['бутылка спорт', '2.8% CTR', 'снизить'],
    ];

    return (
      <div className="grid gap-4 xl:grid-cols-[0.58fr_0.42fr]">
        <div className="rounded-2xl border border-blue-500/12 bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_100%)] p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.75)]">
          <PanelTitle icon={Megaphone} title="Оптимизация кампаний" action="ROAS" />
          <div className="mt-5 space-y-3">
            {campaigns.map(([name, roas, action, spend]) => (
              <div key={name} className="rounded-xl border border-blue-500/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-950">{name}</p>
                    <p className="mt-1 text-xs font-medium text-ink-500">{action}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-blue-700">{roas}</p>
                    <p className="mt-1 text-xs text-ink-400">{spend}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
            <PanelTitle icon={Search} title="Фразы и ставки" action="312 фраз" />
            <div className="mt-5 space-y-3">
              {keywords.map(([name, ctr, status], index) => (
                <div key={name}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-ink-800">{name}</p>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">{status}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-50">
                      <span className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-300" style={{ width: `${78 - index * 18}%` }} />
                    </div>
                    <span className="w-16 text-right font-mono text-xs font-bold text-ink-700">{ctr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink-950/8 bg-[#07120e] p-4 text-white shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
            <PanelTitle icon={TrendingUp} title="AI-рекомендация" action="+220 тыс ₽" tone="dark" />
            <p className="mt-5 text-sm leading-relaxed text-white/68">{active.insight}</p>
            <div className="mt-5 rounded-xl bg-emerald-300/10 p-4">
              <p className="font-mono text-3xl font-bold text-emerald-300">+18%</p>
              <p className="mt-1 text-xs text-white/55">к бюджету только по прибыльным фразам</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (active.id === 'team') {
    const columns: Array<[string, string[]]> = [
      ['Новые', ['BrandLab запросили КП', 'Новый отзыв 2 звезды']],
      ['Сегодня', ['Обновить цены на Ozon', 'Ответить на 18 отзывов']],
      ['Готово', ['SEO-описание 12 SKU', 'Отчет по марже']],
    ];

    return (
      <div className="grid gap-4">
        <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.75)]">
          <PanelTitle icon={ClipboardCheck} title="Канбан операционной команды" action="7 задач" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {columns.map(([title, cards]) => (
              <div key={title} className="rounded-xl bg-[#f7faf8] p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-400">{title}</p>
                <div className="mt-3 space-y-2">
                  {cards.map((card, index) => (
                    <div key={card} className="rounded-lg border border-ink-950/8 bg-white p-3 shadow-sm">
                      <p className="text-sm font-semibold leading-snug text-ink-950">{card}</p>
                      <p className="mt-2 text-xs text-ink-400">{index === 0 ? 'Анна' : 'Роман'} · сегодня</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.45fr_0.55fr]">
          <div className="rounded-2xl border border-ink-950/8 bg-[#07120e] p-4 text-white shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
            <PanelTitle icon={Users2} title="Контекст клиента" action="CRM" tone="dark" />
            <p className="mt-5 text-lg font-semibold leading-tight text-white">BrandLab Cosmetics</p>
            <p className="mt-2 text-sm leading-relaxed text-white/62">Заявка с сайта, 34 SKU, запуск на WB и Ozon за 60 дней.</p>
            <div className="mt-5 grid gap-2">
              {active.events.map(([title, value]) => (
                <div key={title} className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2.5">
                  <span className="text-sm font-medium text-white">{title}</span>
                  <span className="text-xs text-white/45">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
            <PanelTitle icon={ShieldCheck} title="Что система сделала сама" action="автоматизация" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['Лид', 'создан из заявки'],
                ['Задача', 'назначена sales'],
                ['Отзыв', 'готов шаблон'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl bg-brand-50/65 p-4">
                  <p className="text-xl font-semibold tracking-[-0.03em] text-brand-700">{title}</p>
                  <p className="mt-8 text-sm leading-snug text-ink-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-ink-950/8 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf8_100%)] p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.75)]">
        <PanelTitle icon={Wallet} title="P&L: от выручки к чистой прибыли" action="апрель" />
        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {[
            ['Выручка', '8,42 млн ₽', '100%', 'bg-brand-500'],
            ['Комиссии', '-1,42 млн ₽', '76%', 'bg-rose-400'],
            ['Логистика', '-812 тыс ₽', '54%', 'bg-amber-400'],
            ['Реклама', '-604 тыс ₽', '39%', 'bg-blue-400'],
            ['Прибыль', '1,98 млн ₽', '68%', 'bg-ink-950'],
          ].map(([label, value, height, color]) => (
            <div key={label} className="flex min-h-[172px] flex-col justify-end rounded-xl border border-ink-950/8 bg-white p-3">
              <div className="flex h-20 items-end">
                <span className={cn('w-full rounded-t-lg', color)} style={{ height }} />
              </div>
              <p className="mt-4 text-xs font-semibold text-ink-500">{label}</p>
              <p className="mt-1 font-mono text-sm font-bold text-ink-950">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.42fr_0.58fr]">
        <div className="rounded-2xl border border-ink-950/8 bg-[#07120e] p-4 text-white shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
          <PanelTitle icon={TrendingDown} title="Причина просадки" action="18 SKU" tone="dark" />
          <p className="mt-5 text-sm leading-relaxed text-white/68">{active.insight}</p>
          <div className="mt-5 rounded-xl bg-white/[0.06] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">самый сильный фактор</p>
            <p className="mt-2 font-mono text-3xl font-bold text-emerald-300">-6,4 п.п.</p>
            <p className="mt-1 text-xs text-white/55">маржи из-за логистики и хранения</p>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-950/8 bg-white p-4 shadow-[0_20px_70px_-58px_rgba(15,23,42,.7)]">
          <PanelTitle icon={BarChart3} title="SKU, где нужна правка" action="маржинальность" />
          <div className="mt-5 overflow-hidden rounded-xl border border-ink-950/8">
            {[
              ['WB-8342', 'Сыворотка Vitamin C', '31%', '+90 ₽'],
              ['OZ-2198', 'Органайзер для кухни', '19%', '+140 ₽'],
              ['YM-4107', 'Бутылка Trail', '26%', 'ставки -8%'],
            ].map(([sku, name, margin, action]) => (
              <div key={sku} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-ink-950/6 px-3 py-3 last:border-b-0">
                <span className="rounded-lg bg-brand-50 px-2 py-1 font-mono text-[11px] font-bold text-brand-700">{sku}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-950">{name}</p>
                  <p className="mt-1 text-xs text-ink-400">маржа {margin}</p>
                </div>
                <span className="rounded-full bg-[#f7faf8] px-2 py-1 text-[11px] font-bold text-ink-700">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioFooter({ active }: { active: Scenario }) {
  const content: Record<string, Array<[string, string]>> = {
    profit: [
      ['Правка цены', '+90-140 ₽ по 2 SKU'],
      ['Расходы', 'логистика и хранение'],
      ['Контроль', 'задача финансисту'],
    ],
    stock: [
      ['Поставка', '420 шт. в ближайший слот'],
      ['Склад', 'WB и Ozon синхронизированы'],
      ['Риск', '9 дней до OOS'],
    ],
    ads: [
      ['Guardrail', 'не выше целевого ДРР'],
      ['Бюджет', '+18% только прибыльным'],
      ['Фразы', '14 в паузу'],
    ],
    team: [
      ['Владелец', 'Анна отвечает за CRM'],
      ['SLA', '7 задач на сегодня'],
      ['Автошаг', 'лид, задача, шаблон'],
    ],
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-ink-950/8 bg-[#07120e] p-4 text-white sm:grid-cols-3">
      {content[active.id].map(([name, status]) => (
        <div key={name} className="rounded-xl bg-white/[0.055] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/38">{name}</p>
          <p className="mt-2 text-sm font-semibold leading-snug text-emerald-200">{status}</p>
        </div>
      ))}
    </div>
  );
}

export function OperationalWorkspaceDemo() {
  const [activeId, setActiveId] = useState(scenarios[0].id);
  const active = useMemo(() => scenarios.find((item) => item.id === activeId) ?? scenarios[0], [activeId]);
  const accent = accentClasses[active.accent];

  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-ink-950/10 bg-white shadow-[0_42px_140px_-78px_rgba(15,23,42,.8)] lg:rounded-[1.75rem]">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f6faf7_100%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/35 to-transparent" />

      <div className="relative grid min-h-[680px] lg:grid-cols-[0.34fr_0.66fr]">
        <aside className="border-b border-ink-950/10 bg-[#fbfdfb] p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Демо-режим</p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] text-black sm:text-3xl">
                Один сценарий вместо копии всего кабинета
              </h3>
            </div>
            <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-500/10 sm:grid">
              <Sparkles size={18} />
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            Переключайте задачи команды: интерфейс показывает только важные данные, рекомендацию и следующий шаг.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isActive = scenario.id === active.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setActiveId(scenario.id)}
                  className={cn(
                    'group flex min-h-16 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    isActive
                      ? 'border-brand-500/30 bg-white shadow-[0_14px_38px_-30px_rgba(15,23,42,.8)]'
                      : 'border-ink-950/8 bg-white/55 hover:border-brand-500/20 hover:bg-white',
                  )}
                  aria-pressed={isActive}
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors',
                      isActive ? accent.icon : 'bg-[#f2f6f3] text-ink-500 ring-ink-950/8',
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink-950">{scenario.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-ink-500">{scenario.short}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-ink-950/8 bg-[#07120e] p-4 text-white">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/12 text-emerald-300">
                <RefreshCw size={17} />
              </span>
              <div>
                <p className="text-sm font-semibold">Данные обновлены 5 минут назад</p>
                <p className="mt-1 text-xs leading-relaxed text-white/56">
                  WB, Ozon, Яндекс Маркет, CRM и задачи остаются в одной модели.
                </p>
              </div>
            </div>
          </div>

          <Button as="a" href={REGISTER_URL} size="lg" className="mt-6 w-full rounded-xl shadow-[0_16px_34px_-20px_rgba(44,186,102,0.95)]">
            Попробовать бесплатно
          </Button>
        </aside>

        <div className="min-w-0 p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 border-b border-ink-950/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', accent.soft)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {active.label}
                </span>
                <span className="text-xs font-medium text-ink-400">Sellico workspace</span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] text-black sm:text-3xl">
                {active.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{active.description}</p>
            </div>
            <div className="grid min-w-[172px] rounded-xl border border-ink-950/8 bg-[#f7faf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">{active.metricLabel}</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[-0.03em] text-ink-950">{active.metric}</p>
              <p className={cn('mt-1 text-xs font-semibold', accent.text)}>{active.trend}</p>
            </div>
          </div>

          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 grid gap-4"
          >
            <ScenarioBody active={active} />

            <ScenarioFooter active={active} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
