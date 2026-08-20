// Самопроверка расчёта: node --experimental-strip-types src/lib/unit-economics.test.ts
import assert from 'node:assert/strict';
import { calcUnitEconomics } from './unit-economics.ts';

const base = {
  price: 2000,
  cost: 700,
  commissionPct: 20,
  logistics: 100,
  storage: 20,
  ads: 150,
  other: 30,
  buyoutPct: 100,
  taxPct: 7,
};

// 2000 − (400 комиссия + 100 логистика + 140 налог + 700 себестоимость + 20 + 150 + 30) = 460
const full = calcUnitEconomics(base);
assert.equal(full.commission, 400);
assert.equal(full.tax, 140);
assert.equal(full.logistics, 100);
assert.equal(full.profit, 460);
assert.equal(full.margin, 23);
assert.equal(full.markup, round(460 / 700));

// Выкуп 50% удваивает логистику на выкупленную единицу: 100 → 200, прибыль падает на 100.
const halfBuyout = calcUnitEconomics({ ...base, buyoutPct: 50 });
assert.equal(halfBuyout.logistics, 200);
assert.equal(halfBuyout.profit, 360);

// Убыточный товар должен показывать отрицательную прибыль, а не ноль.
const loss = calcUnitEconomics({ ...base, price: 900 });
assert.ok(loss.profit < 0, 'дешёвая цена должна давать убыток');

// Нулевая цена не должна ломать проценты делением на ноль.
const empty = calcUnitEconomics({ ...base, price: 0, cost: 0 });
assert.equal(empty.margin, 0);
assert.equal(empty.markup, null);

// Отрицательные значения на входе не должны превращаться в «доход».
const negative = calcUnitEconomics({ ...base, ads: -1000 });
assert.equal(negative.profit, full.profit + base.ads);

function round(ratio: number) {
  return Math.round(ratio * 100 * 100) / 100;
}

console.log('unit-economics: ok');
