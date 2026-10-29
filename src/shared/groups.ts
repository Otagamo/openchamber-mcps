export type ServerGroup = {
  id: string;
  name: string;
  serverIds: string[];
};

export type GroupsFile = {
  version: 1;
  groups: ServerGroup[];
};

export const GROUP_LIMIT = 50;
export const GROUP_NAME_MAX = 40;
export const GROUP_MEMBER_LIMIT = 200;
export const GROUP_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const RESERVED_GROUP_IDS = new Set(['all', 'new']);

export class GroupFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroupFileError';
  }
}

// MCP servers are project-specific; shipping presets would reference servers nobody has.
export const DEFAULT_SERVER_GROUPS: ServerGroup[] = [];

export const cloneDefaultGroups = (): ServerGroup[] =>
  DEFAULT_SERVER_GROUPS.map((group) => ({ ...group, serverIds: [...group.serverIds] }));

export const normalizeGroupsFile = (value: unknown): GroupsFile => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GroupFileError('Invalid group config format');
  }
  const record = value as Record<string, unknown>;
  if (record.version !== 1) throw new GroupFileError('Unsupported group config version');
  if (!Array.isArray(record.groups)) throw new GroupFileError('Invalid group list format');
  if (record.groups.length > GROUP_LIMIT) throw new GroupFileError(`Cannot have more than ${GROUP_LIMIT} groups`);

  const groups: ServerGroup[] = [];
  const groupIds = new Set<string>();
  const names = new Set<string>();
  for (const [index, item] of record.groups.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new GroupFileError(`Group ${index + 1} has an invalid format`);
    }
    const group = item as Record<string, unknown>;
    if (typeof group.id !== 'string' || !GROUP_ID_PATTERN.test(group.id) || RESERVED_GROUP_IDS.has(group.id)) {
      throw new GroupFileError(`Group ${index + 1} has an invalid ID`);
    }
    if (groupIds.has(group.id)) throw new GroupFileError(`Duplicate group ID: ${group.id}`);
    const name = typeof group.name === 'string' ? group.name.trim() : '';
    if (!name || name.length > GROUP_NAME_MAX || /[\u0000-\u001f\u007f]/.test(name)) {
      throw new GroupFileError(`Group ${index + 1} name must be 1-${GROUP_NAME_MAX} characters`);
    }
    const nameKey = name.toLowerCase();
    if (names.has(nameKey)) throw new GroupFileError(`Duplicate group name: ${name}`);
    if (!Array.isArray(group.serverIds)) throw new GroupFileError(`Group "${name}" has an invalid member format`);
    if (group.serverIds.length > GROUP_MEMBER_LIMIT) {
      throw new GroupFileError(`Group "${name}" cannot have more than ${GROUP_MEMBER_LIMIT} members`);
    }
    const serverIds: string[] = [];
    const seen = new Set<string>();
    for (const serverId of group.serverIds) {
      if (typeof serverId !== 'string' || !serverId || serverId.length > 128) {
        throw new GroupFileError(`Group "${name}" contains an invalid server ID`);
      }
      if (seen.has(serverId)) continue;
      seen.add(serverId);
      serverIds.push(serverId);
    }
    groupIds.add(group.id);
    names.add(nameKey);
    groups.push({ id: group.id, name, serverIds });
  }
  return { version: 1, groups };
};
