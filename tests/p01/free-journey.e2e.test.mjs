import test from 'node:test';
import assert from 'node:assert/strict';
import { createP01FreeJourney } from '../../apps/web/src/p01/free-journey.mjs';

const deps = {
  consentGate: (input) => input?.allowed === true ? {allowed:true,reason:'ALLOWED'} : {allowed:false,reason:'CONSENT_REQUIRED'},
  assessment: {
    start: () => ({status:'IN_PROGRESS',instrumentCode:'P01',instrumentVersion:'1.0.0',answers:{}}),
    answer: (state,input) => ({...state,answers:{...state.answers,[input.code]:input.value},status:input.complete?'COMPLETE':'IN_PROGRESS'}),
  },
  controlMap: { build: () => ({status:'COMPLETE',dimensions:{bodyAwareness:{value:50},arousalAwareness:{value:50},selfRegulation:{value:50},mentalAttention:{value:50},emotionalResponse:{value:50},contextCommunication:{value:50},perceivedConfidence:{value:50}}}) },
  lesson: {
    create: () => ({status:'IN_PROGRESS',currentStage:'LEARN'}),
    advance: (state,input) => input.final ? {...state,status:'COMPLETE'} : {...state,currentStage:input.nextStage},
  },
  safety: { evaluate: (input) => input?.urgent ? {escalated:true,guidanceKey:'P01.SAFETY.URGENT_CARE',ruleId:'SAFETY-URGENT'} : {escalated:false} },
  recommendation: { next: () => ({kind:'EXERCISE',targetId:'P01-PRACTICE-02',ruleId:'NEXT-PROGRESSIVE',explanationKey:'P01.NEXT.PROGRESSIVE_PRACTICE'}) },
  entitlement: { evaluate: (input) => input?.safetyDecision?.escalated ? {allowed:false,reason:'SAFETY_GATE'} : {allowed:false,reason:'PREMIUM_REQUIRED'} },
  analytics: () => {},
  practiceRuntime: { create: ({ recommendation }) => ({ status:'READY', start:()=>({status:'IN_PROGRESS'}), complete:()=>({status:'COMPLETE',targetId:recommendation.targetId}) }) },
};

test('adult synthetic user completes FREE journey and receives value before offer',()=>{
  const j=createP01FreeJourney(deps);
  j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:true}});
  j.dispatch({type:'START_ASSESSMENT'});
  j.dispatch({type:'ANSWER_ASSESSMENT',input:{code:'P01Q01',value:4,complete:true}});
  j.dispatch({type:'BUILD_CONTROL_MAP'});
  j.dispatch({type:'START_L01',lesson:{}});
  j.dispatch({type:'ADVANCE_L01',input:{final:true}});
  j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L01'}});
  j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  j.dispatch({type:'START_L02',lesson:{lessonCode:'P01-L02'}});
  j.dispatch({type:'ADVANCE_L02',input:{final:true}});
  j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L02'}});
  j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  const state=j.dispatch({type:'RESOLVE_NEXT_STEP',recommendationInput:{},safetyInput:{}});
  assert.equal(state.phase,'PRACTICE');
  assert.equal(state.freeValueDelivered,true);
  j.dispatch({type:'START_PRACTICE'});
  const completed=j.dispatch({type:'COMPLETE_PRACTICE',input:{completedSteps:3,reflectionRecorded:true}});
  assert.equal(completed.phase,'PRACTICE_RESULT');
  assert.equal(completed.offerVisible,false);
  const recorded=j.dispatch({type:'SAVE_PRACTICE_RESULT',privateRecord:{kind:'PRACTICE_RESULT'}});
  assert.equal(recorded.phase,'MAP_UPDATE');
  const offered=j.dispatch({type:'UPDATE_PRACTICE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  assert.equal(offered.phase,'OFFER');
  assert.equal(offered.offerVisible,true);
  assert.equal(state.offerVisible,true);
});

test('safety escalation wins over premium offer and remains authoritative',()=>{
  const j=createP01FreeJourney(deps);
  j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:true}});
  j.dispatch({type:'START_ASSESSMENT'});
  j.dispatch({type:'ANSWER_ASSESSMENT',input:{code:'P01Q01',value:4,complete:true}});
  j.dispatch({type:'BUILD_CONTROL_MAP'});
  j.dispatch({type:'START_L01',lesson:{}});
  j.dispatch({type:'ADVANCE_L01',input:{final:true}});
  j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L01'}});
  j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  j.dispatch({type:'START_L02',lesson:{lessonCode:'P01-L02'}});
  j.dispatch({type:'ADVANCE_L02',input:{final:true}});
  j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L02'}});
  j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  const state=j.dispatch({type:'RESOLVE_NEXT_STEP',safetyInput:{urgent:true}});
  assert.equal(state.phase,'SAFETY_GUIDANCE');
  assert.equal(state.offerVisible,false);
  assert.equal(state.safetyGuidance.escalated,true);
  const afterOfferAttempt=j.dispatch({type:'VIEW_OFFER',entitlementInput:{productId:'CUMG-P01',resourceTier:'PREMIUM'}});
  assert.equal(afterOfferAttempt.phase,'SAFETY_GUIDANCE');
  assert.equal(afterOfferAttempt.offerVisible,false);
});

test('invalid consent blocks private assessment start',()=>{
  const j=createP01FreeJourney(deps);
  const state=j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:false}});
  assert.equal(state.phase,'BLOCKED');
  assert.equal(state.error,'CONSENT_REQUIRED');
});


test('journey rejects out-of-order private reflection',()=>{
  const j=createP01FreeJourney(deps);
  const state=j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION'}});
  assert.equal(state.phase,'ERROR');
  assert.match(state.error,/INVALID_P01_PHASE:REFLECTION/);
});


test('FREE journey requires L02 before resolving the next step',()=>{
  const j=createP01FreeJourney(deps);
  j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:true}});
  j.dispatch({type:'START_ASSESSMENT'});
  j.dispatch({type:'ANSWER_ASSESSMENT',input:{code:'P01Q01',value:4,complete:true}});
  j.dispatch({type:'BUILD_CONTROL_MAP'});
  j.dispatch({type:'START_L01',lesson:{lessonCode:'P01-L01'}});
  j.dispatch({type:'ADVANCE_L01',input:{final:true}});
  j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L01'}});
  j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  const state=j.dispatch({type:'RESOLVE_NEXT_STEP',safetyInput:{}});
  assert.equal(state.phase,'ERROR');
  assert.match(state.error,/INVALID_P01_PHASE:NEXT_STEP/);
});
