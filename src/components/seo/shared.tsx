import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL } from '@/lib/anchors';
import {
  EDITORIAL_AUTHOR,
  EDITORIAL_METHODOLOGY_URL,
  getEditorialSources,
} from '@/content/editorial';
import { BRAND_THEME, formatEditorialDate, type DetailPage } from './page-types';

type PageTheme = NonNullable<DetailPage['theme']>;

export function EditorialInfo({ type, lastmod }: { type: string; lastmod: string }) {
  const sources = getEditorialSources(type);

  return (
    <section className="border-y border-ink-950/[0.07] bg-[#f4f8f6] py-12" aria-labelledby="editorial-info-title">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Редакционная информация</p>
            <h2 id="editorial-info-title" className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-ink-950">
              Проверено по первичным источникам
            </h2>
            <dl className="mt-5 space-y-2 text-sm text-ink-600">
              <div className="flex flex-wrap gap-x-2">
                <dt>Автор:</dt>
                <dd>
                  <a className="font-semibold text-brand-800 underline-offset-4 hover:underline" rel="author" href={EDITORIAL_AUTHOR.url}>
                    {EDITORIAL_AUTHOR.name}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>Обновлено:</dt>
                <dd>
                  <time dateTime={lastmod}>{formatEditorialDate(lastmod)}</time>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>Как проверяем:</dt>
                <dd>
                  <a className="font-semibold text-brand-800 underline-offset-4 hover:underline" href={EDITORIAL_METHODOLOGY_URL}>
                    методология Sellico
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-950">Источники</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-ink-950/[0.08] bg-white px-4 py-3 text-sm leading-relaxed text-ink-700 transition hover:border-brand-700/30 hover:text-brand-800"
                  >
                    <span className="block font-semibold">{source.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{source.publisher}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-ink-600">
              Состав данных конкретного кабинета зависит от API площадки, периода и тарифа Sellico.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function PageHero({
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

export function FinalCta({ background = BRAND_THEME.cta }: { background?: string }) {
  return (
    <section className="py-16 text-white lg:py-20" style={{ backgroundColor: background }} aria-labelledby="seo-cta-title">
      <Container className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="seo-cta-title" className="text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Проверьте работу Sellico на данных своего магазина
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/78 sm:text-base">
            Пробный период — 3 дня без привязки карты. Для Enterprise подготовим расчёт и сценарий внедрения.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>
            Создать аккаунт
          </Button>
        </div>
      </Container>
    </section>
  );
}

export function ComparisonTable({
  table,
  accents,
}: {
  table: NonNullable<DetailPage['table']>;
  accents?: readonly string[];
}) {
  return (
    <section className="py-20 lg:py-24" style={{ backgroundColor: '#f4f8f6' }} aria-labelledby="comparison-title">
      <Container>
        <h2 id="comparison-title" className="max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
          {table.title}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">{table.lead}</p>
        <div className="relative mt-10">
          <div className="overflow-x-auto rounded-[24px] border border-ink-950/[0.08] bg-white">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">{table.title}</caption>
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
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-14 rounded-r-[24px] bg-gradient-to-l from-[#f4f8f6] via-[#f4f8f6]/70 to-transparent md:hidden"
          />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-500 md:hidden">
          Листайте таблицу по горизонтали
          <ArrowRight size={12} aria-hidden />
        </p>
      </Container>
    </section>
  );
}

export function FaqSection({
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

export function DirectAnswer({
  answer,
  id,
  accent,
  background = '#ffffff',
}: {
  answer: NonNullable<DetailPage['answer']>;
  id: string;
  accent: string;
  background?: string;
}) {
  const titleId = `${id}-direct-answer-title`;

  return (
    <section
      className="border-y border-ink-950/[0.08] py-14 lg:py-16"
      style={{ backgroundColor: background }}
      aria-labelledby={titleId}
      data-direct-answer
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(180px,.42fr)_minmax(0,1.58fr)] lg:gap-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
            Короткий ответ
          </p>
          <div>
            <h2 id={titleId} className="max-w-4xl text-3xl font-semibold tracking-[-0.045em] text-ink-950 sm:text-4xl">
              {answer.title}
            </h2>
            <p className="mt-5 max-w-4xl text-base leading-[1.8] text-ink-600 sm:text-lg">{answer.text}</p>
            <ul className="mt-8 grid border-t border-ink-950/10 sm:grid-cols-3">
              {answer.points.map((point) => (
                <li
                  key={point}
                  className="border-b border-ink-950/10 py-4 text-sm font-medium leading-relaxed text-ink-800 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
