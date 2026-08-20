import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL } from '@/lib/anchors';
import { ASSETS, reveal } from './data';
import { PictureSources } from './shared';

export function MarketplaceBanners() {
  const reduced = useReducedMotion();
  const bannersRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: bannersRef, offset: ['start end', 'end start'] });
  const firstY = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const secondY = useTransform(scrollYProgress, [0, 1], [-24, 30]);

  return (
    <section ref={bannersRef} className="content-auto bg-white pb-24 lg:pb-32">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Готовые сценарии</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-0.05em] text-ink-950 sm:text-6xl">
              Растите на каждом маркетплейсе
            </h2>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-ink-500">
            Общая экономика и процессы — с учетом правил каждой площадки.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2">
          <motion.article
            {...reveal}
            className="relative isolate min-h-[520px] overflow-hidden rounded-[32px] bg-[#7c20df] p-6 text-white sm:min-h-[355px] sm:p-10"
          >
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_12%,rgba(255,255,255,.24),transparent_32%),linear-gradient(135deg,#8f2cf1_0%,#6310c7_100%)]" />
            <div className="relative z-10 max-w-[350px]">
              <p className="text-3xl font-black tracking-[-0.04em]">wildberries</p>
              <h3 className="mt-8 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] sm:mt-10 sm:text-4xl">
                Управляйте продажами увереннее
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/72">
                Остатки, маржа, карточки и реклама Wildberries — в одном контуре.
              </p>
              <Button as="a" href={REGISTER_URL} variant="secondary" className="mt-7 rounded-xl text-ink-950" iconRight={<ArrowRight size={15} />}>
                Подключить WB
              </Button>
            </div>
            <picture className="pointer-events-none relative -mb-16 -mr-10 ml-auto mt-6 block h-[250px] w-auto sm:hidden">
              <PictureSources asset={ASSETS.wb} />
              <img
                src={ASSETS.wb.fallback}
                alt=""
                width={ASSETS.wb.width}
                height={ASSETS.wb.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <motion.picture
              className="pointer-events-none absolute -bottom-24 -right-12 hidden h-[430px] w-auto object-contain sm:block"
              style={reduced ? undefined : { y: firstY }}
            >
              <PictureSources asset={ASSETS.wb} />
              <img
                src={ASSETS.wb.fallback}
                alt=""
                width={ASSETS.wb.width}
                height={ASSETS.wb.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </motion.picture>
          </motion.article>

          <motion.article
            {...reveal}
            className="relative isolate min-h-[520px] overflow-hidden rounded-[32px] bg-[#075eff] p-6 text-white sm:min-h-[355px] sm:p-10"
          >
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_20%,rgba(255,255,255,.25),transparent_30%),linear-gradient(135deg,#1674ff_0%,#0049dd_100%)]" />
            <div className="relative z-10 max-w-[330px]">
              <p className="text-3xl font-black tracking-[-0.04em]">OZON</p>
              <h3 className="mt-8 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] sm:mt-10 sm:text-4xl">
                Продавайте больше без лишних расходов
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/72">
                Цены, остатки, поставки и эффективность рекламы Ozon в одном окне.
              </p>
              <Button as="a" href={REGISTER_URL} variant="secondary" className="mt-7 rounded-xl text-ink-950" iconRight={<ArrowRight size={15} />}>
                Подключить Ozon
              </Button>
            </div>
            <picture className="pointer-events-none relative -mb-16 -mr-10 ml-auto mt-6 block h-[250px] w-auto sm:hidden">
              <PictureSources asset={ASSETS.ozon} />
              <img
                src={ASSETS.ozon.fallback}
                alt=""
                width={ASSETS.ozon.width}
                height={ASSETS.ozon.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <motion.picture
              className="pointer-events-none absolute -bottom-24 -right-10 hidden h-[430px] w-auto object-contain sm:block"
              style={reduced ? undefined : { y: secondY }}
            >
              <PictureSources asset={ASSETS.ozon} />
              <img
                src={ASSETS.ozon.fallback}
                alt=""
                width={ASSETS.ozon.width}
                height={ASSETS.ozon.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </motion.picture>
          </motion.article>
        </div>
      </Container>
    </section>
  );
}
