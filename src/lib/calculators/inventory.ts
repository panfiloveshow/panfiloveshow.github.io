// Расчёты запасов, оборачиваемости и логистики маркетплейсов.

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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

/** Оборачиваемость запаса: за сколько дней продаётся средний остаток. */
export function calcTurnover(input: { avgStock: number; sold: number; periodDays: number; leadTime: number }) {
  const avgStock = Math.max(0, input.avgStock);
  const sold = Math.max(0, input.sold);
  const periodDays = Math.max(1, input.periodDays);
  const leadTime = Math.max(0, input.leadTime);

  if (sold === 0) return { days: 0, times: 0, enough: null as boolean | null };

  const days = round((avgStock / sold) * periodDays);
  return {
    days,
    times: round(sold / Math.max(avgStock, 0.0001)),
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
  const safety = Math.ceil(round(maxDaily * maxLeadTime - avgDaily * leadTime, 4));
  return { safety, reorderPoint: Math.ceil(round(avgDaily * leadTime, 4)) + safety };
}

/**
 * Логистика FBW для малогабаритного товара: прямая доставка — базовый тариф за объём × коэффициент склада,
 * обратная при отказе — только базовый тариф.
 */
export function calcWbLogistics(input: { lengthCm: number; widthCm: number; heightCm: number; coefPct: number; buyoutPct: number }) {
  const volume = round((Math.max(0, input.lengthCm) * Math.max(0, input.widthCm) * Math.max(0, input.heightCm)) / 1000, 3);
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

/** Упущенные продажи и выручка за дни без остатка. */
export function calcLostSales(input: { avgDaily: number; daysOut: number; price: number }) {
  const lost = Math.max(0, input.avgDaily) * Math.max(0, input.daysOut);
  return { units: round(lost, 1), revenue: round(lost * Math.max(0, input.price)) };
}
