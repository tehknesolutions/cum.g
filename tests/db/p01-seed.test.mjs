import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const url = new URL('../../packages/db/migrations/006_seed_p01.sql', import.meta.url);
const readSeed = () => readFile(url, 'utf8');

test('P01 seed is structural learning content only', async () => {
  const sql = (await readSeed()).toLowerCase();
  assert.ok(sql.includes("'cumg-p01'"));
  for (const code of ['p01-l01', 'p01-l02', 'p01-l03']) assert.ok(sql.includes(`'${code}'`));
  assert.equal(sql.includes('insert into vault.'), false);
  assert.equal(sql.includes('insert into identity.users'), false);
});

test('P01 exercise definitions explicitly keep private answers in vault', async () => {
  const sql = await readSeed();
  assert.match(sql, /"privateAnswers":"vault-only"/);
});
