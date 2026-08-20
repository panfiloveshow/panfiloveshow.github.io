// Самопроверка расчётов: pnpm test
import assert from 'node:assert/strict';
import { calcBreakEven, calcDrr, calcTurnover } from './calculators.ts';

// Оборачиваемость: 300 / 600 × 30 = 15 дней, оборот дважды за период.
const turnover = calcTurnover({ avgStock: 300, sold: 600, periodDays: 30, leadTime: 12 });
assert.equal(turnover.days, 15);
assert.equal(turnover.times, 2);
assert.equal(turnover.enough, true, 'запаса на 15 дней хватает при поставке 12 дней');

// При сроке поставки 20 дней того же запаса уже не хватает.
assert.equal(calcTurnover({ avgStock: 300, sold: 600, periodDays: 30, leadTime: 20 }).enough, false);

// Без продаж оборачиваемость не определена, а не равна нулю дней «в плюс».
assert.equal(calcTurnover({ avgStock: 300, sold: 0, periodDays: 30, leadTime: 10 }).enough, null);

// ДРР: 30 000 / 200 000 = 15%; при марже 25% остаётся 10 п.п.
const drr = calcDrr({ adCost: 30000, revenue: 200000, marginPct: 25 });
assert.equal(drr.drr, 15);
assert.equal(drr.remaining, 10);
assert.equal(drr.profitable, true);

// Тот же ДРР при марже 14% уводит товар в минус.
const drrLoss = calcDrr({ adCost: 30000, revenue: 200000, marginPct: 14 });
assert.equal(drrLoss.remaining, -1);
assert.equal(drrLoss.profitable, false);

// Нулевая выручка не должна давать деление на ноль.
assert.equal(calcDrr({ adCost: 5000, revenue: 0, marginPct: 20 }).drr, 0);

// Безубыточность: 120 000 / 417 = 288 единиц (округление вверх — неполную единицу не продать).
const be = calcBreakEven({ fixedCosts: 120000, profitPerUnit: 417, price: 2000 });
assert.equal(be.units, 288);
assert.equal(be.revenue, 576000);

// Убыточный товар точки безубыточности не имеет.
assert.equal(calcBreakEven({ fixedCosts: 120000, profitPerUnit: -50, price: 2000 }).units, null);
assert.equal(calcBreakEven({ fixedCosts: 120000, profitPerUnit: 0, price: 2000 }).units, null);

// Мини-расчёты глоссария
import { calcCostPrice, calcFunnel, calcLogisticsPerSale, calcMarginPair, calcRoi } from './calculators.ts';

// Маржинальность 23% и наценка ≈66% на одном товаре — числа из примера на странице.
const pair = calcMarginPair({ price: 2000, profit: 460, cost: 700 });
assert.equal(pair.margin, 23);
assert.equal(pair.markup, 65.71);
assert.equal(calcMarginPair({ price: 0, profit: 0, cost: 0 }).markup, null, 'без себестоимости наценки нет');

// Логистика 100 ₽ при выкупе 70% превращается в 142,86 ₽ на проданную единицу.
const logi = calcLogisticsPerSale({ logistics: 100, buyoutPct: 70 });
assert.equal(logi.perSale, 142.86);
assert.equal(logi.extra, 42.86);
assert.equal(calcLogisticsPerSale({ logistics: 100, buyoutPct: 100 }).extra, 0, 'при полном выкупе доплаты нет');

// Себестоимость партии: 390 000 / 500 = 780 ₽ за единицу.
assert.equal(calcCostPrice({ purchase: 350000, delivery: 25000, packaging: 15000, units: 500 }).perUnit, 780);
assert.equal(calcCostPrice({ purchase: 1000, delivery: 0, packaging: 0, units: 0 }).perUnit, 1000, 'ноль штук не делит на ноль');

// ROI 30% при вложениях 500 000 и прибыли 650 000.
assert.equal(calcRoi({ profit: 650000, investment: 500000 }).roi, 30);
assert.equal(calcRoi({ profit: 100, investment: 0 }).roi, 0, 'без вложений ROI не считается');

// Воронка: CTR 4%, конверсия 6%.
const funnel = calcFunnel({ impressions: 10000, visits: 400, orders: 24 });
assert.equal(funnel.ctr, 4);
assert.equal(funnel.conversion, 6);
assert.equal(calcFunnel({ impressions: 0, visits: 0, orders: 0 }).ctr, 0);

console.log('calculators: ok');
