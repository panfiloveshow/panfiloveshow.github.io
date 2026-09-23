// ABC- и XYZ-анализ для калькулятора: разбор вставленной таблицы и группы товаров.
// Чистые функции без React — их проверяет src/lib/abc-xyz.test.ts (pnpm test).

export type SalesRow = { name: string; values: (number | null)[] };
export type AbcGroup = 'A' | 'B' | 'C';
export type XyzGroup = 'X' | 'Y' | 'Z';
export type AnalyzedItem = {
  name: string;
  total: number;
  share: number;
  cumShare: number;
  abc: AbcGroup;
  periods: number;
  cv: number | null;
  xyz: XyzGroup | null;
};

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/** Число из ячейки: пробелы-разделители тысяч и десятичная запятая допустимы. Пустая ячейка — null, не число — undefined. */
function parseCell(cell: string): number | null | undefined {
  const text = cell.replace(/\s/g, '').replace(',', '.');
  if (text === '') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Таблица, скопированная из Excel или Google Таблиц: первый столбец — товар, дальше продажи по периодам.
 * Столбцы разделены табуляцией или точкой с запятой; если разделителей нет, числа в конце строки — продажи,
 * всё до них — название. Строки без чисел (заголовки, подписи) пропускаются.
 */
export function parseSales(text: string): { rows: SalesRow[]; skipped: number } {
  const rows: SalesRow[] = [];
  let skipped = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let name: string;
    let cells: string[];
    if (/[\t;]/.test(line)) {
      [name, ...cells] = line.split(/\t|;/);
    } else {
      const tokens = line.split(/\s+/);
      let start = tokens.length;
      while (start > 0 && parseCell(tokens[start - 1]) !== undefined) start -= 1;
      name = tokens.slice(0, start).join(' ');
      cells = tokens.slice(start);
    }
    const values = cells.map(parseCell);
    if (!name.trim() || !values.some((value) => typeof value === 'number') || values.includes(undefined)) {
      skipped += 1;
      continue;
    }
    rows.push({ name: name.trim(), values: values as (number | null)[] });
  }
  return { rows, skipped };
}

/**
 * ABC — по сумме продаж: товар, на котором накопленная доля переходит границу, остаётся в старшей группе,
 * поэтому A покрывает не меньше 80% суммы, B — до 95%. XYZ — коэффициент вариации по заполненным периодам,
 * стандартное отклонение по генеральной совокупности, как СТАНДОТКЛОН.Г в Excel.
 */
export function analyzeAbcXyz(rows: SalesRow[]): { items: AnalyzedItem[]; total: number; periods: number } {
  const base = rows.map((row) => {
    // Пустая ячейка — период без остатка: в сумму не добавляет ничего, из вариации исключается.
    const present = row.values.filter((value): value is number => value !== null).map((value) => Math.max(0, value));
    const total = present.reduce((sum, value) => sum + value, 0);
    const mean = present.length ? total / present.length : 0;
    const sd = present.length ? Math.sqrt(present.reduce((sum, value) => sum + (value - mean) ** 2, 0) / present.length) : 0;
    return { name: row.name, total, periods: present.length, cv: present.length >= 2 && mean > 0 ? round((sd / mean) * 100) : null };
  });
  const total = base.reduce((sum, item) => sum + item.total, 0);
  let before = 0;
  const items = [...base]
    .sort((a, b) => b.total - a.total)
    .map((item): AnalyzedItem => {
      const share = total > 0 ? (item.total / total) * 100 : 0;
      const abc: AbcGroup = before < 80 ? 'A' : before < 95 ? 'B' : 'C';
      before += share;
      const { cv } = item;
      return {
        name: item.name,
        total: item.total,
        share: round(share),
        cumShare: round(before),
        abc,
        periods: item.periods,
        cv,
        xyz: cv === null ? null : cv <= 10 ? 'X' : cv <= 25 ? 'Y' : 'Z',
      };
    });
  return { items, total, periods: rows.reduce((max, row) => Math.max(max, row.values.length), 0) };
}

/** Число товаров и их доля в сумме продаж в каждой из девяти клеток матрицы ABC-XYZ. */
export function abcXyzMatrix(items: AnalyzedItem[]) {
  const cells: Record<string, { count: number; share: number }> = {};
  for (const abc of ['A', 'B', 'C']) for (const xyz of ['X', 'Y', 'Z']) cells[abc + xyz] = { count: 0, share: 0 };
  for (const item of items) {
    if (!item.xyz) continue;
    const cell = cells[item.abc + item.xyz];
    cell.count += 1;
    cell.share = round(cell.share + item.share);
  }
  return cells;
}
