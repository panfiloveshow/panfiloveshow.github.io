import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL, SECTION_IDS } from '@/lib/anchors';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { EnterpriseImplementationForm } from './EnterpriseImplementationForm';
import { reveal } from './data';

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

export function PricingSection() {
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
