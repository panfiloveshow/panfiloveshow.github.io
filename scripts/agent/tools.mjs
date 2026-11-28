import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { calcMargin, calcUnitEconomics } from '../../src/lib/calculators/economics.mjs';

export const MCP_PROTOCOL_VERSION = '2025-06-18';

const PRICING_CATALOG = JSON.parse(
  readFileSync(new URL('../../src/content/pricing.json', import.meta.url), 'utf8'),
);

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export const MCP_TOOLS = [
  {
    name: 'sellico_search_pages',
    title: 'Поиск публичных страниц Sellico',
    description:
      'Ищет канонические публичные страницы Sellico (sellico.ru): функции, маркетплейсы (Wildberries, Ozon, Яндекс Маркет), тарифы, сравнения, статьи, глоссарий и онлайн-калькуляторы.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Поисковый запрос на русском или английском языке (например, «юнит-экономика», «тарифы», «сравнение Excel»).',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 20,
          default: 8,
          description: 'Максимальное число результатов (от 1 до 20, по умолчанию 8).',
        },
      },
      required: ['query'],
    },
    annotations: { title: 'Поиск публичных страниц Sellico', ...READ_ONLY_ANNOTATIONS },
  },
  {
    name: 'sellico_read_page',
    title: 'Чтение Markdown публичной страницы Sellico',
    description:
      'Возвращает очищенный Markdown и канонический URL публичной страницы Sellico по пути из sellico_search_pages (например, "/", "/pricing/", "/compare/external-analytics/").',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        path: {
          type: 'string',
          minLength: 1,
          maxLength: 300,
          description: 'Канонический путь страницы (например, "/unit-economics/") или полный URL на sellico.ru.',
        },
      },
      required: ['path'],
    },
    annotations: { title: 'Чтение Markdown страницы Sellico', ...READ_ONLY_ANNOTATIONS },
  },
  {
    name: 'sellico_get_pricing',
    title: 'Тарифы и лимиты Sellico',
    description:
      'Возвращает актуальные публичные тарифы Sellico в рублях (Старт, Про, Бизнес, Enterprise), лимиты магазинов, SKU и пользователей, а также условия 3-дневного пробного периода без карты.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        plan: {
          type: 'string',
          enum: ['start', 'pro', 'business', 'enterprise'],
          description: 'Необязательный фильтр по конкретному тарифу.',
        },
      },
    },
    annotations: { title: 'Тарифы и лимиты Sellico', ...READ_ONLY_ANNOTATIONS },
  },
  {
    name: 'sellico_calculate_margin',
    title: 'Калькулятор маржинальности и наценки',
    description:
      'Рассчитывает чистую прибыль с единицы в рублях, валовую и чистую маржинальность, наценку к себестоимости, цену безубыточности и розничную цену под целевую маржинальность.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        price: { type: 'number', minimum: 0, maximum: 1e9, description: 'Цена продажи за единицу, ₽' },
        cost: { type: 'number', minimum: 0, maximum: 1e9, description: 'Полная себестоимость единицы, ₽' },
        feesPct: { type: 'number', minimum: 0, maximum: 100, description: 'Суммарные процентные удержания (комиссия + эквайринг + налог), % от цены' },
        extra: { type: 'number', minimum: 0, maximum: 1e9, default: 0, description: 'Фиксированные расходы на продажу (логистика, хранение, упаковка), ₽' },
        targetPct: { type: 'number', minimum: 0, maximum: 99.99, default: 20, description: 'Целевая чистая маржинальность, %' },
      },
      required: ['price', 'cost', 'feesPct'],
    },
    annotations: { title: 'Калькулятор маржинальности и наценки', ...READ_ONLY_ANNOTATIONS },
  },
  {
    name: 'sellico_calculate_unit_economics',
    title: 'Калькулятор юнит-экономики маркетплейса',
    description:
      'Рассчитывает юнит-экономику товара для Wildberries, Ozon и Яндекс Маркета: комиссию, логистику на одну выкупленную штуку с учётом процента выкупа и возвратов, рекламу, налог, чистую прибыль, маржинальность и наценку.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        price: { type: 'number', minimum: 0, maximum: 1e9, description: 'Розничная цена продажи до СПП, ₽' },
        cost: { type: 'number', minimum: 0, maximum: 1e9, description: 'Полная себестоимость единицы товара, ₽' },
        commissionPct: { type: 'number', minimum: 0, maximum: 100, description: 'Комиссия маркетплейса с эквайрингом, % от цены' },
        logistics: { type: 'number', minimum: 0, maximum: 1e9, description: 'Стоимость прямой доставки одной единицы до покупателя, ₽' },
        returnLogistics: { type: 'number', minimum: 0, maximum: 1e9, default: 0, description: 'Стоимость обратной доставки при отказе/возврате, ₽ (по умолчанию 0)' },
        buyoutPct: { type: 'number', minimum: 1, maximum: 100, default: 85, description: 'Процент выкупа товара, % (от 1 до 100)' },
        storage: { type: 'number', minimum: 0, maximum: 1e9, default: 0, description: 'Хранение в расчёте на одну проданную единицу, ₽' },
        ads: { type: 'number', minimum: 0, maximum: 1e9, default: 0, description: 'Рекламные расходы в рублях на единицу, ₽' },
        adsPct: { type: 'number', minimum: 0, maximum: 100, default: 0, description: 'ДРР (доля рекламных расходов от цены), %' },
        taxPct: { type: 'number', minimum: 0, maximum: 100, default: 6, description: 'Налог от выручки, % (например, 6% на УСН «Доходы»)' },
        other: { type: 'number', minimum: 0, maximum: 1e9, default: 0, description: 'Прочие переменные расходы на единицу, ₽' },
      },
      required: ['price', 'cost', 'commissionPct', 'logistics'],
    },
    annotations: { title: 'Калькулятор юнит-экономики маркетплейса', ...READ_ONLY_ANNOTATIONS },
  },
];

