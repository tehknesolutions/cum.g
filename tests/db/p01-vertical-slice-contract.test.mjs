import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = new URL('../../packages/db/migrations/001_identity.sql', import.meta.url);
const migration = new URL('../../packages/db/migrations/007_p01_vertical_slice.sql', import.meta.url);
const rollback = new URL('../../packages/db/rollback/007_p01_vertical_slice.down.sql', import.meta.url);

test('P01 identity boundary combines baseline versioned consent with explicit adult confirmation', async () => {
  const baseline = (await readFile(identity, 'utf8')).toLowerCase();
  const sql = (await readFile(migration, 'utf8')).toLowerCase();
  assert.match(baseline, /policy_version text not null/);
  assert.match(sql, /alter table identity\.consent_receipts/);
  assert.match(sql, /age_18_confirmed boolean/);
  for (const forbidden of ['answer text', 'response text', 'reflection text', 'control_map jsonb', 'encrypted_payload']) {
    assert.equal(sql.includes(forbidden), false, `identity migration contains private payload field: ${forbidden}`);
  }
});

test('P01 rollback removes only the adult-confirmation addition', async () => {
  const sql = (await readFile(rollback, 'utf8')).toLowerCase();
  assert.match(sql, /drop column if exists age_18_confirmed/);
  assert.equal(sql.includes('drop column if exists policy_version'), false, 'baseline policy_version must survive P01 rollback');
});
