import type { IncomingMessage, Server, ServerResponse } from 'node:http';

export interface McpServerOptions {
  distDir?: string;
  origin?: string;
}

export function handleMcpEndpoint(
  req: IncomingMessage,
  res: ServerResponse,
  options?: McpServerOptions,
): Promise<void>;

export function handleA2aEndpoint(
  req: IncomingMessage,
  res: ServerResponse,
  options?: McpServerOptions,
): Promise<void>;

export function createMcpHttpServer(options?: McpServerOptions): Server;