const PUBLIC_PLANS = PRICING_CATALOG.plans.map(({ id, name, monthlyPriceRub, priceFrom, limits, highlights }) => ({
  id,
  name,
  monthlyPriceRub,
  priceFrom,
  limits,
  highlights,
}));

function finiteNumber(obj, key, min, max, defaultValue) {
  const raw = obj[key] === undefined ? defaultValue : obj[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < min || raw > max) {
    throw new Error(`Поле "${key}" должно быть конечным числом в диапазоне от ${min} до ${max}.`);
  }
  return raw;
}

function normalizePagePath(rawPath, origin) {
  if (typeof rawPath !== 'string' || !rawPath.trim() || rawPath.length > 300) {
    throw new Error('Поле "path" должно быть непустой строкой длиной до 300 символов.');
  }
  let candidate = rawPath.trim();
  const cleanOrigin = origin.replace(/\/+$/, '');
  if (candidate.startsWith(`${cleanOrigin}/`) || candidate === cleanOrigin) {
    candidate = candidate.slice(cleanOrigin.length) || '/';
  }
  candidate = candidate.split('?')[0].split('#')[0];
  if (!candidate.startsWith('/')) candidate = `/${candidate}`;
  if (candidate !== '/' && !candidate.endsWith('/')) candidate = `${candidate}/`;
  return candidate;
}

async function loadPagesIndex(distDir) {
  const body = await readFile(resolve(distDir, 'agent-pages.json'), 'utf8');
  const parsed = JSON.parse(body);
  if (!Array.isArray(parsed.pages)) throw new Error('Индекс публичных страниц недоступен.');
  return parsed.pages;
}

