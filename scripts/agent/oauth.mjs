import { createHash, generateKeyPairSync, randomUUID, sign as cryptoSign, verify as cryptoVerify } from 'node:crypto';
import {
  AGENT_SCOPES,
  buildA2aAgentCard,
  buildAuthorizationServerMetadata,
  buildProtectedResourceMetadata,
} from './cards.mjs';
import { MAX_BODY_BYTES, parseBodyParams, readRequestBody, sendJson, setCorsHeaders } from './http.mjs';

const AGENT_SCOPE_STRING = AGENT_SCOPES.join(' ');
const TOKEN_TTL_SECONDS = 3600;

// Ephemeral in-memory ES256 signing keypair for agent tokens (zero private keys on disk or in git)
const SIGNING_KEYPAIR = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const PUBLIC_JWK_RAW = SIGNING_KEYPAIR.publicKey.export({ format: 'jwk' });
const SIGNING_KID = createHash('sha256')
  .update(`${PUBLIC_JWK_RAW.x}.${PUBLIC_JWK_RAW.y}`)
  .digest('base64url')
  .slice(0, 16);

const revokedTokenIds = new Set();
const rateLimitBuckets = new Map();

function rememberRevocation(id) {
  if (!id) return;
  if (revokedTokenIds.size >= 10_000) {
    const oldest = revokedTokenIds.values().next().value;
    if (oldest) revokedTokenIds.delete(oldest);
  }
  revokedTokenIds.add(id);
}

function checkRateLimit(ip, limitPerMinute = 60) {
  const now = Date.now();
  if (rateLimitBuckets.size > 2000) rateLimitBuckets.clear();
  const key = ip || 'local';
  const entry = rateLimitBuckets.get(key);
  if (!entry || now - entry.windowStart > 60_000) {
    rateLimitBuckets.set(key, { windowStart: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limitPerMinute;
}

function signEs256Jwt(payload) {
  const headerSegment = Buffer.from(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: SIGNING_KID })).toString('base64url');
  const payloadSegment = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const signature = cryptoSign('sha256', Buffer.from(signingInput), {
    key: SIGNING_KEYPAIR.privateKey,
    dsaEncoding: 'ieee-p1363',
  }).toString('base64url');
  return `${signingInput}.${signature}`;
}

function verifyEs256Jwt(token, expectedIssuer) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerSeg, payloadSeg, sigSeg] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(headerSeg, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(payloadSeg, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!header || header.alg !== 'ES256' || !payload || typeof payload !== 'object') return null;
  const validSig = cryptoVerify(
    'sha256',
    Buffer.from(`${headerSeg}.${payloadSeg}`),
    { key: SIGNING_KEYPAIR.publicKey, dsaEncoding: 'ieee-p1363' },
    Buffer.from(sigSeg, 'base64url'),
  );
  if (!validSig) return null;
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== expectedIssuer) return null;
  if (typeof payload.exp !== 'number' || payload.exp <= now) return null;
  if (payload.jti && revokedTokenIds.has(payload.jti)) return null;
  return payload;
}

export function buildJwks() {
  return {
    keys: [
      {
        kty: 'EC',
        crv: 'P-256',
        use: 'sig',
        alg: 'ES256',
        kid: SIGNING_KID,
        x: PUBLIC_JWK_RAW.x,
        y: PUBLIC_JWK_RAW.y,
      },
    ],
  };
}

export function wwwAuthenticateHeader(origin, errorCode) {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const base = `Bearer resource_metadata="${cleanOrigin}/.well-known/oauth-protected-resource"`;
  return errorCode ? `${base}, error="${errorCode}"` : base;
}

export function extractBearerPayload(req, origin) {
  const auth = req.headers.authorization;
  if (!auth) return { present: false, payload: null };
  const match = auth.match(/^Bearer\s+(\S+)$/i);
  if (!match) return { present: true, payload: null };
  const cleanOrigin = origin.replace(/\/+$/, '');
  return { present: true, payload: verifyEs256Jwt(match[1], cleanOrigin) };
}

