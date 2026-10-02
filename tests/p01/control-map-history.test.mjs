import test from 'node:test';
import assert from 'node:assert/strict';
import { createControlMapHistory } from '../../packages/vault/src/control-map-history.mjs';

test('history persists a complete versioned map snapshot privately',async()=>{
 let received;
 const history=createControlMapHistory({save:async(input)=>(received=input,{id:'m1'})});
 const result=await history.saveSnapshot({userId:'u1',assessmentId:'a1',instrumentVersion:'1.0.0',map:{status:'COMPLETE',version:2,dimensions:{}}});
 assert.equal(result.id,'m1');
 assert.equal(received.mapVersion,2);
 assert.deepEqual(received.encryptedSnapshot,{status:'COMPLETE',version:2,dimensions:{}});
});
test('history rejects incomplete maps',async()=>{
 const history=createControlMapHistory({save:async(input)=>input});
 await assert.rejects(()=>history.saveSnapshot({userId:'u1',assessmentId:'a1',instrumentVersion:'1.0.0',map:{status:'INCOMPLETE'}}),/MAP_SNAPSHOT_REQUIRED/);
});
