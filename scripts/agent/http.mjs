export const MAX_BODY_BYTES = 64 * 1024;

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, MCP-Protocol-Version, Mcp-Session-Id');
  res.setHeader('Access-Control-Expose-Headers', 'MCP-Protocol-Version, Mcp-Session-Id, WWW-Authenticate');
}

export function sendJson(res, statusCode, payload, extraHeaders = {}, headOnly = false) {
  const body = Buffer.from(`${JSON.stringify(payload)}\n`, 'utf8');
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', body.length);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.end(headOnly ? undefined : body);
}

export function readRequestBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolvePromise, rejectPromise) => {
    const chunks = [];
    let total = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      total += chunk.length;
      if (total > maxBytes) {
        tooLarge = true;
        rejectPromise(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!tooLarge) resolvePromise(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', rejectPromise);
  });
}

export function parseBodyParams(rawBody, contentType = '') {
  const trimmed = rawBody.trim();
  if (!trimmed) return {};
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(trimmed).entries());
  }
  return JSON.parse(trimmed);
}
