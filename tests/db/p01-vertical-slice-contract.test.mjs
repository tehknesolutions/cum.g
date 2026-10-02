import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = new URL('../../packages/db/migrations/001_identity.sql', import.meta.url);
const migration = new URL('../../packages/db/migrations/007_p01_vertical_slice.sql', import.meta.url);
const rollback = new URL('../../packages/db/rollback/007_p01_vertical_slice.down.sql', import.meta.url);
const learning = new URL('../../packages/db/migrations/003_learning.sql', import.meta.url);

test('P01 identity boundary combines baseline versioned consent with explicit adult confirmation', async () => {
  const baseline = (await readFile(identity, 'utf8')).toLowerCase();
  const sql = (await readFile(migration, 'utf8')).toLowerCase();
  assert.match(baseline, /policy_version text not null/);
  assert.match(sql, /alter table identity\.consent_receipts/);
  assert.match(sql, /age_18_confirmed boolean/);
});

test('private reflections remain opaque inside cumg_vault with forced RLS', async () => {
  const sql = (await readFile(migration, 'utf8')).toLowerCase();
  assert.match(sql, /create table cumg_vault\.reflections/);
  assert.match(sql, /user_id uuid not null/);
  assert.match(sql, /encrypted_payload bytea not null/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /force row level security/);
  assert.match(sql, /create policy reflections_owner_all/);
  assert.match(sql, /current_setting\('app\.user_id', true\)::uuid = user_id/);
});

test('learning progress does not become an intimate reflection store', async () => {
  const sql = (await readFile(learning, 'utf8')).toLowerCase();
  for (const forbidden of ['reflection', 'encrypted_payload', 'answer_payload', 'control_map_payload']) {
    assert.equal(sql.includes(forbidden), false, `learning domain contains private field: ${forbidden}`);
  }
});

test('P01 rollback removes private reflection structure and only its identity addition', async () => {
  const sql = (await readFile(rollback, 'utf8')).toLowerCase();
  assert.match(sql, /drop table if exists cumg_vault\.reflections/);
  assert.match(sql, /drop column if exists age_18_confirmed/);
  assert.equal(sql.includes('drop column if exists policy_version'), false, 'baseline policy_version must survive P01 rollback');
});
