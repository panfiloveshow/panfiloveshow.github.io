import { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { CALC_SPECS } from '@/lib/calculator-specs';
import { AutomationCta } from '@/components/seo/AutomationCta';
import { CalcHandoff } from '@/components/seo/CalcHandoff';
import { readCalcParams, writeCalcParams } from '@/lib/calc-url';

export function SimpleCalculator({ spec: specKey }: { spec: string }) {
  const spec = CALC_SPECS[specKey];
  const [values, setValues] = useState<Record<string, number>>(() => readCalcParams(spec?.defaults ?? {}));
  const result = useMemo(() => (spec ? spec.compute(values) : null), [spec, values]);

  useEffect(() => {
    if (spec) writeCalcParams(values, spec.defaults);
  }, [spec, values]);

  if (!spec || !result) return null;

  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="calculator-title">
      <Container>
        <h2 id="calculator-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
          {spec.title}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">{spec.lead}</p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <form className="grid gap-4 rounded-[26px] border border-ink-950/[0.08] bg-[#f4f8f6] p-6 sm:grid-cols-2 sm:p-8">
            {spec.fields.map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="font-semibold text-ink-900">{field.label}</span>
                <span className="mt-2 flex items-center gap-2 rounded-xl border border-ink-950/[0.1] bg-white px-3.5 focus-within:border-brand-700/50">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={values[field.key]}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, [field.key]: Number(event.target.value) || 0 }))
                    }
                    className="h-11 w-full bg-transparent text-base font-medium text-ink-950 outline-none"
                  />
                  <span aria-hidden className="text-sm text-ink-500">
                    {field.suffix}
                  </span>
                </span>
                {field.hint && <span className="mt-1.5 block text-xs leading-relaxed text-ink-600">{field.hint}</span>}
              </label>
            ))}
          </form>

          <div
            aria-live="polite"
            className={`rounded-[26px] border p-6 sm:p-8 ${
              result.good ? 'border-brand-700/25 bg-brand-50' : 'border-red-500/25 bg-red-50'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-600">Результат</p>
            <p
              className={`mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl ${
                result.good ? 'text-brand-900' : 'text-red-700'
              }`}
            >
              {result.headline}
            </p>
            <p className="mt-2 text-sm text-ink-600">{result.caption}</p>

            <dl className="mt-8 space-y-3 border-t border-ink-950/[0.08] pt-6 text-sm">
              {result.rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-600">{label}</dt>
                  <dd className="font-semibold text-ink-950">{value}</dd>
                </div>
              ))}
            </dl>

            {result.note && <p className="mt-6 text-xs leading-relaxed text-ink-600">{result.note}</p>}
          </div>
        </div>

        <CalcHandoff next={spec.next} />

        <AutomationCta {...spec.automation} />
      </Container>
    </section>
  );
}
