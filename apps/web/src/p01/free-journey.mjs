export function createP01FreeJourney(deps = {}) {
  const { consentGate, assessment, controlMap, lesson, safety, recommendation, entitlement, practiceRuntime, controlMapHistory, analytics } = deps;
  if (!consentGate || !assessment || !controlMap || !lesson || !safety || !recommendation || !entitlement || !practiceRuntime || !controlMapHistory?.saveSnapshot) throw new Error('P01_DEPENDENCIES_REQUIRED');

  let state = {
    phase:'ENTRY', assessmentState:null, controlMap:null, lessonState:null, currentLessonCode:null,
    completedLessons:[], reflections:[], nextStep:null, safetyGuidance:null, offerVisible:false,
    offerAccess:null, practiceState:null, mapHistory:[], freeValueDelivered:false, error:null,
  };
  const emit=(name,input)=>analytics?.(name,input);
  const requirePhase=(phase)=>{ if(state.phase!==phase) throw new Error(`INVALID_P01_PHASE:${phase}`); };

  return {
    getState:()=>structuredClone(state),
    async dispatch(event={}) {
      try {
        switch(event.type) {
          case 'CONFIRM_ADULT_CONSENT': { requirePhase('ENTRY'); const decision=consentGate(event.input); if(!decision.allowed){state={...state,phase:'BLOCKED',error:decision.reason};break;} state={...state,phase:'ASSESSMENT',error:null}; emit('assessment_started',{assessmentId:'CUMG-P01-CONTROL-MAP',instrumentVersion:event.instrument?.version??'1.0.0'}); break; }
          case 'START_ASSESSMENT': requirePhase('ASSESSMENT'); state={...state,assessmentState:assessment.start(event.input)}; break;
          case 'ANSWER_ASSESSMENT': requirePhase('ASSESSMENT'); state={...state,assessmentState:assessment.answer(state.assessmentState,event.input)}; if(state.assessmentState.status==='COMPLETE'){state={...state,phase:'CONTROL_MAP'};emit('assessment_completed',{assessmentId:state.assessmentState.instrumentCode,instrumentVersion:state.assessmentState.instrumentVersion});} break;
          case 'BUILD_CONTROL_MAP': { requirePhase('CONTROL_MAP'); const map=controlMap.build(event.input); if(map.status!=='COMPLETE'){state={...state,controlMap:map};break;} const saved=await controlMapHistory.saveSnapshot({userId:event.userId,assessmentId:event.assessmentId??state.assessmentState?.assessmentId,instrumentVersion:state.assessmentState?.instrumentVersion??'1.0.0',map}); state={...state,controlMap:map,freeValueDelivered:true,mapHistory:[{version:map.version??1,status:'SAVED',id:saved?.id??null}],phase:'L01'}; break; }
          case 'START_L01': requirePhase('L01'); state={...state,lessonState:lesson.create(event.lesson),currentLessonCode:'P01-L01'}; break;
          case 'ADVANCE_L01': requirePhase('L01'); state={...state,lessonState:lesson.advance(state.lessonState,event.input)}; if(state.lessonState.status==='COMPLETE') state={...state,completedLessons:[...state.completedLessons,'P01-L01'],phase:'REFLECTION'}; break;
          case 'SAVE_REFLECTION': requirePhase('REFLECTION'); state={...state,reflections:[...state.reflections,{lessonCode:state.currentLessonCode,record:event.privateRecord}],phase:'MAP_UPDATE'}; break;
          case 'UPDATE_MAP': requirePhase('MAP_UPDATE'); if(state.currentLessonCode==='P01-L01') state={...state,controlMap:event.controlMap,phase:'L02'}; else if(state.currentLessonCode==='P01-L02') state={...state,controlMap:event.controlMap,phase:'NEXT_STEP'}; else throw new Error('UNKNOWN_P01_LESSON'); break;
          case 'START_L02': requirePhase('L02'); state={...state,lessonState:lesson.create(event.lesson),currentLessonCode:'P01-L02'}; break;
          case 'ADVANCE_L02': requirePhase('L02'); state={...state,lessonState:lesson.advance(state.lessonState,event.input)}; if(state.lessonState.status==='COMPLETE') state={...state,completedLessons:[...state.completedLessons,'P01-L02'],phase:'REFLECTION'}; break;
          case 'RESOLVE_NEXT_STEP': { requirePhase('NEXT_STEP'); const safetyResult=safety.evaluate(event.safetyInput??{}); if(safetyResult.escalated){state={...state,safetyGuidance:safetyResult,phase:'SAFETY_GUIDANCE',freeValueDelivered:true};break;} const next=recommendation.next({controlMap:state.controlMap,safetyDecision:safetyResult,...(event.recommendationInput??{})}); const runtime=practiceRuntime.create({recommendation:next,safetyDecision:safetyResult}); state={...state,nextStep:next,practiceState:runtime,phase:'PRACTICE',offerVisible:false}; break; }
          case 'START_PRACTICE': requirePhase('PRACTICE'); state={...state,practiceState:state.practiceState.start()}; break;
          case 'COMPLETE_PRACTICE': requirePhase('PRACTICE'); state={...state,practiceState:state.practiceState.complete(event.input??{}),phase:'PRACTICE_RESULT',offerVisible:false}; break;
          case 'SAVE_PRACTICE_RESULT': requirePhase('PRACTICE_RESULT'); if(!event.privateRecord) throw new Error('PRACTICE_RECORD_REQUIRED'); state={...state,reflections:[...state.reflections,{lessonCode:'PRACTICE',record:event.privateRecord}],phase:'MAP_UPDATE'}; break;
          case 'UPDATE_PRACTICE_MAP': { requirePhase('MAP_UPDATE'); const map=event.controlMap; const saved=await controlMapHistory.saveSnapshot({userId:event.userId,assessmentId:event.assessmentId??state.assessmentState?.assessmentId,instrumentVersion:state.assessmentState?.instrumentVersion??'1.0.0',map}); state={...state,controlMap:map,mapHistory:[...state.mapHistory,{version:map.version??2,status:'SAVED',id:saved?.id??null}],phase:'OFFER',offerVisible:true}; break; }
          case 'VIEW_OFFER': { if(state.phase!=='OFFER'){if(state.phase==='SAFETY_GUIDANCE') break; throw new Error('INVALID_P01_PHASE:OFFER');} const access=entitlement.evaluate({...event.entitlementInput,safetyDecision:state.safetyGuidance}); state={...state,offerVisible:access.allowed||event.showOffer===true,offerAccess:access}; break; }
          default: throw new Error('UNKNOWN_P01_EVENT');
        }
      } catch(error) { state={...state,phase:'ERROR',error:error instanceof Error?error.message:String(error)}; }
      return this.getState();
    }
  };
}
