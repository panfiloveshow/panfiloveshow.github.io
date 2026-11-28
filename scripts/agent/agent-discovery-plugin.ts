import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { handleOAuthAndAgentRequest } from './oauth.mjs';
import { handleA2aEndpoint, handleMcpEndpoint } from './server.mjs';

// Keep in sync with the nginx negotiation snippet. Wildcards alone prefer HTML.
export const acceptsMarkdown = (accept = '') => accept.split(',').some((part) => {
  const [type, ...parameters] = part.trim().toLowerCase().split(';');
  if (type.trim() !== 'text/markdown') return false;
  const quality = parameters.map((parameter) => parameter.trim()).find((parameter) => parameter.startsWith('q='));
  return !quality || (/^q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(quality) && Number(quality.slice(2)) > 0);
});

const discoveryLinks = '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </agents.md>; rel="service-doc", </llms.txt>; rel="llms", </.well-known/ai-catalog.json>; rel="describedby"; type="application/json", </.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json", </.well-known/agent-card.json>; rel="agent-card"; type="application/json"';

export function agentDiscoveryPlugin(directory = resolve('dist')): Plugin {
  const dist = resolve(directory);
  async function middleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const pathname = (req.url || '/').split('?')[0];
    if (pathname === '/mcp') {
      await handleMcpEndpoint(req, res, { distDir: dist, origin: 'https://sellico.ru' });
      return;
    }
    if (pathname === '/a2a') {
      await handleA2aEndpoint(req, res, { distDir: dist, origin: 'https://sellico.ru' });
      return;
    }
    if (await handleOAuthAndAgentRequest(req, res, { origin: 'https://sellico.ru' })) {
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method || 'GET')) return next();
    if (pathname === '/') res.setHeader('Link', discoveryLinks);
    const pageRequest = pathname.endsWith('/');
    if (pageRequest) {
      const vary = String(res.getHeader('Vary') || '').split(',').map((value) => value.trim()).filter(Boolean);
      res.setHeader('Vary', [...new Set([...vary, 'Accept'])].join(', '));
    }
    let file = pathname;
    let contentType = '';
    if (pageRequest && acceptsMarkdown(req.headers.accept)) {
      file = `${pathname}index.md`;
      contentType = 'text/markdown';
    } else if (pathname.endsWith('.md')) contentType = 'text/markdown';
    else if (pathname === '/.well-known/api-catalog') contentType = 'application/linkset+json';
    else if (pathname === '/mcp/server-card') {
      file = '/mcp/server-card.json';
      contentType = 'application/json';
    } else if (['/openapi.json', '/agent-pages.json', '/mcp/server-card.json', '/.well-known/ai-catalog.json', '/.well-known/agent-skills/index.json', '/.well-known/mcp/server-card.json'].includes(pathname)) contentType = 'application/json';
    else if (pathname.startsWith('/.well-known/')) contentType = pathname.endsWith('.txt') ? 'text/plain' : 'application/json';
    if (!contentType) return next();
    const absolute = resolve(dist, `.${file}`);
    if (!absolute.startsWith(`${dist}${sep}`)) return next();
    try {
      const body = await readFile(absolute);
      res.setHeader('Content-Type', `${contentType}; charset=utf-8`);
      res.setHeader('Content-Length', body.length);
      res.setHeader('Cache-Control', 'no-cache');
      if (pathname.startsWith('/.well-known/') || contentType === 'application/json' || pathname === '/auth.md') {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      if (contentType === 'text/markdown') res.setHeader('X-Robots-Tag', 'noindex, follow');
      res.statusCode = 200;
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      // Machine endpoints must never fall through to the SPA's HTML with status 200.
      res.statusCode = 404;
      res.end('Not found. Run pnpm build to generate agent resources.');
    }
  }
  return {
    name: 'sellico-agent-discovery',
    configureServer(server) { server.middlewares.use((req, res, next) => { void middleware(req, res, next); }); },
    configurePreviewServer(server) { server.middlewares.use((req, res, next) => { void middleware(req, res, next); }); },
  };
}
