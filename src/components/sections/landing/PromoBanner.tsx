import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { reveal } from './data';

type RemotePromoBanner = {
  id: number;
  image: string;
  image_mobile?: string | null;
  link?: string | null;
  alt?: string | null;
};

// Тяжёлые PNG из текущей CMS-выдачи заменяем локальными оптимизированными AVIF (JPEG — для браузеров
// без AVIF). Ключом служит точный путь файла: новый баннер автоматически останется на исходном URL,
// пока для него не появится проверенная оптимизированная версия.
// Баннер — LCP главной и на мобиле, и на десктопе, поэтому вес первого слайда критичен.
const OPTIMIZED_PROMO_ASSETS: Record<string, { src: string; avif: string }> = {
  '/storage/promo-banners/cfmvVfdaI3kssMudeK7z4u5gbfuD1QkMtBFLsW4P.png': {
    src: '/assets/promo-banners/sellico-promo-7-desktop.jpg',
    avif: '/assets/promo-banners/sellico-promo-7-desktop.avif',
  },
  '/storage/promo-banners/HxqlM6u0RqDOzn6XVvSvt4WcggKXHn677CxNqOcv.png': {
    src: '/assets/promo-banners/sellico-promo-7-mobile.jpg',
    avif: '/assets/promo-banners/sellico-promo-7-mobile-750.avif 750w, /assets/promo-banners/sellico-promo-7-mobile-1125.avif 1125w',
  },
};

const SECTION_CLASS = 'pt-24 lg:pt-[92px]';
const CONTAINER_CLASS = 'lg:max-w-[1800px] lg:px-16';
const FRAME_CLASS =
  'relative isolate aspect-[3/1] overflow-hidden rounded-[30px] border border-[#dcebe3] bg-[#edf7f1] sm:aspect-[15/2]';

// Пока идёт запрос к API, держим место под баннер: иначе он появляется над hero и сдвигает
// весь первый экран (CLS 0.2–0.3 на главной).
function PromoBannerSlot() {
  return (
    <section aria-hidden className={SECTION_CLASS}>
      <Container className={CONTAINER_CLASS}>
        <div className={FRAME_CLASS} />
        {/* ponytail: место под точки карусели резервируем всегда (сейчас баннеров два); при одном баннере экран сдвинется на 40px */}
        <div className="mt-2 h-8" />
      </Container>
    </section>
  );
}

const PROMO_ALT_BY_IMAGE: Record<string, string> = {
  '/storage/promo-banners/5VobKJxhylox3v5N1flYYpQ7fUjiLsZ0hffXzDws.jpg':
    'Школьный сезон: пополняйте товары по темпу продаж, отслеживая остатки и скорость продаж.',
  '/storage/promo-banners/cfmvVfdaI3kssMudeK7z4u5gbfuD1QkMtBFLsW4P.png':
    'При оплате трёх месяцев тарифа Pro — один месяц бесплатно.',
};

