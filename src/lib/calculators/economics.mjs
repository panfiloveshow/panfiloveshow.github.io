// Единые финансовые расчёты для клиентских калькуляторов, WebMCP и MCP-сервера.
// Чистый ESM без зависимостей — запускается и в браузере (Vite), и в Node 20+ напрямую.

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Юнит-экономика одной единицы товара с учётом выкупа, возвратной логистики и доли рекламы. */
export function calcUnitEconomics(input) {
  const price = Math.max(0, input.price);
  const cost = Math.max(0, input.cost);
  const buyout = Math.min(100, Math.max(1, input.buyoutPct)) / 100;
  const baseLogistics = Math.max(0, input.logistics);
  const returnLogistics = Math.max(0, input.returnLogistics ?? 0);

  const commissionRaw = price * (Math.max(0, input.commissionPct) / 100);
  const logisticsRaw = baseLogistics / buyout + (returnLogistics * (1 - buyout)) / buyout;
  const adsRaw = Math.max(0, input.ads) + price * (Math.max(0, input.adsPct ?? 0) / 100);
  const taxRaw = price * (Math.max(0, input.taxPct) / 100);
  const expensesRaw =
    commissionRaw +
    logisticsRaw +
    taxRaw +
    cost +
    Math.max(0, input.storage) +
    adsRaw +
    Math.max(0, input.other);
  const profitRaw = price - expensesRaw;

  return {
    commission: round(commissionRaw),
    logistics: round(logisticsRaw),
    adsCost: round(adsRaw),
    tax: round(taxRaw),
    expenses: round(expensesRaw),
    profit: round(profitRaw),
    margin: price > 0 ? round((profitRaw / price) * 100) : 0,
    markup: cost > 0 ? round((profitRaw / cost) * 100) : null,
  };
}

/** Маржинальность и наценка по цене и прибыли — для мини-расчёта в глоссарии. */
export function calcMarginPair(input) {
  const price = Math.max(0, input.price);
  const cost = Math.max(0, input.cost);
  return {
    margin: price === 0 ? 0 : round((input.profit / price) * 100),
    markup: cost === 0 ? null : round((input.profit / cost) * 100),
  };
}

/**
 * Маржинальность и наценка с удержаниями площадки. Процентные удержания (комиссия, эквайринг,
 * налог) растут вместе с ценой, поэтому цену под нужную маржинальность считаем от доли цены,
 * которая остаётся продавцу, а не прибавляем маржу к расходам.
 */
export function calcMargin(input) {
  const price = Math.max(0, input.price);
  const cost = Math.max(0, input.cost);
  const fees = Math.max(0, input.feesPct) / 100;
  const extra = Math.max(0, input.extra);
  const profit = round(price * (1 - fees) - cost - extra);
  const net = calcMarginPair({ price, profit, cost });
  const gross = calcMarginPair({ price, profit: price - cost, cost });
  const priceFor = (share) => (share > 0 ? Math.ceil(round((cost + extra) / share, 4)) : null);
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

/** Себестоимость единицы из затрат на партию. Брак и потери уменьшают число единиц, на которые делятся затраты. */
export function calcCostPrice(input) {
  const units = Math.max(1, input.units);
  const defect = Math.min(99, Math.max(0, input.defectPct ?? 0));
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
 * monthly — простой пересчёт на 30 дней без реинвестирования.
 */
export function calcRoi(input) {
  const investment = Math.max(0, input.investment);
  if (investment === 0) return { roi: 0, net: 0, monthly: null };
  const net = round(input.profit - investment - Math.max(0, input.costs ?? 0));
  const roi = round((net / investment) * 100);
  const days = Math.max(0, input.periodDays ?? 0);
  return { roi, net, monthly: days > 0 ? round((roi * 30) / days) : null };
}

/** Точка безубыточности: сколько единиц нужно продать, чтобы покрыть постоянные расходы. */
export function calcBreakEven(input) {
  const fixedCosts = Math.max(0, input.fixedCosts);
  const profitPerUnit = input.profitPerUnit;
  if (profitPerUnit <= 0) return { units: null, revenue: null };
  const units = Math.ceil(fixedCosts / profitPerUnit);
  return { units, revenue: round(units * Math.max(0, input.price), 0) };
}

/** Безубыточная выручка магазина: постоянные расходы / доля маржинального дохода в выручке. */
export function calcBreakEvenRevenue(input) {
  const share = input.contributionPct / 100;
  return { revenue: share > 0 ? Math.ceil(round(Math.max(0, input.fixedCosts) / share, 4)) : null };
}
