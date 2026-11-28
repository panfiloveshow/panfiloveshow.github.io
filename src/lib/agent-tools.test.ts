import assert from 'node:assert/strict';
import { createAgentTools, registerAgentTools } from './agent-tools.ts';

const requests: { url: string; options?: RequestInit }[] = [];
const fetchPublic: typeof fetch = async (input, options) => {
  const url = String(input);
  requests.push({ url, options });
  if (url === '/agent-pages.json') return Response.json({ pages: [
    { path: '/pricing/', url: 'https://sellico.ru/pricing/', markdown: '/pricing/index.md', title: 'Тарифы Sellico', description: 'Цены' },
    { path: '/ozon/', url: 'https://sellico.ru/ozon/', markdown: '/ozon/index.md', title: 'Sellico для Ozon', description: 'Управление магазином' },
  ] });
  if (url === '/pricing/index.md') return new Response('# Тарифы', { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
  throw new Error(`Unexpected request: ${url}`);
};
const tools = createAgentTools(fetchPublic);
const search = tools.find((tool) => tool.name === 'search_sellico')!;
const read = tools.find((tool) => tool.name === 'read_sellico_page')!;
const calculate = tools.find((tool) => tool.name === 'calculate_sellico_margin')!;
assert.equal(JSON.parse(await search.execute({ query: 'ТАРИФЫ' })).pages[0].path, '/pricing/');
assert.equal(JSON.parse(await search.execute({ query: 'missing-search-result' })).pages.length, 0);
await assert.rejects(search.execute({ query: ' ' }));
await assert.rejects(search.execute({ query: 'a'.repeat(201) }));
assert.deepEqual(JSON.parse(await read.execute({ path: '/pricing/' })), {
  url: 'https://sellico.ru/pricing/', markdown: '# Тарифы',
});
for (const path of ['/crm/', '/api/private', 'https://evil.example/', '/../.env', '/pricing/?email=someone']) {
  await assert.rejects(read.execute({ path }));
}
assert.ok(requests.every(({ options }) => options?.credentials === 'omit'));
assert.ok(requests.every(({ url }) => ['/agent-pages.json', '/pricing/index.md'].includes(url)));
assert.equal(JSON.parse(await calculate.execute({ price: 1000, cost: 400, feesPct: 15, extra: 50, targetPct: 20 })).profit, 400);
assert.equal(JSON.parse(await calculate.execute({ price: 1000, cost: 400, feesPct: 15, extra: 50, targetPct: 20 })).margin, 40);
for (const price of [NaN, Infinity, -1, 1e10, '1000', undefined]) {
  await assert.rejects(calculate.execute({ price, cost: 400, feesPct: 15, extra: 50, targetPct: 20 }));
}
await assert.rejects(calculate.execute({ price: 1000, cost: 400, feesPct: 101, extra: 50, targetPct: 20 }));
const registered: string[] = [];
let signal: AbortSignal | undefined;
const dispose = registerAgentTools({ registerTool: async (tool, options) => {
  registered.push(tool.name); signal = options.signal;
} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(registered.length, 3);
dispose();
assert.equal(signal?.aborted, true);
registerAgentTools({ registerTool: async () => { throw new Error('Unsupported experimental implementation'); } });
await new Promise((resolve) => setTimeout(resolve, 0));
console.log('Agent tools: search, public access boundary, margin validation, registration and cleanup — OK');
