import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = new URL('../../packages/db/migrations/007_p01_vertical_slice.sql', import.meta.url);
const rollback = new URL('../../packages/db/rollback/007_p01_vertical_slice.down.sql', import.meta.url);

test('P01 identity additions record adult/versioned consent without intimate payloads', async () => {
  const sql = (await readFile(migration, 'utf8')).toLowerCase();
  assert.match(sql, /alter table identity\.consent_receipts/);
  assert.match(sql, /age_18_confirmed boolean/);
  assert.match(sql, /policy_version text/);
  for (const forbidden of ['answer text', 'response text', 'reflection text', 'control_map jsonb', 'encrypted_payload']) {
    assert.equal(sql.includes(forbidden), false, `identity migration contains private payload field: ${forbidden}`);
  }
});

test('P01 migration has an explicit rollback for adult/versioned consent fields', async () => {
  const sql = (await readFile(rollback, 'utf8')).toLowerCase();
  assert.match(sql, /drop column if exists policy_version/);
  assert.match(sql, /drop column if exists age_18_confirmed/);
});
