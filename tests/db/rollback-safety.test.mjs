import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = '../../packages/db/rollback/';
const paths = {
  r007:'007_p01_vertical_slice.down.sql',
  r006:'006_seed_p01.down.sql',
  r005b:'005b_vault_runtime_grants.down.sql',
  r005:'005_vault_rls.down.sql',
  r004:'004_vault.down.sql',
  r003:'003_learning.down.sql',
  r002:'002_knowledge.down.sql',
  r001:'001_identity.down.sql',
};

async function read(name){return (await readFile(new URL(base+paths[name],import.meta.url),'utf8')).toLowerCase();}

test('P01 rollback is narrow and does not destroy baseline consent versioning', async()=>{
  const sql=await read('r007');
  assert.match(sql,/drop table if exists cumg_vault\\.reflections/);
  assert.match(sql,/drop column if exists age_18_confirmed/);
  assert.equal(sql.includes('drop column if exists policy_version'),false);
  assert.equal(sql.includes('drop schema if exists cumg_vault'),false);
});

test('rollback ordering preserves dependency direction', async()=>{
  const r006=await read('r006');
  const r004=await read('r004');
  assert.match(r006,/delete from learning\\.exercises/);
  assert.match(r006,/delete from learning\\.lessons/);
  assert.match(r006,/delete from learning\\.modules/);
  assert.match(r006,/delete from learning\\.programs/);
  assert.match(r004,/drop table if exists cumg_vault\\.training_sessions/);
  assert.match(r004,/drop table if exists cumg_vault\\.control_maps/);
  assert.match(r004,/drop table if exists cumg_vault\\.responses/);
  assert.match(r004,/drop table if exists cumg_vault\\.assessments/);
});

test('P01 rollback never removes legacy vault tables or shared schemas', async()=>{
  const r007=await read('r007');
  assert.equal(r007.includes('drop table if exists cumg_vault.assessments'),false);
  assert.equal(r007.includes('drop schema if exists cumg_vault'),false);
  assert.equal(r007.includes('drop schema if exists learning'),false);
  assert.equal(r007.includes('drop schema if exists identity'),false);
});

test('legacy rollback peers clean their own grants/policies before their owning tables', async()=>{
  const r005b=await read('r005b');
  const r005=await read('r005');
  assert.match(r005b,/revoke usage on schema cumg_vault/);
  assert.match(r005,/drop policy if exists assessments_owner_all/);
  assert.match(r005,/drop function if exists cumg_vault.current_user_id/);
});
