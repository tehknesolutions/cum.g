import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const url = new URL('../../packages/db/migrations/005_vault_rls.sql', import.meta.url);
const readMigration = () => readFile(url, 'utf8');

test('rls is enabled and forced on every vault table', async () => {
  const sql = (await readMigration()).toLowerCase();
  for (const table of ['assessments', 'responses', 'control_maps', 'training_sessions']) {
    assert.ok(sql.includes(`alter table vault.${table} enable row level security`));
    assert.ok(sql.includes(`alter table vault.${table} force row level security`));
  }
});

test('vault policies bind rows to the current application user', async () => {
  const sql = (await readMigration()).toLowerCase();
  assert.match(sql, /current_setting\('app\.user_id', true\)::uuid/);
  assert.match(sql, /using \(user_id = vault\.current_user_id\(\)\)/);
  assert.match(sql, /with check \(user_id = vault\.current_user_id\(\)\)/);
});

test('responses inherit authorization from their owning assessment', async () => {
  const sql = (await readMigration()).toLowerCase();
  assert.match(sql, /exists\s*\(\s*select 1\s+from vault\.assessments a/i);
  assert.match(sql, /a\.id = assessment_id/);
  assert.match(sql, /a\.user_id = vault\.current_user_id\(\)/);
});
