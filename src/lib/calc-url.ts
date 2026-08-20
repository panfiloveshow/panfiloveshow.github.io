// Состояние калькулятора живёт в адресной строке: расчётом можно поделиться ссылкой
// и передать результат в соседний калькулятор, а не переписывать числа руками.

export function readCalcParams(defaults: Record<string, number>): Record<string, number> {
  if (typeof window === 'undefined') return defaults;

  const params = new URLSearchParams(window.location.search);
  const values = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const raw = params.get(key);
    if (raw === null) continue;
    const parsed = Number(raw.replace(',', '.'));
    // Мусор в адресе не должен ломать расчёт — молча оставляем значение по умолчанию.
    if (Number.isFinite(parsed)) values[key] = parsed;
  }
  return values;
}

export function writeCalcParams(values: Record<string, number>, defaults: Record<string, number>): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    // В ссылке оставляем только изменённые поля, иначе адрес превращается в простыню.
    if (value !== defaults[key]) params.set(key, String(value));
  }
  const query = params.toString();
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

export function buildCalcLink(path: string, values: Record<string, number>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) params.set(key, String(value));
  return `${path}?${params.toString()}`;
}
