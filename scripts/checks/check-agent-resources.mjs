import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { routes } from '../build/site-routes.mjs';

const read = (path) => readFile(join('dist', path), 'utf8');
const json = async (path) => JSON.parse(await read(path));
const { pages } = await json('agent-pages.json');
assert.equal(pages.length, routes.length + 1);
assert.equal(new Set(pages.map((page) => page.path)).size, pages.length);
for (const page of pages) {
  const body = await read(page.markdown);
  assert.match(body, /^# /m, `${page.path}: no Markdown heading`);
  assert.ok(body.includes(`Каноническая страница: ${page.url}`), `${page.path}: canonical missing`);
  assert.doesNotMatch(body, /<(?:script|style|nav|form)\b/i, `${page.path}: HTML controls in Markdown`);
  const html = await read(`${page.path}index.html`);
  assert.ok(html.includes('rel="alternate" type="text/markdown"'), `${page.path}: alternate missing`);
}

const catalog = await json('.well-known/api-catalog');
assert.ok(catalog.linkset.length > 0);
for (const api of catalog.linkset) {
  assert.equal(new URL(api.anchor).origin, 'https://sellico.ru');
  for (const rel of ['service-desc', 'service-doc']) {
    assert.ok(api[rel].length > 0);
    for (const link of api[rel]) await read(new URL(link.href).pathname);
  }
}
const api = await json('openapi.json');
assert.equal(api.openapi, '3.1.0');
assert.ok(api.paths['/api/public/billing-plans'].get.responses['200']);
assert.deepEqual(api.security, []);
assert.ok(Object.values(api.paths).every((path) => Object.keys(path).every((method) => method === 'get')));

const skills = await json('.well-known/agent-skills/index.json');
assert.equal(skills.$schema, 'https://schemas.agentskills.io/discovery/0.2.0/schema.json');
assert.ok(skills.skills.length > 0);
for (const skill of skills.skills) {
  assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(skill.type, 'skill-md');
  const body = await readFile(join('dist', new URL(skill.url).pathname));
  assert.equal(skill.digest, `sha256:${createHash('sha256').update(body).digest('hex')}`);
  assert.match(body.toString(), /^---\nname: /);
}

const ardAllowedTypes = new Set([
  'application/ai-catalog+json',
  'application/agent-card+json',
  'application/a2a-agent-card+json',
  'application/mcp-server-card+json',
  'application/agent-skills+zip',
  'application/agent-skills+gzip',
  'text/markdown; profile="urn:air:agent-skills"',
  'application/ai-registry',
  'application/ai-registry+json',
]);
const ard = await json('.well-known/ai-catalog.json');
assert.ok(ard.specVersion && ard.host.identifier && ard.host.displayName);
assert.ok(ard.entries.length > 0);
for (const entry of ard.entries) {
  assert.match(entry.identifier, /^urn:air:sellico\.ru:[a-z0-9-]+:[a-z0-9-]+$/);
  assert.ok(ardAllowedTypes.has(entry.type), `Non-standard ARD type: ${entry.type}`);
  assert.notEqual('url' in entry, 'data' in entry);
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  if (entry.url) await read(new URL(entry.url).pathname);
}

const a2aCard = await json('.well-known/agent-card.json');
assert.equal(a2aCard.name, 'Sellico Public Agent');
assert.equal(a2aCard.supportedInterfaces?.[0]?.url, 'https://sellico.ru/a2a');
assert.ok(a2aCard.skills?.length >= 4);
const serverCard = await json('.well-known/mcp/server-card.json');
const aliasCard = await json('mcp/server-card.json');
assert.deepEqual(serverCard, aliasCard);
assert.equal(serverCard.serverInfo?.name, 'sellico-public-mcp');
assert.equal(serverCard.transport?.type, 'streamable-http');
assert.equal(serverCard.transport?.endpoint, 'https://sellico.ru/mcp');
assert.equal(serverCard.authentication?.required, false);
assert.equal(serverCard.tools?.length, 5);
for (const tool of serverCard.tools) {
  assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name}: readOnlyHint must be true`);
  assert.equal(tool.annotations?.destructiveHint, false, `${tool.name}: destructiveHint must be false`);
}

const authMd = await read('auth.md');
assert.match(authMd, /^#\s+.*auth\.md/im, 'auth.md must have an H1 containing auth.md');

const prm = await json('.well-known/oauth-protected-resource');
assert.equal(prm.resource, 'https://sellico.ru');
assert.deepEqual(prm.authorization_servers, ['https://sellico.ru']);
assert.ok(prm.scopes_supported?.includes('mcp:tools:read'));
assert.ok(prm.bearer_methods_supported?.includes('header'));

for (const metaFile of ['.well-known/oauth-authorization-server', '.well-known/openid-configuration']) {
  const meta = await json(metaFile);
  assert.equal(meta.issuer, 'https://sellico.ru');
  assert.equal(meta.authorization_endpoint, 'https://sellico.ru/oauth2/authorize');
  assert.equal(meta.token_endpoint, 'https://sellico.ru/oauth2/token');
  assert.equal(meta.jwks_uri, 'https://sellico.ru/.well-known/jwks.json');
  assert.ok(meta.grant_types_supported?.length > 0);
  assert.ok(meta.response_types_supported?.includes('code'));
  assert.equal(meta.agent_auth?.skill, 'https://sellico.ru/auth.md');
  assert.equal(meta.agent_auth?.register_uri, 'https://sellico.ru/agent/identity');
  assert.ok(meta.agent_auth?.identity_types_supported?.includes('anonymous'));
}

const jwks = await json('.well-known/jwks.json');
assert.equal(jwks.keys?.[0]?.alg, 'ES256');

for (const forbidden of ['.well-known/ucp', '.well-known/acp.json']) {
  await assert.rejects(access(join('dist', forbidden)), `${forbidden} must not be generated without a commerce checkout API`);
}

const robots = await read('robots.txt');
for (const group of robots.split(/\n\s*\n/).filter((group) => group.includes('User-agent:'))) {
  assert.ok(group.includes('Content-Signal: search=yes, ai-input=yes, ai-train=no'));
}
assert.ok(robots.includes('Agentmap: https://sellico.ru/.well-known/ai-catalog.json'));
console.log(`Agent checks: ${pages.length} Markdown pages, MCP Server Card, catalogs, OpenAPI, skill integrity, content policy — OK`);
