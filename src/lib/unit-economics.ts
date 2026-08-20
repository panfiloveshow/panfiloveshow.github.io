export type UnitEconomicsInput = {
  /** Цена продажи за единицу, ₽ */
  price: number;
  /** Себестоимость товара, ₽ */
  cost: number;
  /** Комиссия площадки, % от цены */
  commissionPct: number;
  /** Логистика за одну доставку, ₽ */
  logistics: number;
  /** Хранение на единицу, ₽ */
  storage: number;
  /** Реклама на единицу, ₽ */
  ads: number;
  /** Прочие расходы на единицу, ₽ */
  other: number;
  /** Процент выкупа, % — доставки, которые не выкупили, тоже стоят логистики */
  buyoutPct: number;
  /** Налог, % от цены (УСН «доходы») */
  taxPct: number;
};

export type UnitEconomicsResult = {
  commission: number;
  logistics: number;
  tax: number;
  expenses: number;
  profit: number;
  /** Маржинальность: прибыль к цене продажи, % */
  margin: number;
  /** Наценка: прибыль к себестоимости, % (null, если себестоимость не задана) */
  markup: number | null;
};

const round = (value: number) => Math.round(value * 100) / 100;

export function calcUnitEconomics(input: UnitEconomicsInput): UnitEconomicsResult {
  const price = Math.max(0, input.price);
  const cost = Math.max(0, input.cost);
  // Выкуп ниже 100% означает, что на каждый выкупленный товар приходится больше одной доставки.
  const buyout = Math.min(100, Math.max(1, input.buyoutPct)) / 100;

  const commission = price * (Math.max(0, input.commissionPct) / 100);
  const logistics = Math.max(0, input.logistics) / buyout;
  const tax = price * (Math.max(0, input.taxPct) / 100);
  const expenses =
    commission + logistics + tax + cost + Math.max(0, input.storage) + Math.max(0, input.ads) + Math.max(0, input.other);
  const profit = price - expenses;

  return {
    commission: round(commission),
    logistics: round(logistics),
    tax: round(tax),
    expenses: round(expenses),
    profit: round(profit),
    margin: price > 0 ? round((profit / price) * 100) : 0,
    markup: cost > 0 ? round((profit / cost) * 100) : null,
  };
}
