import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createMcpHttpServer } from './server.mjs';

const fixture = await mkdtemp(join(tmpdir(), 'sellico-mcp-test-'));
await mkdir(join(fixture, 'unit-economics'), { recursive: true });
await mkdir(join(fixture, 'compare'), { recursive: true });
await writeFile(
  join(fixture, 'agent-pages.json'),
  JSON.stringify({
    pages: [
      {
        path: '/',
        url: 'https://sellico.ru/',
        markdown: '/index.md',
        title: 'Sellico — система управления бизнесом на маркетплейсах',
        description: 'Финансы, юнит-экономика, остатки и задачи команды для WB, Ozon и Яндекс Маркета.',
      },
      {
        path: '/unit-economics/',
        url: 'https://sellico.ru/unit-economics/',
        markdown: '/unit-economics/index.md',
        title: 'Юнит-экономика товара на маркетплейсе',
        description: 'Чистая прибыль и маржинальность по каждому SKU с учётом комиссий, логистики и возвратов.',
      },
      {
        path: '/compare/',
        url: 'https://sellico.ru/compare/',
        markdown: '/compare/index.md',
        title: 'Сравнение Sellico с Excel и сервисами аналитики',
        description: 'Как выбрать между таблицами, внешними парсерами и внутренней операционной системой.',
      },
    ],
  }),
);
await writeFile(join(fixture, 'index.md'), '# Sellico\n\nКаноническая страница: https://sellico.ru/\n');
await writeFile(
  join(fixture, 'unit-economics/index.md'),
  '# Юнит-экономика\n\nРасчёт прибыли по SKU.\n\nКаноническая страница: https://sellico.ru/unit-economics/\n',
);
await writeFile(
  join(fixture, 'compare/index.md'),
  '# Сравнения\n\nМатрица выбора.\n\nКаноническая страница: https://sellico.ru/compare/\n',
);
await writeFile(
  join(fixture, 'pricing.md'),
  '# Тарифы Sellico\n\nСтарт — 3 000 ₽ в месяц.\n\nКаноническая HTML-страница: https://sellico.ru/pricing/\n',
);

const server = createMcpHttpServer({ distDir: fixture, origin: 'https://sellico.ru' });
await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert.ok(address && typeof address === 'object');
const baseUrl = `http://127.0.0.1:${address.port}`;

