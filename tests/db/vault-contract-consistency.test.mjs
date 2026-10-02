import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = {
  forwardRls: new URL('../../packages/db/migrations/005_vault_rls.sql', import.meta.url),
  forwardGrants: new URL('../../packages/db/migrations/005b_vault_runtime_grants.sql', import.meta.url),
  seed: new URL('../../packages/db/migrations/006_seed_p01.sql', import.meta.url),
  rollbackRls: new URL('../../packages/db/rollback/005_vault_rls.down.sql', import.meta.url),
  rollbackGrants: new URL('../../packages/db/rollback/005b_vault_runtime_grants.down.sql', import.meta.url),
  rollbackSeed: new URL('../../packages/db/rollback/006_seed_p01.down.sql', import.meta.url),
  vault: new URL('../../packages/db/migrations/004_vault.sql', import.meta.url),
};

async function text(url) { return (await readFile(url,'utf8')).toLowerCase(); }

test('RLS policy targets every pre-existing vault table', async () => {
  const sql=await text(files.forwardRls);
  for (const table of ['assessments','responses','control_maps','training_sessions']) {
    assert.match(sql,new RegExp('alter table cumg_vault\\.'+table+' enable row level security'));
    assert.match(sql,new RegExp('create policy '+table+'_owner_all'));
  }
});

test('runtime grants match only the existing pre-007 vault tables', async () => {
  const grants=await text(files.forwardGrants);
  const vault=await text(files.vault);
  for (const table of ['assessments','responses','control_maps','training_sessions']) {
    assert.match(vault,new RegExp('create table cumg_vault\\.'+table));
    assert.match(grants,new RegExp('cumg_vault\\.'+table));
  }
  assert.equal(grants.includes('cumg_vault.reflections'),false);
});

test('P01 structural seed contains no user or private answer payload', async () => {
  const sql=await text(files.seed);
  for (const forbidden of ['cumg_vault.','insert into identity.users','encrypted_payload','response_payload','reflection']) assert.equal(sql.includes(forbidden),false,forbidden);
});

test('rollback grant and seed peers reverse their forward ownership', async () => {
  const grants=await text(files.rollbackGrants);
  const seed=await text(files.rollbackSeed);
  for (const table of ['assessments','responses','control_maps','training_sessions']) assert.match(grants,new RegExp('revoke[\\s\\S]*cumg_vault\\.'+table));
  for (const id of ['30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003']) assert.match(seed,new RegExp(id));
});
