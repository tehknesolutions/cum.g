import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const url = new URL('../../packages/db/migrations/004_vault.sql', import.meta.url);
const readMigration = () => readFile(url, 'utf8');

test('cumg vault owns all private assessment and training payloads', async () => {
  const sql = (await readMigration()).toLowerCase();
  for (const table of ['assessments', 'responses', 'control_maps', 'training_sessions']) {
    assert.match(sql, new RegExp(`create table cumg_vault\\.${table}`));
  }
  assert.match(sql, /encrypted_payload bytea not null/);
  assert.match(sql, /encrypted_snapshot bytea not null/);
  assert.match(sql, /encrypted_private_state bytea/);
});

test('cumg vault does not define plaintext intimate payload columns', async () => {
  const sql = (await readMigration()).toLowerCase();
  for (const forbidden of ['answer text', 'response text', 'free_text text', 'private_state text', 'control_map jsonb']) {
    assert.equal(sql.includes(forbidden), false, `plaintext private storage detected: ${forbidden}`);
  }
});

test('response ownership is anchored to assessment ownership', async () => {
  const sql = (await readMigration()).toLowerCase();
  assert.match(sql, /assessment_id uuid not null references cumg_vault\.assessments\(id\)/);
  assert.match(sql, /user_id uuid not null references identity\.users\(id\)/);
});
