import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL, SECTION_IDS } from '@/lib/anchors';
import { AI_PARTICLE_LAYERS, reveal } from './data';

export function AiSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const backLayerY = useTransform(scrollYProgress, [0, 1], [16, -16]);
  const backLayerX = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const midLayerY = useTransform(scrollYProgress, [0, 1], [110, -110]);
  const midLayerX = useTransform(scrollYProgress, [0, 1], [-28, 28]);
  const frontLayerY = useTransform(scrollYProgress, [0, 1], [190, -190]);
  const frontLayerX = useTransform(scrollYProgress, [0, 1], [48, -48]);

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.wow}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eef8f3_18%,#eef8f3_100%)] lg:h-[clamp(560px,46vw,760px)] lg:bg-[#eef8f3] lg:bg-none"
    >
      <div
        aria-hidden
        className="ai-particle-viewport relative h-[190px] w-full overflow-hidden sm:h-[280px] md:h-[320px] lg:absolute lg:inset-0 lg:h-full"
      >
        <motion.div
          data-ai-parallax="back"
          className="absolute -left-20 -top-[220px] h-[calc(100%+440px)] w-[calc(100%+160px)] will-change-transform"
          style={reduced ? undefined : { x: backLayerX, y: backLayerY }}
        >
          <img
            src={AI_PARTICLE_LAYERS.back}
            alt=""
            width={2400}
            height={720}
            className="h-full w-full object-cover object-left"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <motion.div
          data-ai-parallax="mid"
          className="absolute -left-20 -top-[220px] h-[calc(100%+440px)] w-[calc(100%+160px)] will-change-transform"
          style={reduced ? undefined : { x: midLayerX, y: midLayerY }}
        >
          <img
            src={AI_PARTICLE_LAYERS.mid}
            alt=""
            width={2400}
            height={720}
            className="h-full w-full object-cover object-left"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <motion.div
          data-ai-parallax="front"
          className="absolute -left-20 -top-[220px] h-[calc(100%+440px)] w-[calc(100%+160px)] will-change-transform"
          style={reduced ? undefined : { x: frontLayerX, y: frontLayerY }}
        >
          <img
            src={AI_PARTICLE_LAYERS.front}
            alt=""
            width={2400}
            height={720}
            className="h-full w-full object-cover object-left"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>

      <Container className="relative z-10 -mt-10 flex items-start justify-center pb-20 sm:-mt-12 lg:mt-0 lg:h-full lg:max-w-none lg:items-center lg:justify-end lg:px-16 lg:pb-0">
        <motion.div
          {...reveal}
          className="w-full max-w-xl rounded-[26px] border border-ink-950/[0.06] bg-white p-6 shadow-[0_30px_80px_-48px_rgba(15,73,52,.32)] sm:p-8 lg:rounded-[28px] lg:p-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">AI для роста</p>
          <h2 className="mt-5 text-[clamp(1.95rem,9.6vw,2.35rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink-950 md:text-5xl lg:text-6xl">
            Искусственный интеллект в каждом решении
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-600">
            Sellico анализирует данные, находит точки роста и предлагает конкретные действия — от новой поставки до корректировки рекламы.
          </p>
          <Button as="a" href={REGISTER_URL} className="mt-8 w-full justify-center rounded-xl sm:w-auto" iconRight={<ArrowRight size={16} />}>
            Попробовать бесплатно
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
