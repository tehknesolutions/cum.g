export function createP01FreeJourney(deps = {}) {
  const { consentGate, assessment, controlMap, lesson, safety, recommendation, entitlement, analytics } = deps;
  if (!consentGate || !assessment || !controlMap || !lesson || !safety || !recommendation || !entitlement) throw new Error('P01_DEPENDENCIES_REQUIRED');

  let state = {
    phase: 'ENTRY',
    assessmentState: null,
    controlMap: null,
    lessonState: null,
    reflection: null,
    nextStep: null,
    safetyGuidance: null,
    offerVisible: false,
    freeValueDelivered: false,
    error: null,
  };

  const emit = (name, input) => analytics?.(name, input);

  return {
    getState: () => structuredClone(state),
    dispatch(event = {}) {
      try {
        switch (event.type) {
          case 'CONFIRM_ADULT_CONSENT': {
            const decision = consentGate(event.input);
            if (!decision.allowed) { state = { ...state, phase:'BLOCKED', error:decision.reason }; break; }
            state = { ...state, phase:'ASSESSMENT', error:null };
            emit('assessment_started',{assessmentId:'CUMG-P01-CONTROL-MAP',instrumentVersion:event.instrument?.version ?? '1.0.0'});
            break;
          }
          case 'START_ASSESSMENT':
            state = { ...state, assessmentState: assessment.start(event.input), phase:'ASSESSMENT' };
            break;
          case 'ANSWER_ASSESSMENT':
            state = { ...state, assessmentState: assessment.answer(state.assessmentState,event.input) };
            if (state.assessmentState.status === 'COMPLETE') {
              state = { ...state, phase:'CONTROL_MAP' };
              emit('assessment_completed',{assessmentId:state.assessmentState.instrumentCode,instrumentVersion:state.assessmentState.instrumentVersion});
            }
            break;
          case 'BUILD_CONTROL_MAP':
            state = { ...state, controlMap:controlMap.build(event.input), freeValueDelivered:true, phase:'L01' };
            break;
          case 'START_L01':
            state = { ...state, lessonState:lesson.create(event.lesson), phase:'L01' };
            break;
          case 'ADVANCE_L01':
            state = { ...state, lessonState:lesson.advance(state.lessonState,event.input) };
            if (state.lessonState.status === 'COMPLETE') state = { ...state, phase:'REFLECTION' };
            break;
          case 'SAVE_REFLECTION':
            state = { ...state, reflection:event.privateRecord, phase:'MAP_UPDATE' };
            break;
          case 'UPDATE_MAP':
            state = { ...state, controlMap:event.controlMap, phase:'NEXT_STEP' };
            break;
          case 'RESOLVE_NEXT_STEP': {
            const safetyResult = safety.evaluate(event.safetyInput ?? {});
            if (safetyResult.escalated) {
              state = { ...state, safetyGuidance:safetyResult, phase:'SAFETY_GUIDANCE', freeValueDelivered:true };
              break;
            }
            state = { ...state, nextStep:recommendation.next(event.recommendationInput ?? {}), phase:'OFFER', offerVisible:true };
            break;
          }
          case 'VIEW_OFFER': {
            const access=entitlement.evaluate(event.entitlementInput);
            state={...state,offerVisible:true,offerAccess:access,phase:'OFFER'};
            break;
          }
          default: throw new Error('UNKNOWN_P01_EVENT');
        }
      } catch (error) {
        state={...state,phase:'ERROR',error:error instanceof Error?error.message:String(error)};
      }
      return this.getState();
    },
  };
}
