import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../../packages/db/migrations/001_identity.sql', import.meta.url);

const readMigration = () => readFile(migrationUrl, 'utf8');

test('identity migration defines isolated account, consent and entitlement contracts', async () => {
  const sql = (await readMigration()).toLowerCase();

  assert.match(sql, /create schema if not exists identity/);
  assert.match(sql, /create table identity\.users/);
  assert.match(sql, /id uuid primary key/);
  assert.match(sql, /create table identity\.consent_receipts/);
  assert.match(sql, /policy_version text not null/);
  assert.match(sql, /granted_at timestamptz not null/);
  assert.match(sql, /revoked_at timestamptz/);
  assert.match(sql, /create table identity\.entitlements/);
  assert.match(sql, /product_id text not null/);
});

test('identity schema does not persist intimate answer payloads', async () => {
  const sql = (await readMigration()).toLowerCase();
  for (const forbidden of ['sexual_answer', 'intimate_answer', 'response_payload', 'control_map', 'private_state']) {
    assert.equal(sql.includes(forbidden), false, `identity migration contains forbidden private field: ${forbidden}`);
  }
});
