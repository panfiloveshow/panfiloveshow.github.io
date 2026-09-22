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

export type MarginResult = {
  profit: number;
  margin: number;
  markup: number | null;
  grossMargin: number;
  grossMarkup: number | null;
  minPrice: number | null;
  targetPrice: number | null;
};

/**
 * Маржинальность и наценка с удержаниями площадки. Процентные удержания (комиссия, эквайринг,
 * налог) растут вместе с ценой, поэтому цену под нужную маржинальность считаем от доли цены,
 * которая остаётся продавцу, а не прибавляем маржу к расходам.
 */
export function calcMargin(input: { price: number; cost: number; feesPct: number; extra: number; targetPct: number }): MarginResult {
  const price = Math.max(0, input.price);
  const cost = Math.max(0, input.cost);
  const fees = Math.max(0, input.feesPct) / 100;
  const extra = Math.max(0, input.extra);
  const profit = round(price * (1 - fees) - cost - extra);
  const net = calcMarginPair({ price, profit, cost });
  const gross = calcMarginPair({ price, profit: price - cost, cost });
  // Доля цены, которая должна остаться; при share ≤ 0 цель недостижима ни при какой цене.
  const priceFor = (share: number) => (share > 0 ? Math.ceil(round((cost + extra) / share, 4)) : null);
  return {
    profit,
    margin: net.margin,
    markup: net.markup,
    grossMargin: gross.margin,
    grossMarkup: gross.markup,
    minPrice: priceFor(1 - fees),
    targetPrice: priceFor(1 - fees - Math.max(0, input.targetPct) / 100),
  };
}

/** Во что обходится логистика на одну проданную единицу с учётом выкупа. */
export function calcLogisticsPerSale(input: { logistics: number; buyoutPct: number }) {
  const buyout = Math.min(100, Math.max(1, input.buyoutPct)) / 100;
  const perSale = Math.max(0, input.logistics) / buyout;
  return { perSale: round(perSale), extra: round(perSale - Math.max(0, input.logistics)) };
}

/** Себестоимость единицы из затрат на партию. Брак и потери уменьшают число единиц, на которые делятся затраты. */
export function calcCostPrice(input: {
  purchase: number;
  delivery: number;
  packaging: number;
  units: number;
  other?: number;
  defectPct?: number;
}) {
  const units = Math.max(1, input.units);
  const defect = Math.min(99, Math.max(0, input.defectPct ?? 0));
  // Продаётся только целая единица — дробный остаток после брака отбрасываем.
  const sellable = Math.max(1, Math.floor(round((units * (100 - defect)) / 100, 6)));
  const purchase = Math.max(0, input.purchase);
  const total = purchase + Math.max(0, input.delivery) + Math.max(0, input.packaging) + Math.max(0, input.other ?? 0);
  const perUnit = round(total / sellable);
  const purchasePerUnit = round(purchase / units);
  return {
    perUnit,
    total: round(total),
    sellable,
    purchasePerUnit,
    upliftPct: purchasePerUnit === 0 ? null : round((perUnit / purchasePerUnit - 1) * 100, 1),
  };
}

/**
 * ROI: возврат на вложенные средства. profit — сколько получено до вычета вложений.
 * monthly — простой пересчёт на 30 дней без реинвестирования: так сравнивают товары с разным сроком оборота.
 */
export function calcRoi(input: { profit: number; investment: number; costs?: number; periodDays?: number }) {
  const investment = Math.max(0, input.investment);
  if (investment === 0) return { roi: 0, net: 0, monthly: null };
  const net = round(input.profit - investment - Math.max(0, input.costs ?? 0));
  const roi = round((net / investment) * 100);
  const days = Math.max(0, input.periodDays ?? 0);
  return { roi, net, monthly: days > 0 ? round((roi * 30) / days) : null };
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
