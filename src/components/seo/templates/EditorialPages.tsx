import { Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { MiniCalc } from '@/components/seo/MiniCalc';
import { EDITORIAL_AUTHOR } from '@/content/editorial';
import { BRAND_THEME, formatEditorialDate, type DetailPage } from '../page-types';
import { ComparisonTable, DirectAnswer } from '../shared';

type PageTheme = NonNullable<DetailPage['theme']>;

function EditorialBreadcrumbs({
  parentLabel,
  parentHref,
  eyebrow,
}: {
  parentLabel: string;
  parentHref: string;
  eyebrow: string;
}) {
  return (
    <nav aria-label="Хлебные крошки" className="text-sm text-ink-500">
      <a href="/" className="underline-offset-4 hover:text-ink-900 hover:underline">
        Главная
      </a>
      <span aria-hidden className="mx-2">/</span>
      <a href={parentHref} className="underline-offset-4 hover:text-ink-900 hover:underline">
        {parentLabel}
      </a>
      <span aria-hidden className="mx-2">/</span>
      <span aria-current="page" className="text-ink-900">
        {eyebrow}
      </span>
    </nav>
  );
}

function ArticleBody({
  blocks,
  tocId,
  sectionLabel,
}: {
  blocks: DetailPage['blocks'];
  tocId: string;
  sectionLabel: string;
}) {
  return (
    <section className="bg-white py-14 lg:py-20" aria-label={sectionLabel}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <nav aria-labelledby={tocId}>
            <h2 id={tocId} className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              Содержание
            </h2>
            <ol className="mt-4 space-y-2.5 border-l border-ink-950/10 pl-4 text-sm leading-snug">
              {blocks.map((block, index) => (
                <li key={block.title}>
                  <a
                    href={`#section-${index + 1}`}
                    className="text-ink-600 underline-offset-4 hover:text-brand-800 hover:underline"
                  >
                    {block.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-3xl space-y-12">
            {blocks.map((block, index) => (
              <section key={block.title} id={`section-${index + 1}`} className="scroll-mt-28">
                <h2 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-3xl">{block.title}</h2>
                {block.text.split('\n\n').map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-[1.8] text-ink-700 sm:text-[17px]">
                    {paragraph}
                  </p>
                ))}
                {block.items.length > 0 && (
                  <ul className="mt-5 space-y-2.5">
                    {block.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-800">
                        <Check size={16} className="mt-1 shrink-0 text-brand-700" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function GlossaryTermPage({ page, theme, slug }: { page: DetailPage; theme: PageTheme; slug: string }) {
  return (
    <>
      <section className="border-b border-ink-950/[0.07] bg-white pb-14 pt-32 lg:pt-36" aria-labelledby="term-title">
        <Container>
          <EditorialBreadcrumbs parentLabel="Глоссарий" parentHref="/glossary/" eyebrow={page.eyebrow} />
          <h1
            id="term-title"
            className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.05em] text-ink-950 sm:text-6xl"
          >
            {page.h1}
          </h1>
          <p data-term-definition className="mt-6 max-w-4xl text-xl font-medium leading-[1.5] tracking-[-0.015em] text-ink-700 sm:text-2xl">
            {page.definition}
          </p>
        </Container>
      </section>

      <section className="bg-white py-14 lg:py-16" aria-labelledby="term-formula-title">
        <Container>
          <h2 id="term-formula-title" className="sr-only">
            Формула
          </h2>

          {page.formula && (
            <div className="mt-10 overflow-hidden rounded-[26px] border border-ink-950/[0.1] bg-[#0b1512]">
              <p className="border-b border-white/10 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-300 sm:px-8">
                Формула
              </p>
              <dl className="divide-y divide-white/[0.07]">
                {page.formula.rows.map((row) => (
                  <div key={row.label} className="gap-2 px-6 py-5 sm:flex sm:items-baseline sm:gap-6 sm:px-8">
                    <dt className="shrink-0 text-sm font-semibold text-white/60 sm:w-[240px]">{row.label}</dt>
                    <dd className="mt-1.5 font-mono text-[15px] leading-relaxed text-white sm:mt-0 sm:text-lg">
                      {row.expression}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="border-t border-white/10 px-6 py-4 text-sm text-white/55 sm:px-8">{page.formula.note}</p>
            </div>
          )}
        </Container>
      </section>

      <MiniCalc slug={slug} />

      <section className="py-16 lg:py-20" style={{ backgroundColor: theme.soft }} aria-labelledby="term-detail-title">
        <Container>
          <h2 id="term-detail-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-4xl">
            {page.blocksTitle}
          </h2>
          <div className="mt-10 max-w-3xl space-y-10">
            {page.blocks.map((block) => (
              <article key={block.title}>
                <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3>
                <p className="mt-3 text-base leading-[1.8] text-ink-600">{block.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-ink-950/[0.08] bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700"
                    >
                      {item}
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

export function ArticlePage({ page }: { page: DetailPage }) {
  const [parentLabel, parentHref] = page.parent ?? ['Статьи', '/articles/'];

  return (
    <>
      <section className="border-b border-ink-950/[0.07] bg-white pb-14 pt-32 lg:pt-36" aria-labelledby="article-title">
        <Container>
          <EditorialBreadcrumbs parentLabel={parentLabel} parentHref={parentHref} eyebrow={page.eyebrow} />
          <h1
            id="article-title"
            className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-ink-950 sm:text-6xl"
          >
            {page.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-[1.7] text-ink-600">{page.lead}</p>
          <p className="mt-7 flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink-500">
            <a className="font-semibold text-brand-800 underline-offset-4 hover:underline" href={EDITORIAL_AUTHOR.url}>
              {EDITORIAL_AUTHOR.name}
            </a>
            {page.created && (
              <>
                <span aria-hidden>·</span>
                <span>
                  Опубликовано <time dateTime={page.created}>{formatEditorialDate(page.created)}</time>
                </span>
              </>
            )}
            {page.lastmod !== page.created && (
              <>
                <span aria-hidden>·</span>
                <span>
                  Обновлено <time dateTime={page.lastmod}>{formatEditorialDate(page.lastmod)}</time>
                </span>
              </>
            )}
          </p>
          {page.cover && (
            <figure className="mt-10 max-w-4xl">
              <img
                src={`${page.cover.src}-1600.webp`}
                srcSet={`${page.cover.src}-800.webp 800w, ${page.cover.src}-1600.webp 1600w`}
                sizes="(min-width: 1024px) 896px, calc(100vw - 40px)"
                width={1600}
                height={840}
                alt={page.cover.alt}
                fetchPriority="high"
                className="h-auto w-full rounded-[26px] border border-ink-950/[0.08] bg-[#f4f8f6]"
              />
              <figcaption className="mt-3 text-xs text-ink-500">
                Фото:{' '}
                <a
                  href={page.cover.creditUrl}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="underline-offset-4 hover:text-ink-900 hover:underline"
                >
                  {page.cover.credit}
                </a>
                , Unsplash
              </figcaption>
            </figure>
          )}
        </Container>
      </section>

      {page.answer && (
        <DirectAnswer answer={page.answer} id="article" accent={BRAND_THEME.mark} background={BRAND_THEME.soft} />
      )}

      <ArticleBody blocks={page.blocks} tocId="article-toc-title" sectionLabel="Текст статьи" />
    </>
  );
}

export function ComparisonPage({ page }: { page: DetailPage }) {
  const [parentLabel, parentHref] = page.parent ?? ['Сравнения', '/compare/'];

  return (
    <>
      <section className="border-b border-ink-950/[0.07] bg-white pb-14 pt-32 lg:pt-36" aria-labelledby="comparison-page-title">
        <Container>
          <EditorialBreadcrumbs parentLabel={parentLabel} parentHref={parentHref} eyebrow={page.eyebrow} />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Разбор и критерии выбора
          </p>
          <h1
            id="comparison-page-title"
            className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-ink-950 sm:text-6xl"
          >
            {page.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-[1.7] text-ink-600">{page.lead}</p>
          <p className="mt-7 flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink-500">
            <a className="font-semibold text-brand-800 underline-offset-4 hover:underline" href={EDITORIAL_AUTHOR.url}>
              {EDITORIAL_AUTHOR.name}
            </a>
            <span aria-hidden>·</span>
            <span>
              Обновлено <time dateTime={page.lastmod}>{formatEditorialDate(page.lastmod)}</time>
            </span>
          </p>
        </Container>
      </section>

      {page.answer && (
        <DirectAnswer answer={page.answer} id="comparison" accent={BRAND_THEME.mark} background={BRAND_THEME.soft} />
      )}

      {page.table && <ComparisonTable table={page.table} />}

      <ArticleBody blocks={page.blocks} tocId="comparison-toc-title" sectionLabel="Критерии сравнения" />
    </>
  );
}
