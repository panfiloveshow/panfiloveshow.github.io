// Расчёты рекламы и воронки карточки: ДРР, CPC/CPO, CTR и конверсия.

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** ДРР кампании и остаток маржинальности после рекламы. */
export function calcDrr(input: { adCost: number; revenue: number; marginPct: number }) {
  const adCost = Math.max(0, input.adCost);
  const revenue = Math.max(0, input.revenue);
  const marginPct = Math.max(0, input.marginPct);

  const drr = revenue === 0 ? 0 : round((adCost / revenue) * 100);
  const remaining = round(marginPct - drr);
  return { drr, remaining, profitable: revenue > 0 && remaining > 0 };
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

/** Конверсия карточки и CTR по воронке показов. */
export function calcFunnel(input: { impressions: number; visits: number; orders: number }) {
  const impressions = Math.max(0, input.impressions);
  const visits = Math.max(0, input.visits);
  return {
    ctr: impressions === 0 ? 0 : round((visits / impressions) * 100),
    conversion: visits === 0 ? 0 : round((Math.max(0, input.orders) / visits) * 100),
  };
}
