import type { ConflictView } from "../shared/types.ts";

export class McpError extends Error {
  readonly code: string;
  readonly status: number;
  readonly conflicts?: ConflictView[];

  constructor(
    code: string,
    status: number,
    message: string,
    conflicts?: ConflictView[],
  ) {
    super(message);
    this.name = "McpError";
    this.code = code;
    this.status = status;
    this.conflicts = conflicts;
  }
}
