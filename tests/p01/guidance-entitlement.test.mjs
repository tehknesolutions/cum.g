import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSafety } from '../../packages/guidance/src/safety-gate.mjs';
import { recommendNextStep } from '../../packages/guidance/src/recommendation-engine.mjs';
import { evaluateEntitlement } from '../../packages/commerce/src/entitlement-gate.mjs';
import safety from '../../content/courses/CUMG-P01/guidance/safety-v1.json' with { type:'json' };
import recommendations from '../../content/courses/CUMG-P01/guidance/recommendations-v1.json' with { type:'json' };

test('safety guidance is deterministic and overrides a premium decision',()=>{
  const result=evaluateSafety({ruleSet:safety,privateSignals:{URGENT_CONCERN:true}});
  assert.deepEqual(result,{escalated:true,guidanceKey:'P01.SAFETY.URGENT_CARE',ruleId:'SAFETY-URGENT'});
  assert.deepEqual(evaluateEntitlement({productId:'CUMG-P01',resourceTier:'PREMIUM',entitlements:[],safetyDecision:result}),{allowed:false,reason:'SAFETY_GATE'});
});

test('FREE resources remain accessible without entitlement when no safety gate is active',()=>{
  assert.deepEqual(evaluateEntitlement({productId:'CUMG-P01',resourceTier:'FREE',entitlements:[],safetyDecision:{escalated:false}}),{allowed:true,reason:'FREE_ACCESS'});
});

test('recommendation is explainable and consent/version gated',()=>{
  const result=recommendNextStep({rules:recommendations,lessonState:{status:'IN_PROGRESS'},consentState:{allowed:true},instrumentVersion:'1.0.0',controlMap:{}});
  assert.equal(result.ruleId,'NEXT-CONTROL-MAP');
  assert.ok(result.explanationKey);
  assert.throws(()=>recommendNextStep({rules:recommendations,lessonState:{status:'IN_PROGRESS'},consentState:{allowed:false},instrumentVersion:'1.0.0'}),/CONSENT_REQUIRED/);
});

test('unknown rule versions fail closed',()=>{
  assert.throws(()=>evaluateSafety({ruleSet:{version:'',rules:[]},privateSignals:{}}),/UNKNOWN_SAFETY_RULESET/);
  assert.throws(()=>recommendNextStep({rules:{version:'',rules:[]},lessonState:{},consentState:{allowed:true},instrumentVersion:'1'}),/UNKNOWN_RECOMMENDATION_RULESET/);
});