export function PromoBanner() {
  const [slide, setSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  // null — ещё не знаем (идёт запрос), [] — точно нет баннеров, иначе — список
  const [banners, setBanners] = useState<RemotePromoBanner[] | null>(null);

  useEffect(() => {
    fetch('/api/public/promo-banners')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        const list: RemotePromoBanner[] = Array.isArray(data) ? data : data?.data;
        const valid = Array.isArray(list) && list.every((b) => typeof b?.image === 'string') ? list : [];
        setBanners(valid);
      })
      .catch(() => setBanners([]));
  }, []);

  // Автопрокрутка; зависимость от slide перезапускает таймер после ручного переключения
  useEffect(() => {
    if (hovered || focused || autoPaused || reducedMotion || (banners?.length ?? 0) < 2) return;
    const id = window.setInterval(() => setSlide((value) => value + 1), 6000);
    return () => window.clearInterval(id);
  }, [autoPaused, banners, focused, hovered, reducedMotion, slide]);

  if (banners === null) return <PromoBannerSlot />;
  // Баннеров нет — блок не рендерим вовсе (не показываем текстовую заглушку)
  if (banners.length === 0) return null;

  const count = banners.length;
  const index = slide % count;
  const banner = banners[index];
  const bannerAlt = banner.alt ?? PROMO_ALT_BY_IMAGE[banner.image] ?? '';
  const desktopAsset = OPTIMIZED_PROMO_ASSETS[banner.image];
  const mobileAsset = banner.image_mobile ? OPTIMIZED_PROMO_ASSETS[banner.image_mobile] : undefined;

  const changeSlide = (direction: number) => {
    setSlide((value) => (value + direction + count) % count);
  };

  return (
    <section aria-label="Предложения Sellico" className={SECTION_CLASS}>
      {/* ponytail: без потолка ширины баннер на широких мониторах растягивается сильнее, чем даёт resolution картинки 2400×320 — размывается на Retina. Кап держит апскейл в пределах ~1.3x вместо ~2x */}
      <Container className={CONTAINER_CLASS}>
        <div
          // Пауза только для настоящего курсора: на тач-устройствах тап эмулирует mouseenter без mouseleave — hovered залипал бы навсегда и автопрокрутка умирала
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          <motion.div {...reveal} className={FRAME_CLASS}>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_77%_18%,rgba(255,255,255,.9),transparent_28%),linear-gradient(100deg,#e5f4ec_0%,#f8fbf9_58%,#e7f5ed_100%)]"
          />

          <motion.div
            key={banner.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {(() => {
              const img = (
                <picture>
                  {mobileAsset && (
                    // 40px — боковые отступы Container (px-5) на мобиле
                    <source media="(max-width: 639px)" type="image/avif" srcSet={mobileAsset.avif} sizes="calc(100vw - 40px)" />
                  )}
                  {banner.image_mobile && (
                    <source media="(max-width: 639px)" srcSet={mobileAsset?.src ?? banner.image_mobile} />
                  )}
                  {desktopAsset && <source type="image/avif" srcSet={desktopAsset.avif} />}
                  <img
                    src={desktopAsset?.src ?? banner.image}
                    alt={bannerAlt}
                    className="h-full w-full object-cover"
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
              );
              return banner.link ? (
                <a href={banner.link} className="block h-full w-full" aria-label={bannerAlt || 'Открыть предложение'}>
                  {img}
                </a>
              ) : (
                img
              );
            })()}
          </motion.div>

          {count > 1 && (
          <button
            type="button"
            onClick={() => changeSlide(-1)}
            className="absolute left-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink-950/8 bg-white/80 text-ink-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Предыдущее предложение"
          >
            <ChevronLeft size={18} />
          </button>
          )}

          {count > 1 && (
          <button
            type="button"
            onClick={() => changeSlide(1)}
            className="absolute right-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink-950/8 bg-white/80 text-ink-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Следующее предложение"
          >
            <ChevronRight size={18} />
          </button>
          )}

          {count > 1 && (
            <button
              type="button"
              onClick={() => setAutoPaused((value) => !value)}
              className="absolute bottom-4 right-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-ink-950/10 bg-white/85 text-ink-800 shadow-sm backdrop-blur transition hover:bg-white"
              aria-label={autoPaused ? 'Продолжить автоматическую смену предложений' : 'Остановить автоматическую смену предложений'}
              aria-pressed={autoPaused}
            >
              {autoPaused ? <Play size={17} aria-hidden /> : <Pause size={17} aria-hidden />}
            </button>
          )}
          </motion.div>

          {count > 1 && (
            <div
              className="mt-2 flex items-center justify-center gap-0.5"
              aria-label="Номер предложения"
            >
              {Array.from({ length: count }, (_, dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={() => setSlide(dot)}
                  className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`Показать предложение ${dot + 1}`}
                  aria-current={dot === index ? 'true' : undefined}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      dot === index ? 'w-6 bg-brand-800' : 'w-1.5 bg-brand-800/30',
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
