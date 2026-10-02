const DIMENSIONS = [
  'bodyAwareness',
  'arousalAwareness',
  'selfRegulation',
  'mentalAttention',
  'emotionalResponse',
  'contextCommunication',
  'perceivedConfidence',
];

const TARGETS = {
  bodyAwareness: 'P01-PRACTICE-BODY-AWARENESS',
  arousalAwareness: 'P01-PRACTICE-AROUSAL-AWARENESS',
  selfRegulation: 'P01-PRACTICE-SELF-REGULATION',
  mentalAttention: 'P01-PRACTICE-MENTAL-ATTENTION',
  emotionalResponse: 'P01-PRACTICE-EMOTIONAL-REGULATION',
  contextCommunication: 'P01-PRACTICE-CONTEXT-COMMUNICATION',
  perceivedConfidence: 'P01-PRACTICE-CONFIDENCE',
};

export function recommendNextStep({ controlMap, safetyDecision } = {}) {
  if (safetyDecision?.escalated === true) return { kind:'SAFETY', targetId:null, ruleId:'SAFETY-GATE', explanationKey:'P01.NEXT.SAFETY_GUIDANCE' };
  if (!controlMap || controlMap.status !== 'COMPLETE' || !controlMap.dimensions) throw new Error('CONTROL_MAP_REQUIRED');

  const candidates = DIMENSIONS
    .map((dimension) => ({ dimension, value: controlMap.dimensions[dimension]?.value }))
    .filter((item) => Number.isFinite(item.value))
    .sort((a,b) => a.value - b.value || DIMENSIONS.indexOf(a.dimension) - DIMENSIONS.indexOf(b.dimension));

  if (!candidates.length) throw new Error('CONTROL_MAP_EMPTY');

  const selected = candidates[0];
  const band = selected.value < 34 ? 'EXPLORE' : selected.value < 67 ? 'DEVELOP' : 'STRENGTHEN';

  return {
    kind: 'EXERCISE',
    targetId: TARGETS[selected.dimension],
    dimension: selected.dimension,
    value: selected.value,
    band,
    ruleId: `LOWEST_DIMENSION_${band}`,
    explanationKey: `P01.NEXT.${band}_${selected.dimension.toUpperCase()}`,
  };
}
