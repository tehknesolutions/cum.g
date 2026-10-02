import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeRuntime } from '../../packages/practice-runtime/src/practice-runtime.mjs';

const recommendation = {
  kind:'EXERCISE',
  targetId:'PRACTICE-SELF-REGULATION',
  dimension:'selfRegulation',
  band:'EXPLORE',
  ruleId:'LOWEST_DIMENSION_EXPLORE'
};

test('runtime executes a recommendation as a traceable practice',()=>{
  const runtime=createPracticeRuntime({recommendation,safetyDecision:{escalated:false}});
  assert.equal(runtime.start().status,'IN_PROGRESS');
  const state=runtime.complete({completedSteps:3,reflectionRecorded:true});
  assert.equal(state.status,'COMPLETE');
  assert.equal(state.targetId,recommendation.targetId);
  assert.equal(state.result.ruleId,recommendation.ruleId);
  assert.equal(state.result.reflectionRecorded,true);
});

test('runtime refuses incomplete execution',()=>{
  const runtime=createPracticeRuntime({recommendation,safetyDecision:{escalated:false}});
  runtime.start();
  assert.throws(()=>runtime.complete({completedSteps:2}),/RUNTIME_STEPS_INCOMPLETE/);
});

test('runtime refuses safety escalation',()=>{
  assert.throws(()=>createPracticeRuntime({recommendation,safetyDecision:{escalated:true}}),/SAFETY_GATE/);
});
