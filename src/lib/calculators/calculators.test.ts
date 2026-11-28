// Самопроверка расчётов: pnpm test
import assert from 'node:assert/strict';
import {
  calcBreakEven,
  calcBreakEvenRevenue,
  calcCostPrice,
  calcMargin,
  calcMarginPair,
  calcRoi,
} from './economics.mjs';
import {
  calcLogisticsPerSale,
  calcLostSales,
  calcSafetyStock,
  calcTurnover,
  calcWbLogistics,
} from './inventory.ts';
import { calcAdCosts, calcDrr, calcFunnel } from './marketing.ts';

// Оборачиваемость: 300 / 600 × 30 = 15 дней, оборот дважды за период.
const turnover = calcTurnover({ avgStock: 300, sold: 600, periodDays: 30, leadTime: 12 });
assert.equal(turnover.days, 15);
assert.equal(turnover.times, 2);
assert.equal(turnover.enough, true, 'запаса на 15 дней хватает при поставке 12 дней');
assert.equal(calcTurnover({ avgStock: 300, sold: 600, periodDays: 30, leadTime: 20 }).enough, false);
assert.equal(calcTurnover({ avgStock: 300, sold: 0, periodDays: 30, leadTime: 10 }).enough, null);

// ДРР: 30 000 / 200 000 = 15%; при марже 25% остаётся 10 п.п.
const drr = calcDrr({ adCost: 30000, revenue: 200000, marginPct: 25 });
assert.equal(drr.drr, 15);
assert.equal(drr.remaining, 10);
assert.equal(drr.profitable, true);
const drrLoss = calcDrr({ adCost: 30000, revenue: 200000, marginPct: 14 });
assert.equal(drrLoss.remaining, -1);
assert.equal(drrLoss.profitable, false);
assert.equal(calcDrr({ adCost: 5000, revenue: 0, marginPct: 20 }).drr, 0);

// Безубыточность: 120 000 / 417 = 288 единиц (округление вверх — неполную единицу не продать).
const be = calcBreakEven({ fixedCosts: 120000, profitPerUnit: 417, price: 2000 });
assert.equal(be.units, 288);
assert.equal(be.revenue, 576000);
assert.equal(calcBreakEven({ fixedCosts: 120000, profitPerUnit: -50, price: 2000 }).units, null);
assert.equal(calcBreakEven({ fixedCosts: 120000, profitPerUnit: 0, price: 2000 }).units, null);

// Маржинальность 23% и наценка ≈66% на одном товаре
const pair = calcMarginPair({ price: 2000, profit: 460, cost: 700 });
assert.equal(pair.margin, 23);
assert.equal(pair.markup, 65.71);
assert.equal(calcMarginPair({ price: 0, profit: 0, cost: 0 }).markup, null, 'без себестоимости наценки нет');

// Логистика 100 ₽ при выкупе 70% превращается в 142,86 ₽ на проданную единицу.
const logi = calcLogisticsPerSale({ logistics: 100, buyoutPct: 70 });
assert.equal(logi.perSale, 142.86);
assert.equal(logi.extra, 42.86);
assert.equal(calcLogisticsPerSale({ logistics: 100, buyoutPct: 100 }).extra, 0, 'при полном выкупе доплаты нет');

// Себестоимость партии
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

// Калькулятор маржинальности
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
assert.equal(calcMargin({ price: 0, cost: 900, feesPct: 20, extra: 60, targetPct: 32 }).targetPrice, 2000);

// Брак 2%
const costPrice = calcCostPrice({ purchase: 350000, delivery: 25000, packaging: 15000, other: 0, units: 500, defectPct: 2 });
assert.equal(costPrice.sellable, 490);
assert.equal(costPrice.perUnit, 795.92);
assert.equal(costPrice.purchasePerUnit, 700);
assert.equal(costPrice.upliftPct, 13.7);
assert.equal(calcCostPrice({ purchase: 0, delivery: 100, packaging: 0, units: 10 }).upliftPct, null, 'без закупки сравнивать не с чем');
assert.equal(calcCostPrice({ purchase: 1000, delivery: 0, packaging: 0, units: 3, defectPct: 99 }).sellable, 1, 'хотя бы одна единица');

