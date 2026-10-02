import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function read(path){
  return (await readFile(new URL('../../'+path,import.meta.url),'utf8')).toLowerCase();
}

test('vault RLS isolates control-map rows by app.user_id',async()=>{
  const sql=await read('packages/db/migrations/005_vault_rls.sql');
  assert.match(sql,/alter table cumg_vault\.control_maps enable row level security/);
  assert.match(sql,/alter table cumg_vault\.control_maps force row level security/);
  assert.match(sql,/create policy control_maps_owner_all on cumg_vault\.control_maps/);
  assert.match(sql,/user_id = cumg_vault\.current_user_id\(\)/);
  assert.match(sql,/with check \(user_id = cumg_vault\.current_user_id\(\)\)/);
});

test('map history uses a per-user version uniqueness boundary for concurrent writes',async()=>{
  const sql=await read('packages/db/migrations/008_control_map_history.sql');
  assert.match(sql,/create unique index if not exists control_maps_user_version_idx/);
  assert.match(sql,/on cumg_vault\.control_maps\(user_id, map_version\)/);
});

test('immutable history blocks rewrites of owner, version, provenance, or encrypted payload',async()=>{
  const sql=await read('packages/db/migrations/008_control_map_history.sql');
  for (const field of ['old.user_id','old.map_version','old.assessment_id','old.instrument_version','old.encrypted_snapshot']) {
    assert.match(sql,new RegExp(field.replace('.','\\.')+' is distinct from new\\.'+field.split('.')[1],'i'));
  }
  assert.match(sql,/raise exception 'control_map_history_immutable'/i);
});
