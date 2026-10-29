export type ServerState = 'enabled' | 'disabled' | 'invalid' | 'conflict';

export type TransportKind = 'local' | 'remote' | 'unknown';

export type ConflictKind =
  | 'both'
  | 'read-error'
  | 'duplicate'
  | 'invalid'
  | 'tools-off'
  | 'insecure-url';

export type ConfigView = {
  path: string;
  exists: boolean;
  error: string | null;
};

export type ConflictView = {
  kind: ConflictKind;
  serverId: string;
  message: string;
  paths: string[];
  blocking: boolean;
};

export type ServerView = {
  id: string;
  transport: TransportKind;
  command: string[];
  url: string | null;
  cwd: string | null;
  environmentKeys: string[];
  headerKeys: string[];
  timeout: number | null;
  oauth: 'auto' | 'disabled' | 'configured' | 'none';
  enabled: boolean;
  state: ServerState;
  advertised: boolean;
  toolsOff: string[];
  paths: string[];
  conflicts: ConflictView[];
  warnings: string[];
  contentHash: string;
};

export type Summary = {
  total: number;
  advertised: number;
  enabled: number;
  disabled: number;
  invalid: number;
  blockingConflicts: number;
  warnings: number;
};

export type ServersResponse = {
  servers: ServerView[];
  conflicts: ConflictView[];
  summary: Summary;
  config: ConfigView;
  scanned: ConfigView[];
  scannedAt: number;
};

export type DefinedServer = {
  id: string;
  definition: Record<string, unknown>;
  enabled: boolean;
};

export type DetailResponse = {
  id: string;
  definition: Record<string, unknown>;
  paths: string[];
  maskedPaths: string[];
};

export type ImportResponse = {
  drafts: DefinedServer[];
  existing: string[];
  source: string;
};

export type BulkResponse = ServersResponse & {
  changed: string[];
};

export type BatchResponse = ServersResponse & {
  changed: string[];
};

export type ResolveResponse = ServersResponse & {
  backupPath: string;
};

export type SaveResponse = ServersResponse & {
  id: string;
  backupPath: string | null;
};

export type RemoveResponse = ServersResponse & {
  id: string;
  removedPaths: string[];
};

export type ErrorResponse = {
  error: string;
  code?: string;
  conflicts?: ConflictView[];
};