export async function executeTool(name, args, { distDir, origin }) {
  const input = args && typeof args === 'object' && !Array.isArray(args) ? args : {};
  const cleanOrigin = origin.replace(/\/+$/, '');

  switch (name) {
    case 'sellico_search_pages': {
      if (typeof input.query !== 'string' || !input.query.trim() || input.query.length > 200) {
        throw new Error('Поле "query" должно быть непустой строкой до 200 символов.');
      }
      const limit = input.limit === undefined ? 8 : finiteNumber(input, 'limit', 1, 20);
      if (!Number.isInteger(limit)) {
        throw new Error('Поле "limit" должно быть целым числом от 1 до 20.');
      }
      const terms = input.query.trim().toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
      const pages = await loadPagesIndex(distDir);
      const ranked = pages
        .map((page) => {
          const title = String(page.title || '').toLocaleLowerCase('ru');
          const description = String(page.description || '').toLocaleLowerCase('ru');
          const pathLower = String(page.path || '').toLocaleLowerCase('ru');
          const score = terms.reduce(
            (acc, term) =>
              acc +
              (title.includes(term) ? 3 : 0) +
              (pathLower.includes(term) ? 2 : 0) +
              (description.includes(term) ? 1 : 0),
            0,
          );
          return { page, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);

      return {
        query: input.query.trim(),
        totalMatches: ranked.length,
        pages: ranked.slice(0, limit).map(({ page }) => page),
      };
    }

    case 'sellico_read_page': {
      const normalizedPath = normalizePagePath(input.path, cleanOrigin);
      const pages = await loadPagesIndex(distDir);
      const entry = pages.find((candidate) => candidate.path === normalizedPath);
      if (!entry) {
        throw new Error(
          `Страница "${normalizedPath}" не найдена среди канонических публичных страниц. Вызовите sellico_search_pages для поиска доступного пути.`,
        );
      }
      const resolvedRoot = resolve(distDir);
      const markdownFile = resolve(resolvedRoot, `.${entry.markdown}`);
      if (!markdownFile.startsWith(`${resolvedRoot}${sep}`)) {
        throw new Error('Недопустимый путь к Markdown-ресурсу.');
      }
      const markdown = await readFile(markdownFile, 'utf8');
      return {
        path: entry.path,
        url: entry.url,
        title: entry.title,
        description: entry.description,
        markdown,
      };
    }

    case 'sellico_get_pricing': {
      let plans = PUBLIC_PLANS;
      if (input.plan !== undefined) {
        if (typeof input.plan !== 'string' || !['start', 'pro', 'business', 'enterprise'].includes(input.plan)) {
          throw new Error('Поле "plan" поддерживает только значения: start, pro, business, enterprise.');
        }
        plans = PUBLIC_PLANS.filter((plan) => plan.id === input.plan);
      }
      let markdown = '';
      try {
        markdown = await readFile(resolve(distDir, 'pricing.md'), 'utf8');
      } catch {
        markdown = '';
      }
      return {
        currency: PRICING_CATALOG.currency,
        billingPeriod: PRICING_CATALOG.billingPeriod,
        canonicalUrl: `${cleanOrigin}/pricing/`,
        trial: PRICING_CATALOG.trial,
        plans,
        markdown,
      };
    }

    case 'sellico_calculate_margin': {
      const price = finiteNumber(input, 'price', 0, 1e9);
      const cost = finiteNumber(input, 'cost', 0, 1e9);
      const feesPct = finiteNumber(input, 'feesPct', 0, 100);
      const extra = finiteNumber(input, 'extra', 0, 1e9, 0);
      const targetPct = finiteNumber(input, 'targetPct', 0, 99.99, 20);
      const result = calcMargin({ price, cost, feesPct, extra, targetPct });

      return {
        currency: PRICING_CATALOG.currency,
        estimate: true,
        canonicalCalculatorUrl: `${cleanOrigin}/calculators/margin/`,
        ...result,
      };
    }

    case 'sellico_calculate_unit_economics': {
      const price = finiteNumber(input, 'price', 0, 1e9);
      const cost = finiteNumber(input, 'cost', 0, 1e9);
      const commissionPct = finiteNumber(input, 'commissionPct', 0, 100);
      const logistics = finiteNumber(input, 'logistics', 0, 1e9);
      const returnLogistics = finiteNumber(input, 'returnLogistics', 0, 1e9, 0);
      const buyoutPct = finiteNumber(input, 'buyoutPct', 1, 100, 85);
      const storage = finiteNumber(input, 'storage', 0, 1e9, 0);
      const ads = finiteNumber(input, 'ads', 0, 1e9, 0);
      const adsPct = finiteNumber(input, 'adsPct', 0, 100, 0);
      const taxPct = finiteNumber(input, 'taxPct', 0, 100, 6);
      const other = finiteNumber(input, 'other', 0, 1e9, 0);

      const result = calcUnitEconomics({
        price,
        cost,
        commissionPct,
        logistics,
        returnLogistics,
        buyoutPct,
        storage,
        ads,
        adsPct,
        taxPct,
        other,
      });

      return {
        currency: PRICING_CATALOG.currency,
        estimate: true,
        canonicalCalculatorUrl: `${cleanOrigin}/calculators/unit-economics/`,
        commission: result.commission,
        logisticsPerSale: result.logistics,
        adsCost: result.adsCost,
        tax: result.tax,
        expenses: result.expenses,
        profit: result.profit,
        margin: result.margin,
        markup: result.markup,
      };
    }

    default:
      return null;
  }
}
