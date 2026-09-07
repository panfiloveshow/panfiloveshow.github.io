import { useEffect, useMemo, useState } from 'react';
import { AutomationCta } from '@/components/seo/AutomationCta';
import { CalcHandoff } from '@/components/seo/CalcHandoff';
import { buildCalcLink, readCalcParams, writeCalcParams } from '@/lib/calc-url';
import { calcUnitEconomics, type UnitEconomicsInput } from '@/lib/unit-economics';

const FIELDS: { key: keyof UnitEconomicsInput; label: string; hint?: string; suffix: string }[] = [
  { key: 'price', label: 'Цена продажи', suffix: '₽' },
  { key: 'cost', label: 'Себестоимость', hint: 'Закупка или производство единицы', suffix: '₽' },
  { key: 'commissionPct', label: 'Комиссия площадки', hint: 'Ставка вашей категории из кабинета продавца', suffix: '%' },
  { key: 'logistics', label: 'Логистика за доставку', suffix: '₽' },
  { key: 'buyoutPct', label: 'Процент выкупа', hint: 'Невыкупленные доставки тоже стоят логистики', suffix: '%' },
  { key: 'storage', label: 'Хранение на единицу', suffix: '₽' },
  { key: 'ads', label: 'Реклама на единицу', suffix: '₽' },
  { key: 'other', label: 'Прочие расходы', hint: 'Упаковка, приёмка, брак и другое', suffix: '₽' },
  { key: 'taxPct', label: 'Налог', hint: 'Например, 6–7% на УСН «доходы»', suffix: '%' },
];

const DEFAULTS: UnitEconomicsInput = {
  price: 2000,
  cost: 700,
  commissionPct: 20,
  logistics: 100,
  buyoutPct: 70,
  storage: 20,
  ads: 150,
  other: 30,
  taxPct: 7,
};

const money = (value: number) => `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;

export function UnitEconomicsCalculator() {
  const [values, setValues] = useState<UnitEconomicsInput>(() => readCalcParams(DEFAULTS) as UnitEconomicsInput);
  const result = useMemo(() => calcUnitEconomics(values), [values]);
  const profitable = result.profit > 0;

  useEffect(() => writeCalcParams(values, DEFAULTS), [values]);

  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="calculator-title">
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[1180px]">
        <h2 id="calculator-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
          Калькулятор юнит-экономики
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">
          Расчёт по одной единице товара. Ставку комиссии и логистику возьмите из кабинета продавца — они зависят от
          категории, схемы работы и площадки, поэтому подставлять их «за вас» было бы неверно.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <form className="grid gap-4 rounded-[26px] border border-ink-950/[0.08] bg-[#f4f8f6] p-6 sm:grid-cols-2 sm:p-8">
            {FIELDS.map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="font-semibold text-ink-900">{field.label}</span>
                <span className="mt-2 flex items-center gap-2 rounded-xl border border-ink-950/[0.1] bg-white px-3.5 focus-within:border-brand-700/50">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
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
                {field.hint && <span className="mt-1.5 block text-xs leading-relaxed text-ink-500">{field.hint}</span>}
              </label>
            ))}
          </form>

          <div
            aria-live="polite"
            className={`rounded-[26px] border p-6 sm:p-8 ${
              profitable ? 'border-brand-700/25 bg-brand-50' : 'border-red-500/25 bg-red-50'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-600">Прибыль с единицы</p>
            <p
              className={`mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl ${
                profitable ? 'text-brand-900' : 'text-red-700'
              }`}
            >
              {money(result.profit)}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              Маржинальность {result.margin}%
              {result.markup !== null && ` · наценка к себестоимости ${result.markup}%`}
            </p>

            <dl className="mt-8 space-y-3 border-t border-ink-950/[0.08] pt-6 text-sm">
              {[
                ['Комиссия площадки', money(result.commission)],
                ['Логистика с учётом выкупа', money(result.logistics)],
                ['Налог', money(result.tax)],
                ['Себестоимость', money(values.cost)],
                // Сумма хранения, рекламы и «прочих» — название отличаем от одноимённого поля ввода
                ['Хранение, реклама и прочее', money(values.storage + values.ads + values.other)],
                ['Итого расходов', money(result.expenses)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-600">{label}</dt>
                  <dd className="font-semibold text-ink-950">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-ink-500">
              Расчёт носит справочный характер: вы задаёте ставки вручную, а состав расходов площадки зависит от
              категории, схемы работы и текущих тарифов маркетплейса.
            </p>
          </div>
        </div>

        <CalcHandoff
          next={
            profitable
              ? {
                  label: 'Посчитать точку безубыточности с этой прибылью',
                  hint: `Прибыль ${result.profit} ₽ с единицы перенесётся в расчёт автоматически`,
                  href: buildCalcLink('/calculators/break-even/', {
                    profitPerUnit: result.profit,
                    price: values.price,
                  }),
                }
              : undefined
          }
        />

        <AutomationCta
          title="Здесь вы подставляете ставки руками. В Sellico они берутся из вашего кабинета — до копейки"
          text="Калькулятор считает по средним значениям, которые вы ввели. Внутри Sellico юнит-экономика собирается из фактических данных подключённого магазина: реальные удержания площадки, логистика по каждой доставке, возвраты, хранение и реклама — по каждой продаже и по каждому SKU, без ручного ввода и усреднений."
          items={[
            'Фактические удержания из отчётов площадки',
            'Логистика и возвраты по каждой доставке',
            'Прибыль по каждому SKU, а не по средней цене',
            'Пересчёт автоматически, без сборки таблиц',
          ]}
        />
      </div>
    </section>
  );
}
