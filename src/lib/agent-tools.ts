import { calcMargin } from './calculators/economics.mjs';

type PublicPage = { path: string; url: string; markdown: string; title: string; description: string };
type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: (input: Record<string, unknown>) => Promise<string>;
};
type ModelContext = {
  registerTool: (tool: Tool, options: { signal: AbortSignal }) => Promise<void> | void;
};

function textInput(value: unknown, name: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new Error(`${name}: expected a non-empty string up to ${max} characters`);
  }
  return value.trim();
}

export function createAgentTools(fetchPublic: typeof fetch = fetch): Tool[] {
  async function pages(): Promise<PublicPage[]> {
    const response = await fetchPublic('/agent-pages.json', { credentials: 'omit' });
    if (!response.ok) throw new Error('Public page index is unavailable');
    const body = await response.json() as { pages: PublicPage[] };
    return body.pages;
  }
  return [{
    name: 'search_sellico',
    description: 'Search public Sellico product, marketplace, pricing, guide and calculator pages.',
    inputSchema: {
      type: 'object', properties: { query: { type: 'string', minLength: 1, maxLength: 200 } },
      required: ['query'], additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const terms = textInput(input.query, 'query', 200).toLocaleLowerCase('ru').split(/\s+/);
      const results = (await pages()).map((page) => ({
        page, score: terms.reduce((score, term) => score +
          (page.title.toLocaleLowerCase('ru').includes(term) ? 3 : 0) +
          (page.description.toLocaleLowerCase('ru').includes(term) ? 1 : 0), 0),
      })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
      return JSON.stringify({ pages: results.map(({ page }) => page) });
    },
  }, {
    name: 'read_sellico_page',
    description: 'Read Markdown of a public Sellico page by its canonical path from search_sellico.',
    inputSchema: {
      type: 'object', properties: { path: { type: 'string', minLength: 1, maxLength: 300 } },
      required: ['path'], additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const path = textInput(input.path, 'path', 300);
      const page = (await pages()).find((candidate) => candidate.path === path);
      if (!page) throw new Error('Choose a public canonical path from search_sellico');
      const response = await fetchPublic(page.markdown, {
        headers: { Accept: 'text/markdown' }, credentials: 'omit',
      });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('text/markdown')) {
        throw new Error('Markdown is unavailable');
      }
      return JSON.stringify({ url: page.url, markdown: await response.text() });
    },
  }, {
    name: 'calculate_sellico_margin',
    description: 'Estimate profit and margin in RUB using price, cost, marketplace fees, extra costs and target margin. No account or payment is required.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      properties: {
        price: { type: 'number', minimum: 0, maximum: 1e9, description: 'Sale price, RUB' },
        cost: { type: 'number', minimum: 0, maximum: 1e9, description: 'Purchase cost, RUB' },
        feesPct: { type: 'number', minimum: 0, maximum: 100, description: 'Fees as a percentage of price' },
        extra: { type: 'number', minimum: 0, maximum: 1e9, description: 'Other costs per sale, RUB' },
        targetPct: { type: 'number', minimum: 0, maximum: 100, description: 'Target margin, percent' },
      },
      required: ['price', 'cost', 'feesPct', 'extra', 'targetPct'],
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      for (const key of ['price', 'cost', 'feesPct', 'extra', 'targetPct']) {
        const value = input[key];
        const max = key.endsWith('Pct') ? 100 : 1e9;
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) {
          throw new Error(`${key}: expected a number between 0 and ${max}`);
        }
      }
      return JSON.stringify({ currency: 'RUB', estimate: true, ...calcMargin(input as Parameters<typeof calcMargin>[0]) });
    },
  }];
}

export function registerAgentTools(
  context: ModelContext | undefined =
    (document as Document & { modelContext?: ModelContext }).modelContext ??
    (navigator as Navigator & { modelContext?: ModelContext }).modelContext,
): () => void {
  const controller = new AbortController();
  if (context?.registerTool) {
    for (const tool of createAgentTools()) {
      // Experimental implementations may reject registration. Keep normal browsing usable.
      void Promise.resolve().then(() => {
        if (!controller.signal.aborted) return context.registerTool(tool, { signal: controller.signal });
      }).catch(() => undefined);
    }
  }
  return () => controller.abort();
}
