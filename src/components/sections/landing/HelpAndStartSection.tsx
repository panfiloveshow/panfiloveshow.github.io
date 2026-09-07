import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CircleCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL, SECTION_IDS } from '@/lib/anchors';
import { track } from '@/lib/analytics';
import {
  PERSONAL_DATA_CONSENT_VERSION,
  PERSONAL_DATA_CONSENT_PATH,
  PRIVACY_POLICY_PATH,
  PRIVACY_POLICY_VERSION,
  REGISTRATION_PREFILL_STORAGE_KEY,
} from '@/lib/legal';
import { reveal } from './data';

// Перелинковка с главной вглубь: без неё внутренние страницы висят на одном подвале.
const DEEP_LINKS = [
  { label: 'Юнит-экономика', href: '/unit-economics/' },
  { label: 'Остатки и поставки', href: '/supply-planning/' },
  { label: 'SEO карточек', href: '/seo-cards/' },
  { label: 'Реклама и цены', href: '/advertising/' },
  { label: 'Отзывы и заявки', href: '/reviews/' },
  { label: 'Задачи и команда', href: '/team/' },
  { label: 'Sellico для Wildberries', href: '/wildberries/' },
  { label: 'Sellico для Ozon', href: '/ozon/' },
  { label: 'Sellico для Яндекс Маркета', href: '/yandex-market/' },
  { label: 'Калькулятор юнит-экономики', href: '/calculators/unit-economics/' },
  { label: 'Калькулятор ДРР', href: '/calculators/drr/' },
  { label: 'Калькулятор оборачиваемости', href: '/calculators/turnover/' },
  { label: 'Глоссарий продавца', href: '/glossary/' },
  { label: 'Контакты', href: '/contacts/' },
];

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

export function HelpAndStartSection() {
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

    try {
      sessionStorage.setItem(REGISTRATION_PREFILL_STORAGE_KEY, JSON.stringify({
        email,
        consentAt: new Date().toISOString(),
        consentVersion: PERSONAL_DATA_CONSENT_VERSION,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        expiresAt: Date.now() + 15 * 60 * 1000,
      }));
    } catch {
      // Регистрация останется доступна без автозаполнения.
    }

    track('lead_submit', { source: 'landing_v2_final_cta' });
    window.location.href = REGISTER_URL;
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
                    <span>Даю <a href={PERSONAL_DATA_CONSENT_PATH} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2">согласие на обработку данных</a> (версия {PERSONAL_DATA_CONSENT_VERSION}) и ознакомлен с <a href={PRIVACY_POLICY_PATH} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2">политикой</a> (версия {PRIVACY_POLICY_VERSION}).</span>
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

              <nav aria-label="Разделы сайта" className="border-t border-ink-950/[0.08] py-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Разобраться подробнее</h3>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {DEEP_LINKS.map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-ink-950/[0.1] bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:border-brand-700/40 hover:bg-[#f4f8f6]"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
