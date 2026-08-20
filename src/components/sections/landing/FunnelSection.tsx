import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { SECTION_IDS } from '@/lib/anchors';
import { cn } from '@/lib/cn';
import { ASSETS, reveal } from './data';
import { PictureSources } from './shared';

const funnelSteps = [
  ['Аналитика', 'Понимаем прибыль и точки роста'],
  ['Остатки', 'Планируем закупки и поставки'],
  ['Реклама', 'Управляем ставками через экономику'],
  ['CRM', 'Превращаем сигналы в действия'],
  ['Прибыль', 'Масштабируем то, что работает'],
];

export function FunnelSection() {
  const reduced = useReducedMotion();
  const funnelRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: funnelRef, offset: ['start end', 'end start'] });
  const imageScale = useTransform(scrollYProgress, [0.15, 0.8], [0.96, 1.03]);
  const imageY = useTransform(scrollYProgress, [0, 1], [35, -35]);

  return (
    <section
      ref={funnelRef}
      id={SECTION_IDS.how}
      className="relative -mt-7 overflow-hidden rounded-t-[44px] bg-[#03110c] py-20 text-white lg:rounded-t-[68px] lg:py-28"
    >
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="relative z-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">Единая система роста</p>
          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            От данных до прибыли — один непрерывный процесс
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg">
            Каждый сигнал превращается в понятное действие, а каждое действие связано с экономикой бизнеса.
          </p>
        </motion.div>

        <motion.div
          {...reveal}
          className="relative mx-auto mt-8 max-w-[1600px] rounded-[28px] border border-white/[0.08] bg-[#071a13] lg:overflow-hidden lg:rounded-[32px]"
        >
          <picture className="relative block aspect-[2/1] overflow-hidden rounded-[27px] md:aspect-[3/1] lg:hidden">
            <PictureSources asset={ASSETS.funnel} />
            <img
              src={ASSETS.funnel.fallback}
              alt="Этапы работы Sellico: аналитика, остатки, реклама, CRM и прибыль"
              width={ASSETS.funnel.width}
              height={ASSETS.funnel.height}
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <motion.picture
            className="relative hidden lg:block"
            style={reduced ? undefined : { scale: imageScale, y: imageY }}
          >
            <PictureSources asset={ASSETS.funnel} />
            <img
              src={ASSETS.funnel.fallback}
              alt="Этапы работы Sellico: аналитика, остатки, реклама, CRM и прибыль"
              width={ASSETS.funnel.width}
              height={ASSETS.funnel.height}
              className="h-auto w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </motion.picture>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 aspect-[2/1] bg-gradient-to-b from-transparent via-transparent to-[#03110c]/95 lg:inset-0 lg:aspect-auto" />
          <div className="relative -mt-4 grid grid-cols-2 gap-2 p-3 pt-0 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:grid-cols-5 lg:p-8">
            {funnelSteps.map(([title, text], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className={cn(
                  'rounded-2xl border border-white/10 bg-[#061710]/95 p-4 backdrop-blur-md lg:bg-black/30',
                  index === funnelSteps.length - 1 && 'col-span-2 lg:col-span-1',
                )}
              >
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/78">{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
