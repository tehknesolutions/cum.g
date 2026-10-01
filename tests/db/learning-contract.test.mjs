import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../../packages/db/migrations/003_learning.sql', import.meta.url);
const readMigration = () => readFile(migrationUrl, 'utf8');

test('learning defines program to exercise hierarchy and claim traceability', async () => {
  const sql = (await readMigration()).toLowerCase();
  for (const table of ['programs', 'modules', 'lessons', 'lesson_claims', 'exercises', 'progress']) {
    assert.match(sql, new RegExp(`create table learning\\.${table}`));
  }
  assert.match(sql, /program_id text not null references learning\.programs\(id\)/);
  assert.match(sql, /module_id uuid not null references learning\.modules\(id\)/);
  assert.match(sql, /lesson_id uuid not null references learning\.lessons\(id\)/);
  assert.match(sql, /claim_id uuid not null references knowledge\.claims\(id\)/);
});

test('learning progress stores state, not intimate response payloads', async () => {
  const sql = (await readMigration()).toLowerCase();
  const progress = sql.split('create table learning.progress')[1]?.split(');')[0] ?? '';
  assert.match(progress, /user_id uuid not null references identity\.users\(id\)/);
  assert.match(progress, /state text not null/);
  for (const forbidden of ['answer', 'response', 'free_text', 'private_payload', 'control_map', 'sexual']) {
    assert.equal(progress.includes(forbidden), false, `learning.progress leaks private field: ${forbidden}`);
  }
});

test('exercise config is public structure only', async () => {
  const sql = (await readMigration()).toLowerCase();
  const exercises = sql.split('create table learning.exercises')[1]?.split(');')[0] ?? '';
  assert.match(exercises, /public_config jsonb not null/);
  assert.equal(exercises.includes('user_id'), false);
});
