import { createP01FreeJourney } from './free-journey.mjs';
import { createLessonPlayer } from './lesson-player.mjs';
import { evaluateAdultConsent } from '../../../../packages/access/src/adult-consent-gate.mjs';
import { loadInstrument } from '../../../../packages/assessment/src/instrument.mjs';
import { startAssessment, answerQuestion } from '../../../../packages/assessment/src/session.mjs';
import { buildControlMap, updateControlMap } from '../../../../packages/control-map/src/control-map.mjs';
import { loadLesson, createLessonSession, advanceLesson } from '../../../../packages/learning/src/lesson-runtime.mjs';
import { evaluateSafety } from '../../../../packages/guidance/src/safety-gate.mjs';
import { recommendNextStep } from '../../../../packages/guidance/src/recommendation-engine.mjs';
import { createPracticeRuntime } from '../../../../packages/practice-runtime/src/practice-runtime.mjs';

const base=new URL('../../../../',import.meta.url);
const loadJson=async path=>{const response=await fetch(new URL(path,base));if(!response.ok)throw new Error(`CONTENT_LOAD_FAILED:${path}`);return response.json();};

export async function createBrowserP01Journey({userId='browser-demo'}={}){
  const [instrumentRaw,l01Raw,l02Raw,safetyRules,recommendationRules]=await Promise.all([
    loadJson('content/courses/CUMG-P01/assessment/control-map-v1.json'),loadJson('content/courses/CUMG-P01/lessons/P01-L01.json'),loadJson('content/courses/CUMG-P01/lessons/P01-L02.json'),loadJson('content/courses/CUMG-P01/guidance/safety-v1.json'),loadJson('content/courses/CUMG-P01/guidance/recommendations-v1.json')
  ]);
  const instrument=loadInstrument(instrumentRaw);const lessons={'P01-L01':loadLesson(l01Raw),'P01-L02':loadLesson(l02Raw)};const players={'P01-L01':createLessonPlayer(lessons['P01-L01']),'P01-L02':createLessonPlayer(lessons['P01-L02'])};const checkpointStore=new Map();const mapStore=new Map();
  const checkpoint={save:async({userId,state,expectedVersion})=>{const current=checkpointStore.get(userId);const version=current?.stateVersion??0;if(version!==expectedVersion)throw new Error('CHECKPOINT_CONFLICT');const next={state:structuredClone(state),stateVersion:version+1};checkpointStore.set(userId,next);return{state_version:next.stateVersion};},loadLatest:async({userId})=>checkpointStore.get(userId)??null};
  const history={saveSnapshot:async({userId,map})=>{const version=map.version??1;const item={id:`browser-map-${version}`,version,map:structuredClone(map)};mapStore.set(userId,item);return item;},loadLatestSnapshot:async({userId})=>mapStore.get(userId)??null};
  const journey=createP01FreeJourney({
    consentGate:input=>evaluateAdultConsent({ageConfirmed:input?.ageConfirmed===true,consentReceipt:{consentType:'EDUCATION_ADULT',policyVersion:'1.0.0',grantedAt:new Date().toISOString()},requiredConsentType:'EDUCATION_ADULT',requiredPolicyVersion:'1.0.0'}),
    assessment:{start:()=>startAssessment({instrument,accessDecision:{allowed:true}}),answer:(state,input)=>answerQuestion(state,{questionCode:input.questionCode,value:input.value})},
    controlMap:{build:()=>buildControlMap({instrument,assessmentState:journey.getState().assessmentState,answers:journey.getState().assessmentState?.answers})},
    lesson:{create:input=>createLessonSession(input),advance:(state,input)=>advanceLesson(state,input)},
    safety:{evaluate:input=>evaluateSafety({ruleSet:safetyRules,privateSignals:input?.privateSignals??{}})},
    recommendation:{next:input=>recommendNextStep({rules:recommendationRules,controlMap:input.controlMap,lessonState:input.lessonState,consentState:{allowed:true},instrumentVersion:journey.getState().assessmentState?.instrumentVersion??instrument.version})},
    entitlement:{evaluate:()=>({allowed:false,reason:'PREMIUM_REQUIRED'})},practiceRuntime:{create:input=>createPracticeRuntime(input)},controlMapHistory:history,journeyCheckpoint:checkpoint,analytics:()=>{}
  });
  return{journey,instrument,lessons,players,userId,updateMap:(dimension,rating)=>updateControlMap({previousMap:journey.getState().controlMap,dimension,selfRating:rating})};
}
