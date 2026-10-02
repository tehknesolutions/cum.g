import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const migrationsDir = new URL('../../packages/db/migrations/', import.meta.url);
const rollbackDir = new URL('../../packages/db/rollback/', import.meta.url);

const forwardPeer = (name) => name.replace(/\.sql$/, '.down.sql');

test('every current M5.G2 migration has an explicit rollback peer', async () => {
  const migrations = (await readdir(migrationsDir)).filter((x) => /^00(?:[1-6]|5b)_.*\.sql$/.test(x)).sort();
  const rollbacks = (await readdir(rollbackDir)).filter((x) => /^00(?:[1-6]|5b)_.*\.down\.sql$/.test(x)).sort();

  assert.ok(migrations.includes('005b_vault_runtime_grants.sql'));
  assert.ok(rollbacks.includes('005b_vault_runtime_grants.down.sql'));

  for (const migration of migrations) {
    assert.ok(rollbacks.includes(forwardPeer(migration)), `missing rollback peer for ${migration}`);
  }
});

test('rollback chain removes only CUM.G-owned domain schemas', async () => {
  const files = await readdir(rollbackDir);
  const content = (await Promise.all(files.filter((x) => x.endsWith('.down.sql')).map((x) => readFile(new URL(x, rollbackDir), 'utf8')))).join('\n').toLowerCase();

  for (const schema of ['cumg_vault', 'learning', 'knowledge', 'identity']) {
    assert.ok(content.includes(`drop schema if exists ${schema}`), `rollback does not remove ${schema}`);
  }

  assert.equal(content.includes('drop schema if exists vault;'), false, 'rollback must not drop Supabase-owned vault schema');
});
