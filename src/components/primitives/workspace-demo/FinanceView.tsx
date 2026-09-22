import { useState } from 'react';
import { ChevronDown, Clock3, Info, Search, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

const financeBars = [66, 54, 46, 38, 32, 74, 62, 56, 49, 71, 52, 61, 82, 68, 58, 64, 49, 44, 35, 59, 47, 40, 51, 69, 48, 31, 24, 56, 42, 18];
const financeMetrics = [
  { label: 'Выкупленные товары', value: '1 284 630 ₽', detail: '487 шт.' },
  { label: 'Обр. логистика', value: '31 840 ₽', detail: 'Выкуп: 78,4%' },
  { label: 'Компенсация', value: '2 940 ₽', detail: '0,3%' },
  { label: 'Маржинальность', value: '24,8%', detail: '+2,1 п.п.' },
  { label: 'ROI', value: '31,2%', detail: '+4,7%' },
  { label: '% выкупа', value: '78,4%', detail: 'Данные воронки' },
  { label: 'Ср. цена продажи', value: '2 638 ₽', detail: '+6,2%' },
  { label: 'Ср. прибыль на товар', value: '654 ₽', detail: '+8,4%' },
  { label: 'Ср. логистика на товар', value: '164 ₽', detail: '−3,1%' },
  { label: 'Ср. продажи в день', value: '42 821 ₽', detail: '+12,6%' },
  { label: 'Капитализация', value: '4 820 000 ₽', detail: '8,2 млн розн.' },
  { label: 'Оборачиваемость', value: '64 дн.', detail: '51 дн. по заказам' },
];
const financeProducts = [
  { name: 'Органайзер модульный', sku: 'MS-1042', revenue: '186 420 ₽', sales: '72 шт.', expenses: '104 395 ₽', profit: '48 960 ₽', buyout: '82,4%', margin: '26,3%', abc: 'A' },
  { name: 'Набор контейнеров', sku: 'MS-1186', revenue: '142 815 ₽', sales: '54 шт.', expenses: '78 604 ₽', profit: '39 117 ₽', buyout: '79,8%', margin: '27,4%', abc: 'A' },
  { name: 'Полка настольная', sku: 'MS-0917', revenue: '96 730 ₽', sales: '38 шт.', expenses: '56 402 ₽', profit: '22 809 ₽', buyout: '76,1%', margin: '23,6%', abc: 'B' },
  { name: 'Чехлы дорожные, комплект', sku: 'MS-1240', revenue: '71 280 ₽', sales: '31 шт.', expenses: '43 602 ₽', profit: '15 946 ₽', buyout: '74,6%', margin: '22,4%', abc: 'B' },
  { name: 'Корзина для хранения', sku: 'MS-0834', revenue: '48 190 ₽', sales: '26 шт.', expenses: '31 408 ₽', profit: '8 924 ₽', buyout: '71,3%', margin: '18,5%', abc: 'C' },
  { name: 'Подставка для аксессуаров', sku: 'MS-1308', revenue: '24 670 ₽', sales: '14 шт.', expenses: '18 442 ₽', profit: '3 180 ₽', buyout: '68,2%', margin: '12,9%', abc: 'C' },
];

const abcColors: Record<string, string> = {
  A: '#10b981',
  B: '#fbbf24',
  C: '#f97316',
  D: '#ef4444',
  U: '#cbd5e1',
};
// Буква в бейдже: яркие abcColors на своём же тинте не дотягивают до WCAG AA 4.5:1
const abcTextColors: Record<string, string> = {
  A: '#047857',
  B: '#b45309',
  C: '#c2410c',
  D: '#b91c1c',
  U: '#64748b',
};

function FinanceAbcBar({
  title,
  segments,
}: {
  title: string;
  segments: Array<{ label: string; value: number; count: number }>;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold text-[#1f2937]">{title}</p>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#f1f5f9]">
        {segments.map((segment) => (
          <span key={segment.label} style={{ width: `${segment.value}%`, backgroundColor: abcColors[segment.label] }} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {segments.map((segment) => (
          <span key={segment.label} className="inline-flex items-center gap-1 text-[7px] text-[#64748b]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: abcColors[segment.label] }} />
            <strong className="text-[#334155]">{segment.label}</strong>
            {segment.value}% · {segment.count}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FinanceView() {
  const [period, setPeriod] = useState('30 дней');
  const [productSearch, setProductSearch] = useState('');
  const [abcFilter, setAbcFilter] = useState('all');
  const heatmap = Array.from({ length: 7 * 24 }, (_, index) => ((index * 17 + Math.floor(index / 7) * 11) % 100));
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const visibleFinanceProducts = financeProducts.filter((product) => (
    (abcFilter === 'all' || product.abc === abcFilter)
    && (!normalizedProductSearch || product.name.toLowerCase().includes(normalizedProductSearch) || product.sku.toLowerCase().includes(normalizedProductSearch))
  ));

  return (
    <section aria-label="Финансы" className="min-h-[662px] bg-[#f8fafc] p-3 sm:p-5">
      <div className="flex flex-col gap-3 rounded-[15px] border border-[#e5e7eb] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {['Сегодня', 'Вчера', 'Неделя', '30 дней', '90 дней'].map((label) => (
            <button key={label} type="button" onClick={() => setPeriod(label)} className={cn('h-8 rounded-[8px] px-3 text-[8px] font-semibold', period === label ? 'bg-[#111827] text-white' : 'text-[#64748b] hover:bg-[#f1f5f9]')}>
              {label}
            </button>
          ))}
          <button type="button" className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#e5e7eb] px-3 text-[8px] text-[#64748b]">24 июн. – 24 июл. <ChevronDown size={11} /></button>
        </div>
        <button type="button" className="inline-flex h-8 items-center gap-2 self-start rounded-full border border-[#93c5fd] bg-[#eff6ff] px-3 text-[8px] font-bold text-[#2563eb] sm:self-auto">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2563eb] text-[7px] text-white">MS</span>
          Магазин Север
          <ChevronDown size={11} />
        </button>
      </div>

      <section className="mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-4">
        <p className="text-[9px] font-bold text-[#1f2937]">Выручка и прибыль — Магазин Север</p>
        <div className="mt-5 flex h-[150px] items-end gap-[3px] border-b border-[#eef2f7] px-1">
          {financeBars.map((bar, index) => (
            <div key={index} className="flex h-full min-w-0 flex-1 items-end gap-[1px]">
              <div className="w-1/2 rounded-t-[2px] bg-[#10b981]" style={{ height: `${bar}%` }} />
              <div className="w-1/2 rounded-t-[2px] bg-[#a7e4c8]" style={{ height: `${Math.max(12, bar - 14)}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[6px] text-[#64748b]">
          {['24', '28', '2', '6', '10', '14', '18', '22'].map((day) => <span key={day}>{day}</span>)}
        </div>
      </section>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Выручка', value: '1 284 630 ₽', detail: '+12,6%', color: '#047857' },
          { label: 'Все расходы', value: '726 840 ₽', detail: '56,6% от выручки', color: '#dc2626' },
          { label: 'Себестоимость', value: '238 120 ₽', detail: '18,5% от выручки', color: '#b45309' },
          { label: 'Прибыль', value: '319 670 ₽', detail: '24,8%', color: '#2563eb' },
        ].map((metric) => (
          <section key={metric.label} className="relative overflow-hidden rounded-[15px] border border-[#e5e7eb] bg-white p-4">
            <span className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: metric.color }} />
            <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#64748b]">{metric.label}</p>
            <p className="mt-2 text-[17px] font-extrabold tracking-[-0.03em]" style={{ color: metric.color }}>{metric.value}</p>
            <p className="mt-1 text-[7px] text-[#64748b]">{metric.detail}</p>
          </section>
        ))}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {financeMetrics.map((metric) => (
          <section key={metric.label} className="min-h-[82px] rounded-[14px] border border-[#e5e7eb] bg-white p-3">
            <p className="text-[7px] font-semibold uppercase tracking-[0.04em] text-[#64748b]">{metric.label}</p>
            <p className="mt-2 text-[13px] font-extrabold text-[#1f2937]">{metric.value}</p>
            <p className={cn('mt-1 text-[7px]', metric.detail.startsWith('−') ? 'text-[#dc2626]' : 'text-[#047857]')}>{metric.detail}</p>
          </section>
        ))}
      </div>

      <section className="mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold text-[#1f2937]"><Clock3 size={13} className="text-[#047857]" />Тепловая карта заказов</p>
            <p className="mt-1 text-[7px] text-[#64748b]">Пн–Вс по 24 часам · интенсивность заказов</p>
          </div>
          <div className="flex gap-2 text-[7px] text-[#64748b]"><span className="rounded-[7px] bg-[#f1f5f9] px-2 py-1.5 text-[#475569]">Штуки</span><span className="rounded-[7px] border border-[#e5e7eb] px-2 py-1.5">24 июн. – 24 июл.</span></div>
        </div>
        <div className="mt-4 grid grid-cols-[20px_repeat(24,minmax(8px,1fr))] gap-1 overflow-x-auto">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].flatMap((day, dayIndex) => [
            <span key={`${day}-label`} className="grid h-4 place-items-center text-[6px] text-[#64748b]">{day}</span>,
            ...Array.from({ length: 24 }, (_, hour) => {
              const value = heatmap[dayIndex * 24 + hour];
              const color = value > 82 ? '#008f5b' : value > 62 ? '#36bd84' : value > 40 ? '#74d4aa' : value > 20 ? '#b9ead5' : '#edf7f2';
              return <span key={`${day}-${hour}`} className="h-4 min-w-2 rounded-[4px]" style={{ backgroundColor: color }} />;
            }),
          ])}
        </div>
        <div className="mt-3 flex items-center gap-1 text-[6px] text-[#64748b]">
          Меньше
          {['#edf7f2', '#b9ead5', '#74d4aa', '#36bd84', '#008f5b'].map((color) => <span key={color} className="h-2 w-4 rounded-full" style={{ backgroundColor: color }} />)}
          Больше
        </div>
      </section>

      <section className="mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-4">
        <p className="text-[10px] font-bold text-[#1f2937]">Расходы</p>
        <p className="mt-1 text-[7px] text-[#64748b]">Распределение расходов и история за период</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
          <div>
            <div className="flex h-7 overflow-hidden rounded-full">
              {[
                ['#fbbf24', '42%'],
                ['#84cc16', '23%'],
                ['#22c55e', '17%'],
                ['#60a5fa', '10%'],
                ['#8b5cf6', '8%'],
              ].map(([color, width]) => <span key={color} style={{ backgroundColor: color, width }} />)}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[7px] text-[#64748b]">
              {['Комиссия', 'Реклама', 'Доставка', 'Прочее', 'Хранение'].map((label) => <span key={label}>{label}</span>)}
            </div>
          </div>
          <div className="flex h-[92px] items-end gap-1">
            {[44, 61, 53, 68, 72, 64, 78, 59, 84, 76, 52, 69, 63, 47, 74, 58].map((value, index) => (
              <span key={index} className="min-w-0 flex-1 rounded-t-[2px] bg-gradient-to-t from-[#fbbf24] via-[#84cc16] to-[#60a5fa]" style={{ height: `${value}%` }} />
            ))}
          </div>
        </div>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <section className="rounded-[16px] border border-[#e5e7eb] bg-white p-4">
          <p className="text-[10px] font-bold text-[#1f2937]">Остатки и товары в доставке</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Все товары', value: '4 820 000 ₽', detail: '1 842 шт.' },
              { label: 'На складе для продажи', value: '4 126 400 ₽', detail: '85,6% · 1 576 шт.' },
              { label: 'В доставке', value: '693 600 ₽', detail: '14,4% · 266 шт.' },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-[12px] border border-[#e5e7eb] p-3">
                <p className="line-clamp-2 min-h-[20px] text-[6px] font-semibold uppercase tracking-[0.04em] text-[#64748b]">{item.label}</p>
                <p className="mt-2 truncate text-[11px] font-extrabold text-[#1f2937] sm:text-[13px]">{item.value}</p>
                <p className="mt-1 text-[6px] text-[#64748b] sm:text-[7px]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 rounded-[16px] border border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
          <FinanceAbcBar
            title="ABC-анализ прибыли"
            segments={[
              { label: 'A', value: 54, count: 2 },
              { label: 'B', value: 23, count: 2 },
              { label: 'C', value: 14, count: 2 },
              { label: 'D', value: 5, count: 0 },
              { label: 'U', value: 4, count: 0 },
            ]}
          />
          <FinanceAbcBar
            title="Доля выручки по ABC-классам"
            segments={[
              { label: 'A', value: 78, count: 2 },
              { label: 'B', value: 15, count: 2 },
              { label: 'C', value: 7, count: 2 },
              { label: 'D', value: 0, count: 0 },
            ]}
          />
        </section>
      </div>

      <section className="mt-3 overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
        <div className="grid gap-3 border-b border-[#e5e7eb] bg-[#f8fafc]/90 p-3 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Info size={15} className="mt-0.5 shrink-0 text-[#2563eb]" />
            <div>
              <p className="text-[9px] font-extrabold text-[#1f2937]">Часть расходов не распределена по товарам</p>
              <p className="mt-1 text-[7px] leading-relaxed text-[#64748b]">По товарам распределено 689 200 ₽, не распределено 37 640 ₽. Прибыль по товарам не включает эти общие списания.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TriangleAlert size={15} className="mt-0.5 shrink-0 text-[#b45309]" />
            <div>
              <p className="text-[9px] font-extrabold text-[#1f2937]">Себестоимость заполнена не у всех товаров</p>
              <p className="mt-1 text-[7px] leading-relaxed text-[#64748b]">5 товаров с выручкой 18 420 ₽ имеют нулевую себестоимость. Прибыль по ним предварительная.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#eef2f7] p-3 sm:flex-row sm:items-center">
          <label className="relative shrink-0">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              aria-label="Поиск финансов по товару"
              placeholder="Артикул или имя"
              className="h-8 w-full rounded-[8px] border border-[#e5e7eb] pl-8 pr-3 text-[8px] outline-none focus:border-[#111827] sm:w-[190px]"
            />
          </label>
          <div className="flex overflow-x-auto">
            {['all', 'A', 'B', 'C', 'D', 'U'].map((filter) => {
              const count = filter === 'all' ? financeProducts.length : financeProducts.filter((product) => product.abc === filter).length;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setAbcFilter(filter)}
                  className={cn(
                    'h-8 shrink-0 border border-r-0 border-[#e5e7eb] px-2.5 text-[7px] font-semibold first:rounded-l-[8px] last:rounded-r-[8px] last:border-r',
                    abcFilter === filter ? 'border-[#111827] bg-[#111827] text-white' : 'bg-white text-[#64748b]',
                  )}
                >
                  {filter === 'all' ? 'Все (прибыль)' : filter}
                  <span className="ml-1">{count}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[7px] text-[#64748b] sm:ml-auto">Сортировать по <strong className="text-[#64748b]">выручке</strong>, сначала <strong className="text-[#64748b]">высокая</strong></p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left">
            <thead className="bg-[#f8fafc] text-[7px] uppercase tracking-[0.04em] text-[#64748b]">
              <tr>
                {['Товар', 'Выкупы', 'ABC', 'Расходы', 'Прибыль', 'Процент выкупа', 'Маржинальность'].map((label) => <th key={label} className="px-4 py-2.5 font-semibold">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {visibleFinanceProducts.length ? visibleFinanceProducts.map((product) => (
                <tr key={product.name} className="border-t border-[#eef2f7] text-[8px] text-[#475569] hover:bg-[#f8fbff]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#dcfce7] to-[#dbeafe] text-[8px] font-extrabold text-[#087b57]">MS</span>
                      <span>
                        <span className="block font-semibold text-[#1f2937]">{product.name}</span>
                        <span className="mt-1 block text-[6px] text-[#64748b]">Артикул: {product.sku}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-bold text-[#1f2937]">{product.revenue}</span>
                    <span className="mt-1 block text-[6px] text-[#64748b]">{product.sales}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full border text-[7px] font-extrabold" style={{ borderColor: `${abcColors[product.abc]}55`, backgroundColor: `${abcColors[product.abc]}18`, color: abcTextColors[product.abc] }}>{product.abc}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{product.expenses}</td>
                  <td className="px-4 py-3 font-bold text-[#047857]">{product.profit}</td>
                  <td className="px-4 py-3 font-semibold text-[#2563eb]">{product.buyout}</td>
                  <td className={cn('px-4 py-3 font-bold', Number.parseFloat(product.margin) >= 20 ? 'text-[#047857]' : 'text-[#b45309]')}>{product.margin}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[8px] text-[#64748b]">Нет товаров по выбранному фильтру</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