async function rpc(body: unknown, headers: Record<string, string> = {}) {
  return fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

try {
  // 1. Healthcheck
  const health = await fetch(`${baseUrl}/healthz`);
  assert.equal(health.status, 200);
  const healthBody = (await health.json()) as { status: string; service: string };
  assert.equal(healthBody.status, 'ok');
  assert.equal(healthBody.service, 'sellico-public-mcp');

  // 2. MCP Server Card (SEP-1649) on both well-known and /mcp/server-card
  for (const cardPath of ['/.well-known/mcp/server-card.json', '/mcp/server-card']) {
    const cardRes = await fetch(`${baseUrl}${cardPath}`);
    assert.equal(cardRes.status, 200, cardPath);
    assert.match(cardRes.headers.get('Content-Type') || '', /^application\/json/);
    assert.equal(cardRes.headers.get('Access-Control-Allow-Origin'), '*');
    const card = (await cardRes.json()) as {
      serverInfo: { name: string; version: string };
      transport: { type: string; endpoint: string };
      authentication: { required: boolean };
      capabilities: { tools: Record<string, unknown> };
      tools: Array<{ name: string }>;
    };
    assert.equal(card.serverInfo.name, 'sellico-public-mcp');
    assert.equal(card.serverInfo.version, '1.0.0');
    assert.equal(card.transport.type, 'streamable-http');
    assert.equal(card.transport.endpoint, 'https://sellico.ru/mcp');
    assert.equal(card.authentication.required, false);
    assert.ok(card.capabilities.tools);
    assert.equal(card.tools.length, 5);
  }

  // 3. CORS preflight & stateless Streamable HTTP GET/DELETE 405
  const optionsRes = await fetch(`${baseUrl}/mcp`, { method: 'OPTIONS' });
  assert.equal(optionsRes.status, 204);
  assert.equal(optionsRes.headers.get('Access-Control-Allow-Origin'), '*');
  assert.ok(optionsRes.headers.get('Access-Control-Allow-Methods')?.includes('POST'));

  for (const method of ['GET', 'DELETE']) {
    const methodRes = await fetch(`${baseUrl}/mcp`, { method });
    assert.equal(methodRes.status, 405, `Expected 405 for ${method} /mcp`);
    assert.ok(methodRes.headers.get('Allow')?.includes('POST'));
  }

  // 4. JSON-RPC initialize + notifications/initialized + ping
  const initRes = await rpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'test-agent', version: '1.0.0' },
    },
  });
  assert.equal(initRes.status, 200);
  assert.equal(initRes.headers.get('MCP-Protocol-Version'), '2025-06-18');
  const initJson = (await initRes.json()) as {
    result: { protocolVersion: string; serverInfo: { name: string }; capabilities: { tools: unknown } };
  };
  assert.equal(initJson.result.protocolVersion, '2025-06-18');
  assert.equal(initJson.result.serverInfo.name, 'sellico-public-mcp');
  assert.ok(initJson.result.capabilities.tools);

  const notifRes = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.equal(notifRes.status, 202);
  assert.equal(await notifRes.text(), '');

  const pingRes = await rpc({ jsonrpc: '2.0', id: 2, method: 'ping' });
  assert.equal(pingRes.status, 200);
  assert.deepEqual(((await pingRes.json()) as { result: unknown }).result, {});

  // 5. tools/list
  const listRes = await rpc({ jsonrpc: '2.0', id: 3, method: 'tools/list' });
  assert.equal(listRes.status, 200);
  const listJson = (await listRes.json()) as {
    result: { tools: Array<{ name: string; annotations: { readOnlyHint: boolean; destructiveHint: boolean } }> };
  };
  const toolNames = listJson.result.tools.map((tool) => tool.name);
  assert.deepEqual(toolNames, [
    'sellico_search_pages',
    'sellico_read_page',
    'sellico_get_pricing',
    'sellico_calculate_margin',
    'sellico_calculate_unit_economics',
  ]);
  for (const tool of listJson.result.tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
  }

  // 6. tools/call: sellico_search_pages
  const searchRes = await rpc({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: { name: 'sellico_search_pages', arguments: { query: 'юнит-экономика SKU', limit: 5 } },
  });
  const searchJson = (await searchRes.json()) as {
    result: { isError: boolean; structuredContent: { pages: Array<{ path: string }> } };
  };
  assert.equal(searchJson.result.isError, false);
  assert.equal(searchJson.result.structuredContent.pages[0].path, '/unit-economics/');

  // 7. tools/call: sellico_read_page (valid + traversal rejection)
  const readRes = await rpc({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: { name: 'sellico_read_page', arguments: { path: '/unit-economics/' } },
  });
  const readJson = (await readRes.json()) as {
    result: { isError: boolean; structuredContent: { url: string; markdown: string } };
  };
  assert.equal(readJson.result.isError, false);
  assert.equal(readJson.result.structuredContent.url, 'https://sellico.ru/unit-economics/');
  assert.match(readJson.result.structuredContent.markdown, /^# Юнит-экономика/m);

  const badReadRes = await rpc({
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: { name: 'sellico_read_page', arguments: { path: '/../../etc/passwd' } },
  });
  const badReadJson = (await badReadRes.json()) as { result: { isError: boolean } };
  assert.equal(badReadJson.result.isError, true);

  // 8. tools/call: sellico_get_pricing
  const pricingRes = await rpc({
    jsonrpc: '2.0',
    id: 7,
    method: 'tools/call',
    params: { name: 'sellico_get_pricing', arguments: {} },
  });
  const pricingJson = (await pricingRes.json()) as {
    result: {
      isError: boolean;
      structuredContent: { currency: string; plans: Array<{ id: string; monthlyPriceRub: number }> };
    };
  };
  assert.equal(pricingJson.result.isError, false);
  assert.equal(pricingJson.result.structuredContent.currency, 'RUB');
  assert.deepEqual(
    pricingJson.result.structuredContent.plans.map((plan) => plan.monthlyPriceRub),
    [3000, 8000, 15000, 40000],
  );

  // 9. tools/call: sellico_calculate_margin
  const marginRes = await rpc({
    jsonrpc: '2.0',
    id: 8,
    method: 'tools/call',
    params: {
      name: 'sellico_calculate_margin',
      arguments: { price: 2000, cost: 700, feesPct: 22, extra: 100, targetPct: 25 },
    },
  });
  const marginJson = (await marginRes.json()) as {
    result: { isError: boolean; structuredContent: { profit: number; margin: number; minPrice: number } };
  };
  assert.equal(marginJson.result.isError, false);
  assert.equal(marginJson.result.structuredContent.profit, 760);
  assert.equal(marginJson.result.structuredContent.margin, 38);
  assert.ok(marginJson.result.structuredContent.minPrice > 0);

  // 10. tools/call: sellico_calculate_unit_economics
  const unitRes = await rpc({
    jsonrpc: '2.0',
    id: 9,
    method: 'tools/call',
    params: {
      name: 'sellico_calculate_unit_economics',
      arguments: {
        price: 2500,
        cost: 800,
        commissionPct: 20,
        logistics: 120,
        returnLogistics: 40,
        buyoutPct: 80,
        storage: 15,
        adsPct: 8,
        taxPct: 6,
        other: 10,
      },
    },
  });
  const unitJson = (await unitRes.json()) as {
    result: {
      isError: boolean;
      structuredContent: { commission: number; logisticsPerSale: number; profit: number; margin: number };
    };
  };
  assert.equal(unitJson.result.isError, false);
  assert.equal(unitJson.result.structuredContent.commission, 500);
  // buyout 0.8 => direct 120 / 0.8 = 150 + return 40 * 0.2 / 0.8 = 10 => 160
  assert.equal(unitJson.result.structuredContent.logisticsPerSale, 160);
  // expenses = 500 (comm) + 160 (log) + 150 (tax 6%) + 800 (cost) + 15 (storage) + 200 (ads 8%) + 10 (other) = 1835 => profit = 665
  assert.equal(unitJson.result.structuredContent.profit, 665);
  assert.equal(unitJson.result.structuredContent.margin, 26.6);

  // 11. JSON-RPC errors: unknown method (-32601), unknown tool (-32602), malformed JSON (-32700)
  const unknownMethod = await rpc({ jsonrpc: '2.0', id: 10, method: 'resources/list' });
  assert.equal(((await unknownMethod.json()) as { error: { code: number } }).error.code, -32601);

  const unknownTool = await rpc({
    jsonrpc: '2.0',
    id: 11,
    method: 'tools/call',
    params: { name: 'delete_database', arguments: {} },
  });
  assert.equal(((await unknownTool.json()) as { error: { code: number } }).error.code, -32602);

  const parseErr = await rpc('{broken-json');
  assert.equal(parseErr.status, 400);
  assert.equal(((await parseErr.json()) as { error: { code: number } }).error.code, -32700);

  // 12. OAuth Protected Resource Metadata (RFC 9728) + 401 WWW-Authenticate on /agent/me
  const unauthMe = await fetch(`${baseUrl}/agent/me`);
  assert.equal(unauthMe.status, 401);
  assert.match(
    unauthMe.headers.get('WWW-Authenticate') || '',
    /resource_metadata="https:\/\/sellico\.ru\/\.well-known\/oauth-protected-resource"/,
  );

  const prmRes = await fetch(`${baseUrl}/.well-known/oauth-protected-resource`);
  assert.equal(prmRes.status, 200);
  const prm = (await prmRes.json()) as {
    resource: string;
    authorization_servers: string[];
    scopes_supported: string[];
    bearer_methods_supported: string[];
  };
  assert.equal(prm.resource, 'https://sellico.ru');
  assert.deepEqual(prm.authorization_servers, ['https://sellico.ru']);
  assert.ok(prm.scopes_supported.includes('mcp:tools:read'));
  assert.ok(prm.bearer_methods_supported.includes('header'));

  // 13. OAuth/OIDC Discovery Metadata + agent_auth block + JWKS
  for (const metaPath of ['/.well-known/oauth-authorization-server', '/.well-known/openid-configuration']) {
    const metaRes = await fetch(`${baseUrl}${metaPath}`);
    assert.equal(metaRes.status, 200, metaPath);
    const meta = (await metaRes.json()) as {
      issuer: string;
      authorization_endpoint: string;
      token_endpoint: string;
      jwks_uri: string;
      grant_types_supported: string[];
      response_types_supported: string[];
      agent_auth: {
        skill: string;
        register_uri: string;
        revocation_uri: string;
        identity_types_supported: string[];
        anonymous: { credential_types_supported: string[]; claim_uri: string };
        events_supported: string[];
      };
    };
    assert.equal(meta.issuer, 'https://sellico.ru');
    assert.equal(meta.authorization_endpoint, 'https://sellico.ru/oauth2/authorize');
    assert.equal(meta.token_endpoint, 'https://sellico.ru/oauth2/token');
    assert.equal(meta.jwks_uri, 'https://sellico.ru/.well-known/jwks.json');
    assert.ok(meta.grant_types_supported.includes('urn:ietf:params:oauth:grant-type:jwt-bearer'));
    assert.ok(meta.response_types_supported.includes('code'));
    assert.equal(meta.agent_auth.skill, 'https://sellico.ru/auth.md');
    assert.equal(meta.agent_auth.register_uri, 'https://sellico.ru/agent/identity');
    assert.equal(meta.agent_auth.revocation_uri, 'https://sellico.ru/oauth2/revoke');
    assert.ok(meta.agent_auth.identity_types_supported.includes('anonymous'));
    assert.ok(meta.agent_auth.anonymous.credential_types_supported.includes('access_token'));
    assert.equal(meta.agent_auth.anonymous.claim_uri, 'https://sellico.ru/agent/identity/claim');
    assert.ok(meta.agent_auth.events_supported.length > 0);
  }

  const jwksRes = await fetch(`${baseUrl}/.well-known/jwks.json`);
  assert.equal(jwksRes.status, 200);
  const jwks = (await jwksRes.json()) as { keys: Array<{ kty: string; crv: string; alg: string; kid: string }> };
  assert.equal(jwks.keys.length, 1);
  assert.equal(jwks.keys[0].kty, 'EC');
  assert.equal(jwks.keys[0].crv, 'P-256');
  assert.equal(jwks.keys[0].alg, 'ES256');

  // 14. End-to-end Auth.md registration -> JWT-bearer token exchange -> authenticated call -> revocation
  const regRes = await fetch(`${baseUrl}/agent/identity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'anonymous', agent_name: 'test-scanner-agent' }),
  });
  assert.equal(regRes.status, 200);
  const reg = (await regRes.json()) as { identity_assertion: string; claim_token: string; claim_uri: string };
  assert.ok(reg.identity_assertion.split('.').length === 3);
  assert.ok(reg.claim_token);
  assert.equal(reg.claim_uri, 'https://sellico.ru/agent/identity/claim');

  const tokenRes = await fetch(`${baseUrl}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: reg.identity_assertion,
    }),
  });
  assert.equal(tokenRes.status, 200);
  const tokenJson = (await tokenRes.json()) as { access_token: string; token_type: string; scope: string };
  assert.equal(tokenJson.token_type, 'Bearer');
  assert.ok(tokenJson.access_token.split('.').length === 3);
  assert.ok(tokenJson.scope.includes('mcp:tools:read'));

  const authedMe = await fetch(`${baseUrl}/agent/me`, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  assert.equal(authedMe.status, 200);
  const meJson = (await authedMe.json()) as { iss: string; scope: string };
  assert.equal(meJson.iss, 'https://sellico.ru');

  const authedMcp = await rpc(
    { jsonrpc: '2.0', id: 12, method: 'ping' },
    { Authorization: `Bearer ${tokenJson.access_token}` },
  );
  assert.equal(authedMcp.status, 200);

  const badMcp = await rpc({ jsonrpc: '2.0', id: 13, method: 'ping' }, { Authorization: 'Bearer forged.jwt.token' });
  assert.equal(badMcp.status, 401);

  const revokeRes = await fetch(`${baseUrl}/oauth2/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token: tokenJson.access_token }),
  });
  assert.equal(revokeRes.status, 200);

  const revokedMe = await fetch(`${baseUrl}/agent/me`, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  assert.equal(revokedMe.status, 401);

  // 15. A2A Agent Card (/.well-known/agent-card.json) + real JSON-RPC A2A POST /a2a
  const a2aCardRes = await fetch(`${baseUrl}/.well-known/agent-card.json`);
  assert.equal(a2aCardRes.status, 200);
  const a2aCard = (await a2aCardRes.json()) as {
    name: string;
    version: string;
    description: string;
    supportedInterfaces: Array<{ url: string; protocolBinding: string }>;
    capabilities: Record<string, unknown>;
    skills: Array<{ id: string; name: string; description: string }>;
  };
  assert.equal(a2aCard.name, 'Sellico Public Agent');
  assert.equal(a2aCard.version, '1.0.0');
  assert.ok(a2aCard.description.length > 20);
  assert.equal(a2aCard.supportedInterfaces[0].url, 'https://sellico.ru/a2a');
  assert.ok(a2aCard.skills.length >= 4);

  const a2aRpcRes = await fetch(`${baseUrl}/a2a`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'a2a-1',
      method: 'message/send',
      params: {
        message: {
          role: 'user',
          parts: [{ kind: 'text', text: 'юнит-экономика SKU' }],
        },
      },
    }),
  });
  assert.equal(a2aRpcRes.status, 200);
  const a2aRpc = (await a2aRpcRes.json()) as {
    result: { status: { state: string }; artifacts: Array<{ parts: Array<{ text: string }> }> };
  };
  assert.equal(a2aRpc.result.status.state, 'completed');
  assert.ok(a2aRpc.result.artifacts[0].parts[0].text.includes('/unit-economics/'));
} finally {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  await rm(fixture, { recursive: true, force: true });
}

console.log('MCP server test: Server Card, CORS, stateless Streamable HTTP, and all 5 read-only tools — OK');
