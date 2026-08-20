import { useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Download,
  Grid3X3,
  Maximize2,
  RefreshCw,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type CoordinationMode = 'summary' | 'day';
type CoordinationMarketplace = 'all' | 'Ozon' | 'Wildberries';

const coordinationStores = [
  { name: 'Магазин Север', marketplace: 'Wildberries', seed: 7 },
  { name: 'Дом и порядок', marketplace: 'Ozon', seed: 12 },
  { name: 'Городской склад', marketplace: 'Wildberries', seed: 19 },
  { name: 'Линия дома', marketplace: 'Ozon', seed: 26 },
  { name: 'Вектор', marketplace: 'Wildberries', seed: 33 },
  { name: 'Простые вещи', marketplace: 'Ozon', seed: 41 },
  { name: 'Новый сезон', marketplace: 'Wildberries', seed: 48 },
  { name: 'Базовый магазин', marketplace: 'Ozon', seed: 55 },
  { name: 'Тёплый дом', marketplace: 'Wildberries', seed: 63 },
  { name: 'Полезные детали', marketplace: 'Ozon', seed: 71 },
];

const coordinationSummaryGroups = [
  { label: 'ИЮЛЬ', tone: '#fff8c9' },
  { label: 'Неделя 1', tone: '#d9f5f7' },
  { label: 'Неделя 2', tone: '#d9f5f7' },
  { label: 'Неделя 3', tone: '#d9f5f7' },
];

const coordinationSummaryMetrics = ['Продажа', 'Выручка', 'Прогноз', 'План'];
const coordinationDayMetrics = ['Продажа', 'Выручка', 'Ср чек', 'Общ.Показ', 'ДРР', 'Показы', 'Клики', 'Корзина', 'Заказ'];

function coordinationCellData(seed: number, group: number, metric: number, mode: CoordinationMode) {
  const hash = (seed * 37 + group * 23 + metric * 17) % 101;
  const tone = hash < 42 ? 'negative' : hash > 64 ? 'positive' : 'neutral';
  const direction = tone === 'positive' ? '↑↑ ' : tone === 'negative' ? '↓↓ ' : hash % 2 ? '→ ' : '';

  if (mode === 'summary') {
    const bases = [34 + ((seed * 13 + group * 31) % 790), 52_000 + ((seed * 19_431 + group * 73_770) % 930_000), 78_000 + ((seed * 27_019 + group * 41_500) % 1_140_000), 0];
    const value = bases[metric];
    return {
      tone: metric === 3 ? 'neutral' : tone,
      value: metric === 3 ? '—' : `${direction}${value.toLocaleString('ru-RU')}`,
    };
  }

  const values = [
    4 + ((seed * 11 + group * 17) % 230),
    8_500 + ((seed * 7_613 + group * 19_300) % 198_000),
    620 + ((seed * 137 + group * 449) % 5_900),
    2_300 + ((seed * 1_901 + group * 3_770) % 88_000),
    (1.2 + ((seed * 29 + group * 13) % 145) / 10).toFixed(2),
    1_100 + ((seed * 653 + group * 1_771) % 62_000),
    (0.8 + ((seed * 7 + group * 11) % 72) / 10).toFixed(2),
    (3.2 + ((seed * 5 + group * 17) % 285) / 10).toFixed(2),
    (8.5 + ((seed * 9 + group * 21) % 1_260) / 10).toFixed(2),
  ];
  const suffix = metric === 4 ? '%' : '';
  return { tone, value: `${direction}${Number(values[metric]).toLocaleString('ru-RU')}${suffix}` };
}

function CoordinationDataCell({
  seed,
  group,
  metric,
  mode,
}: {
  seed: number;
  group: number;
  metric: number;
  mode: CoordinationMode;
}) {
  const data = coordinationCellData(seed, group, metric, mode);
  return (
    <td
      className={cn(
        'h-8 min-w-[82px] border-b border-r border-[#dfe3e6] px-2 text-right font-mono text-[7px] font-semibold tabular-nums',
        data.tone === 'positive' && 'bg-[#dff2df] text-[#2e7d32]',
        data.tone === 'negative' && 'bg-[#ffd7da] text-[#d43a3a]',
        data.tone === 'neutral' && 'bg-white text-[#5b6067]',
      )}
    >
      {data.value}
    </td>
  );
}

function CoordinationTable({
  mode,
  stores,
}: {
  mode: CoordinationMode;
  stores: typeof coordinationStores;
}) {
  if (mode === 'summary') {
    return (
      <table className="min-w-[1540px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f6f7f8]" />
            {coordinationSummaryGroups.map((group) => (
              <th key={group.label} colSpan={4} className="h-8 border-b border-r border-[#d9dde1] text-center text-[9px] font-bold text-[#30363d]" style={{ backgroundColor: group.tone }}>{group.label}</th>
            ))}
          </tr>
          <tr>
            <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f1f3f4] px-2 text-[8px] font-bold text-[#61666d]">Магазин</th>
            {coordinationSummaryGroups.flatMap((group) => coordinationSummaryMetrics.map((metric) => (
              <th key={`${group.label}-${metric}`} className="h-8 min-w-[82px] border-b border-r border-[#d9dde1] px-2 text-center text-[7px] font-bold text-[#676b72]" style={{ backgroundColor: group.tone }}>{metric}</th>
            )))}
          </tr>
        </thead>
        <tbody>
          {stores.map((storeItem) => (
            <tr key={storeItem.name}>
              <th className="sticky left-0 z-20 h-9 border-b border-r border-[#dfe3e6] bg-white px-2">
                <span className="block max-w-[150px] truncate text-[8px] font-bold text-[#343941]">{storeItem.name}</span>
                <span className="mt-0.5 block text-[6px] font-medium text-[#888e95]">{storeItem.marketplace}</span>
              </th>
              {coordinationSummaryGroups.flatMap((group, groupIndex) => coordinationSummaryMetrics.map((metric, metricIndex) => (
                <CoordinationDataCell key={`${group.label}-${metric}`} seed={storeItem.seed} group={groupIndex} metric={metricIndex} mode="summary" />
              )))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const dayGroups = [
    { week: 'Неделя 4', date: '22 июля' },
    { week: 'Неделя 4', date: '21 июля' },
    { week: 'Неделя 3', date: '20 июля' },
  ];

  return (
    <table className="min-w-[2450px] border-separate border-spacing-0 text-left">
      <thead>
        <tr>
          <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f6f7f8]" />
          {dayGroups.map((group, index) => (
            <th key={group.date} colSpan={9} className={cn('h-7 border-b border-r border-[#c5d5e8] text-center text-[9px] font-bold', index % 2 ? 'bg-[#b7dff7] text-[#1766c2]' : 'bg-[#dcecff] text-[#1766c2]')}>{group.week}</th>
          ))}
        </tr>
        <tr>
          <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f6f7f8]" />
          {dayGroups.map((group, index) => (
            <th key={group.date} colSpan={9} className={cn('h-7 border-b border-r border-[#c5d5e8] text-center text-[8px] font-bold', index % 2 ? 'bg-[#e8f5ff] text-[#1766c2]' : 'bg-[#eff5ff] text-[#1766c2]')}>{group.date}</th>
          ))}
        </tr>
        <tr>
          <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f1f3f4] px-2 text-[8px] font-bold text-[#61666d]">Магазин</th>
          {dayGroups.flatMap((group) => coordinationDayMetrics.map((metric) => (
            <th key={`${group.date}-${metric}`} className="h-8 min-w-[82px] border-b border-r border-[#d9dde1] bg-[#f7f8fa] px-2 text-center text-[7px] font-bold text-[#676b72]">{metric}</th>
          )))}
        </tr>
      </thead>
      <tbody>
        {stores.map((storeItem) => (
          <tr key={storeItem.name}>
            <th className="sticky left-0 z-20 h-9 border-b border-r border-[#dfe3e6] bg-white px-2">
              <span className="block max-w-[150px] truncate text-[8px] font-bold text-[#343941]">{storeItem.name}</span>
              <span className="mt-0.5 block text-[6px] font-medium text-[#888e95]">{storeItem.marketplace}</span>
            </th>
            {dayGroups.flatMap((group, groupIndex) => coordinationDayMetrics.map((metric, metricIndex) => (
              <CoordinationDataCell key={`${group.date}-${metric}`} seed={storeItem.seed} group={groupIndex} metric={metricIndex} mode="day" />
            )))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CoordinationView() {
  const [mode, setMode] = useState<CoordinationMode>('summary');
  const [searchValue, setSearchValue] = useState('');
  const [marketplace, setMarketplace] = useState<CoordinationMarketplace>('all');
  const [zoom, setZoom] = useState(100);
  const normalizedSearch = searchValue.trim().toLowerCase();
  const visibleStores = coordinationStores.filter((storeItem) => (
    (marketplace === 'all' || storeItem.marketplace === marketplace)
    && (!normalizedSearch || storeItem.name.toLowerCase().includes(normalizedSearch))
  ));

  return (
    <section aria-label="Координация" className="min-h-[662px] bg-[#f8faf9] p-2 sm:p-3">
      <section className="overflow-hidden rounded-[14px] border border-[#dfe3e4] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde1] bg-[#f8f9fa] p-3 xl:flex-row xl:items-center xl:justify-between">
          <button type="button" className="inline-flex h-9 items-center gap-2 self-start rounded-full border border-[#b9dfc0] bg-[#f3fbf4] px-4 text-[8px] font-bold text-[#418d48]">
            <CalendarDays size={14} />
            1 мая — 24 июля 2026
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:justify-center">
            <div className="flex self-start overflow-hidden rounded-[10px] border border-[#d7dadd] bg-white">
              {[
                { id: 'summary' as const, label: 'Сводка' },
                { id: 'day' as const, label: 'По дням' },
              ].map((item) => (
                <button key={item.id} type="button" onClick={() => setMode(item.id)} className={cn('h-9 px-4 text-[8px] font-bold uppercase', mode === item.id ? 'bg-[#f1f3f4] text-[#20242a]' : 'text-[#777c84]')}>
                  {item.label}
                </button>
              ))}
            </div>
            <label className="relative block min-w-0 sm:w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
              <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} aria-label="Поиск магазина в координации" placeholder="Поиск магазина" className="h-9 w-full rounded-[10px] border border-[#cfd4d7] bg-white pl-9 pr-3 text-[8px] outline-none focus:border-[#58a469]" />
            </label>
            <label className="relative block sm:w-[140px]">
              <span className="pointer-events-none absolute -top-2 left-3 bg-[#f8f9fa] px-1 text-[6px] text-[#74869a]">Маркетплейс</span>
              <select value={marketplace} onChange={(event) => setMarketplace(event.target.value as CoordinationMarketplace)} aria-label="Фильтр маркетплейса" className="h-9 w-full appearance-none rounded-[10px] border border-[#cfd4d7] bg-white px-3 pr-8 text-[8px] text-[#3e444b] outline-none">
                <option value="all">Все</option>
                <option value="Ozon">Ozon</option>
                <option value="Wildberries">Wildberries</option>
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777d83]" />
            </label>
          </div>

          <div className="flex items-center gap-0.5 self-start text-[#666b72] xl:self-auto">
            {mode === 'day' ? <button type="button" aria-label="Выбор колонок" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><Grid3X3 size={14} /></button> : null}
            <button type="button" onClick={() => setZoom((value) => Math.max(70, value - 10))} aria-label="Уменьшить масштаб" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><ZoomOut size={14} /></button>
            <span className="w-9 text-center text-[7px] font-semibold">{zoom}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.min(130, value + 10))} aria-label="Увеличить масштаб" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><ZoomIn size={14} /></button>
            <button type="button" aria-label="Обновить" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><RefreshCw size={14} /></button>
            <button type="button" aria-label="На весь экран" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><Maximize2 size={14} /></button>
            <button type="button" aria-label="Скачать" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><Download size={14} /></button>
          </div>
        </div>

        <div className="h-[520px] overflow-auto bg-white [scrollbar-color:#bfc5c8_#f3f4f5]">
          <CoordinationTable mode={mode} stores={visibleStores} />
          {!visibleStores.length ? <p className="p-10 text-center text-[9px] text-[#8a9097]">Магазины не найдены</p> : null}
        </div>
        <div className="flex h-9 items-center justify-between border-t border-[#d9dde1] bg-[#fafbfb] px-3 text-[7px] text-[#71777e]">
          <span>{visibleStores.length} магазинов · 83 дня · {mode === 'day' ? '747' : '40'} колонок</span>
          <span>Демо-данные обезличены</span>
        </div>
      </section>
    </section>
  );
}