export async function handleOAuthAndAgentRequest(req, res, { origin = 'https://sellico.ru' } = {}) {
  const pathname = (req.url || '/').split('?')[0];
  const method = (req.method || 'GET').toUpperCase();
  const cleanOrigin = origin.replace(/\/+$/, '');

  const knownPaths = new Set([
    '/.well-known/agent-card.json',
    '/.well-known/oauth-protected-resource',
    '/.well-known/oauth-authorization-server',
    '/.well-known/openid-configuration',
    '/.well-known/jwks.json',
    '/agent/identity',
    '/agent/identity/claim',
    '/agent/event/notify',
    '/agent/me',
    '/oauth2/authorize',
    '/oauth2/token',
    '/oauth2/revoke',
  ]);
  if (!knownPaths.has(pathname)) return false;

  setCorsHeaders(res);
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (pathname === '/.well-known/agent-card.json' && (method === 'GET' || method === 'HEAD')) {
    sendJson(res, 200, buildA2aAgentCard(cleanOrigin), {}, method === 'HEAD');
    return true;
  }

  if (pathname === '/.well-known/oauth-protected-resource' && (method === 'GET' || method === 'HEAD')) {
    sendJson(res, 200, buildProtectedResourceMetadata(cleanOrigin), {}, method === 'HEAD');
    return true;
  }

  if (
    (pathname === '/.well-known/oauth-authorization-server' || pathname === '/.well-known/openid-configuration') &&
    (method === 'GET' || method === 'HEAD')
  ) {
    sendJson(res, 200, buildAuthorizationServerMetadata(cleanOrigin), {}, method === 'HEAD');
    return true;
  }

  if (pathname === '/.well-known/jwks.json' && (method === 'GET' || method === 'HEAD')) {
    sendJson(res, 200, buildJwks(), {}, method === 'HEAD');
    return true;
  }

  if (pathname === '/agent/me' && (method === 'GET' || method === 'HEAD')) {
    const bearer = extractBearerPayload(req, cleanOrigin);
    if (!bearer.present || !bearer.payload || bearer.payload.typ !== 'access_token') {
      sendJson(
        res,
        401,
        { error: 'unauthorized', error_description: 'Provide a valid Bearer access_token obtained via /auth.md' },
        { 'WWW-Authenticate': wwwAuthenticateHeader(cleanOrigin, bearer.present ? 'invalid_token' : undefined) },
        method === 'HEAD',
      );
      return true;
    }
    sendJson(
      res,
      200,
      {
        sub: bearer.payload.sub,
        iss: bearer.payload.iss,
        scope: bearer.payload.scope,
        exp: bearer.payload.exp,
        access_level: 'public_read_only',
      },
      {},
      method === 'HEAD',
    );
    return true;
  }

  if (pathname === '/oauth2/authorize' && (method === 'GET' || method === 'HEAD')) {
    const html = Buffer.from(
      `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Sellico Agent OAuth</title></head><body><h1>Авторизация AI-агентов Sellico</h1><p>Публичные read-only агенты регистрируются автоматически по протоколу <a href="${cleanOrigin}/auth.md">auth.md</a> (<code>POST ${cleanOrigin}/agent/identity</code>).</p><p>Для входа человека в приватное рабочее пространство магазина используйте <a href="${cleanOrigin}/login">${cleanOrigin}/login</a> или <a href="${cleanOrigin}/register">${cleanOrigin}/register</a>.</p></body></html>\n`,
      'utf8',
    );
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', html.length);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.end(method === 'HEAD' ? undefined : html);
    return true;
  }

  if (pathname === '/agent/identity/claim' && (method === 'GET' || method === 'POST')) {
    sendJson(res, 200, {
      status: 'human_registration_required_for_private_crm',
      verification_uri: `${cleanOrigin}/register`,
      login_uri: `${cleanOrigin}/login`,
      message:
        'Агентские токены предоставляют read-only доступ к публичным данным и MCP-инструментам Sellico. Владелец магазина создаёт приватное рабочее пространство самостоятельно на https://sellico.ru/register.',
    });
    return true;
  }

  if (method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' }, { Allow: 'POST, OPTIONS' });
    return true;
  }

  const clientIp = String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'local');
  if (!checkRateLimit(clientIp)) {
    sendJson(res, 429, { error: 'slow_down', error_description: 'Rate limit exceeded' });
    return true;
  }

  let bodyObj;
  try {
    const raw = await readRequestBody(req, MAX_BODY_BYTES);
    bodyObj = parseBodyParams(raw, String(req.headers['content-type'] || ''));
  } catch {
    sendJson(res, 400, { error: 'invalid_request', error_description: 'Malformed request body' });
    return true;
  }

  if (pathname === '/agent/identity') {
    const reqType = bodyObj?.type ? String(bodyObj.type) : 'anonymous';
    if (reqType !== 'anonymous') {
      sendJson(res, 400, {
        error: 'unsupported_identity_type',
        error_description: 'Sellico public agent server supports anonymous read-only registration ("type": "anonymous").',
      });
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    const agentId = `agent_anon_${randomUUID()}`;
    const identityAssertion = signEs256Jwt({
      iss: cleanOrigin,
      sub: agentId,
      aud: cleanOrigin,
      jti: randomUUID(),
      typ: 'identity_assertion',
      scope: AGENT_SCOPE_STRING,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    });
    const claimToken = signEs256Jwt({
      iss: cleanOrigin,
      sub: agentId,
      aud: cleanOrigin,
      jti: randomUUID(),
      typ: 'claim_token',
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    });
    sendJson(res, 200, {
      type: 'anonymous',
      agent_id: agentId,
      identity_assertion: identityAssertion,
      claim_token: claimToken,
      claim_uri: `${cleanOrigin}/agent/identity/claim`,
      scopes: AGENT_SCOPES,
      expires_in: TOKEN_TTL_SECONDS,
    });
    return true;
  }

  if (pathname === '/oauth2/token') {
    const grantType = String(bodyObj?.grant_type || '');
    const now = Math.floor(Date.now() / 1000);

    if (grantType === 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
      const verified = verifyEs256Jwt(String(bodyObj?.assertion || ''), cleanOrigin);
      if (!verified || verified.typ !== 'identity_assertion') {
        sendJson(res, 400, { error: 'invalid_grant', error_description: 'Invalid or expired identity_assertion' });
        return true;
      }
      const accessToken = signEs256Jwt({
        iss: cleanOrigin,
        sub: verified.sub,
        aud: cleanOrigin,
        jti: randomUUID(),
        typ: 'access_token',
        scope: AGENT_SCOPE_STRING,
        iat: now,
        exp: now + TOKEN_TTL_SECONDS,
      });
      sendJson(res, 200, {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: TOKEN_TTL_SECONDS,
        scope: AGENT_SCOPE_STRING,
      });
      return true;
    }

    if (grantType === 'client_credentials') {
      const accessToken = signEs256Jwt({
        iss: cleanOrigin,
        sub: `agent_client_${randomUUID()}`,
        aud: cleanOrigin,
        jti: randomUUID(),
        typ: 'access_token',
        scope: AGENT_SCOPE_STRING,
        iat: now,
        exp: now + TOKEN_TTL_SECONDS,
      });
      sendJson(res, 200, {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: TOKEN_TTL_SECONDS,
        scope: AGENT_SCOPE_STRING,
      });
      return true;
    }

    if (grantType === 'urn:workos:agent-auth:grant-type:claim') {
      sendJson(res, 400, {
        error: 'authorization_pending',
        error_description: 'Private seller workspaces are created manually by the store owner at https://sellico.ru/register',
      });
      return true;
    }

    sendJson(res, 400, { error: 'unsupported_grant_type', error_description: `Unsupported grant_type: ${grantType}` });
    return true;
  }

  if (pathname === '/oauth2/revoke') {
    const token = String(bodyObj?.token || '');
    const verified = verifyEs256Jwt(token, cleanOrigin);
    if (verified?.jti) rememberRevocation(verified.jti);
    sendJson(res, 200, { revoked: true });
    return true;
  }

  if (pathname === '/agent/event/notify') {
    res.statusCode = 202;
    res.end();
    return true;
  }

  return false;
}
