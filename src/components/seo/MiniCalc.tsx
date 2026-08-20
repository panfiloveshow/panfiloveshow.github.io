import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { MINI_CALCS } from '@/lib/mini-calcs';

/** Короткий расчёт прямо в статье термина: одно число и переход к полному калькулятору. */
export function MiniCalc({ slug }: { slug: string }) {
  const spec = MINI_CALCS[slug];
  const [values, setValues] = useState<Record<string, number>>(spec?.defaults ?? {});
  const result = useMemo(() => (spec ? spec.compute(values) : null), [spec, values]);

  if (!spec || !result) return null;

  return (
    <section className="bg-white pb-14" aria-labelledby="mini-calc-title">
      <Container>
        <div className="rounded-[26px] border border-brand-700/20 bg-[#f4f8f6] p-6 sm:p-8">
          <h2 id="mini-calc-title" className="text-lg font-semibold tracking-[-0.02em] text-ink-950">
            {spec.title}
          </h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <form className="grid gap-3 sm:grid-cols-3">
              {spec.fields.map((field) => (
                <label key={field.key} className="block text-sm">
                  <span className="text-xs font-semibold text-ink-600">{field.label}</span>
                  <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-ink-950/[0.1] bg-white px-3 focus-within:border-brand-700/50">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={values[field.key]}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, [field.key]: Number(event.target.value) || 0 }))
                      }
                      className="h-10 w-full bg-transparent text-[15px] font-medium text-ink-950 outline-none"
                    />
                    <span aria-hidden className="text-xs text-ink-500">
                      {field.suffix}
                    </span>
                  </span>
                </label>
              ))}
            </form>

            <div aria-live="polite" className="rounded-2xl bg-white px-5 py-4">
              <p className="text-3xl font-semibold tracking-[-0.04em] text-brand-900">{result.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{result.caption}</p>
            </div>
          </div>

          <a
            href={spec.link.href(values)}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            {spec.link.label}
            <ArrowRight size={14} aria-hidden />
          </a>
        </div>
      </Container>
    </section>
  );
}
