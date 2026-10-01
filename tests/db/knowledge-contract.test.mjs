import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../../packages/db/migrations/002_knowledge.sql', import.meta.url);
const readMigration = () => readFile(migrationUrl, 'utf8');

test('knowledge migration preserves the four approved provenance classes', async () => {
  const sql = (await readMigration()).toUpperCase();
  for (const provenance of ['SCIENTIFIC', 'EXPERIENTIAL', 'SOCIAL', 'HNK']) {
    assert.ok(sql.includes(`'${provenance}'`), `missing provenance ${provenance}`);
  }
  assert.match(sql, /CHECK\s*\(PROVENANCE_CLASS\s+IN\s*\(/);
});

test('claims remain traceable to evidence', async () => {
  const sql = (await readMigration()).toLowerCase();
  assert.match(sql, /create table knowledge\.sources/);
  assert.match(sql, /create table knowledge\.evidence/);
  assert.match(sql, /create table knowledge\.claims/);
  assert.match(sql, /create table knowledge\.claim_evidence/);
  assert.match(sql, /claim_id uuid not null references knowledge\.claims\(id\)/);
  assert.match(sql, /evidence_id uuid not null references knowledge\.evidence\(id\)/);
});

test('approved scientific claims require approved scientific evidence', async () => {
  const sql = (await readMigration()).toLowerCase();
  assert.match(sql, /enforce_scientific_claim_evidence/);
  assert.match(sql, /scientific claim requires approved scientific evidence/);
  assert.match(sql, /provenance_class = 'scientific'/);
  assert.match(sql, /review_status = 'approved'/);
});
