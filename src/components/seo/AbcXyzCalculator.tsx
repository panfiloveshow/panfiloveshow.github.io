import { useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { AutomationCta } from '@/components/seo/AutomationCta';
import { abcXyzMatrix, analyzeAbcXyz, parseSales } from '@/lib/abc-xyz';

// Полгода продаж восьми товаров в рублях, столбцы через табуляцию — как при копировании из таблицы.
const EXAMPLE = [
  ['Органайзер модульный', 186000, 190000, 182000, 188000, 184000, 190000],
  ['Набор контейнеров', 150000, 120000, 160000, 110000, 170000, 140000],
  ['Полка настольная', 60000, 140000, 30000, 180000, 50000, 120000],
  ['Чехлы дорожные', 70000, 72000, 69000, 71000, 70000, 68000],
  ['Корзина для хранения', 40000, 55000, 35000, 60000, 30000, 50000],
  ['Подставка для аксессуаров', 20000, 21000, 19000, 20000, 20500, 19500],
  ['Коробка подарочная', 0, 45000, 5000, 0, 60000, 10000],
  ['Держатель для кабелей', 8000, 9000, 7000, 8500, 7500, 8000],
]
  .map((row) => row.join('\t'))
  .join('\n');

const num = (value: number, digits = 0) => value.toLocaleString('ru-RU', { maximumFractionDigits: digits });

const buttonClass =
  'rounded-lg border border-ink-950/15 bg-white px-3 py-1.5 font-semibold text-ink-800 transition hover:border-ink-950/30';

export function AbcXyzCalculator() {
  const [text, setText] = useState(EXAMPLE);
  const { rows, skipped } = useMemo(() => parseSales(text), [text]);
  const analysis = useMemo(() => analyzeAbcXyz(rows), [rows]);
  const matrix = useMemo(() => abcXyzMatrix(analysis.items), [analysis]);
  const hasData = analysis.total > 0;

  return (
    <section className="bg-white py-16 lg:py-20" aria-labelledby="calculator-title">
      <Container>
        <h2 id="calculator-title" className="text-3xl font-semibold tracking-[-0.05em] text-ink-950 sm:text-5xl">
          ABC- и XYZ-анализ ассортимента
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-600">
          Вставьте продажи по товарам — калькулятор разделит ассортимент по вкладу в продажи и по стабильности спроса.
          Расчёт идёт в браузере: данные никуда не отправляются и не сохраняются.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-[26px] border border-ink-950/[0.08] bg-[#f4f8f6] p-6 sm:p-8">
            <label htmlFor="abc-xyz-input" className="text-sm font-semibold text-ink-900">
              Продажи по товарам
            </label>
            <p id="abc-xyz-hint" className="mt-1.5 text-xs leading-relaxed text-ink-600">
              Скопируйте диапазон из таблицы: в первом столбце — товар, дальше — продажи по месяцам в рублях или
              штуках. Пустая ячейка — месяц без остатка: в XYZ она не учитывается.
            </p>
            <textarea
              id="abc-xyz-input"
              aria-describedby="abc-xyz-hint"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={10}
              spellCheck={false}
              className="mt-4 w-full resize-y rounded-xl border border-ink-950/[0.1] bg-white p-3.5 font-mono text-xs leading-relaxed text-ink-950 outline-none focus:border-brand-700/50"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-600">
              <button type="button" onClick={() => setText(EXAMPLE)} className={buttonClass}>
                Вернуть пример
              </button>
              <button type="button" onClick={() => setText('')} className={buttonClass}>
                Очистить
              </button>
              <span>
                Товаров: {rows.length}
                {skipped > 0 && ` · пропущено строк без чисел: ${skipped}`}
              </span>
            </div>
          </div>

          <div aria-live="polite" className="rounded-[26px] border border-brand-700/25 bg-brand-50 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-600">Матрица ABC-XYZ</p>
            {hasData ? (
              <table className="mt-5 w-full table-fixed text-center">
                <caption className="sr-only">Число товаров и их доля в сумме продаж по группам ABC и XYZ</caption>
                <thead>
                  <tr className="text-sm text-ink-600">
                    <td className="w-10" />
                    {['X', 'Y', 'Z'].map((xyz) => (
                      <th key={xyz} scope="col" className="pb-2 font-semibold">
                        {xyz}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['A', 'B', 'C'].map((abc) => (
                    <tr key={abc}>
                      <th scope="row" className="text-left text-sm font-semibold text-ink-600">
                        {abc}
                      </th>
                      {['X', 'Y', 'Z'].map((xyz) => {
                        const cell = matrix[abc + xyz];
                        return (
                          <td key={xyz} className="border border-brand-700/15 bg-white/70 px-1 py-3">
                            {cell.count ? (
                              <>
                                <span className="block text-2xl font-semibold tracking-[-0.03em] text-brand-900">{cell.count}</span>
                                <span className="text-xs text-ink-600">{num(cell.share, 1)}%</span>
                              </>
                            ) : (
                              <span className="text-sm text-ink-600">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-5 text-sm text-ink-600">Вставьте хотя бы одну строку с продажами.</p>
            )}
            <p className="mt-6 text-xs leading-relaxed text-ink-600">
              В клетке — число товаров и их доля в сумме продаж. A — первые 80% накопленной суммы, B — до 95%, C —
              остальное; X — вариация до 10%, Y — до 25%, Z — выше.
              {analysis.periods > 0 && analysis.periods < 6 && ' Периодов меньше шести — XYZ-группы ориентировочные.'}
            </p>
          </div>
        </div>

        {hasData && (
          <div className="mt-4 overflow-x-auto rounded-[22px] border border-ink-950/[0.08]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Группы ABC и XYZ по каждому товару</caption>
              <thead className="bg-[#f4f8f6] text-xs uppercase tracking-[0.08em] text-ink-600">
                <tr>
                  {['Товар', 'Сумма', 'Доля', 'Накопленная доля', 'ABC', 'Вариация', 'XYZ'].map((label) => (
                    <th key={label} scope="col" className="px-4 py-3 font-semibold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-ink-700">
                {analysis.items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-t border-ink-950/[0.06]">
                    <th scope="row" className="px-4 py-3 font-medium text-ink-950">
                      {item.name}
                    </th>
                    <td className="px-4 py-3 tabular-nums">{num(item.total)}</td>
                    <td className="px-4 py-3 tabular-nums">{num(item.share, 1)}%</td>
                    <td className="px-4 py-3 tabular-nums">{num(item.cumShare, 1)}%</td>
                    <td className="px-4 py-3 font-semibold text-ink-950">{item.abc}</td>
                    <td className="px-4 py-3 tabular-nums">{item.cv === null ? '—' : `${num(item.cv, 1)}%`}</td>
                    <td className="px-4 py-3 font-semibold text-ink-950">{item.xyz ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AutomationCta
          title="Здесь продажи вставляются руками. В Sellico ABC-анализ строится на данных кабинетов"
          text="Для ручного анализа нужно выгрузить продажи из каждого кабинета и свести их в таблицу. В Sellico ABC-анализ ассортимента по прибыли и выручке строится на данных подключённых магазинов, а остатки и оборачиваемость видны рядом — решение о закупке принимается без выгрузок."
          items={['ABC по прибыли и выручке', 'Данные подключённых магазинов', 'Остатки и оборачиваемость рядом', 'Приоритеты закупки']}
        />
      </Container>
    </section>
  );
}
