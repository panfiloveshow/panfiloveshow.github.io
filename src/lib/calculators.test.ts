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

// Калькуляторы маржинальности, себестоимости и ROI — числа из примеров на их страницах
import { calcMargin } from './calculators.ts';

// 2000 × (1 − 27%) − 700 − 300 = 460 ₽: те же 23% и ≈66%, что в глоссарии.
const margin = calcMargin({ price: 2000, cost: 700, feesPct: 27, extra: 300, targetPct: 25 });
assert.equal(margin.profit, 460);
assert.equal(margin.margin, 23);
assert.equal(margin.markup, 65.71);
assert.equal(margin.grossMargin, 65);
assert.equal(margin.grossMarkup, 185.71);
assert.equal(margin.minPrice, 1370, '1000 / 0,73 = 1369,86 — округляем вверх до рубля');
assert.equal(margin.targetPrice, 2084, '1000 / (1 − 0,27 − 0,25) = 2083,33');
assert.ok(calcMargin({ price: 2084, cost: 700, feesPct: 27, extra: 300, targetPct: 25 }).margin >= 25);
assert.equal(calcMargin({ price: 2000, cost: 700, feesPct: 60, extra: 300, targetPct: 40 }).targetPrice, null, 'удержания и цель съедают всю цену');
assert.equal(calcMargin({ price: 2000, cost: 700, feesPct: 60, extra: 300, targetPct: 40 }).minPrice, 2500);
// Ровное деление не должно уводить цену на рубль вверх из-за плавающей точки.
assert.equal(calcMargin({ price: 0, cost: 900, feesPct: 20, extra: 60, targetPct: 32 }).targetPrice, 2000);

// Брак 2%: 390 000 ₽ делятся на 490 единиц, а не на 500.
const costPrice = calcCostPrice({ purchase: 350000, delivery: 25000, packaging: 15000, other: 0, units: 500, defectPct: 2 });
assert.equal(costPrice.sellable, 490);
assert.equal(costPrice.perUnit, 795.92);
assert.equal(costPrice.purchasePerUnit, 700);
assert.equal(costPrice.upliftPct, 13.7);
assert.equal(calcCostPrice({ purchase: 0, delivery: 100, packaging: 0, units: 10 }).upliftPct, null, 'без закупки сравнивать не с чем');
assert.equal(calcCostPrice({ purchase: 1000, delivery: 0, packaging: 0, units: 3, defectPct: 99 }).sellable, 1, 'хотя бы одна единица');

// ROI: 650 000 − 500 000 − 40 000 = 110 000 ₽, это 22% за 60 дней и 11% в пересчёте на 30.
const roi = calcRoi({ profit: 650000, investment: 500000, costs: 40000, periodDays: 60 });
assert.equal(roi.net, 110000);
assert.equal(roi.roi, 22);
assert.equal(roi.monthly, 11);
assert.equal(calcRoi({ profit: 650000, investment: 500000 }).monthly, null, 'без срока пересчёта нет');
assert.equal(calcRoi({ profit: 400000, investment: 500000, costs: 0, periodDays: 30 }).roi, -20);

// Страховой запас — пример со страницы глоссария: 32 × 16 − 20 × 12 = 272, точка заказа 512.
import { calcSafetyStock } from './calculators.ts';

const stock = calcSafetyStock({ avgDaily: 20, maxDaily: 32, leadTime: 12, maxLeadTime: 16 });
assert.equal(stock.safety, 272);
assert.equal(stock.reorderPoint, 512);
// Мини-расчёт: срок постоянный, запас покрывает только всплеск продаж — (32 − 20) × 12.
assert.deepEqual(calcSafetyStock({ avgDaily: 20, maxDaily: 32, leadTime: 12 }), { safety: 144, reorderPoint: 384 });
assert.equal(calcSafetyStock({ avgDaily: 20, maxDaily: 10, leadTime: 12 }).safety, 0, 'максимум ниже среднего не даёт отрицательный запас');
assert.equal(calcSafetyStock({ avgDaily: 2.5, maxDaily: 4, leadTime: 3 }).reorderPoint, 13, '7,5 + 4,5 — округляем вверх до штук');

console.log('calculators: ok');
