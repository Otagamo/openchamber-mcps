import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { GroupFileError, cloneDefaultGroups, normalizeGroupsFile, type GroupsFile } from '../shared/groups.ts';

const DATA_DIR = ['.config', 'openchamber', 'mcp-manager'] as const;
const GROUPS_FILE = 'groups.json';

export class GroupError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'GroupError';
    this.code = code;
    this.status = status;
  }
}

const defaults = (): GroupsFile => ({ version: 1, groups: cloneDefaultGroups() });

const groupsFile = (home: string): string => path.join(home, ...DATA_DIR, GROUPS_FILE);

export const readGroups = async (home: string): Promise<GroupsFile> => {
  let raw: string;
  try {
    raw = await fs.readFile(groupsFile(home), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return defaults();
    throw new GroupError('read-error', 500, 'Cannot read group config, check file permissions');
  }
  try {
    return normalizeGroupsFile(JSON.parse(raw));
  } catch {
    throw new GroupError(
      'invalid-groups',
      500,
      'Group config file is corrupt; the original file was not modified (~/.config/openchamber/mcp-manager/groups.json)',
    );
  }
};

export const writeGroups = async (home: string, value: unknown): Promise<GroupsFile> => {
  let normalized: GroupsFile;
  try {
    normalized = normalizeGroupsFile(value);
  } catch (error) {
    if (error instanceof GroupFileError) throw new GroupError('invalid-groups', 400, error.message);
    throw new GroupError('invalid-groups', 400, 'Group config format is invalid');
  }

  const dir = path.join(home, ...DATA_DIR);
  const file = groupsFile(home);
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    await fs.writeFile(temporary, `${JSON.stringify(normalized, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await fs.rename(temporary, file);
    return await readGroups(home);
  } catch (error) {
    try {
      await fs.unlink(temporary);
    } catch {
    }
    if (error instanceof GroupError) throw error;
    throw new GroupError('write-error', 500, 'Failed to save group config, check directory permissions');
  }
};
