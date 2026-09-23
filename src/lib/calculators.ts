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

/**
 * Страховой запас методом максимумов и точка заказа. Без maxLeadTime срок поставки
 * считается постоянным — тогда запас покрывает только всплеск продаж.
 */
export function calcSafetyStock(input: { avgDaily: number; maxDaily: number; leadTime: number; maxLeadTime?: number }) {
  const avgDaily = Math.max(0, input.avgDaily);
  const maxDaily = Math.max(avgDaily, input.maxDaily);
  const leadTime = Math.max(0, input.leadTime);
  const maxLeadTime = Math.max(leadTime, input.maxLeadTime ?? leadTime);
  // Штуки целые и округляются вверх: неполная единица дефицит не закроет.
  const safety = Math.ceil(round(maxDaily * maxLeadTime - avgDaily * leadTime, 4));
  return { safety, reorderPoint: Math.ceil(round(avgDaily * leadTime, 4)) + safety };
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

/** Безубыточная выручка магазина: постоянные расходы / доля маржинального дохода в выручке. */
export function calcBreakEvenRevenue(input: { fixedCosts: number; contributionPct: number }) {
  const share = input.contributionPct / 100;
  // Без положительного маржинального дохода постоянные расходы не покрыть ни при каком объёме.
  return { revenue: share > 0 ? Math.ceil(round(Math.max(0, input.fixedCosts) / share, 4)) : null };
}

/** Стоимость клика и заказа из рекламы и конверсия из клика в заказ. */
export function calcAdCosts(input: { adCost: number; clicks: number; orders: number }) {
  const adCost = Math.max(0, input.adCost);
  const clicks = Math.max(0, input.clicks);
  const orders = Math.max(0, input.orders);
  return {
    cpc: clicks === 0 ? null : round(adCost / clicks),
    cpo: orders === 0 ? null : round(adCost / orders),
    conversion: clicks === 0 ? 0 : round((orders / clicks) * 100),
  };
}

/** Упущенные продажи и выручка за дни без остатка. */
export function calcLostSales(input: { avgDaily: number; daysOut: number; price: number }) {
  const lost = Math.max(0, input.avgDaily) * Math.max(0, input.daysOut);
  return { units: round(lost, 1), revenue: round(lost * Math.max(0, input.price)) };
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

// Базовые тарифы доставки Wildberries — инструкция «Доставка: виды и расчёт стоимости» от 09.09.2026.
// Поменяются тарифы — обновить здесь, в примерах страницы /calculators/wildberries-logistics/ и в тестах.
const WB_TIERS_UP_TO_LITRE: [number, number][] = [
  [0.2, 23],
  [0.4, 26],
  [0.6, 29],
  [0.8, 30],
  [1, 32],
];
const WB_FIRST_LITRE = 46;
const WB_EXTRA_LITRE = 14;

/**
 * Логистика FBW для малогабаритного товара: прямая доставка — базовый тариф за объём × коэффициент склада,
 * обратная при отказе — только базовый тариф. На продажу: доставка за каждый заказ плюс возврат за каждый отказ.
 */
export function calcWbLogistics(input: { lengthCm: number; widthCm: number; heightCm: number; coefPct: number; buyoutPct: number }) {
  const volume = round((Math.max(0, input.lengthCm) * Math.max(0, input.widthCm) * Math.max(0, input.heightCm)) / 1000, 3);
  // Дополнительные литры тарифицируются дробно: 1,8 л = 46 + 0,8 × 14.
  const base =
    volume <= 0 ? 0 : volume <= 1 ? WB_TIERS_UP_TO_LITRE.find(([limit]) => volume <= limit)![1] : WB_FIRST_LITRE + WB_EXTRA_LITRE * (volume - 1);
  const direct = base * (Math.max(0, input.coefPct) / 100);
  const buyout = Math.min(100, Math.max(1, input.buyoutPct)) / 100;
  return {
    volume,
    base: round(base),
    direct: round(direct),
    reverse: round(base),
    perSale: round(direct / buyout + (base * (1 - buyout)) / buyout),
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
