import { lazy, Suspense, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { SECTION_IDS } from '@/lib/anchors';
import { reveal } from './data';

const OperationalWorkspaceDemo = lazy(() =>
  import('@/components/primitives/OperationalWorkspaceDemo').then((module) => ({
    default: module.OperationalWorkspaceDemo,
  })),
);

export function DemoSection() {
  const demoLoadRef = useRef<HTMLDivElement>(null);
  const shouldLoadDemo = useInView(demoLoadRef, { once: true, margin: '800px 0px' });

  return (
    <section id={SECTION_IDS.demo} className="content-auto bg-white py-24 lg:py-32">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Командная работа</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-ink-950 sm:text-6xl lg:text-7xl">
            Интерфейс команды — как в Sellico
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-600">
            Интерактивная копия рабочего пространства: задачи, организатор, заявки, отзывы, финансы, SEO, координация
            и чат собраны на одной странице. Изменены только демонстрационные данные.
          </p>
        </motion.div>

        <motion.div ref={demoLoadRef} {...reveal} className="mt-10 min-w-0 sm:mt-14">
          {shouldLoadDemo ? (
            <Suspense
              fallback={
                <div
                  role="status"
                  className="grid min-h-[760px] place-items-center rounded-[28px] border border-ink-950/[0.08] bg-[#f8faf9] text-sm font-medium text-ink-600"
                >
                  Загружаем интерактивный интерфейс…
                </div>
              }
            >
              <OperationalWorkspaceDemo />
            </Suspense>
          ) : (
            <div
              aria-hidden="true"
              className="min-h-[760px] rounded-[28px] border border-ink-950/[0.08] bg-[linear-gradient(135deg,#f8faf9,#eef7f2)]"
            />
          )}
        </motion.div>
      </Container>
    </section>
  );
}
