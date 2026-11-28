import { lazy, Suspense } from 'react';
import { Container } from '@/components/ui/Container';

// Экраны рабочего пространства грузятся отдельным чанком и отдаются наружу через
// один фасад — SEO-страницы не зависят от внутренней структуры workspace-demo.
const PREVIEW_VIEWS: Record<string, ReturnType<typeof lazy>> = {
  FinanceView: lazy(() =>
    import('./workspace-demo/FinanceView').then((m) => ({ default: m.FinanceView })),
  ),
  SeoView: lazy(() =>
    import('./workspace-demo/SeoView').then((m) => ({ default: m.SeoView })),
  ),
  ReviewsView: lazy(() =>
    import('./workspace-demo/ReviewsView').then((m) => ({ default: m.ReviewsView })),
  ),
  CoordinationView: lazy(() =>
    import('./workspace-demo/CoordinationView').then((m) => ({ default: m.CoordinationView })),
  ),
};

export function WorkspacePreview({ view, caption }: { view: string; caption: string }) {
  const View = PREVIEW_VIEWS[view];
  if (!View) return null;

  return (
    <section className="bg-[#0b1512] py-16 lg:py-20" aria-labelledby="product-screen-title">
      <Container>
        <h2 id="product-screen-title" className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
          Как это выглядит в Sellico
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{caption}</p>
        <figure className="mt-8">
          <div className="overflow-hidden rounded-[22px] border border-white/12 bg-[#f6f8f7] shadow-[0_40px_90px_-60px_rgba(0,0,0,.9)]">
            <div className="flex items-center gap-1.5 border-b border-ink-950/[0.07] bg-white px-4 py-3">
              {['#e5564e', '#e8b33c', '#43b95f'].map((color) => (
                <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              ))}
              <span className="ml-3 text-xs font-medium text-ink-500">Рабочее пространство Sellico</span>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              <Suspense
                fallback={<div className="h-[420px] animate-pulse bg-[#edf4f0]" aria-label="Загрузка экрана" />}
              >
                <View />
              </Suspense>
            </div>
          </div>
          <figcaption className="mt-4 text-xs text-white/45">
            Интерфейс продукта с демонстрационными данными — цифры на экране модельные.
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
