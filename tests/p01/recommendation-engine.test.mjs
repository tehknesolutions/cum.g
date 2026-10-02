import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendNextStep } from '../../packages/recommendation/src/recommendation-engine.mjs';

const base = Object.fromEntries([
  'bodyAwareness','arousalAwareness','selfRegulation','mentalAttention',
  'emotionalResponse','contextCommunication','perceivedConfidence'
].map((key)=>[key,{value:70}]));

test('recommendation selects the lowest control-map dimension deterministically',()=>{
  const result=recommendNextStep({controlMap:{status:'COMPLETE',dimensions:{...base,selfRegulation:{value:22},mentalAttention:{value:22}}}});
  assert.equal(result.dimension,'selfRegulation');
  assert.equal(result.targetId,'P01-PRACTICE-SELF-REGULATION');
  assert.equal(result.band,'EXPLORE');
  assert.equal(result.ruleId,'LOWEST_DIMENSION_EXPLORE');
});

test('recommendation returns safety gate before using the control map',()=>{
  const result=recommendNextStep({controlMap:{status:'COMPLETE',dimensions:base},safetyDecision:{escalated:true}});
  assert.equal(result.kind,'SAFETY');
  assert.equal(result.ruleId,'SAFETY-GATE');
});

test('recommendation refuses incomplete control maps',()=>{
  assert.throws(()=>recommendNextStep({controlMap:{status:'INCOMPLETE',dimensions:{}}}),/CONTROL_MAP_REQUIRED/);
});
