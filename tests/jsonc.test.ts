import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findMember, keysOfMember, parseJsonc, spliceMember, stripComments } from '../src/core/jsonc.ts';

test('stripComments blanks comments but keeps line count', () => {
  const source = '{\n  // note\n  "a": 1, /* inline */\n  "b": [1, 2,],\n}\n';
  const cleaned = stripComments(source);
  assert.equal(cleaned.split('\n').length, source.split('\n').length);
  assert.ok(!cleaned.includes('note'));
  assert.deepEqual(parseJsonc(source), { a: 1, b: [1, 2] });
});

test('parseJsonc accepts an empty document', () => {
  assert.deepEqual(parseJsonc('   \n'), {});
});

test('spliceMember replaces an existing member and keeps everything else byte-identical', () => {
  const source = '{\n  "$schema": "https://opencode.ai/config.json",\n  // keep me\n  "mcp": {\n    "old": { "type": "local", "command": ["x"] }\n  },\n  "theme": "dark"\n}\n';
  const next = spliceMember(source, 'mcp', JSON.stringify({ fresh: { type: 'remote', url: 'https://x.test/mcp' } }, null, 2));
  assert.ok(next.includes('"$schema": "https://opencode.ai/config.json"'));
  assert.ok(next.includes('// keep me'));
  assert.ok(next.includes('"theme": "dark"'));
  assert.ok(!next.includes('"old"'));
  assert.deepEqual((parseJsonc(next) as Record<string, unknown>).theme, 'dark');
});

test('spliceMember inserts the member when the object is empty', () => {
  const next = spliceMember('{}', 'mcp', '{\n  "a": {\n    "type": "local"\n  }\n}');
  assert.deepEqual(parseJsonc(next), { mcp: { a: { type: 'local' } } });
});

test('spliceMember inserts into an object that already has members', () => {
  const next = spliceMember('{\n  "theme": "dark"\n}\n', 'mcp', '{}');
  assert.deepEqual(parseJsonc(next), { theme: 'dark', mcp: {} });
});

test('spliceMember creates a document from an empty file', () => {
  const next = spliceMember('', 'mcp', '{}');
  assert.deepEqual(parseJsonc(next), { mcp: {} });
});

test('findMember reports the value span of a nested member', () => {
  const source = '{"mcp": {"a": {"type": "local", "command": ["npx"]}}, "other": 1}';
  const scan = findMember(source, 'mcp');
  assert.ok(scan.span);
  if (!scan.span) return;
  assert.equal(source.slice(scan.span.start, scan.span.end), '{"a": {"type": "local", "command": ["npx"]}}');
});

test('keysOfMember lists duplicate keys in file order', () => {
  const source = '{\n  "mcp": {\n    "dup": {"type": "local", "command": ["a"]},\n    "dup": {"type": "remote", "url": "https://x.test"}\n  }\n}';
  assert.deepEqual(keysOfMember(source, 'mcp'), ['dup', 'dup']);
});
