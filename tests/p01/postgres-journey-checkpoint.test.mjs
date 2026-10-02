import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostgresJourneyCheckpoint } from '../../packages/vault/src/postgres-journey-checkpoint.mjs';

test('postgres checkpoint encrypts resumable state and inserts with user ownership', async()=>{
 let call;
 const checkpoint=createPostgresJourneyCheckpoint({createId:()=> 'checkpoint-1',encrypt:async()=>Buffer.from('ciphertext'),decrypt:async v=>v,query:async(sql,params)=>{call={sql,params};return {rows:[{id:'checkpoint-1'}]};}});
 const result=await checkpoint.save({userId:'user-1',state:{phase:'L02',offerVisible:false}});
 assert.match(call.sql,/insert into cumg_vault\.journey_checkpoints/i);assert.match(call.sql,/\$1.*\$2.*\$3/i);assert.deepEqual(call.params.slice(0,2),['checkpoint-1','user-1']);assert.equal(call.params[2].length,12);assert.equal(result.id,'checkpoint-1');
});

test('checkpoint refuses offer-bearing or error states before encryption',async()=>{let encrypted=false;let queried=false;const checkpoint=createPostgresJourneyCheckpoint({createId:()=> 'x',encrypt:async()=>{encrypted=true;return 'x'},decrypt:async v=>v,query:async()=>{queried=true;}});await assert.rejects(()=>checkpoint.save({userId:'u',state:{phase:'OFFER',offerVisible:true}}),/UNSAFE_JOURNEY_CHECKPOINT/);assert.equal(encrypted,false);assert.equal(queried,false);});

test('loads latest checkpoint only for requested user and decrypts state',async()=>{let call;const state={phase:'L02',offerVisible:false,lessonState:{currentStage:'PRACTICE'}};const checkpoint=createPostgresJourneyCheckpoint({createId:()=> 'x',encrypt:async v=>v,decrypt:async cipher=>{assert.equal(cipher,'cipher-v3');return state;},query:async(sql,params)=>{call={sql,params};return {rows:[{id:'checkpoint-3',encrypted_state:'cipher-v3',created_at:'2026-10-02T12:00:00Z'}]};}});const result=await checkpoint.loadLatest({userId:'user-1'});assert.match(call.sql,/where user_id = \$1/i);assert.match(call.sql,/order by created_at desc/i);assert.match(call.sql,/limit 1/i);assert.deepEqual(call.params,['user-1']);assert.deepEqual(result.state,state);});

test('empty checkpoint history returns null without decrypting',async()=>{const checkpoint=createPostgresJourneyCheckpoint({createId:()=> 'x',encrypt:async v=>v,decrypt:async()=>{throw new Error('SHOULD_NOT_DECRYPT');},query:async()=>({rows:[]})});assert.equal(await checkpoint.loadLatest({userId:'empty'}),null);});
