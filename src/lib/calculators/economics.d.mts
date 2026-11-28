export type UnitEconomicsInput = {
  /** Цена продажи за единицу, ₽ */
  price: number;
  /** Себестоимость товара, ₽ */
  cost: number;
  /** Комиссия площадки, % от цены */
  commissionPct: number;
  /** Логистика за одну доставку, ₽ */
  logistics: number;
  /** Обратная логистика при отказе, ₽ */
  returnLogistics?: number;
  /** Хранение на единицу, ₽ */
  storage: number;
  /** Реклама на единицу, ₽ */
  ads: number;
  /** Реклама, % от цены */
  adsPct?: number;
  /** Прочие расходы на единицу, ₽ */
  other: number;
  /** Процент выкупа, % */
  buyoutPct: number;
  /** Налог, % от цены (УСН «доходы») */
  taxPct: number;
};

export function calcUnitEconomics(input: UnitEconomicsInput): {
  commission: number;
  logistics: number;
  adsCost: number;
  tax: number;
  expenses: number;
  profit: number;
  margin: number;
  markup: number | null;
};

export function calcMarginPair(input: { price: number; profit: number; cost: number }): {
  margin: number;
  markup: number | null;
};

export function calcMargin(input: {
  price: number;
  cost: number;
  feesPct: number;
  extra: number;
  targetPct: number;
}): {
  profit: number;
  margin: number;
  markup: number | null;
  grossMargin: number;
  grossMarkup: number | null;
  minPrice: number | null;
  targetPrice: number | null;
};

export function calcCostPrice(input: {
  purchase: number;
  delivery: number;
  packaging: number;
  units: number;
  other?: number;
  defectPct?: number;
}): {
  perUnit: number;
  total: number;
  sellable: number;
  purchasePerUnit: number;
  upliftPct: number | null;
};

export function calcRoi(input: {
  profit: number;
  investment: number;
  costs?: number;
  periodDays?: number;
}): {
  roi: number;
  net: number;
  monthly: number | null;
};

export function calcBreakEven(input: {
  fixedCosts: number;
  profitPerUnit: number;
  price: number;
}): {
  units: number | null;
  revenue: number | null;
};

export function calcBreakEvenRevenue(input: {
  fixedCosts: number;
  contributionPct: number;
}): {
  revenue: number | null;
};
