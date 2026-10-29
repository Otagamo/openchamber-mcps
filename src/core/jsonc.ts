/**
 * Minimal JSONC support: comments and trailing commas are tolerated when reading,
 * and a single object member can be replaced without touching the rest of the file.
 * Comments inside the replaced member are lost; everything outside it stays byte-identical.
 */

export type Token = {
  type: 'string' | 'punct' | 'word' | 'comment';
  start: number;
  end: number;
  value: string;
};

export class JsoncError extends Error {
  readonly position: number;

  constructor(message: string, position: number) {
    super(message);
    this.name = 'JsoncError';
    this.position = position;
  }
}

export const tokenize = (text: string): Token[] => {
  const tokens: Token[] = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index] ?? '';
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      index += 1;
      continue;
    }
    if (char === '/' && text[index + 1] === '/') {
      const newline = text.indexOf('\n', index);
      const end = newline < 0 ? text.length : newline;
      tokens.push({ type: 'comment', start: index, end, value: text.slice(index, end) });
      index = end;
      continue;
    }
    if (char === '/' && text[index + 1] === '*') {
      const close = text.indexOf('*/', index + 2);
      if (close < 0) throw new JsoncError('Unterminated block comment', index);
      const end = close + 2;
      tokens.push({ type: 'comment', start: index, end, value: text.slice(index, end) });
      index = end;
      continue;
    }
    if (char === '"') {
      let cursor = index + 1;
      let closed = false;
      while (cursor < text.length) {
        const next = text[cursor];
        if (next === '\\') {
          cursor += 2;
          continue;
        }
        if (next === '"') {
          cursor += 1;
          closed = true;
          break;
        }
        if (next === '\n') break;
        cursor += 1;
      }
      if (!closed) throw new JsoncError('Unterminated string', index);
      tokens.push({ type: 'string', start: index, end: cursor, value: text.slice(index + 1, cursor - 1) });
      index = cursor;
      continue;
    }
    if ('{}[]:,'.includes(char)) {
      tokens.push({ type: 'punct', start: index, end: index + 1, value: char });
      index += 1;
      continue;
    }
    let cursor = index;
    while (cursor < text.length && !'{}[]:,"/ \t\n\r'.includes(text[cursor] ?? '')) cursor += 1;
    tokens.push({ type: 'word', start: index, end: cursor, value: text.slice(index, cursor) });
    index = cursor;
  }
  return tokens;
};

const significant = (tokens: Token[]): Token[] => tokens.filter((token) => token.type !== 'comment');

/** Comment contents become spaces so offsets and line numbers survive; trailing commas are dropped. */
export const stripComments = (text: string): string => {
  const tokens = tokenize(text);
  const out = text.split('');
  const blank = (start: number, end: number): void => {
    for (let index = start; index < end; index += 1) {
      if (out[index] !== '\n' && out[index] !== '\r') out[index] = ' ';
    }
  };
  for (const token of tokens) if (token.type === 'comment') blank(token.start, token.end);
  const compact = significant(tokens);
  for (let index = 0; index < compact.length; index += 1) {
    const token = compact[index];
    if (!token || token.type !== 'punct' || token.value !== ',') continue;
    const next = compact[index + 1];
    if (next && next.type === 'punct' && (next.value === '}' || next.value === ']')) blank(token.start, token.end);
  }
  return out.join('');
};

export const parseJsonc = (text: string): unknown => {
  const cleaned = stripComments(text).replace(/^\uFEFF/, '');
  if (cleaned.trim().length === 0) return {};
  return JSON.parse(cleaned) as unknown;
};

export type Span = { start: number; end: number };

type MemberScan = {
  /** Value span of the requested member, or null when the object has no such member. */
  span: Span | null;
  /** Position of the top-level closing brace. */
  close: number;
  /** Whether the top-level object has at least one member. */
  hasMembers: boolean;
  /** Keys found at the object's own level, in order (used to catch duplicate keys). */
  keys: string[];
};

const objectScan = (text: string): MemberScan => {
  const tokens = significant(tokenize(text));
  const open = tokens.findIndex((token) => token.type === 'punct' && token.value === '{');
  if (open < 0) throw new JsoncError('Root value must be an object', 0);

  const scan: MemberScan = { span: null, close: -1, hasMembers: false, keys: [] };
  let depth = 0;
  for (let index = open; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) break;
    if (token.type === 'punct' && (token.value === '{' || token.value === '[')) {
      depth += 1;
      continue;
    }
    if (token.type === 'punct' && (token.value === '}' || token.value === ']')) {
      depth -= 1;
      if (depth === 0) {
        scan.close = token.start;
        break;
      }
      continue;
    }
    if (depth === 1 && token.type === 'string' && tokens[index + 1]?.value === ':') scan.keys.push(token.value);
  }
  scan.hasMembers = scan.keys.length > 0;
  if (scan.close < 0) throw new JsoncError('Root object is not closed', text.length);
  return scan;
};

