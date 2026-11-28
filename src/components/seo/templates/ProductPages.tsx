import { ArrowRight, Braces, Check, Database, Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { WorkspacePreview } from '@/components/primitives/WorkspacePreview';
import { REGISTER_URL } from '@/lib/anchors';
import type { DetailPage } from '../page-types';
import { DirectAnswer } from '../shared';

type FeatureLayout = 'matrix' | 'ledger' | 'control' | 'studio' | 'inbox' | 'flow' | 'workspace';

type FeatureSignature = {
  number: string;
  label: string;
  layout: FeatureLayout;
  accent: string;
  soft: string;
  hero: string;
};

const FEATURE_SIGNATURES: Record<string, FeatureSignature> = {
  'analytics-marketplaces': {
    number: '01',
    label: 'Контур данных',
    layout: 'matrix',
    accent: '#70E1BC',
    soft: '#EAF8F3',
    hero: 'radial-gradient(circle at 78% 24%,rgba(39,189,151,.24),transparent 26%),linear-gradient(135deg,#071712 0%,#103f31 100%)',
  },
  'unit-economics': {
    number: '02',
    label: 'Финансовая модель',
    layout: 'ledger',
    accent: '#F2C96D',
    soft: '#FBF5E8',
    hero: 'radial-gradient(circle at 80% 18%,rgba(242,201,109,.2),transparent 28%),linear-gradient(135deg,#17140d 0%,#413616 100%)',
  },
  advertising: {
    number: '03',
    label: 'Контур управления',
    layout: 'control',
    accent: '#FF9072',
    soft: '#FFF0EB',
    hero: 'radial-gradient(circle at 80% 18%,rgba(255,144,114,.22),transparent 28%),linear-gradient(135deg,#1b0f0c 0%,#54251b 100%)',
  },
  'seo-cards': {
    number: '04',
    label: 'Контент-студия',
    layout: 'studio',
    accent: '#B6A7FF',
    soft: '#F2EFFE',
    hero: 'radial-gradient(circle at 78% 18%,rgba(182,167,255,.24),transparent 29%),linear-gradient(135deg,#110f1d 0%,#30285d 100%)',
  },
  reviews: {
    number: '05',
    label: 'Входящие',
    layout: 'inbox',
    accent: '#7FD3FF',
    soft: '#EAF7FD',
    hero: 'radial-gradient(circle at 80% 20%,rgba(127,211,255,.24),transparent 28%),linear-gradient(135deg,#08151b 0%,#163f52 100%)',
  },
  'supply-planning': {
    number: '06',
    label: 'Цепочка поставки',
    layout: 'flow',
    accent: '#A8D56A',
    soft: '#F0F7E7',
    hero: 'radial-gradient(circle at 80% 20%,rgba(168,213,106,.22),transparent 28%),linear-gradient(135deg,#10170a 0%,#334b1c 100%)',
  },
  team: {
    number: '07',
    label: 'Рабочее пространство',
    layout: 'workspace',
    accent: '#FFA9C1',
    soft: '#FCEEF2',
    hero: 'radial-gradient(circle at 80% 20%,rgba(255,169,193,.22),transparent 28%),linear-gradient(135deg,#1a0d12 0%,#4e2532 100%)',
  },
};

type MarketplaceSignature = {
  label: string;
  art: string;
  alt: string;
  accent: string;
  ink: string;
  soft: string;
};

const MARKETPLACE_SIGNATURES: Record<string, MarketplaceSignature> = {
  wildberries: {
    label: 'Fashion commerce system',
    art: 'wildberries-system',
    alt: 'Трёхмерная композиция склада одежды, заказов и поставок Wildberries в едином рабочем контуре',
    accent: '#E9B5FF',
    ink: '#260C32',
    soft: '#F7EEFA',
  },
  ozon: {
    label: 'Order engineering system',
    art: 'ozon-system',
    alt: 'Трёхмерная инженерная схема заказов, складов и FBO/FBS-потоков магазина Ozon',
    accent: '#BFD5FF',
    ink: '#081D42',
    soft: '#ECF3FF',
  },
  'yandex-market': {
    label: 'Connected commerce map',
    art: 'yandex-market-system',
    alt: 'Трёхмерная карта товарных, складских и командных процессов магазина Яндекс Маркета',
    accent: '#FFD34D',
    ink: '#261B05',
    soft: '#FFF6D5',
  },
};

function FeatureHero({ page, signature }: { page: DetailPage; signature: FeatureSignature }) {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-36 text-white lg:pb-28 lg:pt-44" style={{ background: signature.hero }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:42px_42px]" />
      <Container>
        <nav aria-label="Хлебные крошки" className="text-sm text-white/58">
          <a href="/" className="underline-offset-4 hover:text-white hover:underline">Главная</a>
          <span aria-hidden className="mx-2">/</span>
          <a href="/features/" className="underline-offset-4 hover:text-white hover:underline">Возможности</a>
          <span aria-hidden className="mx-2">/</span>
          <span aria-current="page">{page.eyebrow}</span>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>
              <span>{signature.number}</span>
              <span className="h-px w-8" style={{ backgroundColor: signature.accent }} aria-hidden />
              <span>{signature.label}</span>
            </div>
            <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{page.h1}</h1>
            <p className="mt-7 max-w-3xl text-base leading-[1.75] text-white/72 sm:text-lg">{page.lead}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить магазин</Button>
              <Button as="a" href="/#demo" variant="dark" size="lg" className="rounded-xl border-white/20">Посмотреть интерфейс</Button>
            </div>
          </div>

          <div className="relative hidden min-h-[280px] overflow-hidden rounded-[28px] border border-white/14 bg-white/[0.055] p-7 lg:block">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <span>Sellico / module</span>
              <span>{signature.number}</span>
            </div>
            <div className="mt-12 grid grid-cols-4 gap-2" aria-hidden>
              {[78, 46, 92, 64, 38, 84, 56, 100].map((height, index) => (
                <span key={`${height}-${index}`} className="relative h-16 overflow-hidden rounded-lg bg-white/[0.06]">
                  <span className="absolute inset-x-0 bottom-0 rounded-lg opacity-75" style={{ height: `${height}%`, backgroundColor: signature.accent }} />
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: signature.accent }} />
              <span className="text-xs text-white/52">Данные → решение → действие</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureItems({ items, signature }: { items: string[]; signature: FeatureSignature }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-950/[0.07] bg-white/75 px-3 py-1.5 text-[13px] font-medium text-ink-700">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: signature.accent }} aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeatureBlocks({ page, signature }: { page: DetailPage; signature: FeatureSignature }) {
  const heading = (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent === '#F2C96D' ? '#8A6817' : '#176B54' }}>{signature.label}</p>
      <h2 id="feature-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2>
      <p className="mt-5 text-base leading-relaxed text-ink-600">{page.blocksLead}</p>
    </div>
  );

  if (signature.layout === 'ledger') {
    return (
      <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="mt-14 overflow-hidden border-y border-ink-950/15 bg-white/55">
            {page.blocks.map((block, index) => (
              <article key={block.title} className="grid gap-6 border-b border-ink-950/10 px-1 py-8 last:border-0 sm:px-5 lg:grid-cols-[80px_minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-10">
                <span className="font-mono text-sm text-ink-400">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3>
                <div>
                  <p className="text-base leading-[1.8] text-ink-600">{block.text}</p>
                  <FeatureItems items={block.items} signature={signature} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'flow') {
    return (
      <section className="bg-white py-20 lg:py-28" aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="relative mt-16 max-w-5xl lg:ml-auto">
            <div aria-hidden className="absolute bottom-10 left-[23px] top-10 w-px bg-ink-950/12 sm:left-[31px]" />
            <div className="space-y-5">
              {page.blocks.map((block, index) => (
                <article key={block.title} className="relative grid gap-5 pl-16 sm:pl-20 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-14">
                  <span className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full border-4 border-white text-xs font-bold sm:h-16 sm:w-16" style={{ backgroundColor: signature.soft, color: '#304817' }}>{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="pt-2 text-2xl font-semibold tracking-[-0.035em] text-ink-950 sm:pt-4">{block.title}</h3>
                  <div className="rounded-[22px] border border-ink-950/[0.08] p-6 sm:p-7">
                    <p className="text-base leading-[1.8] text-ink-600">{block.text}</p>
                    <FeatureItems items={block.items} signature={signature} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'inbox') {
    return (
      <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="feature-blocks-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">{heading}</div>
            <div className="overflow-hidden rounded-[28px] border border-ink-950/[0.09] bg-white shadow-[0_28px_70px_-55px_rgba(7,35,48,.55)]">
              <div className="flex items-center justify-between border-b border-ink-950/[0.07] px-6 py-4 text-xs font-semibold text-ink-500">
                <span>Единая очередь обращений</span><span>{page.blocks.length} контуров</span>
              </div>
              {page.blocks.map((block, index) => (
                <article key={block.title} className="group border-b border-ink-950/[0.07] px-6 py-7 last:border-0 sm:px-8">
                  <div className="flex gap-5">
                    <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ backgroundColor: signature.soft, color: '#195A76' }}>{index + 1}</span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3>
                      <p className="mt-3 text-sm leading-[1.75] text-ink-600">{block.text}</p>
                      <FeatureItems items={block.items} signature={signature} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'control') {
    return (
      <section className="bg-white py-20 lg:py-28" aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="mt-14 space-y-5">
            {page.blocks.map((block, index) => (
              <article key={block.title} className={`grid overflow-hidden rounded-[26px] border border-ink-950/[0.08] lg:grid-cols-2 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
                <div className="flex min-h-[210px] flex-col justify-between p-7 sm:p-9" style={{ backgroundColor: index % 2 ? '#25130F' : signature.soft, color: index % 2 ? 'white' : '#151915' }}>
                  <span className={`text-xs font-bold uppercase tracking-[0.18em] ${index % 2 ? 'text-white/45' : 'text-ink-400'}`}>Сценарий {String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-12 text-3xl font-semibold tracking-[-0.04em]">{block.title}</h3>
                </div>
                <div className="p-7 sm:p-9">
                  <p className="text-base leading-[1.8] text-ink-600">{block.text}</p>
                  <FeatureItems items={block.items} signature={signature} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (signature.layout === 'studio') {
    const [primary, ...rest] = page.blocks;
    return (
      <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="feature-blocks-title">
        <Container>
          {heading}
          <div className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            {primary && (
              <article className="relative min-h-[430px] overflow-hidden rounded-[30px] bg-[#171329] p-7 text-white sm:p-10">
                <Braces className="absolute -right-6 -top-8 h-48 w-48 text-white/[0.055]" strokeWidth={1} aria-hidden />
                <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>Основной контур</span>
                <h3 className="mt-20 max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{primary.title}</h3>
                <p className="mt-6 max-w-xl text-base leading-[1.8] text-white/65">{primary.text}</p>
                <ul className="mt-8 space-y-3">
                  {primary.items.map((item) => <li key={item} className="flex items-center gap-3 text-sm text-white/82"><Check size={15} style={{ color: signature.accent }} aria-hidden />{item}</li>)}
                </ul>
              </article>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {rest.map((block, index) => (
                <article key={block.title} className={`rounded-[24px] border border-ink-950/[0.08] p-6 sm:p-7 ${index === rest.length - 1 ? 'bg-white' : 'bg-white/65'}`}>
                  <span className="font-mono text-xs text-ink-400">{String(index + 2).padStart(2, '0')}</span>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-ink-950">{block.title}</h3>
                  <p className="mt-3 text-sm leading-[1.7] text-ink-600">{block.text}</p>
                  <FeatureItems items={block.items} signature={signature} />
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const isWorkspace = signature.layout === 'workspace';
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="feature-blocks-title">
      <Container>
        {heading}
        <div className={`mt-14 grid gap-4 md:grid-cols-2 ${isWorkspace ? 'lg:grid-cols-6' : 'lg:grid-cols-3'}`}>
          {page.blocks.map((block, index) => {
            const span = isWorkspace
              ? index === 0 || index === page.blocks.length - 1 ? 'lg:col-span-4' : 'lg:col-span-2'
              : index === 0 || index === 4 ? 'lg:col-span-2' : '';
            const dark = index === 0;
            return (
              <article key={block.title} className={`${span} min-h-[260px] rounded-[26px] border p-7 sm:p-8 ${dark ? 'border-transparent bg-[#151116] text-white' : 'border-ink-950/[0.08] text-ink-950'}`} style={!dark ? { backgroundColor: index % 2 ? signature.soft : 'white' } : undefined}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs ${dark ? 'text-white/40' : 'text-ink-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                  {isWorkspace ? <Layers3 size={18} style={{ color: signature.accent }} aria-hidden /> : <Database size={18} style={{ color: signature.accent }} aria-hidden />}
                </div>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h3>
                <p className={`mt-4 text-sm leading-[1.75] ${dark ? 'text-white/62' : 'text-ink-600'}`}>{block.text}</p>
                <FeatureItems items={block.items} signature={signature} />
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function FeatureSection({ page, type }: { page: DetailPage; type: string }) {
  const signature = FEATURE_SIGNATURES[type] ?? FEATURE_SIGNATURES['analytics-marketplaces'];

  return (
    <>
      <FeatureHero page={page} signature={signature} />
      {page.answer && (
        <DirectAnswer
          answer={page.answer}
          id={type}
          accent={signature.accent}
          background={signature.soft}
        />
      )}
      <FeatureBlocks page={page} signature={signature} />
      {page.demo && <WorkspacePreview view={page.demo.view} caption={page.demo.caption} />}
    </>
  );
}

function MarketplaceArtwork({
  signature,
  className = '',
}: {
  signature: MarketplaceSignature;
  className?: string;
}) {
  const base = `/assets/marketplaces/generated/${signature.art}`;
  return (
    <picture className={className} data-marketplace-art={signature.art}>
      <source
        type="image/avif"
        srcSet={`${base}-640.avif 640w, ${base}-960.avif 960w, ${base}-1536.avif 1536w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px"
      />
      <source
        type="image/webp"
        srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w, ${base}-1536.webp 1536w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px"
      />
      <img
        src={`${base}-960.webp`}
        srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w, ${base}-1536.webp 1536w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px"
        alt={signature.alt}
        width={1536}
        height={1024}
        decoding="async"
        fetchPriority="high"
        className="h-auto w-full select-none object-contain"
      />
    </picture>
  );
}

function MarketplaceBreadcrumbs({ page, light = true }: { page: DetailPage; light?: boolean }) {
  const color = light ? 'text-white/58' : 'text-ink-500';
  const hover = light ? 'hover:text-white' : 'hover:text-ink-950';
  return (
    <nav aria-label="Хлебные крошки" className={`text-sm ${color}`}>
      <a href="/" className={`underline-offset-4 hover:underline ${hover}`}>Главная</a>
      <span aria-hidden className="mx-2">/</span>
      <a href="/marketplaces/" className={`underline-offset-4 hover:underline ${hover}`}>Маркетплейсы</a>
      <span aria-hidden className="mx-2">/</span>
      <span aria-current="page">{page.eyebrow}</span>
    </nav>
  );
}

function MarketplaceHero({ page, type, signature }: { page: DetailPage; type: string; signature: MarketplaceSignature }) {
  if (type === 'wildberries') {
    return (
      <section className="relative isolate overflow-hidden bg-[#240b31] pb-0 pt-32 text-white lg:pt-40 xl:min-h-[800px] xl:pb-12 xl:pt-32" aria-labelledby="marketplace-title">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_60%,rgba(207,92,255,.18),transparent_33%),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,48px_48px,48px_48px]" />
        <Container>
          <MarketplaceBreadcrumbs page={page} />
          <div className="relative z-10 mt-10 max-w-3xl xl:max-w-[46%]">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>
              {page.logo && <span className="grid h-11 w-11 place-items-center rounded-xl bg-white"><img src={page.logo} alt="" aria-hidden="true" width={28} height={28} className="h-7 w-7" /></span>}
              <span>{signature.label}</span>
            </div>
            <h1 id="marketplace-title" className="mt-7 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-6xl xl:text-[4rem]">{page.h1}</h1>
            <p className="mt-7 max-w-2xl text-base leading-[1.75] text-white/68 sm:text-lg">{page.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить магазин</Button>
              <Button as="a" href="/#demo" variant="dark" size="lg" className="rounded-xl border-white/20">Интерфейс</Button>
            </div>
          </div>
        </Container>
        <figure className="pointer-events-none relative mt-12 h-[300px] sm:mt-16 sm:h-[420px] lg:h-[440px] xl:absolute xl:bottom-[-50px] xl:left-[52%] xl:right-[-4%] xl:top-[140px] xl:mt-0 xl:h-auto">
          <div aria-hidden className="absolute bottom-[12%] left-1/2 h-[58%] w-[70%] -translate-x-1/2 rounded-full bg-[#C264E7]/12 blur-[90px]" />
          <MarketplaceArtwork signature={signature} className="absolute left-[-8%] top-0 block w-[116%] max-w-none drop-shadow-[0_36px_55px_rgba(9,0,13,.38)] sm:left-[-3%] sm:w-[106%] xl:bottom-[-11%] xl:left-0 xl:top-auto xl:w-[112%]" />
          <figcaption className="absolute bottom-7 left-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/46 sm:left-12 xl:bottom-24 xl:left-[8%]">
            <span className="h-px w-9 bg-[#D98DF7]/70" aria-hidden />
            Товары → остатки → поставки → экономика
          </figcaption>
        </figure>
      </section>
    );
  }

  if (type === 'ozon') {
    return (
      <section className="relative isolate overflow-hidden bg-[#061B3F] pb-0 pt-32 text-white lg:pt-40 xl:min-h-[800px] xl:pb-12 xl:pt-32" aria-labelledby="marketplace-title">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_52%,rgba(50,117,255,.2),transparent_34%),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,42px_42px,42px_42px]" />
        <Container>
          <MarketplaceBreadcrumbs page={page} />
          <div className="relative z-10 mt-10 max-w-3xl xl:ml-auto xl:max-w-[43%]">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: signature.accent }}>
              {page.logo && <span className="grid h-11 w-11 place-items-center rounded-xl bg-white"><img src={page.logo} alt="" aria-hidden="true" width={28} height={28} className="h-7 w-7" /></span>}
              <span>{signature.label}</span>
            </div>
            <h1 id="marketplace-title" className="mt-7 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-6xl xl:text-[4rem]">{page.h1}</h1>
            <p className="mt-7 text-base leading-[1.75] text-white/68 sm:text-lg">{page.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить Ozon</Button>
              <Button as="a" href="/#demo" variant="dark" size="lg" className="rounded-xl border-white/20">Интерфейс</Button>
            </div>
          </div>
        </Container>
        <figure className="pointer-events-none relative mt-12 h-[300px] sm:mt-16 sm:h-[420px] lg:h-[440px] xl:absolute xl:bottom-[-50px] xl:left-[-4%] xl:right-[55%] xl:top-[140px] xl:mt-0 xl:h-auto">
          <div aria-hidden className="absolute bottom-[14%] left-[46%] h-[58%] w-[68%] -translate-x-1/2 rounded-full bg-[#2F66DA]/14 blur-[100px]" />
          <MarketplaceArtwork signature={signature} className="absolute left-[-8%] top-0 block w-[116%] max-w-none drop-shadow-[0_34px_52px_rgba(0,8,31,.45)] sm:left-[-3%] sm:w-[106%] xl:bottom-[-6%] xl:left-auto xl:right-0 xl:top-auto xl:w-[112%]" />
          <figcaption className="absolute left-8 top-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/48 sm:left-12 xl:left-[18%] xl:top-24">
            <Database size={14} style={{ color: signature.accent }} aria-hidden />
            FBO + FBS в одной модели
          </figcaption>
        </figure>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#FFF6D5] pb-0 pt-32 text-[#241A06] lg:pt-40 xl:min-h-[800px] xl:pb-12 xl:pt-32" aria-labelledby="marketplace-title">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_68%,rgba(255,202,43,.25),transparent_38%),linear-gradient(rgba(82,55,0,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(82,55,0,.045)_1px,transparent_1px)] [background-size:auto,54px_54px,54px_54px]" />
      <Container>
        <MarketplaceBreadcrumbs page={page} light={false} />
        <div className="relative z-10 mx-auto mt-10 max-w-5xl text-center xl:mx-0 xl:max-w-[46%] xl:text-left">
          <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#805B00]">
            {page.logo && <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#8B6500]/10 bg-white"><img src={page.logo} alt="" aria-hidden="true" width={28} height={28} className="h-7 w-7" /></span>}
            <span>{signature.label}</span>
          </div>
          <h1 id="marketplace-title" className="mt-7 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl xl:text-6xl 2xl:text-7xl">{page.h1}</h1>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-[1.75] text-[#5C4B27] sm:text-lg">{page.lead}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row xl:justify-start">
            <Button as="a" href={REGISTER_URL} size="lg" className="rounded-xl" iconRight={<ArrowRight size={17} />}>Подключить магазин</Button>
            <Button as="a" href="/#demo" variant="outline" size="lg" className="rounded-xl border-[#241A06]/12 bg-white/70 !text-[#241A06]">Интерфейс</Button>
          </div>
        </div>
      </Container>
      <figure className="pointer-events-none relative mt-12 h-[320px] sm:mt-16 sm:h-[430px] lg:h-[440px] xl:absolute xl:bottom-[-50px] xl:left-[52%] xl:right-[-4%] xl:top-[140px] xl:mt-0 xl:h-auto">
        <div aria-hidden className="absolute bottom-[12%] left-1/2 h-[55%] w-[64%] -translate-x-1/2 rounded-full bg-[#FFCB2F]/18 blur-[100px]" />
        <MarketplaceArtwork signature={signature} className="absolute left-[-8%] top-0 block w-[116%] max-w-none drop-shadow-[0_34px_52px_rgba(90,61,0,.2)] sm:left-[-3%] sm:w-[106%] xl:bottom-[-10%] xl:left-0 xl:top-auto xl:w-[112%]" />
        <figcaption className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] text-[#6D5100]/58 xl:bottom-24">
          <span className="h-px w-9 bg-[#A77B00]/45" aria-hidden />
          Магазин внутри общей картины продаж
          <span className="h-px w-9 bg-[#A77B00]/45" aria-hidden />
        </figcaption>
      </figure>
    </section>
  );
}

export function MarketplaceDetailPage({ page, type }: { page: DetailPage; type: string }) {
  const signature = MARKETPLACE_SIGNATURES[type] ?? MARKETPLACE_SIGNATURES.ozon;

  if (type === 'ozon') {
    return (
      <>
        <MarketplaceHero page={page} type={type} signature={signature} />
        {page.answer && <DirectAnswer answer={page.answer} id={type} accent={signature.accent} />}
        <section className="bg-white py-20 lg:py-28" aria-labelledby="marketplace-blocks-title">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[.58fr_1.42fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1D4ED8]">Система Ozon</p>
                <h2 id="marketplace-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2>
                <p className="mt-5 text-base leading-[1.75] text-ink-600">{page.blocksLead}</p>
              </div>
              <div className="border-t border-ink-950/14">
                {page.blocks.map((block, index) => (
                  <article key={block.title} className="grid gap-5 border-b border-ink-950/12 py-9 sm:grid-cols-[70px_1fr]">
                    <span className="font-mono text-xl text-[#2F66DA]">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.035em] text-ink-950">{block.title}</h3>
                      <p className="mt-4 text-base leading-[1.8] text-ink-600">{block.text}</p>
                      <ul className="mt-6 grid gap-2 sm:grid-cols-3">{block.items.map((item) => <li key={item} className="border-l-2 border-[#AFC9FF] pl-3 text-sm text-ink-700">{item}</li>)}</ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </>
    );
  }

  if (type === 'wildberries') {
    return (
      <>
        <MarketplaceHero page={page} type={type} signature={signature} />
        {page.answer && <DirectAnswer answer={page.answer} id={type} accent={signature.accent} background={signature.soft} />}
        <section className="py-20 lg:py-28" style={{ backgroundColor: signature.soft }} aria-labelledby="marketplace-blocks-title">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7A2FA8]">Рабочие контуры WB</p><h2 id="marketplace-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2></div>
              <p className="max-w-2xl text-base leading-[1.75] text-ink-600 lg:justify-self-end">{page.blocksLead}</p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {page.blocks.map((block, index) => {
                const span = index === 0 || index === 3 ? 'lg:col-span-4' : index === 6 ? 'lg:col-span-6' : 'lg:col-span-2';
                const dark = index === 0 || index === 6;
                return (
                  <article key={block.title} className={`${span} min-h-[270px] overflow-hidden rounded-[30px] border p-7 sm:p-9 ${dark ? 'border-transparent bg-[#2D1039] text-white' : 'border-[#3B1648]/10 bg-white text-ink-950'}`}>
                    <div className="flex items-center justify-between"><span className={`font-mono text-xs ${dark ? 'text-white/40' : 'text-ink-400'}`}>{String(index + 1).padStart(2, '0')}</span><span className="h-2.5 w-2.5 rounded-full bg-[#C264E7]" aria-hidden /></div>
                    <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em]">{block.title}</h3>
                    <p className={`mt-4 text-sm leading-[1.8] ${dark ? 'text-white/65' : 'text-ink-600'}`}>{block.text}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">{block.items.map((item) => <li key={item} className={`rounded-full px-3 py-1.5 text-xs font-medium ${dark ? 'bg-white/10 text-white/78' : 'bg-[#F7EEFA] text-[#5F2A73]'}`}>{item}</li>)}</ul>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <MarketplaceHero page={page} type={type} signature={signature} />
      {page.answer && <DirectAnswer answer={page.answer} id={type} accent="#8A6200" background="#FFFDF6" />}
      <section className="bg-[#FFFDF6] py-20 lg:py-28" aria-labelledby="marketplace-blocks-title">
        <Container>
          <div className="mx-auto max-w-4xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A6200]">Карта процессов</p><h2 id="marketplace-blocks-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">{page.blocksTitle}</h2><p className="mx-auto mt-5 max-w-3xl text-base leading-[1.75] text-ink-600">{page.blocksLead}</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.blocks.map((block, index) => {
              const featured = index === 4;
              const wide = index === 0 || index === 6;
              return (
                <article key={block.title} className={`${featured ? 'lg:col-span-2 lg:row-span-2 bg-[#28200F] text-white' : wide ? 'lg:col-span-2' : ''} rounded-[28px] border border-[#5E4600]/10 p-7 sm:p-8 ${featured ? '' : index % 2 ? 'bg-[#FFF3BD] text-ink-950' : 'bg-white text-ink-950'}`}>
                  <div className="flex items-center justify-between"><span className={`font-mono text-xs ${featured ? 'text-white/42' : 'text-[#9B7611]'}`}>{String(index + 1).padStart(2, '0')}</span>{featured ? <Layers3 size={18} className="text-[#FFD34D]" aria-hidden /> : <span className="h-2.5 w-2.5 rounded-sm bg-[#FFD34D]" aria-hidden />}</div>
                  <h3 className={`mt-9 font-semibold tracking-[-0.035em] ${featured ? 'max-w-xl text-3xl sm:text-4xl' : 'text-2xl'}`}>{block.title}</h3>
                  <p className={`mt-4 text-sm leading-[1.8] ${featured ? 'max-w-2xl text-white/66' : 'text-ink-600'}`}>{block.text}</p>
                  <ul className={`mt-6 ${featured ? 'grid gap-3 sm:grid-cols-3' : 'flex flex-wrap gap-2'}`}>{block.items.map((item) => <li key={item} className={featured ? 'border-t border-white/12 pt-3 text-sm text-white/78' : 'rounded-full border border-[#6C5100]/10 bg-white/65 px-3 py-1.5 text-xs font-medium text-[#6C5100]'}>{item}</li>)}</ul>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
