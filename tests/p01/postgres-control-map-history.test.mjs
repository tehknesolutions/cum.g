import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostgresControlMapHistory } from '../../packages/vault/src/postgres-control-map-history.mjs';

test('postgres history encrypts and inserts a versioned snapshot with positional parameters', async () => {
  let call;
  const history = createPostgresControlMapHistory({
    createId: () => 'map-id',
    encrypt: async () => Buffer.from('ciphertext'),
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
  const history=createPostgresControlMapHistory({createId:()=> 'map-id',encrypt:async()=>Buffer.from('x'),query:async()=>{queried=true;}});
  await assert.rejects(()=>history.saveSnapshot({userId:'u',assessmentId:'a',instrumentVersion:'1',map:{status:'INCOMPLETE'}}),/MAP_SNAPSHOT_REQUIRED/);
  assert.equal(queried,false);
});
