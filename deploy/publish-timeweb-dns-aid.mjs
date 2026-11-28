#!/usr/bin/env node
/**
 * Idempotently publishes DNS for AI Discovery (DNS-AID, draft-mozleywilliams-dnsop-dnsaid / RFC 9460)
 * records for sellico.ru via Timeweb Cloud DNS API v1.
 *
 * Usage:
 *   node deploy/publish-timeweb-dns-aid.mjs --dry-run
 *   TIMEWEB_TOKEN="<token>" node deploy/publish-timeweb-dns-aid.mjs
 */

import { pathToFileURL } from 'node:url';

const DOMAIN = process.env.DNS_DOMAIN || 'sellico.ru';
const API_BASE = `https://api.timeweb.cloud/api/v1/domains/${encodeURIComponent(DOMAIN)}/dns-records`;
const DRY_RUN = process.argv.includes('--dry-run');
const TOKEN = process.env.TIMEWEB_TOKEN || '';

export const DNS_AID_RECORDS = [
  {
    subdomain: '_index._agents',
    type: 'SVCB',
    value: '1 sellico.ru. alpn="h2" port="443" key65400="/.well-known/ai-catalog.json"',
    bind: '_index._agents.sellico.ru. 3600 IN SVCB 1 sellico.ru. alpn="h2" port="443" key65400="/.well-known/ai-catalog.json"',
  },
  {
    subdomain: '_mcp._agents',
    type: 'SVCB',
    value: '1 sellico.ru. alpn="h2" port="443" key65400="/mcp"',
    bind: '_mcp._agents.sellico.ru.   3600 IN SVCB 1 sellico.ru. alpn="h2" port="443" key65400="/mcp"',
  },
  {
    subdomain: '_a2a._agents',
    type: 'SVCB',
    value: '1 sellico.ru. alpn="h2" port="443" key65400="/a2a"',
    bind: '_a2a._agents.sellico.ru.   3600 IN SVCB 1 sellico.ru. alpn="h2" port="443" key65400="/a2a"',
  },
  {
    subdomain: '_catalog._agents',
    type: 'TXT',
    value: 'v=aid1; catalog=https://sellico.ru/.well-known/ai-catalog.json; mcp=https://sellico.ru/.well-known/mcp/server-card.json; a2a=https://sellico.ru/.well-known/agent-card.json',
    bind: '_catalog._agents.sellico.ru. 3600 IN TXT "v=aid1; catalog=https://sellico.ru/.well-known/ai-catalog.json; mcp=https://sellico.ru/.well-known/mcp/server-card.json; a2a=https://sellico.ru/.well-known/agent-card.json"',
  },
];

export const DNSSEC_DS_RECORD = {
  keyTag: 17472,
  algorithm: 13,
  digestType: 2,
  digest: '6130D6C850B0EE3315FA9BCF77D32C85C3B7672F63E16913924A211463EED9E5',
};

async function main() {
  if (DRY_RUN) {
    console.log(`DNS-AID dry-run for ${DOMAIN} (${API_BASE}):\n`);
    for (const rec of DNS_AID_RECORDS) {
      console.log(`  [${rec.type}] ${rec.subdomain}.${DOMAIN}`);
      console.log(`    BIND: ${rec.bind}`);
      console.log(`    API payload: ${JSON.stringify({ subdomain: rec.subdomain, type: rec.type, value: rec.value })}`);
    }
    console.log('\nRegistrar (.RU / ТЦИ) DNSSEC DS delegation parameters:');
    console.log(`  Key Tag: ${DNSSEC_DS_RECORD.keyTag} | Alg: ${DNSSEC_DS_RECORD.algorithm} (ECDSAP256SHA256) | Digest Type: ${DNSSEC_DS_RECORD.digestType} (SHA-256)`);
    console.log(`  Digest:  ${DNSSEC_DS_RECORD.digest}`);
    return;
  }

  if (!TOKEN) {
    console.error('Missing TIMEWEB_TOKEN environment variable. Run with --dry-run to preview payloads.');
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const listRes = await fetch(`${API_BASE}?limit=200`, { headers });
  if (!listRes.ok) {
    throw new Error(`Failed to fetch existing DNS records: HTTP ${listRes.status} ${await listRes.text()}`);
  }
  const listJson = await listRes.json();
  const existing = Array.isArray(listJson.dns_records) ? listJson.dns_records : [];

  for (const rec of DNS_AID_RECORDS) {
    const match = existing.find(
      (item) =>
        String(item.type || '').toUpperCase() === rec.type &&
        String(item.data?.subdomain || item.subdomain || '') === rec.subdomain,
    );
    if (match && String(match.data?.value || '') === rec.value) {
      console.log(`[skip] ${rec.type} ${rec.subdomain}.${DOMAIN} already up to date (id=${match.id})`);
      continue;
    }
    const url = match ? `${API_BASE}/${match.id}` : API_BASE;
    const method = match ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({ subdomain: rec.subdomain, type: rec.type, value: rec.value }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[warn] ${method} ${rec.type} ${rec.subdomain}.${DOMAIN} returned HTTP ${res.status}: ${errText}`);
      console.error(`       Add manually via BIND zone import: ${rec.bind}`);
      continue;
    }
    console.log(`[ok] ${method} ${rec.type} ${rec.subdomain}.${DOMAIN}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