/** Locates `key` at the root object level and returns the span of its value. */
export const findMember = (text: string, key: string): MemberScan => {
  const scan = objectScan(text);
  const tokens = significant(tokenize(text));
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) break;
    if (token.type === 'punct' && (token.value === '{' || token.value === '[')) {
      depth += 1;
      continue;
    }
    if (token.type === 'punct' && (token.value === '}' || token.value === ']')) {
      depth -= 1;
      if (depth === 0) break;
      continue;
    }
    if (depth !== 1 || token.type !== 'string' || token.value !== key) continue;
    if (tokens[index + 1]?.value !== ':') continue;
    const first = tokens[index + 2];
    if (!first) throw new JsoncError('Member has no value', token.end);
    let cursor = index + 2;
    let inner = 0;
    let last = first;
    while (cursor < tokens.length) {
      const current = tokens[cursor];
      if (!current) break;
      if (current.type === 'punct' && (current.value === '{' || current.value === '[')) inner += 1;
      else if (current.type === 'punct' && (current.value === '}' || current.value === ']')) {
        if (inner === 0) break;
        inner -= 1;
      } else if (current.type === 'punct' && current.value === ',' && inner === 0) break;
      last = current;
      cursor += 1;
    }
    return { ...scan, span: { start: first.start, end: last.end } };
  }
  return { ...scan, span: null };
};

/** Indentation step used inside the mcp object, so a rewrite keeps the file's visual shape. */
export const indentUnit = (text: string): string => {
  if (text.trim().length === 0) return '  ';
  const scan = findMember(text, 'mcp');
  if (!scan.span) return '  ';
  const lineStart = text.lastIndexOf('\n', scan.span.start) + 1;
  const memberIndent = /^[ \t]*/.exec(text.slice(lineStart, scan.span.start))?.[0] ?? '';
  const afterBrace = text.slice(scan.span.start + 1);
  const newline = afterBrace.indexOf('\n');
  if (newline < 0) return '  ';
  const childIndent = /^[ \t]*/.exec(afterBrace.slice(newline + 1))?.[0] ?? '';
  if (childIndent.length > memberIndent.length) return childIndent.slice(memberIndent.length);
  return '  ';
};

/** Replaces (or inserts) one root-level member, leaving the rest of the file untouched. */
export const spliceMember = (text: string, key: string, valueText: string, eol = '\n'): string => {
  const source = text.trim().length === 0 ? `{${eol}}${eol}` : text;
  const scan = findMember(source, key);
  const anchor = scan.span ? scan.span.start : scan.close;
  const lineStart = source.lastIndexOf('\n', anchor) + 1;
  const memberIndent = /^[ \t]*/.exec(source.slice(lineStart, anchor))?.[0] ?? '  ';
  const indented = valueText.replace(/\r\n/g, '\n').replace(/\n/g, `${eol}${memberIndent}`);
  if (scan.span) return `${source.slice(0, scan.span.start)}${indented}${source.slice(scan.span.end)}`;
  const separator = scan.hasMembers ? ',' : '';
  return `${source.slice(0, scan.close)}${separator}${eol}${memberIndent}${JSON.stringify(key)}: ${indented}${eol}${source.slice(scan.close)}`;
};

/** Keys of the object the text starts with (comments and trailing commas tolerated). */
export const objectKeys = (text: string): string[] => {
  const tokens = significant(tokenize(text));
  const keys: string[] = [];
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) break;
    if (token.type === 'punct' && (token.value === '{' || token.value === '[')) {
      depth += 1;
      continue;
    }
    if (token.type === 'punct' && (token.value === '}' || token.value === ']')) {
      depth -= 1;
      if (depth === 0) break;
      continue;
    }
    if (depth === 1 && token.type === 'string' && tokens[index + 1]?.value === ':') keys.push(token.value);
  }
  return keys;
};

/** Text of one root-level member's value, or '' when the member is missing. */
export const memberText = (text: string, key: string): string => {
  const scan = findMember(text, key);
  return scan.span ? text.slice(scan.span.start, scan.span.end) : '';
};

/** Keys of the root-level object `key`, in file order, so duplicates can be reported. */
export const keysOfMember = (text: string, key: string): string[] => {
  const scan = findMember(text, key);
  if (!scan.span) return [];
  const tokens = significant(tokenize(text));
  const keys: string[] = [];
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token || token.start < scan.span.start || token.end > scan.span.end) continue;
    if (token.type === 'punct' && (token.value === '{' || token.value === '[')) {
      depth += 1;
      continue;
    }
    if (token.type === 'punct' && (token.value === '}' || token.value === ']')) {
      depth -= 1;
      continue;
    }
    if (depth === 1 && token.type === 'string' && tokens[index + 1]?.value === ':') keys.push(token.value);
  }
  return keys;
};
