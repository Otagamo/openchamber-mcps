import http from 'node:http';
import os from 'node:os';
import { GroupError, readGroups, writeGroups } from '../core/groups.ts';
import { McpError } from '../core/errors.ts';
import {
  batchSetEnabled,
  bulkSetEnabled,
  importManifest,
  readDefinition,
  removeServer,
  resolveDuplicate,
  saveServer,
  scanServers,
  setServerEnabled,
} from '../core/servers.ts';

const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
const token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? '';
if (!port || !token) {
  console.error('OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required');
  process.exit(1);
}

const HOME = os.homedir();

const json = (res: http.ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
};

const readBody = (req: http.IncomingMessage): Promise<Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let failed = false;
    req.on('data', (chunk: Buffer) => {
      if (failed) return;
      size += chunk.length;
      if (size > 1024 * 1024) {
        failed = true;
        chunks.length = 0;
        reject(new McpError('too-large', 413, 'Request body too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', () => reject(new McpError('invalid-request', 400, 'Request interrupted, retry')));
    req.on('end', () => {
      if (failed) return;
      try {
        const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
        resolve(parsed as Record<string, unknown>);
      } catch {
        reject(new McpError('invalid-request', 400, 'Request body must be a valid JSON object'));
      }
    });
  });

let queue: Promise<unknown> = Promise.resolve();
const exclusive = <T>(action: () => Promise<T>): Promise<T> => {
  const next = queue.then(() => action(), () => action());
  queue = next.catch(() => undefined);
  return next;
};

const stringField = (body: Record<string, unknown>, key: string, max: number): string => {
  const value = typeof body[key] === 'string' ? body[key].trim() : '';
  if (!value) throw new McpError('invalid-request', 400, `Missing ${key}`);
  if (value.length > max) throw new McpError('invalid-request', 400, `${key} is too long`);
  return value;
};

const optionalStringField = (body: Record<string, unknown>, key: string, max: number): string | undefined => {
  if (body[key] === undefined || body[key] === null || body[key] === '') return undefined;
  return stringField(body, key, max);
};

const booleanField = (body: Record<string, unknown>, key: string): boolean => {
  const value = body[key];
  if (typeof value !== 'boolean') throw new McpError('invalid-request', 400, `${key} must be a boolean`);
  return value;
};

const stringArrayField = (body: Record<string, unknown>, key: string): string[] => {
  const value = body[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.length === 0 || item.length > 128)) {
    throw new McpError('invalid-request', 400, `${key} must be an array of MCP server IDs`);
  }
  if (value.length > 200) throw new McpError('invalid-request', 400, `${key} has too many entries`);
  return value as string[];
};

const handle = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
  if (req.headers.authorization !== `Bearer ${token}`) {
    throw new McpError('unauthorized', 401, 'unauthorized');
  }
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (url.pathname === '/health' && req.method === 'GET') {
    json(res, 200, { ok: true });
    return;
  }
  if (url.pathname === '/servers' && req.method === 'GET') {
    json(res, 200, await exclusive(() => scanServers(HOME)));
    return;
  }
  if (url.pathname === '/servers/detail' && req.method === 'GET') {
    const id = url.searchParams.get('id')?.trim() ?? '';
    if (!id) throw new McpError('invalid-request', 400, 'Missing id');
    json(res, 200, await exclusive(() => readDefinition(HOME, id)));
    return;
  }
  if (url.pathname === '/servers/toggle' && req.method === 'POST') {
    const body = await readBody(req);
    const id = stringField(body, 'id', 128);
    const enabled = booleanField(body, 'enabled');
    json(res, 200, await exclusive(() => setServerEnabled(HOME, id, enabled)));
    return;
  }
  if (url.pathname === '/servers/bulk' && req.method === 'POST') {
    const body = await readBody(req);
    const enabled = booleanField(body, 'enabled');
    json(res, 200, await exclusive(() => bulkSetEnabled(HOME, enabled)));
    return;
  }
  if (url.pathname === '/servers/batch' && req.method === 'POST') {
    const body = await readBody(req);
    const enable = stringArrayField(body, 'enable');
    const disable = stringArrayField(body, 'disable');
    json(res, 200, await exclusive(() => batchSetEnabled(HOME, enable, disable)));
    return;
  }
  if (url.pathname === '/servers/save' && req.method === 'POST') {
    const body = await readBody(req);
    const definition = body.definition;
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      throw new McpError('invalid-request', 400, 'definition must be a JSON object');
    }
    const input = {
      id: optionalStringField(body, 'id', 128),
      previousId: optionalStringField(body, 'previousId', 128),
      definition,
      enabled: body.enabled === undefined ? undefined : booleanField(body, 'enabled'),
    };
    json(res, 200, await exclusive(() => saveServer(HOME, input)));
    return;
  }
  if (url.pathname === '/servers/remove' && req.method === 'POST') {
    const body = await readBody(req);
    const id = stringField(body, 'id', 128);
    json(res, 200, await exclusive(() => removeServer(HOME, id)));
    return;
  }
  if (url.pathname === '/servers/import' && req.method === 'POST') {
    const body = await readBody(req);
    const kind = stringField(body, 'kind', 16);
    const value = typeof body.value === 'string' ? body.value : '';
    json(res, 200, await exclusive(() => importManifest(HOME, kind, value)));
    return;
  }
  if (url.pathname === '/servers/resolve' && req.method === 'POST') {
    const body = await readBody(req);
    const id = stringField(body, 'id', 128);
    const keep = stringField(body, 'keep', 4096);
    json(res, 200, await exclusive(() => resolveDuplicate(HOME, id, keep)));
    return;
  }
  if (url.pathname === '/groups' && req.method === 'GET') {
    json(res, 200, await exclusive(() => readGroups(HOME)));
    return;
  }
  if (url.pathname === '/groups' && req.method === 'POST') {
    const body = await readBody(req);
    json(res, 200, await exclusive(() => writeGroups(HOME, body)));
    return;
  }
  throw new McpError('not-found', 404, 'not-found');
};

const server = http.createServer((req, res) => {
  void handle(req, res).catch((error: unknown) => {
    if (res.headersSent || res.destroyed) return;
    if (error instanceof McpError || error instanceof GroupError) {
      json(res, error.status, {
        error: error.message,
        code: error.code,
        ...(error instanceof McpError && error.conflicts ? { conflicts: error.conflicts } : {}),
      });
      return;
    }
    console.error('mcp service:', error instanceof Error ? error.message : error);
    json(res, 500, { error: 'Local service failed to handle the request, retry', code: 'internal' });
  });
});

server.listen(port, '127.0.0.1');
