import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeRuntime } from '../../packages/practice-runtime/src/practice-runtime.mjs';
import { createPracticePlayer } from '../../apps/web/src/p01/practice-player.mjs';

const recommendation={kind:'EXERCISE',targetId:'P01-PRACTICE-02',dimension:'mentalAttention',band:'LOW',ruleId:'NEXT-PROGRESSIVE'};

test('practice player delegates to the canonical runtime and requires three steps',()=>{
 const runtime=createPracticeRuntime({recommendation,safetyDecision:{escalated:false}});
 const player=createPracticePlayer(runtime);
 assert.equal(player.getState().status,'READY'); assert.equal(player.presentation().totalSteps,3);
 assert.throws(()=>player.complete(),/RUNTIME_NOT_IN_PROGRESS/);
 player.start(); assert.equal(player.getState().status,'IN_PROGRESS');
 const done=player.complete(); assert.equal(done.status,'COMPLETE'); assert.equal(done.completedSteps,3); assert.equal(done.result.reflectionRecorded,false);
});

test('practice player cannot bypass the safety gate',()=>{
 assert.throws(()=>createPracticeRuntime({recommendation,safetyDecision:{escalated:true}}),/SAFETY_GATE/);
});
