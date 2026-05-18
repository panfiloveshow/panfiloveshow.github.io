import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { REGISTER_URL, SECTION_IDS } from '@/lib/anchors';
import { track } from '@/lib/analytics';

const fade = {
  initial: false,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-90px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const cases = [
  ['Бренд одежды', 'финансы', 'видит маржу по SKU, рекламу и остатки в одном рабочем столе'],
  ['Товары для дома', 'поставки', 'получает прогноз пополнения и задачи для команды'],
  ['Агентство', 'команда', 'контролирует клиентов, роли и события без таблиц'],
  ['Производитель', 'реклама', 'управляет ставками через ROI и остатки, а не на глаз'],
];

const plans = [
  {
    name: 'Старт',
    price: '3 000 ₽',
    text: 'Для первого магазина и базовой операционки.',
    features: ['1 интеграция API', '3 пользователя', '50 товаров', '100 отзывов в день', 'SEO-генерация: 20/мес', 'SEO-аудит: 50/мес', '1 автопоставка', 'Юнит-экономика и задачи'],
  },
  {
    name: 'Pro',
    price: '8 000 ₽',
    text: 'Для растущей команды с несколькими каналами.',
    features: ['3 интеграции API', '10 пользователей', '150 товаров', '250 отзывов в день на канал', 'SEO-генерация: 100/мес', 'SEO-аудит: 150/мес', '4 автопоставки', 'Финансовая отчетность'],
  },
  {
    name: 'Бизнес',
    price: '15 000 ₽',
    text: 'Для команды, где CRM, финансы и поставки уже критичны.',
    features: ['6 интеграций API', '20 пользователей', '300 товаров', '250 отзывов для оператора', 'SEO-генерация: 200/мес', 'SEO-аудит: 300/мес', '8 автопоставок', 'Заявки, лиды и Sellico Meet'],
  },
  {
    name: 'Enterprise',
    price: 'от 40 000 ₽',
    text: 'Для брендов, агентств и команд с договорными лимитами.',
    features: ['Интеграции, пользователи и товары по договору', 'Отзывы: все функции Бизнес + премиум', 'SEO, аудит и автопланирование по договору', 'Юнит-экономика, CRM, заявки и лиды', 'Финансовая отчетность и Sellico Meet', 'Координация, массовое редактирование и roadmap'],
  },
];

function CaseMarquee() {
  return (
    <div className="mt-12 overflow-hidden">
      <div className="flex w-max animate-marquee gap-4">
        {[...cases, ...cases].map(([brand, value, text], index) => (
          <div key={`${brand}-${index}`} className="w-[330px] rounded-[1.5rem] border border-ink-950/10 bg-white p-6 shadow-[0_18px_70px_-55px_rgba(15,23,42,.6)]">
            <p className="text-sm font-semibold text-ink-500">{brand}</p>
            <p className="mt-9 text-5xl font-semibold tracking-[-0.04em] text-brand-700">{value}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-500">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingFinalSections() {
  const [ctaEmail, setCtaEmail] = useState('');
  const [ctaConsent, setCtaConsent] = useState(false);
  const [ctaError, setCtaError] = useState('');

  const submitCta = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(ctaEmail)) {
      setCtaError('Введите корректный email.');
      return;
    }
    if (!ctaConsent) {
      setCtaError('Подтвердите согласие на обработку персональных данных.');
      return;
    }
    track('lead_submit', { source: 'xway_final_cta' });
    window.location.href = `${REGISTER_URL}?email=${encodeURIComponent(ctaEmail)}`;
  };

  return (
    <>
      <section id={SECTION_IDS.proof} className="content-auto bg-white py-24 lg:py-32">
        <Container>
          <motion.div {...fade} className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <h2 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl lg:text-6xl">
              Сценарии для ролей, которые живут внутри Sellico.
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-ink-500">
              Без неподтвержденных обещаний: показываем, какие задачи решают бренд, агентство, операционный менеджер и финансист.
            </p>
          </motion.div>
          <CaseMarquee />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cases.map(([brand, value, text]) => (
              <motion.div key={brand} {...fade} className="rounded-2xl border border-ink-950/10 bg-[#f7f8f5] p-6">
                <p className="text-sm font-semibold text-ink-500">{brand}</p>
                <p className="mt-10 text-5xl font-semibold tracking-[-0.04em] text-brand-700">{value}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-500">{text}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section id={SECTION_IDS.pricing} className="content-auto py-24 lg:py-32">
        <Container>
          <motion.div {...fade} className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-950/5 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-700 shadow-sm backdrop-blur-md">
              Тарифы
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl lg:text-[3.5rem] lg:leading-none">
              Один тариф — <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">все инструменты</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-500">
              Стартуйте с базовой операционки и подключайте CRM, каталог, финансы, поставки, рекламу и AI-модули по мере роста.
            </p>
          </motion.div>

          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map(({ name, price, text, features }, index) => {
              const highlight = index === 2;
              return (
                <motion.div
                  key={name}
                  {...fade}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 lg:p-7 ${highlight ? 'bg-ink-950 shadow-[0_20px_40px_-10px_rgba(44,186,102,0.3)] ring-1 ring-white/10 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(44,186,102,0.4)]' : 'bg-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.05)] ring-1 ring-ink-950/5 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.1)] hover:ring-ink-950/10'}`}
                >
                  {highlight && <div aria-hidden className="pointer-events-none absolute -right-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-brand-500/20 blur-[80px]" />}

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <p className={`text-[13px] font-bold uppercase tracking-widest ${highlight ? 'text-brand-400' : 'text-brand-700'}`}>
                        {name}
                      </p>
                      {highlight && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-400 backdrop-blur-md">
                          <Sparkles size={10} className="text-brand-400" />
                          Хит
                        </span>
                      )}
                    </div>
                    <p className={`mt-3 text-pretty text-[13px] leading-relaxed xl:text-sm ${highlight ? 'text-ink-300' : 'text-ink-500'}`}>
                      {text}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className={`font-mono text-3xl font-bold tracking-tight xl:text-[2.5rem] ${highlight ? 'text-white' : 'text-ink-950'}`}>
                      {price}
                    </span>
                    {price !== 'Индивидуально' && !price.includes('от') && (
                      <span className={`text-xs font-medium xl:text-sm ${highlight ? 'text-ink-400' : 'text-ink-500'}`}>
                        /мес
                      </span>
                    )}
                  </div>

                  <a
                    href={REGISTER_URL}
                    className={`relative mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl px-4 py-3.5 text-[14px] font-bold transition-all xl:text-sm ${highlight ? 'bg-brand-500 text-white shadow-[0_14px_30px_-18px_rgba(44,186,102,0.9),0_0_20px_rgba(44,186,102,0.3)] hover:bg-brand-400 hover:shadow-[0_14px_32px_-16px_rgba(44,186,102,1),0_0_25px_rgba(44,186,102,0.5)]' : 'bg-ink-50 text-ink-950 hover:bg-ink-100 hover:text-black'}`}
                  >
                    {index === 3 ? 'Обсудить условия' : 'Попробовать бесплатно'}
                  </a>

                  <div className={`my-6 h-px w-full ${highlight ? 'bg-white/10' : 'bg-ink-950/5'}`} />

                  <ul className="relative flex-1 space-y-3.5">
                    {features.map((item) => (
                      <li key={item} className={`flex items-start gap-2.5 text-[13px] xl:text-sm ${highlight ? 'text-ink-200' : 'text-ink-600'}`}>
                        <span className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${highlight ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id={SECTION_IDS.cta} className="content-auto px-4 pb-24">
        <Container>
          <motion.div {...fade} className="relative isolate overflow-hidden rounded-2xl bg-black px-6 py-14 text-white lg:px-14 lg:py-16">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_35%,rgba(44,186,102,.45),transparent_30%)]" />
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <h2 className="max-w-3xl text-4xl font-semibold leading-none tracking-[-0.04em] sm:text-5xl lg:text-7xl">
                  Запустите рабочее пространство Sellico.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
                  Соберите CRM, товары, финансы, поставки, задачи и коммуникации в одном рабочем пространстве без долгой настройки.
                </p>
              </div>
              <form onSubmit={submitCta} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-3 backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={ctaEmail}
                    onChange={(event) => {
                      setCtaEmail(event.target.value);
                      if (ctaError) setCtaError('');
                    }}
                    className="h-14 flex-1 rounded-2xl border border-white/10 bg-white px-5 text-base text-ink-950 outline-none placeholder:text-ink-400"
                    placeholder="Ваш email"
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={Boolean(ctaError)}
                  />
                  <Button type="submit" size="lg" className="w-full rounded-2xl px-7 sm:w-auto" disabled={!ctaConsent}>
                    Начать
                  </Button>
                </div>
                <label className="mt-3 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-white/60">
                  <input
                    type="checkbox"
                    checked={ctaConsent}
                    onChange={(event) => {
                      setCtaConsent(event.target.checked);
                      if (ctaError) setCtaError('');
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 accent-brand-500"
                    required
                  />
                  <span>
                    Я даю согласие на обработку персональных данных и принимаю{' '}
                    <a href="/personal-data-consent" className="font-medium text-white underline-offset-2 hover:underline">
                      текст согласия
                    </a>{' '}
                    и{' '}
                    <a href="/privacy" className="font-medium text-white underline-offset-2 hover:underline">
                      политику обработки данных
                    </a>
                    .
                  </span>
                </label>
                {ctaError && <p className="mt-2 px-1 text-[12px] leading-relaxed text-rose-200">{ctaError}</p>}
              </form>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
