import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildA2aAgentCard, buildMcpServerCard } from './cards.mjs';
import { MAX_BODY_BYTES, readRequestBody, sendJson, setCorsHeaders } from './http.mjs';
import { extractBearerPayload, handleOAuthAndAgentRequest, wwwAuthenticateHeader } from './oauth.mjs';
import { executeTool, MCP_PROTOCOL_VERSION, MCP_TOOLS } from './tools.mjs';

const SUPPORTED_PROTOCOL_VERSIONS = new Set(['2025-06-18', '2025-03-26', '2024-11-05']);

async function handleJsonRpcMessage(message, context) {
  if (!message || typeof message !== 'object' || Array.isArray(message) || message.jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id: message && typeof message === 'object' && 'id' in message ? message.id : null,
      error: { code: -32600, message: 'Invalid Request: expected JSON-RPC 2.0 object' },
    };
  }

  const isNotification = !('id' in message) || message.id === undefined;
  const method = message.method;
  if (typeof method !== 'string') {
    if (isNotification) return null;
    return {
      jsonrpc: '2.0',
      id: message.id,
      error: { code: -32600, message: 'Invalid Request: missing method string' },
    };
  }

  if (isNotification) return null;

  const id = message.id;
  const params = message.params && typeof message.params === 'object' ? message.params : {};

  if (method === 'initialize') {
    const requestedVersion = typeof params.protocolVersion === 'string' ? params.protocolVersion : '';
    const negotiated = SUPPORTED_PROTOCOL_VERSIONS.has(requestedVersion) ? requestedVersion : MCP_PROTOCOL_VERSION;
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: negotiated,
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: 'sellico-public-mcp',
          title: 'Sellico Public MCP Server',
          version: '1.0.0',
        },
        instructions:
          'Публичный read-only сервер российской SaaS-платформы Sellico (sellico.ru) для продавцов на Wildberries, Ozon и Яндекс Маркете. Используйте инструменты для поиска и чтения канонических страниц, проверки тарифов и расчёта маржи или юнит-экономики. Сервер не изменяет данные пользователей.',
      },
    };
  }

  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
  if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: MCP_TOOLS } };

  if (method === 'tools/call') {
    const toolName = typeof params.name === 'string' ? params.name : '';
    const knownTool = MCP_TOOLS.find((tool) => tool.name === toolName);
    if (!knownTool) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Invalid params: unknown tool "${toolName}"` },
      };
    }
    try {
      const output = await executeTool(toolName, params.arguments, context);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
          isError: false,
        },
      };
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Ошибка выполнения инструмента';
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text }],
          isError: true,
        },
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

export async function handleMcpEndpoint(req, res, { distDir = resolve('dist'), origin = 'https://sellico.ru' } = {}) {
  setCorsHeaders(res);
  const method = (req.method || 'GET').toUpperCase();
  const cleanOrigin = origin.replace(/\/+$/, '');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const bearer = extractBearerPayload(req, cleanOrigin);
  if (bearer.present && (!bearer.payload || bearer.payload.typ !== 'access_token')) {
    sendJson(
      res,
      401,
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32001, message: 'Unauthorized: invalid or revoked Bearer token' },
      },
      { 'WWW-Authenticate': wwwAuthenticateHeader(cleanOrigin, 'invalid_token') },
    );
    return;
  }

  if (method !== 'POST') {
    sendJson(
      res,
      405,
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32000, message: 'Method Not Allowed: stateless Streamable HTTP MCP accepts POST /mcp' },
      },
      { Allow: 'POST, OPTIONS' },
    );
    return;
  }

  let rawBody = '';
  try {
    rawBody = await readRequestBody(req, MAX_BODY_BYTES);
  } catch (error) {
    const statusCode = error && typeof error === 'object' && 'statusCode' in error ? error.statusCode : 400;
    sendJson(res, statusCode, {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: statusCode === 413 ? 'Payload Too Large' : 'Failed to read request body' },
    });
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    sendJson(res, 400, {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: invalid JSON payload' },
    });
    return;
  }

  const context = { distDir: resolve(distDir), origin: cleanOrigin };
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      sendJson(res, 400, {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32600, message: 'Invalid Request: empty JSON-RPC batch' },
      });
      return;
    }
    const responses = (await Promise.all(parsed.map((item) => handleJsonRpcMessage(item, context)))).filter(Boolean);
    if (responses.length === 0) {
      res.statusCode = 202;
      res.end();
      return;
    }
    sendJson(res, 200, responses, { 'MCP-Protocol-Version': MCP_PROTOCOL_VERSION });
    return;
  }

  const response = await handleJsonRpcMessage(parsed, context);
  if (response === null) {
    res.statusCode = 202;
    res.end();
    return;
  }
  sendJson(res, 200, response, { 'MCP-Protocol-Version': MCP_PROTOCOL_VERSION });
}

export async function handleA2aEndpoint(req, res, { distDir = resolve('dist'), origin = 'https://sellico.ru' } = {}) {
  setCorsHeaders(res);
  const method = (req.method || 'GET').toUpperCase();
  const cleanOrigin = origin.replace(/\/+$/, '');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const bearer = extractBearerPayload(req, cleanOrigin);
  if (bearer.present && (!bearer.payload || bearer.payload.typ !== 'access_token')) {
    sendJson(
      res,
      401,
      { jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Unauthorized: invalid Bearer token' } },
      { 'WWW-Authenticate': wwwAuthenticateHeader(cleanOrigin, 'invalid_token') },
    );
    return;
  }

  if (method === 'GET' || method === 'HEAD') {
    sendJson(res, 200, buildA2aAgentCard(cleanOrigin), {}, method === 'HEAD');
    return;
  }

  if (method !== 'POST') {
    sendJson(res, 405, { jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Method Not Allowed' } }, { Allow: 'POST, GET, OPTIONS' });
    return;
  }

  let parsed;
  try {
    const raw = await readRequestBody(req, MAX_BODY_BYTES);
    parsed = JSON.parse(raw);
  } catch {
    sendJson(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }

  if (!parsed || typeof parsed !== 'object' || parsed.jsonrpc !== '2.0' || typeof parsed.method !== 'string') {
    sendJson(res, 400, { jsonrpc: '2.0', id: parsed?.id ?? null, error: { code: -32600, message: 'Invalid JSON-RPC 2.0 request' } });
    return;
  }

  const id = parsed.id ?? null;
  if (parsed.method === 'agent/authenticatedExtendedCard' || parsed.method === 'agent/card') {
    sendJson(res, 200, { jsonrpc: '2.0', id, result: buildA2aAgentCard(cleanOrigin) });
    return;
  }

  if (!['message/send', 'SendMessage', 'tasks/send'].includes(parsed.method)) {
    sendJson(res, 200, { jsonrpc: '2.0', id, error: { code: -32601, message: `Unsupported A2A method: ${parsed.method}` } });
    return;
  }

  const parts = Array.isArray(parsed.params?.message?.parts) ? parsed.params.message.parts : [];
  const queryText = parts
    .map((part) => (typeof part?.text === 'string' ? part.text.trim() : ''))
    .filter(Boolean)
    .join(' ')
    .slice(0, 200);

  if (!queryText) {
    sendJson(res, 200, { jsonrpc: '2.0', id, error: { code: -32602, message: 'Expected non-empty text part in params.message.parts' } });
    return;
  }

  const context = { distDir: resolve(distDir), origin: cleanOrigin };
  let answerText = '';
  try {
    if (/(тариф|цен|стоим|pricing|plan|бесплатн)/i.test(queryText)) {
      const pricing = await executeTool('sellico_get_pricing', {}, context);
      const lines = pricing.plans.map((p) => `- ${p.name}: ${p.priceFrom ? 'от ' : ''}${p.monthlyPriceRub} ₽/мес.`);
      answerText = `Тарифы Sellico (${pricing.canonicalUrl}):\n${lines.join('\n')}\nПробный период: 3 дня без привязки банковской карты.`;
    } else {
      const found = await executeTool('sellico_search_pages', { query: queryText, limit: 5 }, context);
      if (found.pages.length > 0) {
        const list = found.pages.map((p) => `- ${p.title}: ${p.url} (${p.path}) — ${p.description}`).join('\n');
        answerText = `Найденные канонические страницы Sellico по запросу «${queryText}»:\n${list}`;
      } else {
        answerText = `Прямых совпадений по запросу «${queryText}» не найдено. Основные разделы: ${cleanOrigin}/features/, ${cleanOrigin}/compare/, ${cleanOrigin}/pricing/, ${cleanOrigin}/calculators/.`;
      }
    }
  } catch {
    answerText = `Справка Sellico доступна на ${cleanOrigin}/llms.txt и ${cleanOrigin}/agents.md.`;
  }

  const taskId = randomUUID();
  sendJson(res, 200, {
    jsonrpc: '2.0',
    id,
    result: {
      kind: 'task',
      id: taskId,
      contextId: typeof parsed.params?.message?.contextId === 'string' ? parsed.params.message.contextId : taskId,
      status: {
        state: 'completed',
        timestamp: new Date().toISOString(),
      },
      artifacts: [
        {
          artifactId: randomUUID(),
          name: 'sellico-public-response',
          parts: [{ kind: 'text', text: answerText }],
        },
      ],
    },
  });
}

export function createMcpHttpServer({ distDir = resolve('dist'), origin = 'https://sellico.ru' } = {}) {
  const cardPayload = Buffer.from(`${JSON.stringify(buildMcpServerCard(origin), null, 2)}\n`, 'utf8');
  return createServer((req, res) => {
    const pathname = (req.url || '/').split('?')[0];
    if (pathname === '/healthz' && (req.method === 'GET' || req.method === 'HEAD')) {
      setCorsHeaders(res);
      sendJson(
        res,
        200,
        { status: 'ok', service: 'sellico-public-mcp', protocolVersion: MCP_PROTOCOL_VERSION },
        {},
        req.method === 'HEAD',
      );
      return;
    }
    if (
      (pathname === '/.well-known/mcp/server-card.json' ||
        pathname === '/mcp/server-card' ||
        pathname === '/mcp/server-card.json') &&
      (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS')
    ) {
      setCorsHeaders(res);
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Length', cardPayload.length);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(req.method === 'HEAD' ? undefined : cardPayload);
      return;
    }
    if (pathname === '/mcp') {
      void handleMcpEndpoint(req, res, { distDir, origin });
      return;
    }
    if (pathname === '/a2a') {
      void handleA2aEndpoint(req, res, { distDir, origin });
      return;
    }
    void handleOAuthAndAgentRequest(req, res, { origin }).then((handled) => {
      if (!handled) {
        setCorsHeaders(res);
        sendJson(res, 404, { error: 'Not Found' });
      }
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const host = process.env.MCP_HOST || '127.0.0.1';
  const port = Number(process.env.MCP_PORT || process.env.PORT || 4180);
  const distDir = resolve(process.env.MCP_DIST_DIR || 'dist');
  const origin = process.env.MCP_ORIGIN || 'https://sellico.ru';
  const server = createMcpHttpServer({ distDir, origin });
  server.listen(port, host, () => {
    console.log(`Sellico MCP & Agent OAuth server listening on http://${host}:${port} (dist: ${distDir})`);
  });
  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
