// Самопроверка ABC- и XYZ-анализа: pnpm test
import assert from 'node:assert/strict';
import { abcXyzMatrix, analyzeAbcXyz, parseSales } from './abc-xyz.ts';

// Разбор: табуляция из Excel, точка с запятой, пробелы; заголовок и строки без чисел пропускаются.
const parsed = parseSales(
  [
    'Товар\tЯнварь\tФевраль',
    'Органайзер модульный\t1 200\t1 350,5',
    'Набор контейнеров;800;;900',
    'Кружка 350 мл 40 50 60',
    'просто подпись',
    '',
  ].join('\n'),
);
assert.equal(parsed.skipped, 2, 'заголовок и подпись без чисел');
assert.deepEqual(parsed.rows, [
  { name: 'Органайзер модульный', values: [1200, 1350.5] },
  { name: 'Набор контейнеров', values: [800, null, 900] },
  { name: 'Кружка 350 мл', values: [40, 50, 60] },
]);

// XYZ на рядах со страницы глоссария: среднее у всех 100, вариация 6,5%, 21,6% и 61,9%.
const xyz = analyzeAbcXyz([
  { name: 'Ровный', values: [100, 110, 90, 105, 95, 100] },
  { name: 'С колебаниями', values: [80, 120, 90, 110, 70, 130] },
  { name: 'Непредсказуемый', values: [40, 150, 60, 200, 30, 120] },
]);
assert.deepEqual(
  xyz.items.map((item) => [item.name, item.cv, item.xyz]),
  [
    ['Ровный', 6.5, 'X'],
    ['С колебаниями', 21.6, 'Y'],
    ['Непредсказуемый', 61.9, 'Z'],
  ],
);

// ABC: доли 50, 25, 10, 8, 4, 2, 1%. Третий товар пересекает 80% и остаётся в A, пятый пересекает 95% — в B.
const abc = analyzeAbcXyz([500, 250, 100, 80, 40, 20, 10].map((total, index) => ({ name: `Товар ${index + 1}`, values: [total] })));
assert.equal(abc.items.map((item) => item.abc).join(''), 'AAABBCC');
assert.deepEqual(
  abc.items.map((item) => item.cumShare),
  [50, 75, 85, 93, 97, 99, 100],
);
assert.equal(abc.items[0].xyz, null, 'один период — вариацию не посчитать');

// Пустая ячейка — месяц без остатка: в вариацию не идёт, поэтому стабильный товар остаётся в X.
const gap = analyzeAbcXyz([{ name: 'Был дефицит', values: [100, null, 100, 100, null, 100] }]).items[0];
assert.equal(gap.periods, 4);
assert.equal(gap.cv, 0);
assert.equal(gap.xyz, 'X');
// Тот же товар с нулями вместо пустых ячеек выглядит непредсказуемым — ради этого и нужна пустая ячейка.
assert.equal(analyzeAbcXyz([{ name: 'Нули', values: [100, 0, 100, 100, 0, 100] }]).items[0].xyz, 'Z');

// Товар без продаж уходит в C; число периодов — по самой длинной строке.
const withZero = analyzeAbcXyz([
  { name: 'Продаётся', values: [10, 12, 11] },
  { name: 'Стоит', values: [0, 0] },
]);
assert.deepEqual(withZero.items.map((item) => [item.abc, item.xyz]), [['A', 'X'], ['C', null]]);
assert.equal(withZero.periods, 3);

// Матрица: число товаров и доля продаж в клетке.
const matrix = abcXyzMatrix(xyz.items);
assert.deepEqual(matrix.AX, { count: 1, share: 33.3 });
assert.equal(Object.values(matrix).reduce((sum, cell) => sum + cell.count, 0), 3);

console.log('abc-xyz: ok');
