// Самопроверка разбора адреса: pnpm test
import assert from 'node:assert/strict';
import { buildCalcLink, readCalcParams } from './url.ts';

const defaults = { price: 2000, cost: 700 };

assert.deepEqual(readCalcParams(defaults), defaults);

const link = buildCalcLink('/calculators/break-even/', { profitPerUnit: 417.14, price: 2000 });
assert.equal(link, '/calculators/break-even/?profitPerUnit=417.14&price=2000');

globalThis.window = {
  location: { search: '?price=1500&cost=abc', pathname: '/calculators/unit-economics/' },
  history: { replaceState: () => {} },
} as never;

const parsed = readCalcParams(defaults);
assert.equal(parsed.price, 1500, 'число из адреса подхватывается');
assert.equal(parsed.cost, 700, 'нечисловое значение не ломает расчёт');

console.log('calc-url: ok');
