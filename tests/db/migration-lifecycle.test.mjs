import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const migrationsDir = new URL('../../packages/db/migrations/', import.meta.url);
const rollbackDir = new URL('../../packages/db/rollback/', import.meta.url);

test('every M5.G2 migration has an explicit rollback peer', async () => {
  const migrations = (await readdir(migrationsDir)).filter((x) => /^00[1-6]_.*\.sql$/.test(x)).sort();
  const rollbacks = (await readdir(rollbackDir)).filter((x) => /^00[1-6]_.*\.down\.sql$/.test(x)).sort();
  assert.equal(migrations.length, 6);
  assert.equal(rollbacks.length, 6);
  for (const migration of migrations) {
    const prefix = migration.slice(0, 3);
    assert.ok(rollbacks.some((x) => x.startsWith(prefix)), `missing rollback for ${migration}`);
  }
});

test('rollback chain removes all four domain schemas', async () => {
  const files = await readdir(rollbackDir);
  const content = (await Promise.all(files.filter((x) => x.endsWith('.down.sql')).map((x) => readFile(new URL(x, rollbackDir), 'utf8')))).join('\n').toLowerCase();
  for (const schema of ['vault', 'learning', 'knowledge', 'identity']) {
    assert.ok(content.includes(`drop schema if exists ${schema}`), `rollback does not remove ${schema}`);
  }
});
