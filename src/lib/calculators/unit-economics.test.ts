// Самопроверка расчёта юнит-экономики: pnpm test
import assert from 'node:assert/strict';
import { calcUnitEconomics } from './economics.mjs';

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

const full = calcUnitEconomics(base);
assert.equal(full.commission, 400);
assert.equal(full.tax, 140);
assert.equal(full.logistics, 100);
assert.equal(full.profit, 460);
assert.equal(full.margin, 23);
assert.equal(full.markup, round(460 / 700));

const halfBuyout = calcUnitEconomics({ ...base, buyoutPct: 50 });
assert.equal(halfBuyout.logistics, 200);
assert.equal(halfBuyout.profit, 360);

const withReturn = calcUnitEconomics({ ...base, buyoutPct: 80, returnLogistics: 50, adsPct: 5 });
assert.equal(withReturn.logistics, 137.5);
assert.equal(withReturn.adsCost, 250);

const loss = calcUnitEconomics({ ...base, price: 900 });
assert.ok(loss.profit < 0, 'дешёвая цена должна давать убыток');

const empty = calcUnitEconomics({ ...base, price: 0, cost: 0 });
assert.equal(empty.margin, 0);
assert.equal(empty.markup, null);

const negative = calcUnitEconomics({ ...base, ads: -1000 });
assert.equal(negative.profit, full.profit + base.ads);

function round(ratio: number) {
  return Math.round(ratio * 100 * 100) / 100;
}

console.log('unit-economics: ok');
