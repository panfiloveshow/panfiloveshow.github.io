import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { acceptsMarkdown, agentDiscoveryPlugin } from './agent-discovery-plugin.ts';
import { buildA2aAgentCard, buildMcpServerCard } from './cards.mjs';

for (const accept of ['', '*/*', 'text/html', 'text/markdown;q=0', 'text/markdown;q=0.000', 'text/markdown-other', 'text/markdown;q=bad']) {
  assert.equal(acceptsMarkdown(accept), false, accept);
}
for (const accept of ['text/markdown', 'TEXT/MARKDOWN', 'text/html, text/markdown;q=0.5', 'text/markdown; charset=utf-8', 'text/markdown;q=1.000']) {
  assert.equal(acceptsMarkdown(accept), true, accept);
}

// Exercise real HTTP; an HTML fallback makes accidental SPA fallthrough visible.
const fixture = await mkdtemp(join(tmpdir(), 'sellico-agent-http-'));
await mkdir(join(fixture, 'calculators/margin'), { recursive: true });
await mkdir(join(fixture, '.well-known/mcp'), { recursive: true });
await mkdir(join(fixture, 'mcp'), { recursive: true });
await writeFile(join(fixture, 'index.md'), '# Sellico\n');
await writeFile(join(fixture, 'auth.md'), '# Sellico auth.md\n\nAgent registration guide.\n');
await writeFile(join(fixture, 'calculators/margin/index.md'), '# Маржа\nhttps://sellico.ru/calculators/margin/\n');
await writeFile(
  join(fixture, 'agent-pages.json'),
  JSON.stringify({
    pages: [
      {
        path: '/calculators/margin/',
        url: 'https://sellico.ru/calculators/margin/',
        markdown: '/calculators/margin/index.md',
        title: 'Калькулятор маржинальности',
        description: 'Маржа и наценка товара',
      },
    ],
  }),
);
const serverCardJson = JSON.stringify(buildMcpServerCard('https://sellico.ru'));
await writeFile(join(fixture, '.well-known/mcp/server-card.json'), serverCardJson);
await writeFile(join(fixture, 'mcp/server-card.json'), serverCardJson);
await writeFile(join(fixture, '.well-known/agent-card.json'), JSON.stringify(buildA2aAgentCard('https://sellico.ru')));
await writeFile(join(fixture, '.well-known/api-catalog'), JSON.stringify({ linkset: [{ anchor: 'https://sellico.ru/api/public/billing-plans' }] }));
await writeFile(join(fixture, '.well-known/ai-catalog.json'), JSON.stringify({ entries: [{ identifier: 'urn:air:sellico.ru:api:public-information' }] }));
let middleware: (req: IncomingMessage, res: ServerResponse, next: () => void) => void = () => {};
const plugin = agentDiscoveryPlugin(fixture);
const setup = plugin.configurePreviewServer as (server: unknown) => void;
setup({ middlewares: { use: (handler: typeof middleware) => { middleware = handler; } } });
const server = createServer((req, res) => middleware(req, res, () => {
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>HTML default</h1>');
}));
await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert.ok(address && typeof address === 'object');
const origin = `http://127.0.0.1:${address.port}`;
try {
  const html = await fetch(`${origin}/`);
  assert.equal(html.headers.get('Content-Type'), 'text/html');
  assert.ok(html.headers.get('Link')?.includes('rel="api-catalog"'));
  assert.ok(html.headers.get('Link')?.includes('rel="mcp-server-card"'));
  assert.ok(html.headers.get('Vary')?.includes('Accept'));
  const markdown = await fetch(`${origin}/?utm_source=agent`, { headers: { Accept: 'text/markdown' } });
  assert.equal(markdown.status, 200);
  assert.match(markdown.headers.get('Content-Type')!, /^text\/markdown/);
  assert.match(await markdown.text(), /^# /m);
  const nested = await fetch(`${origin}/calculators/margin/`, { headers: { Accept: 'text/markdown' } });
  assert.equal(nested.status, 200);
  assert.ok((await nested.text()).includes('https://sellico.ru/calculators/margin/'));
  const zero = await fetch(`${origin}/`, { headers: { Accept: 'text/html, text/markdown;q=0' } });
  assert.equal(zero.headers.get('Content-Type'), 'text/html');
  const head = await fetch(`${origin}/`, { method: 'HEAD', headers: { Accept: 'text/markdown' } });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const catalog = await fetch(`${origin}/.well-known/api-catalog`);
  assert.match(catalog.headers.get('Content-Type')!, /^application\/linkset\+json/);
  assert.ok((await catalog.json()).linkset.length);
  const ard = await fetch(`${origin}/.well-known/ai-catalog.json`);
  assert.equal(ard.headers.get('Access-Control-Allow-Origin'), '*');
  assert.ok((await ard.json()).entries.length);

  // MCP Server Card & Streamable HTTP endpoint
  for (const cardPath of ['/.well-known/mcp/server-card.json', '/mcp/server-card']) {
    const cardRes = await fetch(`${origin}${cardPath}`);
    assert.equal(cardRes.status, 200, cardPath);
    assert.equal(cardRes.headers.get('Access-Control-Allow-Origin'), '*');
    const card = (await cardRes.json()) as { serverInfo: { name: string }; transport: { endpoint: string } };
    assert.equal(card.serverInfo.name, 'sellico-public-mcp');
    assert.equal(card.transport.endpoint, 'https://sellico.ru/mcp');
  }
  const mcpGet = await fetch(`${origin}/mcp`);
  assert.equal(mcpGet.status, 405);
  const mcpPost = await fetch(`${origin}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  });
  assert.equal(mcpPost.status, 200);
  assert.equal(((await mcpPost.json()) as { result: { tools: unknown[] } }).result.tools.length, 5);

  // A2A Agent Card & JSON-RPC endpoint
  const a2aCardRes = await fetch(`${origin}/.well-known/agent-card.json`);
  assert.equal(a2aCardRes.status, 200);
  assert.equal(a2aCardRes.headers.get('Access-Control-Allow-Origin'), '*');
  const a2aCard = (await a2aCardRes.json()) as { name: string; supportedInterfaces: Array<{ url: string }> };
  assert.equal(a2aCard.name, 'Sellico Public Agent');
  assert.equal(a2aCard.supportedInterfaces[0].url, 'https://sellico.ru/a2a');
  const a2aPost = await fetch(`${origin}/a2a`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'SendMessage',
      params: { message: { role: 'ROLE_USER', parts: [{ text: 'Какие тарифы у Sellico?' }] } },
    }),
  });
  assert.equal(a2aPost.status, 200);
  assert.match(JSON.stringify(await a2aPost.json()), /3\s?000/);

  // Auth.md + OAuth Protected Resource + OAuth/OIDC Discovery + JWKS
  const authMd = await fetch(`${origin}/auth.md`);
  assert.equal(authMd.status, 200);
  assert.match(authMd.headers.get('Content-Type')!, /^text\/markdown/);
  assert.match(await authMd.text(), /^#\s+.*auth\.md/im);

  for (const oauthPath of [
    '/.well-known/oauth-protected-resource',
    '/.well-known/oauth-authorization-server',
    '/.well-known/openid-configuration',
    '/.well-known/jwks.json',
  ]) {
    const res = await fetch(`${origin}${oauthPath}`);
    assert.equal(res.status, 200, oauthPath);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
  }

  // Unimplemented commerce/missing paths MUST remain strict 404 (never SPA HTML 200)
  for (const path of ['/missing-agent-page/', '/.well-known/agent-skills/missing.md', '/.well-known/ucp', '/.well-known/acp.json']) {
    assert.equal((await fetch(`${origin}${path}`, { headers: { Accept: 'text/markdown' } })).status, 404, path);
  }
} finally {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await rm(fixture, { recursive: true, force: true });
}
console.log('Agent HTTP: HTML/Markdown negotiation, MCP Server Card, /mcp, Auth.md, OAuth discovery and strict 404 — OK');
