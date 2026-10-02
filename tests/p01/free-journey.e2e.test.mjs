import test from 'node:test';
import assert from 'node:assert/strict';
import { createP01FreeJourney } from '../../apps/web/src/p01/free-journey.mjs';

function createDeps(overrides={}) {
  return {
    consentGate: (input) => input?.allowed === true ? {allowed:true,reason:'ALLOWED'} : {allowed:false,reason:'CONSENT_REQUIRED'},
    assessment: {
      start: () => ({status:'IN_PROGRESS',assessmentId:'assessment-1',instrumentCode:'P01',instrumentVersion:'1.0.0',answers:{}}),
      answer: (state,input) => ({...state,answers:{...state.answers,[input.code]:input.value},status:input.complete?'COMPLETE':'IN_PROGRESS'}),
    },
    controlMap: { build: () => ({status:'COMPLETE',version:1,dimensions:{bodyAwareness:{value:50},arousalAwareness:{value:50},selfRegulation:{value:50},mentalAttention:{value:50},emotionalResponse:{value:50},contextCommunication:{value:50},perceivedConfidence:{value:50}}}) },
    lesson: {
      create: () => ({status:'IN_PROGRESS',currentStage:'LEARN'}),
      advance: (state,input) => input.final ? {...state,status:'COMPLETE'} : {...state,currentStage:input.nextStage},
    },
    safety: { evaluate: (input) => input?.urgent ? {escalated:true,guidanceKey:'P01.SAFETY.URGENT_CARE',ruleId:'SAFETY-URGENT'} : {escalated:false} },
    recommendation: { next: () => ({kind:'EXERCISE',targetId:'P01-PRACTICE-02',ruleId:'NEXT-PROGRESSIVE',explanationKey:'P01.NEXT.PROGRESSIVE_PRACTICE'}) },
    entitlement: { evaluate: (input) => input?.safetyDecision?.escalated ? {allowed:false,reason:'SAFETY_GATE'} : {allowed:false,reason:'PREMIUM_REQUIRED'} },
    analytics: () => {},
    practiceRuntime: { create: ({ recommendation }) => ({ status:'READY', start:()=>({status:'IN_PROGRESS'}), complete:()=>({status:'COMPLETE',targetId:recommendation.targetId}) }) },
    controlMapHistory: { saveSnapshot: async (input) => ({ id:'map-'+(input.map.version??1) }) },
    ...overrides,
  };
}

async function reachMapUpdate(j) {
  await j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:true}});
  await j.dispatch({type:'START_ASSESSMENT'});
  await j.dispatch({type:'ANSWER_ASSESSMENT',input:{code:'P01Q01',value:4,complete:true}});
  await j.dispatch({type:'BUILD_CONTROL_MAP',userId:'user-1'});
  await j.dispatch({type:'START_L01',lesson:{}});
  await j.dispatch({type:'ADVANCE_L01',input:{final:true}});
  await j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L01'}});
  await j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  await j.dispatch({type:'START_L02',lesson:{lessonCode:'P01-L02'}});
  await j.dispatch({type:'ADVANCE_L02',input:{final:true}});
  await j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L02'}});
  await j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  await j.dispatch({type:'RESOLVE_NEXT_STEP',recommendationInput:{},safetyInput:{}});
  await j.dispatch({type:'START_PRACTICE'});
  await j.dispatch({type:'COMPLETE_PRACTICE',input:{completedSteps:3,reflectionRecorded:true}});
  return j.dispatch({type:'SAVE_PRACTICE_RESULT',privateRecord:{kind:'PRACTICE_RESULT'}});
}

test('adult synthetic user completes FREE journey and receives value before offer',async()=>{
  const j=createP01FreeJourney(createDeps());
  const recorded=await reachMapUpdate(j);
  assert.equal(recorded.phase,'MAP_UPDATE');
  assert.equal(recorded.offerVisible,false);
  assert.equal(recorded.mapHistory[0].version,1);
  assert.equal(recorded.mapHistory[0].status,'SAVED');
  const offered=await j.dispatch({type:'UPDATE_PRACTICE_MAP',userId:'user-1',controlMap:{status:'COMPLETE',version:2,dimensions:{}}});
  assert.equal(offered.phase,'OFFER');
  assert.equal(offered.offerVisible,true);
  assert.equal(offered.mapHistory.at(-1).version,2);
  assert.equal(offered.mapHistory.at(-1).status,'SAVED');
});

