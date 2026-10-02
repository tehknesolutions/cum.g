import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostgresControlMapHistory } from '../../packages/vault/src/postgres-control-map-history.mjs';

test('postgres history encrypts and inserts a versioned snapshot with positional parameters', async () => {
  let call;
  const history = createPostgresControlMapHistory({
    createId: () => 'map-id',
    encrypt: async () => Buffer.from('ciphertext'),
    decrypt: async value => value,
    query: async (sql, params) => {
      call = { sql, params };
      return { rows: [{ id:'map-id', map_version:2 }] };
    }
  });
  const result = await history.saveSnapshot({ userId:'user-id', assessmentId:'assessment-id', instrumentVersion:'1.0.0', map:{status:'COMPLETE',version:2,dimensions:{}} });
  assert.match(call.sql,/insert into cumg_vault\.control_maps/i);
  assert.match(call.sql,/\$1.*\$2.*\$3.*\$4.*\$5.*\$6/i);
  assert.deepEqual(call.params.slice(0,4),['map-id','user-id','assessment-id','1.0.0']);
  assert.equal(call.params[5],2);
  assert.equal(result.map_version,2);
});

test('postgres history refuses incomplete snapshots before encryption or SQL', async () => {
  let queried=false;
  const history=createPostgresControlMapHistory({createId:()=> 'map-id',encrypt:async()=>Buffer.from('x'),decrypt:async v=>v,query:async()=>{queried=true;}});
  await assert.rejects(()=>history.saveSnapshot({userId:'u',assessmentId:'a',instrumentVersion:'1',map:{status:'INCOMPLETE'}}),/MAP_SNAPSHOT_REQUIRED/);
  assert.equal(queried,false);
});

test('loads latest encrypted snapshot for one user and decrypts it', async()=>{
  let call;
  const expected={status:'COMPLETE',version:3,dimensions:{bodyAwareness:{value:70}}};
  const history=createPostgresControlMapHistory({
    createId:()=> 'unused', encrypt:async v=>v,
    decrypt:async cipher=>{ assert.equal(cipher,'cipher-v3'); return expected; },
    query:async(sql,params)=>{call={sql,params};return {rows:[{id:'map-3',map_version:3,instrument_version:'1.0.0',encrypted_snapshot:'cipher-v3',created_at:'2026-10-02T12:00:00Z'}]};}
  });
  const result=await history.loadLatestSnapshot({userId:'user-1'});
  assert.match(call.sql,/where user_id = \$1/i);
  assert.match(call.sql,/order by map_version desc/i);
  assert.match(call.sql,/limit 1/i);
  assert.deepEqual(call.params,['user-1']);
  assert.deepEqual(result.map,expected);
  assert.equal(result.version,3);
});

test('latest snapshot lookup returns null when user has no history',async()=>{
  const history=createPostgresControlMapHistory({createId:()=> 'unused',encrypt:async v=>v,decrypt:async()=>{throw new Error('SHOULD_NOT_DECRYPT');},query:async()=>({rows:[]})});
  assert.equal(await history.loadLatestSnapshot({userId:'user-empty'}),null);
});
