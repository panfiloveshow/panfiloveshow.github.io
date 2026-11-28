import { ArrowRight, ArrowUpRight, Check, FileCheck2, SearchCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import pagesIndex from '@/content/pages-index.json';
import { EDITORIAL_AUTHOR } from '@/content/editorial';
import { BRAND_THEME, formatEditorialDate, pluralRu, type DetailPage } from '../page-types';
import { DirectAnswer } from '../shared';

const AUTHOR_ARTICLES = Object.entries(pagesIndex as Record<string, { kind: string; title: string; created?: string; cover?: string }>)
  .filter(([, entry]) => entry.kind === 'article')
  .sort(([, a], [, b]) => (b.created ?? '').localeCompare(a.created ?? ''));

const AUTHOR_PORTRAIT_SIZES = '(min-width: 1024px) 480px, min(384px, calc(100vw - 40px))';

export function AuthorProfilePage({ page }: { page: DetailPage }) {
  const [name, role] = page.h1.split(' — ');
  const { certificate } = page;
  const photo = EDITORIAL_AUTHOR.photo;
  const articlesCount = AUTHOR_ARTICLES.length;
  const facts = [
    ...(page.facts ?? []),
    ...(articlesCount
      ? [[String(articlesCount), `${pluralRu(articlesCount, ['статья', 'статьи', 'статей'])} для продавцов маркетплейсов`]]
      : []),
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#F3F3F0] pb-16 pt-32 lg:pb-20 lg:pt-40" aria-labelledby="author-title">
        <div aria-hidden className="absolute -right-40 -top-40 -z-10 h-[720px] w-[720px] rounded-full bg-white/80 blur-3xl" />
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-[#5C6560]">
            <a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a>
            <span aria-hidden className="mx-2">/</span>
            <a href="/about/" className="underline-offset-4 hover:text-ink-950 hover:underline">О Sellico</a>
            <span aria-hidden className="mx-2">/</span>
            <span aria-current="page" className="text-ink-950">{name}</span>
          </nav>

          <div className="mt-12 grid items-end gap-16 lg:mt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:gap-20">
            <div>
              <h1
                id="author-title"
                className="text-[clamp(3.5rem,9vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-ink-950"
              >
                {name.split(' ').map((part, index) => (
                  <span key={part} className="block">
                    {index > 0 && ' '}
                    {part}
                  </span>
                ))}
                {role && (
                  <>
                    <span className="sr-only"> — </span>
                    <span className="mt-5 block text-[clamp(1.35rem,2.4vw,2rem)] font-medium leading-tight tracking-[-0.03em] text-[#6B736F]">
                      {role}
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-[1.7] text-[#4A5550]">{page.lead}</p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href="mailto:hello@sellico.ru"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Написать автору <ArrowRight size={16} aria-hidden />
                </a>
                {articlesCount > 0 && (
                  <a
                    href="#author-articles-title"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-950 underline-offset-4 hover:underline"
                  >
                    Статьи автора <ArrowRight size={15} aria-hidden />
                  </a>
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
              <img
                src={`${photo}-portrait-960.webp`}
                srcSet={`${photo}-portrait-480.webp 480w, ${photo}-portrait-960.webp 960w`}
                sizes={AUTHOR_PORTRAIT_SIZES}
                width={960}
                height={1200}
                alt={EDITORIAL_AUTHOR.name}
                fetchPriority="high"
                className="h-auto w-full rounded-[32px] bg-[#D6D6D5] shadow-[0_60px_100px_-60px_rgba(9,14,23,.55)]"
              />
              {certificate && (
                <a
                  href="#certificate"
                  className="absolute -bottom-7 left-4 right-4 flex items-start gap-3.5 rounded-2xl border border-ink-950/[0.06] bg-white/95 p-4 shadow-[0_24px_60px_-28px_rgba(9,14,23,.45)] backdrop-blur transition-colors hover:border-brand-700/30 motion-safe:animate-rise-fade sm:left-auto sm:right-6 sm:w-[320px] lg:-left-14 lg:bottom-12 lg:right-auto"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-white">
                    <Check size={18} strokeWidth={2.5} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">Роспатент</span>
                    <span className="mt-1 block text-sm font-semibold text-ink-950">
                      Свидетельство №{'\u00a0'}{certificate.number}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-[#5C6560]">{certificate.note}</span>
                  </span>
                </a>
              )}
            </div>
          </div>

          {facts.length > 0 && (
            <dl className="mt-20 grid border-t border-ink-950/10 sm:grid-cols-3">
              {facts.map(([value, label]) => (
                <div
                  key={label}
                  className="flex flex-col-reverse border-b border-ink-950/10 py-6 sm:border-b-0 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
                >
                  <dt className="mt-2 max-w-[17rem] text-sm leading-snug text-[#5C6560]">{label}</dt>
                  <dd className="text-4xl font-semibold tracking-[-0.045em] text-ink-950 sm:text-5xl">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Container>
      </section>

      {certificate && (
        <section id="certificate" className="scroll-mt-24 bg-white py-20 lg:py-28" aria-labelledby="certificate-title">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-20">
              <div>
                <p className="text-sm font-semibold text-brand-700">Подтверждение авторства</p>
                <h2 id="certificate-title" className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink-950 sm:text-5xl">
                  Программа {certificate.program} зарегистрирована в Роспатенте
                </h2>
                <p className="mt-5 max-w-lg text-base leading-[1.75] text-[#4A5550]">
                  Свидетельство о государственной регистрации программы для ЭВМ подтверждает авторство и права на {certificate.program}.
                  Запись открыта в реестре ФИПС — проверить её может любой.
                </p>
              </div>
              <div className="rounded-[28px] border border-ink-950/[0.08] bg-[#FAFAF8] p-7 sm:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5C6560]">Реестр программ для ЭВМ · Роспатент</p>
                <p className="mt-4 text-4xl font-semibold tabular-nums tracking-[-0.03em] text-ink-950 sm:text-5xl">
                  №{'\u00a0'}{certificate.number}
                </p>
                <dl className="mt-8 border-t border-ink-950/[0.08] text-sm">
                  {[
                    ['Программа', `«${certificate.program}»`],
                    ['Автор и правообладатель', certificate.holder],
                    ['Дата регистрации', formatEditorialDate(certificate.date)],
                    ['Заявка', `№\u00a0${certificate.application} от ${formatEditorialDate(certificate.applicationDate)}`],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 border-b border-ink-950/[0.08] py-3.5 sm:grid-cols-[200px_1fr] sm:gap-6">
                      <dt className="text-[#5C6560]">{label}</dt>
                      <dd className="font-medium text-ink-950">{value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={certificate.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-brand-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
                >
                  Открыть запись в реестре ФИПС <ArrowUpRight size={15} aria-hidden />
                </a>
              </div>
            </div>
          </Container>
        </section>
      )}

      <section className="bg-[#F3F3F0] py-20 lg:py-28" aria-labelledby="author-work-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <div>
              <h2 id="author-work-title" className="text-3xl font-semibold tracking-[-0.045em] text-ink-950 sm:text-5xl">
                {page.blocksTitle}
              </h2>
              <p className="mt-5 max-w-md text-base leading-[1.75] text-[#4A5550]">{page.blocksLead}</p>
            </div>
            <div className="border-t border-ink-950/[0.12]">
              {page.blocks.map((block) => (
                <article key={block.title} className="border-b border-ink-950/[0.12] py-8">
                  <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink-950 sm:text-2xl">{block.title}</h3>
                  <p className="mt-3 max-w-2xl text-base leading-[1.75] text-[#4A5550]">{block.text}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[#5C6560]">{block.items.join(' · ')}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {articlesCount > 0 && (
        <section className="bg-white py-20 lg:py-24" aria-labelledby="author-articles-title">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="author-articles-title" className="scroll-mt-28 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
                Статьи автора
              </h2>
              <a
                href="/articles/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
              >
                Все статьи <ArrowRight size={14} aria-hidden />
              </a>
            </div>
            <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {AUTHOR_ARTICLES.map(([slug, article]) => (
                <a key={slug} href={`/${slug}/`} className="group block">
                  {article.cover && (
                    <span className="block overflow-hidden rounded-2xl bg-[#F3F3F0]">
                      <img
                        src={`${article.cover}-800.webp`}
                        width={800}
                        height={420}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    </span>
                  )}
                  {article.created && (
                    <time dateTime={article.created} className="mt-4 block text-xs text-[#5C6560]">
                      {formatEditorialDate(article.created)}
                    </time>
                  )}
                  <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-ink-950 transition-colors group-hover:text-brand-800">
                    {article.title}
                  </h3>
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

export function CasesEvidencePage({ page }: { page: DetailPage }) {
  const [status, ...rest] = page.blocks;
  const scenarios = rest.slice(0, 3);
  const [standard, submit] = rest.slice(3);

  return (
    <>
      <section className="border-b border-[#d8d2c4] bg-[#f3efe5] pb-20 pt-32 lg:pb-24 lg:pt-40" aria-labelledby="cases-title">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-ink-500"><a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">Сценарии использования</span></nav>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#805f1e]">Практика работы в Sellico</p>
              <h1 id="cases-title" className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">{page.h1}</h1>
              <p className="mt-7 max-w-3xl text-lg leading-[1.75] text-ink-600">{page.lead}</p>
            </div>
            <div className="border-l border-ink-950/15 pl-7">
              <p className="text-[7rem] font-semibold leading-none tracking-[-0.09em] text-[#b58a31]">3</p>
              <p className="mt-2 max-w-[230px] text-sm font-semibold leading-relaxed text-ink-800">сценария для магазина, бренда и агентства</p>
            </div>
          </div>
        </Container>
      </section>

      {page.answer && <DirectAnswer answer={page.answer} id="cases" accent="#805f1e" background="#faf8f3" />}

      <section className="bg-white py-20 lg:py-28" aria-labelledby="cases-process-title">
        <Container>
          <div className="max-w-3xl"><h2 id="cases-process-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div>
          {status && (
            <article className="mt-14 grid gap-8 rounded-[30px] bg-[#15130f] p-7 text-white sm:p-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
              <div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e5bf6b]"><FileCheck2 size={15} aria-hidden /> Первый шаг</span><h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">{status.title}</h3></div>
              <div><p className="text-base leading-[1.8] text-white/65">{status.text}</p><ul className="mt-6 grid gap-3 sm:grid-cols-3">{status.items.map((item) => <li key={item} className="border-t border-white/12 pt-3 text-sm text-white/78">{item}</li>)}</ul></div>
            </article>
          )}

          <div className="mt-16">
            <div className="flex items-end justify-between gap-6 border-b border-ink-950/15 pb-5"><h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">Сценарии использования</h3></div>
            {scenarios.map((block, index) => (
              <article key={block.title} className="grid gap-6 border-b border-ink-950/10 py-9 lg:grid-cols-[100px_minmax(0,.78fr)_minmax(0,1.22fr)] lg:gap-10">
                <span className="font-mono text-3xl text-[#b58a31]">{String(index + 1).padStart(2, '0')}</span><h4 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h4><div><p className="text-base leading-[1.8] text-ink-600">{block.text}</p><ul className="mt-5 flex flex-wrap gap-2">{block.items.map((item) => <li key={item} className="rounded-full bg-[#f3efe5] px-3.5 py-2 text-[13px] font-medium text-ink-700">{item}</li>)}</ul></div>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            {standard && <article className="rounded-[28px] bg-[#f3efe5] p-7 sm:p-9"><p className="font-mono text-xs text-[#805f1e]">STANDARD / 01</p><h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-ink-950">{standard.title}</h3><p className="mt-4 text-sm leading-[1.8] text-ink-600">{standard.text}</p><ol className="mt-7 grid gap-3 sm:grid-cols-2">{standard.items.map((item, index) => <li key={item} className="flex gap-3 border-t border-ink-950/10 pt-3 text-sm text-ink-700"><span className="font-mono text-[#b58a31]">{index + 1}</span>{item}</li>)}</ol></article>}
            {submit && <article className="rounded-[28px_28px_8px_28px] bg-[#b58a31] p-7 text-white sm:p-9"><p className="font-mono text-xs text-white/60">SELLICO / START</p><h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em]">{submit.title}</h3><p className="mt-4 text-sm leading-[1.8] text-white/75">{submit.text}</p><a href="mailto:hello@sellico.ru?subject=Запуск%20Sellico" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">Обсудить задачу <ArrowRight size={14} aria-hidden /></a></article>}
          </div>
        </Container>
      </section>
    </>
  );
}

export function AboutCompanyPage({ page }: { page: DetailPage }) {
  return (
    <>
      <section className="relative overflow-hidden bg-white pb-20 pt-32 lg:pb-28 lg:pt-40" aria-labelledby="about-title">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-ink-500"><a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">О Sellico</span></nav>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-brand-800">Продукт / компания / редакция</p>
          <h1 id="about-title" className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-ink-950 sm:text-6xl lg:text-8xl">{page.h1}</h1>
          <div className="mt-10 grid gap-8 border-t border-ink-950/12 pt-8 lg:grid-cols-[1fr_1fr]"><p className="max-w-2xl text-lg leading-[1.75] text-ink-600">{page.lead}</p><div className="grid grid-cols-3 gap-3"><span className="rounded-2xl bg-[#efe7ff] p-4 text-sm font-semibold text-ink-800">WB</span><span className="rounded-2xl bg-[#e9f1ff] p-4 text-sm font-semibold text-ink-800">Ozon</span><span className="rounded-2xl bg-[#fff2c5] p-4 text-sm font-semibold text-ink-800">Market</span></div></div>
        </Container>
      </section>
      {page.answer && <DirectAnswer answer={page.answer} id="about" accent={BRAND_THEME.mark} background={BRAND_THEME.soft} />}
      <section className="bg-[#edf3ef] py-20 lg:py-28" aria-labelledby="about-facts-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.62fr_1.38fr] lg:gap-20"><div><h2 id="about-facts-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div><div className="grid gap-5 sm:grid-cols-2">{page.blocks.map((block, index) => <article key={block.title} className={`${index === 0 || index === 3 ? 'sm:col-span-2' : ''} rounded-[28px] p-7 sm:p-9 ${index === 0 ? 'bg-[#0d3d2e] text-white' : index === 3 ? 'bg-[#181d1a] text-white' : 'border border-ink-950/[0.08] bg-white text-ink-950'}`}><span className={`font-mono text-xs ${index === 0 || index === 3 ? 'text-white/45' : 'text-ink-400'}`}>{String(index + 1).padStart(2, '0')}</span><h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h3><p className={`mt-4 text-sm leading-[1.8] ${index === 0 || index === 3 ? 'text-white/65' : 'text-ink-600'}`}>{block.text}</p><ul className="mt-6 flex flex-wrap gap-2">{block.items.map((item) => <li key={item} className={`rounded-full px-3 py-1.5 text-xs font-medium ${index === 0 || index === 3 ? 'bg-white/10 text-white/78' : 'bg-[#edf3ef] text-ink-700'}`}>{item}</li>)}</ul></article>)}</div></div>
        </Container>
      </section>
    </>
  );
}

export function MethodologyProtocolPage({ page }: { page: DetailPage }) {
  return (
    <>
      <section className="bg-[#e9f0ec] pb-20 pt-32 lg:pb-24 lg:pt-40" aria-labelledby="method-title">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-ink-500"><a href="/" className="underline-offset-4 hover:text-ink-950 hover:underline">Главная</a><span aria-hidden className="mx-2">/</span><span aria-current="page">Методология</span></nav>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-800"><SearchCheck size={15} aria-hidden /> Редакционный протокол</div>
              <h1 id="method-title" className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">{page.h1}</h1>
              <p className="mt-7 max-w-3xl text-lg leading-[1.75] text-ink-600">{page.lead}</p>
            </div>
            <div className="rounded-[26px] border border-ink-950/10 bg-white/60 p-6">
              <div className="flex items-center justify-between"><FileCheck2 size={23} className="text-brand-800" aria-hidden /><span className="font-mono text-xs text-ink-400">v.2026.08</span></div>
              <p className="mt-9 text-sm font-semibold text-ink-900">Проверяемость по умолчанию</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">Факты, формулы, даты, источники и ограничения.</p>
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-white py-20 lg:py-28" aria-labelledby="protocol-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start"><h2 id="protocol-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div>
            <ol className="border-t border-ink-950/14">
              {page.blocks.map((block, index) => (
                <li key={block.title} className="grid gap-5 border-b border-ink-950/12 py-9 sm:grid-cols-[70px_1fr]">
                  <span className="font-mono text-xl text-brand-700">{String(index + 1).padStart(2, '0')}</span>
                  <article>
                    <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3>
                    <p className="mt-4 text-base leading-[1.8] text-ink-600">{block.text}</p>
                    <ul className="mt-6 grid gap-2 sm:grid-cols-3">{block.items.map((item) => <li key={item} className="border-l-2 border-brand-300 pl-3 text-sm text-ink-700">{item}</li>)}</ul>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </>
  );
}

export function ContactsPage({ page }: { page: DetailPage }) {
  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="contacts-title">
      <Container>
        <h2 id="contacts-title" className="sr-only">
          Способы связи
        </h2>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {page.actions?.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="group flex flex-col justify-between rounded-[26px] border border-ink-950/[0.08] bg-[#f4f8f6] p-6 transition-colors hover:border-brand-700/30 hover:bg-brand-50 sm:p-7"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">{action.label}</p>
                  <p className="mt-4 break-all text-xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-2xl">
                    {action.value}
                  </p>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-ink-600">{action.note}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800">
                  Написать
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            ))}
          </div>

          {page.requisites && (
            <div className="rounded-[26px] border border-ink-950/[0.08] bg-[#0b1512] p-6 text-white sm:p-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
                {page.requisites.title}
              </h3>
              <dl className="mt-6 space-y-4">
                {page.requisites.rows.map(([label, value]) => (
                  <div key={label} className="border-b border-white/[0.08] pb-4 last:border-0 last:pb-0">
                    <dt className="text-xs text-white/45">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-xs leading-relaxed text-white/45">{page.requisites.note}</p>
            </div>
          )}
        </div>

        <div className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-4xl">{page.blocksTitle}</h2>
          <div className="mt-8 grid gap-x-12 gap-y-9 md:grid-cols-2">
            {page.blocks.map((block) => (
              <article key={block.title}>
                <h3 className="text-lg font-semibold text-ink-950">{block.title}</h3>
                <p className="mt-3 text-sm leading-[1.75] text-ink-600">{block.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
