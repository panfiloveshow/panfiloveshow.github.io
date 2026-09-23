// Мини-расчёты для страниц глоссария: два-три поля и одно число.
// Намеренно короткие — полный расчёт живёт в калькуляторах, сюда он не дублируется,
// иначе термин начнёт конкурировать с калькулятором за один и тот же запрос.
import {
  calcCostPrice,
  calcDrr,
  calcFunnel,
  calcLogisticsPerSale,
  calcMarginPair,
  calcRoi,
  calcSafetyStock,
  calcTurnover,
} from '@/lib/calculators';

type MiniField = { key: string; label: string; suffix: string };
export type MiniSpec = {
  title: string;
  fields: MiniField[];
  defaults: Record<string, number>;
  compute: (values: Record<string, number>) => { value: string; caption: string };
  link: { label: string; href: (values: Record<string, number>) => string };
};

const pct = (value: number) => `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}%`;
const rub = (value: number) => `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;

export const MINI_CALCS: Record<string, MiniSpec> = {
  'glossary/drr': {
    title: 'Посчитайте ДРР на своих числах',
    fields: [
      { key: 'adCost', label: 'Расходы на рекламу', suffix: '₽' },
      { key: 'revenue', label: 'Выручка с рекламы', suffix: '₽' },
    ],
    defaults: { adCost: 30000, revenue: 200000 },
    compute: (v) => ({
      value: pct(calcDrr({ ...v, marginPct: 0 } as never).drr),
      caption: 'Столько выручки ушло на продвижение',
    }),
    link: {
      label: 'Сравнить ДРР с маржинальностью товара',
      href: (v) => `/calculators/drr/?adCost=${v.adCost}&revenue=${v.revenue}`,
    },
  },
  'glossary/turnover': {
    title: 'Посчитайте оборачиваемость',
    fields: [
      { key: 'avgStock', label: 'Средний остаток', suffix: 'шт.' },
      { key: 'sold', label: 'Продано за месяц', suffix: 'шт.' },
    ],
    defaults: { avgStock: 300, sold: 600 },
    compute: (v) => {
      const r = calcTurnover({ ...v, periodDays: 30, leadTime: 0 } as never);
      return { value: `${r.days} дн.`, caption: `Запас оборачивается ${r.times} раза за месяц` };
    },
    link: {
      label: 'Проверить, хватит ли запаса до поставки',
      href: (v) => `/calculators/turnover/?avgStock=${v.avgStock}&sold=${v.sold}`,
    },
  },
  'glossary/safety-stock': {
    title: 'Посчитайте страховой запас',
    fields: [
      { key: 'avgDaily', label: 'Средние продажи в день', suffix: 'шт.' },
      { key: 'maxDaily', label: 'Максимальные продажи в день', suffix: 'шт.' },
      { key: 'leadTime', label: 'Срок поставки', suffix: 'дн.' },
    ],
    defaults: { avgDaily: 20, maxDaily: 32, leadTime: 12 },
    compute: (v) => {
      const r = calcSafetyStock(v as never);
      return { value: `${r.safety} шт.`, caption: `Точка заказа — ${r.reorderPoint} шт.` };
    },
    link: {
      label: 'Проверить, хватит ли запаса до поставки',
      href: (v) => `/calculators/turnover/?sold=${v.avgDaily * 30}&periodDays=30&leadTime=${v.leadTime}`,
    },
  },
  'glossary/margin': {
    title: 'Маржинальность и наценка на ваших числах',
    fields: [
      { key: 'price', label: 'Цена продажи', suffix: '₽' },
      { key: 'cost', label: 'Себестоимость', suffix: '₽' },
      { key: 'profit', label: 'Прибыль с единицы', suffix: '₽' },
    ],
    defaults: { price: 2000, cost: 700, profit: 460 },
    compute: (v) => {
      const r = calcMarginPair(v as never);
      return {
        value: pct(r.margin),
        caption: r.markup === null ? 'Маржинальность к цене' : `Наценка к себестоимости — ${pct(r.markup)}`,
      };
    },
    link: {
      label: 'Учесть удержания площадки и подобрать цену',
      href: (v) => `/calculators/margin/?price=${v.price}&cost=${v.cost}`,
    },
  },
  'glossary/buyout-rate': {
    title: 'Во что обходится логистика при вашем выкупе',
    fields: [
      { key: 'logistics', label: 'Логистика за доставку', suffix: '₽' },
      { key: 'buyoutPct', label: 'Процент выкупа', suffix: '%' },
    ],
    defaults: { logistics: 100, buyoutPct: 70 },
    compute: (v) => {
      const r = calcLogisticsPerSale(v as never);
      return { value: rub(r.perSale), caption: `На проданную единицу — переплата ${rub(r.extra)}` };
    },
    link: {
      label: 'Учесть это в полном расчёте прибыли',
      href: (v) => `/calculators/unit-economics/?logistics=${v.logistics}&buyoutPct=${v.buyoutPct}`,
    },
  },
  'glossary/cost-price': {
    title: 'Себестоимость единицы из затрат на партию',
    fields: [
      { key: 'purchase', label: 'Закупка партии', suffix: '₽' },
      { key: 'delivery', label: 'Доставка и приёмка', suffix: '₽' },
      { key: 'units', label: 'Штук в партии', suffix: 'шт.' },
    ],
    defaults: { purchase: 350000, delivery: 40000, units: 500 },
    compute: (v) => {
      const r = calcCostPrice({ ...v, packaging: 0 } as never);
      return { value: rub(r.perUnit), caption: `Всего затрат на партию — ${rub(r.total)}` };
    },
    link: {
      label: 'Добавить упаковку, маркировку и брак',
      // Нули в новых полях — чтобы калькулятор открылся с тем же результатом, что здесь.
      href: (v) =>
        `/calculators/cost-price/?purchase=${v.purchase}&delivery=${v.delivery}&packaging=0&units=${v.units}&defectPct=0`,
    },
  },
  'glossary/roi': {
    title: 'Посчитайте ROI вложений',
    fields: [
      { key: 'investment', label: 'Вложено', suffix: '₽' },
      { key: 'profit', label: 'Получено', suffix: '₽' },
    ],
    defaults: { investment: 500000, profit: 650000 },
    compute: (v) => ({ value: pct(calcRoi(v as never).roi), caption: 'Возврат на вложенные средства' }),
    link: {
      label: 'Учесть налог и срок оборота',
      href: (v) => `/calculators/roi/?investment=${v.investment}&received=${v.profit}&costs=0`,
    },
  },
  'glossary/conversion': {
    title: 'Посчитайте воронку карточки',
    fields: [
      { key: 'impressions', label: 'Показы в выдаче', suffix: 'шт.' },
      { key: 'visits', label: 'Переходы в карточку', suffix: 'шт.' },
      { key: 'orders', label: 'Заказы', suffix: 'шт.' },
    ],
    defaults: { impressions: 10000, visits: 400, orders: 24 },
    compute: (v) => {
      const r = calcFunnel(v as never);
      return { value: pct(r.conversion), caption: `CTR карточки — ${pct(r.ctr)}` };
    },
    link: { label: 'Как улучшать карточки в Sellico', href: () => '/seo-cards/' },
  },
};
