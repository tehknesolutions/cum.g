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
  assert.match(sql,/drop table if exists cumg_vault\.reflections/);
  assert.match(sql,/drop column if exists age_18_confirmed/);
  assert.equal(sql.includes('drop column if exists policy_version'),false);
  assert.equal(sql.includes('drop schema if exists cumg_vault'),false);
});

test('rollback ordering preserves dependency direction', async()=>{
  const r006=await read('r006');
  const r004=await read('r004');
  assert.match(r006,/delete from learning\.exercises/);
  assert.match(r006,/delete from learning\.lessons/);
  assert.match(r006,/delete from learning\.modules/);
  assert.match(r006,/delete from learning\.programs/);
  assert.match(r004,/drop table if exists cumg_vault\.training_sessions/);
  assert.match(r004,/drop table if exists cumg_vault\.control_maps/);
  assert.match(r004,/drop table if exists cumg_vault\.responses/);
  assert.match(r004,/drop table if exists cumg_vault\.assessments/);
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

test('P01 forward migration is explicitly re-runnable', async()=>{
  const sql=await readFile(new URL('../../packages/db/migrations/007_p01_vertical_slice.sql',import.meta.url),'utf8');
  assert.match(sql,/add column if not exists age_18_confirmed/i);
  assert.match(sql,/create index if not exists consent_receipts_user_type_version_idx/i);
  assert.match(sql,/create table if not exists cumg_vault\.reflections/i);
  assert.match(sql,/create index if not exists reflections_user_lesson_idx/i);
  assert.match(sql,/from pg_policies/i);
  assert.match(sql,/create policy reflections_owner_all/i);
});

test('P01 seed is re-runnable by conflict-safe inserts', async()=>{
  const sql=await readFile(new URL('../../packages/db/migrations/006_seed_p01.sql',import.meta.url),'utf8');
  assert.equal((sql.match(/on conflict \(id\) do nothing/gi)||[]).length,4);
});

test('control map history migration enforces per-user version uniqueness and immutability',async()=>{
  const sql=await readFile(new URL('../../packages/db/migrations/008_control_map_history.sql',import.meta.url),'utf8');
  assert.match(sql,/create unique index if not exists control_maps_user_version_idx/i);
  assert.match(sql,/prevent_control_map_history_update/i);
  assert.match(sql,/control_map_history_immutable/i);
  assert.match(sql,/before update on cumg_vault\.control_maps/i);
});

test('control map history rollback removes trigger and function before schema field',async()=>{
  const sql=await readFile(new URL('../../packages/db/rollback/008_control_map_history.down.sql',import.meta.url),'utf8');
  assert.match(sql,/drop trigger if exists control_map_history_immutable/i);
  assert.match(sql,/drop function if exists cumg_vault\.prevent_control_map_history_update/i);
  assert.match(sql,/drop column if exists map_version/i);
});
