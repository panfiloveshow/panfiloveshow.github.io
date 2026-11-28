// Run after prerender: Markdown always describes the HTML in the same release.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import {
  buildA2aAgentCard,
  buildAuthorizationServerMetadata,
  buildMcpServerCard,
  buildProtectedResourceMetadata,
} from './cards.mjs';
import { buildJwks } from './oauth.mjs';
import { routes } from '../build/site-routes.mjs';

const origin = 'https://sellico.ru';
async function write(path, value) {
  const file = join('dist', path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`);
}

const markdown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
markdown.use(gfm);
markdown.remove(['script', 'style', 'nav', 'header', 'footer', 'form', 'button']);
markdown.addRule('absoluteLinks', {
  filter: (node) => node.nodeName === 'A' && node.hasAttribute('href'),
  replacement: (content, node) => `[${content}](<${new URL(node.getAttribute('href'), origin).href}>)`,
});
markdown.addRule('absoluteImages', {
  filter: 'img',
  replacement: (_content, node) => node.getAttribute('src')
    ? `![${node.getAttribute('alt') || ''}](<${new URL(node.getAttribute('src'), origin).href}>)`
    : '',
});

const pages = [];
for (const page of [{ path: '', canonical: `${origin}/`, description: 'Sellico для продавцов маркетплейсов' }, ...routes]) {
  const directory = page.path ? `${page.path}/` : '';
  const file = join('dist', directory, 'index.html');
  let html = await readFile(file, 'utf8');
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];
  if (!main) throw new Error(`Cannot generate Markdown without <main>: ${file}`);
  const body = `${markdown.turndown(main)}\n\nКаноническая страница: ${page.canonical}\n`;
  const markdownPath = `/${directory}index.md`;
  await write(markdownPath, body);
  // Pricing already has a curated alternate in the HTML head.
  if (page.path !== 'pricing') {
    html = html.replace('</head>', `  <link rel="alternate" type="text/markdown" href="${markdownPath}" />\n</head>`);
    await writeFile(file, html);
  }
  pages.push({
    path: `/${directory}`, url: page.canonical, markdown: markdownPath,
    title: page.h1 || 'Sellico — система управления бизнесом на маркетплейсах',
    description: page.description,
  });
}
await write('agent-pages.json', { pages });

const agentsDoc = await readFile(join('public', 'agents.md'), 'utf8');
await write('AGENTS.md', agentsDoc);
await write('.well-known/AGENTS.md', agentsDoc);

const skillPath = '/.well-known/agent-skills/sellico-public/SKILL.md';
const skill = await readFile(join('public', skillPath), 'utf8');
await write('.well-known/agent-skills/index.json', {
  $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
  skills: [{
    name: 'sellico-public', type: 'skill-md',
    description: 'Найти публичные сведения Sellico, тарифы и калькуляторы маркетплейсов.',
    url: `${origin}${skillPath}`,
    digest: `sha256:${createHash('sha256').update(skill).digest('hex')}`,
  }],
});

const mcpServerCard = buildMcpServerCard(origin);
await write('.well-known/mcp/server-card.json', mcpServerCard);
await write('mcp/server-card.json', mcpServerCard);
await write('.well-known/agent-card.json', buildA2aAgentCard(origin));

const oauthServerMeta = buildAuthorizationServerMetadata(origin);
await write('.well-known/oauth-protected-resource', buildProtectedResourceMetadata(origin));
await write('.well-known/oauth-authorization-server', oauthServerMeta);
await write('.well-known/openid-configuration', oauthServerMeta);
await write('.well-known/jwks.json', buildJwks());

await write('.well-known/api-catalog', {
  linkset: [
    {
      anchor: `${origin}/api/public/billing-plans`,
      'service-desc': [{ href: `${origin}/openapi.json`, type: 'application/vnd.oai.openapi+json' }],
      'service-doc': [{ href: `${origin}/agents.md`, type: 'text/markdown' }],
    },
    {
      anchor: `${origin}/mcp`,
      'service-desc': [{ href: `${origin}/.well-known/mcp/server-card.json`, type: 'application/json' }],
      'service-doc': [{ href: `${origin}/agents.md`, type: 'text/markdown' }],
    },
  ],
});
await write('openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Sellico public information API', version: '1.0.0',
    description: 'Публичные сведения без авторизации. Не описывает приватный API CRM или платёжный API.',
  },
  servers: [{ url: origin }],
  security: [],
  paths: {
    '/api/public/billing-plans': { get: {
      operationId: 'getPublicBillingPlans', summary: 'Базовые месячные цены тарифов в RUB',
      description: 'Актуальные базовые цены; итоговая стоимость подтверждается в кабинете до оплаты.',
      responses: {
        200: { description: 'Тарифы по идентификатору', content: { 'application/json': { schema: {
          type: 'object', additionalProperties: {
            type: 'object', required: ['title', 'monthly_price'], properties: {
              title: { type: 'string' }, monthly_price: { type: 'number', minimum: 0 },
            },
          },
        } } } },
        503: { description: 'API временно недоступен' },
      },
    } },
    '/agent-pages.json': { get: {
      operationId: 'listPublicPages', summary: 'Индекс публичных страниц и их Markdown-версий',
      responses: { 200: { description: 'Публичные страницы', content: { 'application/json': { schema: {
        type: 'object', required: ['pages'], properties: { pages: { type: 'array', items: {
          type: 'object', required: ['path', 'url', 'markdown', 'title', 'description'],
          properties: Object.fromEntries(['path', 'url', 'markdown', 'title', 'description'].map((key) => [key, { type: 'string' }])),
        } } },
      } } } } },
    } },
  },
});
await write('.well-known/ai-catalog.json', {
  specVersion: '1.0',
  host: { displayName: 'Sellico', identifier: 'https://sellico.ru/' },
  entries: [{
    identifier: 'urn:air:sellico.ru:mcp:public-tools',
    displayName: 'Публичный MCP-сервер Sellico (поиск страниц, тарифы и калькуляторы)',
    type: 'application/mcp-server-card+json',
    url: `${origin}/.well-known/mcp/server-card.json`,
    representativeQueries: [
      'Посчитай юнит-экономику и маржинальность товара для Wildberries и Ozon',
      'Сравни Sellico с Excel, внешними парсерами и кабинетами маркетплейсов',
      'Какие тарифы и лимиты действуют в Sellico?',
    ],
  }, {
    identifier: 'urn:air:sellico.ru:a2a:public-agent',
    displayName: 'Публичный A2A-агент Sellico',
    type: 'application/a2a-agent-card+json',
    url: `${origin}/.well-known/agent-card.json`,
    representativeQueries: [
      'Сколько стоит Sellico и какие условия пробного периода?',
      'Где найти калькуляторы и руководства для селлеров маркетплейсов?',
    ],
  }, {
    identifier: 'urn:air:sellico.ru:skill:public-information',
    displayName: 'Навык чтения публичной информации Sellico',
    type: 'text/markdown; profile="urn:air:agent-skills"',
    url: `${origin}${skillPath}`,
    representativeQueries: ['Какие маркетплейсы поддерживает Sellico?', 'Как рассчитать маржу товара?'],
  }],
});
console.log(`Agent resources: ${pages.length} Markdown pages, MCP Server Card, API catalog, OpenAPI, skills and AI catalog`);