test('map v1 persistence failure fails closed before L01',async()=>{
  const j=createP01FreeJourney(createDeps({controlMapHistory:{saveSnapshot:async()=>{throw new Error('VAULT_WRITE_FAILED');}}}));
  await j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:true}});
  await j.dispatch({type:'START_ASSESSMENT'});
  await j.dispatch({type:'ANSWER_ASSESSMENT',input:{code:'P01Q01',value:4,complete:true}});
  const state=await j.dispatch({type:'BUILD_CONTROL_MAP',userId:'user-1'});
  assert.equal(state.phase,'ERROR');
  assert.equal(state.error,'VAULT_WRITE_FAILED');
  assert.equal(state.offerVisible,false);
  assert.equal(state.mapHistory.length,0);
});

test('map v2 persistence failure fails closed and never exposes offer',async()=>{
  let writes=0;
  const history={saveSnapshot:async(input)=>{writes+=1;if((input.map.version??1)===2) throw new Error('VAULT_WRITE_FAILED');return {id:'map-1'};}};
  const j=createP01FreeJourney(createDeps({controlMapHistory:history}));
  await reachMapUpdate(j);
  const state=await j.dispatch({type:'UPDATE_PRACTICE_MAP',userId:'user-1',controlMap:{status:'COMPLETE',version:2,dimensions:{}}});
  assert.equal(writes,2);
  assert.equal(state.phase,'ERROR');
  assert.equal(state.error,'VAULT_WRITE_FAILED');
  assert.equal(state.offerVisible,false);
  assert.equal(state.mapHistory.length,1);
});

test('safety escalation wins over premium offer and remains authoritative',async()=>{
  const j=createP01FreeJourney(createDeps());
  await j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:true}});
  await j.dispatch({type:'START_ASSESSMENT'});
  await j.dispatch({type:'ANSWER_ASSESSMENT',input:{code:'P01Q01',value:4,complete:true}});
  await j.dispatch({type:'BUILD_CONTROL_MAP',userId:'user-1'});
  await j.dispatch({type:'START_L01',lesson:{}});
  await j.dispatch({type:'ADVANCE_L01',input:{final:true}});
  await j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L01'}});
  await j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  await j.dispatch({type:'START_L02',lesson:{lessonCode:'P01-L02'}});
  await j.dispatch({type:'ADVANCE_L02',input:{final:true}});
  await j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L02'}});
  await j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  const state=await j.dispatch({type:'RESOLVE_NEXT_STEP',safetyInput:{urgent:true}});
  assert.equal(state.phase,'SAFETY_GUIDANCE');
  assert.equal(state.offerVisible,false);
  assert.equal(state.safetyGuidance.escalated,true);
  const afterOfferAttempt=await j.dispatch({type:'VIEW_OFFER',entitlementInput:{productId:'CUMG-P01',resourceTier:'PREMIUM'}});
  assert.equal(afterOfferAttempt.phase,'SAFETY_GUIDANCE');
  assert.equal(afterOfferAttempt.offerVisible,false);
});

test('invalid consent blocks private assessment start',async()=>{
  const j=createP01FreeJourney(createDeps());
  const state=await j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:false}});
  assert.equal(state.phase,'BLOCKED');
  assert.equal(state.error,'CONSENT_REQUIRED');
});

test('journey rejects out-of-order private reflection',async()=>{
  const j=createP01FreeJourney(createDeps());
  const state=await j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION'}});
  assert.equal(state.phase,'ERROR');
  assert.match(state.error,/INVALID_P01_PHASE:REFLECTION/);
});

test('FREE journey requires L02 before resolving the next step',async()=>{
  const j=createP01FreeJourney(createDeps());
  await j.dispatch({type:'CONFIRM_ADULT_CONSENT',input:{allowed:true}});
  await j.dispatch({type:'START_ASSESSMENT'});
  await j.dispatch({type:'ANSWER_ASSESSMENT',input:{code:'P01Q01',value:4,complete:true}});
  await j.dispatch({type:'BUILD_CONTROL_MAP',userId:'user-1'});
  await j.dispatch({type:'START_L01',lesson:{lessonCode:'P01-L01'}});
  await j.dispatch({type:'ADVANCE_L01',input:{final:true}});
  await j.dispatch({type:'SAVE_REFLECTION',privateRecord:{kind:'P01_REFLECTION_L01'}});
  await j.dispatch({type:'UPDATE_MAP',controlMap:{status:'COMPLETE',dimensions:{}}});
  const state=await j.dispatch({type:'RESOLVE_NEXT_STEP',safetyInput:{}});
  assert.equal(state.phase,'ERROR');
  assert.match(state.error,/INVALID_P01_PHASE:NEXT_STEP/);
});
