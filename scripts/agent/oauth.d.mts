import type { IncomingMessage, ServerResponse } from 'node:http';

export function buildJwks(): Record<string, unknown>;

export function handleOAuthAndAgentRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options?: { origin?: string },
): Promise<boolean>;