// ROI с расходами и сроком
const roi = calcRoi({ profit: 650000, investment: 500000, costs: 40000, periodDays: 60 });
assert.equal(roi.net, 110000);
assert.equal(roi.roi, 22);
assert.equal(roi.monthly, 11);
assert.equal(calcRoi({ profit: 650000, investment: 500000 }).monthly, null, 'без срока пересчёта нет');
assert.equal(calcRoi({ profit: 400000, investment: 500000, costs: 0, periodDays: 30 }).roi, -20);

// Страховой запас
const stock = calcSafetyStock({ avgDaily: 20, maxDaily: 32, leadTime: 12, maxLeadTime: 16 });
assert.equal(stock.safety, 272);
assert.equal(stock.reorderPoint, 512);
assert.deepEqual(calcSafetyStock({ avgDaily: 20, maxDaily: 32, leadTime: 12 }), { safety: 144, reorderPoint: 384 });
assert.equal(calcSafetyStock({ avgDaily: 20, maxDaily: 10, leadTime: 12 }).safety, 0, 'максимум ниже среднего не даёт отрицательный запас');
assert.equal(calcSafetyStock({ avgDaily: 2.5, maxDaily: 4, leadTime: 3 }).reorderPoint, 13, '7,5 + 4,5 — округляем вверх до штук');

// Точка безубыточности в рублях, CPM/CPC/CPO и упущенная выручка
assert.equal(calcBreakEvenRevenue({ fixedCosts: 120000, contributionPct: 20 }).revenue, 600000);
assert.equal(calcBreakEvenRevenue({ fixedCosts: 120000, contributionPct: 30 }).revenue, 400000);
assert.equal(calcBreakEvenRevenue({ fixedCosts: 120000, contributionPct: 0 }).revenue, null, 'без маржинального дохода точки нет');

assert.deepEqual(calcAdCosts({ adCost: 30000, clicks: 4000, orders: 150 }), { cpc: 7.5, cpo: 200, conversion: 3.75 });
assert.deepEqual(calcAdCosts({ adCost: 5000, clicks: 0, orders: 0 }), { cpc: null, cpo: null, conversion: 0 }, 'без кликов и заказов делить не на что');

assert.deepEqual(calcLostSales({ avgDaily: 15, daysOut: 10, price: 2000 }), { units: 150, revenue: 300000 });
assert.deepEqual(calcLostSales({ avgDaily: 2.5, daysOut: 3, price: 1000 }), { units: 7.5, revenue: 7500 });

// Логистика WB
const wbSmall = calcWbLogistics({ lengthCm: 10, widthCm: 11, heightCm: 5, coefPct: 170, buyoutPct: 100 });
assert.equal(wbSmall.volume, 0.55);
assert.equal(wbSmall.base, 29);
assert.equal(wbSmall.direct, 49.3);
assert.equal(wbSmall.perSale, 49.3, 'при полном выкупе возвратов нет');

const wb = calcWbLogistics({ lengthCm: 20, widthCm: 15, heightCm: 6, coefPct: 170, buyoutPct: 80 });
assert.deepEqual(wb, { volume: 1.8, base: 57.2, direct: 97.24, reverse: 57.2, perSale: 135.85 });

assert.equal(calcWbLogistics({ lengthCm: 10, widthCm: 10, heightCm: 10, coefPct: 100, buyoutPct: 100 }).base, 32);
assert.equal(calcWbLogistics({ lengthCm: 10, widthCm: 10, heightCm: 2, coefPct: 100, buyoutPct: 100 }).base, 23);
assert.equal(calcWbLogistics({ lengthCm: 0, widthCm: 10, heightCm: 10, coefPct: 170, buyoutPct: 80 }).perSale, 0, 'без габаритов доставки нет');

console.log('calculators: ok');
