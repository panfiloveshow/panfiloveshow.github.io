// Расчёты для страниц калькуляторов. Чистые функции без React — их проверяет
// src/lib/calculators.test.ts (pnpm test).

const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export type TurnoverResult = { days: number; times: number; enough: boolean | null };

/** Оборачиваемость запаса: за сколько дней продаётся средний остаток. */
export function calcTurnover(input: { avgStock: number; sold: number; periodDays: number; leadTime: number }): TurnoverResult {
  const avgStock = Math.max(0, input.avgStock);
  const sold = Math.max(0, input.sold);
  const periodDays = Math.max(1, input.periodDays);
  const leadTime = Math.max(0, input.leadTime);

  if (sold === 0) return { days: 0, times: 0, enough: null };

  const days = round((avgStock / sold) * periodDays);
  return {
    days,
    times: round(sold / Math.max(avgStock, 0.0001)),
    // Запаса должно хватить минимум на срок поставки, иначе товар встанет без наличия.
    enough: leadTime === 0 ? null : days >= leadTime,
  };
}

export type DrrResult = { drr: number; remaining: number; profitable: boolean };

/** ДРР кампании и остаток маржинальности после рекламы. */
export function calcDrr(input: { adCost: number; revenue: number; marginPct: number }): DrrResult {
  const adCost = Math.max(0, input.adCost);
  const revenue = Math.max(0, input.revenue);
  const marginPct = Math.max(0, input.marginPct);

  const drr = revenue === 0 ? 0 : round((adCost / revenue) * 100);
  const remaining = round(marginPct - drr);
  return { drr, remaining, profitable: revenue > 0 && remaining > 0 };
}

export type BreakEvenResult = { units: number | null; revenue: number | null };

/** Точка безубыточности: сколько единиц нужно продать, чтобы покрыть постоянные расходы. */
export function calcBreakEven(input: { fixedCosts: number; profitPerUnit: number; price: number }): BreakEvenResult {
  const fixedCosts = Math.max(0, input.fixedCosts);
  const profitPerUnit = input.profitPerUnit;

  // При нулевой или отрицательной прибыли с единицы объём продаж только увеличивает убыток.
  if (profitPerUnit <= 0) return { units: null, revenue: null };

  const units = Math.ceil(fixedCosts / profitPerUnit);
  return { units, revenue: round(units * Math.max(0, input.price), 0) };
}

/** Маржинальность и наценка по цене и прибыли — для мини-расчёта в глоссарии. */
export function calcMarginPair(input: { price: number; profit: number; cost: number }) {
  const price = Math.max(0, input.price);
  const cost = Math.max(0, input.cost);
  return {
    margin: price === 0 ? 0 : round((input.profit / price) * 100),
    markup: cost === 0 ? null : round((input.profit / cost) * 100),
  };
}

/** Во что обходится логистика на одну проданную единицу с учётом выкупа. */
export function calcLogisticsPerSale(input: { logistics: number; buyoutPct: number }) {
  const buyout = Math.min(100, Math.max(1, input.buyoutPct)) / 100;
  const perSale = Math.max(0, input.logistics) / buyout;
  return { perSale: round(perSale), extra: round(perSale - Math.max(0, input.logistics)) };
}

/** Себестоимость единицы из затрат на партию. */
export function calcCostPrice(input: { purchase: number; delivery: number; packaging: number; units: number }) {
  const units = Math.max(1, input.units);
  const total = Math.max(0, input.purchase) + Math.max(0, input.delivery) + Math.max(0, input.packaging);
  return { perUnit: round(total / units), total: round(total) };
}

/** ROI: возврат на вложенные средства. */
export function calcRoi(input: { profit: number; investment: number }) {
  const investment = Math.max(0, input.investment);
  if (investment === 0) return { roi: 0 };
  return { roi: round(((input.profit - investment) / investment) * 100) };
}

/** Конверсия карточки и CTR по воронке показов. */
export function calcFunnel(input: { impressions: number; visits: number; orders: number }) {
  const impressions = Math.max(0, input.impressions);
  const visits = Math.max(0, input.visits);
  return {
    ctr: impressions === 0 ? 0 : round((visits / impressions) * 100),
    conversion: visits === 0 ? 0 : round((Math.max(0, input.orders) / visits) * 100),
  };
}
