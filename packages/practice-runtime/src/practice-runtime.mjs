const STEP_COUNT = 3;

export function createPracticeRuntime({ recommendation, safetyDecision } = {}) {
  if (!recommendation || recommendation.kind !== 'EXERCISE') throw new Error('RECOMMENDATION_REQUIRED');
  if (safetyDecision?.escalated === true) throw new Error('SAFETY_GATE');

  let state = {
    status: 'READY',
    targetId: recommendation.targetId,
    dimension: recommendation.dimension,
    band: recommendation.band,
    ruleId: recommendation.ruleId,
    startedAt: null,
    completedAt: null,
    completedSteps: 0,
    result: null,
  };

  return {
    getState: () => structuredClone(state),
    start() {
      if (state.status !== 'READY') throw new Error('RUNTIME_ALREADY_STARTED');
      state = { ...state, status:'IN_PROGRESS', startedAt:new Date().toISOString() };
      return this.getState();
    },
    complete(input = {}) {
      if (state.status !== 'IN_PROGRESS') throw new Error('RUNTIME_NOT_IN_PROGRESS');
      if (input.completedSteps !== STEP_COUNT) throw new Error('RUNTIME_STEPS_INCOMPLETE');
      state = {
        ...state,
        status:'COMPLETE',
        completedAt:new Date().toISOString(),
        completedSteps:STEP_COUNT,
        result:{
          targetId:recommendation.targetId,
          dimension:recommendation.dimension,
          band:recommendation.band,
          ruleId:recommendation.ruleId,
          reflectionRecorded:input.reflectionRecorded === true
        }
      };
      return this.getState();
    }
  };
}
