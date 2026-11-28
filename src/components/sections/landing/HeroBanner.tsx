import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { parseHeroBanners, type HeroPromoBanner } from '@/lib/hero-banners';
import { cn } from '@/lib/cn';

const DURATION = 6000;
// CMS banners replace this complete starter set; old strip banners never enter it.
const builtInBanners: HeroPromoBanner[] = [
  {
    id: -1,
    format: 'hero',
    image: '/assets/hero/2026-10-19/01-profit.webp',
    image_mobile: null,
    link: '/unit-economics/',
    alt: 'Прибыль по SKU. Все расходы рядом: комиссии, реклама и себестоимость.',
  },
  {
    id: -2,
    format: 'hero',
    image: '/assets/hero/2026-10-19/02-stock.webp',
    image_mobile: null,
    link: '/supply-planning/',
    alt: 'Остатки и поставки под контролем: остатки, темп продаж и пополнение.',
  },
  {
    id: -3,
    format: 'hero',
    image: '/assets/hero/2026-10-19/03-team.webp',
    image_mobile: null,
    link: '/#demo',
    alt: 'Задачи команды в одном месте: ответственные, сроки и статусы.',
  },
];

// Last-resort asset retained if every file from the starter set is unavailable.
const fallback: HeroPromoBanner = {
  id: 0,
  format: 'hero',
  image: '/assets/hero/sellico-overview.webp',
  image_mobile: null,
  link: null,
  alt: 'Все магазины. Одна система. Демо Sellico: остатки — 1 482 шт., задачи команды — 8 в работе.',
};

export function HeroBanner() {
  const [remote, setRemote] = useState<HeroPromoBanner[]>([]);
  const [failed, setFailed] = useState<number[]>([]);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const reducedMotion = useReducedMotion();
  const remaining = useRef(DURATION);
  const usable = remote.filter(item => !failed.includes(item.id));
  const defaults = builtInBanners.filter(item => !failed.includes(item.id));
  const slides = usable.length ? usable : defaults.length ? defaults : [fallback];
  const count = slides.length;
  const index = slide % count;
  const banner = slides[index];
  const stopped = paused || hovered || focused || hidden || Boolean(reducedMotion);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    fetch('/api/public/promo-banners?format=hero', { signal: controller.signal, cache: 'no-cache' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Banner request failed')))
      .then(payload => setRemote(parseHeroBanners(payload)))
      .catch(() => { /* The local banners stay visible if the API is unavailable. */ })
      .finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => { remaining.current = DURATION; }, [slide, count]);
  useEffect(() => {
    if (count < 2 || stopped) return;
    const start = performance.now();
    const timer = window.setTimeout(() => { remaining.current = DURATION; setSlide(value => value + 1); }, remaining.current);
    return () => { window.clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - start)); };
  }, [count, slide, stopped]);

  const select = (next: number) => {
    const nextIndex = (next + count) % count;
    if (nextIndex === index) return;
    remaining.current = DURATION;
    setSlide(nextIndex);
  };
  const localSrcSet = banner.image.startsWith('/assets/hero/2026-10-19/') && banner.image.endsWith('.webp')
    ? `${banner.image.replace(/\.webp$/, '-640.webp')} 640w, ${banner.image.replace(/\.webp$/, '-960.webp')} 960w, ${banner.image} 1254w`
    : undefined;
  const picture = <picture key={banner.id}>
    {banner.image_mobile && <source media="(max-width: 639px)" srcSet={banner.image_mobile} />}
    <img src={banner.image} srcSet={localSrcSet} sizes={localSrcSet ? '(max-width: 1023px) calc(100vw - 48px), 46vw' : undefined} alt={banner.alt} width={1254} height={1254} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full max-w-full object-contain" onError={() => { if (banner.id !== fallback.id) setFailed(values => [...values, banner.id]); }} />
  </picture>;

  return (
    <div className="relative isolate aspect-square overflow-hidden rounded-[20px] bg-[#d9f6e9] sm:rounded-[22px]" role="region" aria-roledescription="карусель" aria-label="Промо-баннеры Sellico" tabIndex={count > 1 ? 0 : undefined}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      onKeyDown={event => { if (count < 2) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); select(index + (event.key === 'ArrowRight' ? 1 : -1)); } }}>
      {banner.link ? <a href={banner.link} className="absolute inset-0 block" aria-label={banner.alt}>{picture}</a> : picture}
      <div className="pointer-events-none absolute inset-x-[5.4%] top-[3.6%] z-10 flex gap-3" aria-label={count > 1 ? 'Выбор баннера' : undefined} aria-hidden={count === 1 ? true : undefined}>
        {slides.map((item, i) => count > 1 ? <button type="button" key={item.id} className="pointer-events-auto flex h-6 flex-1 items-center" aria-label={`Показать баннер ${i + 1} из ${count}`} aria-current={i === index ? 'true' : undefined} onClick={() => select(i)}>
          <span className="h-1.5 w-full overflow-hidden rounded-full bg-white/40"><span key={`${slide}-${count}`} className={cn('block h-full origin-left rounded-full bg-white', i === index && !reducedMotion && 'hero-story-progress')} style={{ transform: i < index || (i === index && reducedMotion) ? 'scaleX(1)' : 'scaleX(0)', animationPlayState: stopped ? 'paused' : 'running' }} /></span>
        </button> : <span key={item.id} className="mt-2.5 h-1.5 w-full rounded-full bg-white/85" />)}
      </div>
      {count > 1 && <div className="absolute inset-x-4 bottom-[16%] z-10 flex justify-between">
        <div className="flex gap-1.5">{[-1, 1].map(step => <button type="button" key={step} className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#176854] shadow-sm hover:bg-white" aria-label={step < 0 ? 'Предыдущий баннер' : 'Следующий баннер'} onClick={() => select(index + step)}>{step < 0 ? <ChevronLeft size={19} /> : <ChevronRight size={19} />}</button>)}</div>
        {!reducedMotion && <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#176854] shadow-sm hover:bg-white" aria-label={paused ? 'Включить смену баннеров' : 'Приостановить смену баннеров'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
      </div>}
      <span className="sr-only">Баннер {index + 1} из {count}</span>
    </div>
  );
}
