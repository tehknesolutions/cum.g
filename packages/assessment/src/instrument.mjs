const DIMENSIONS = new Set([
  'bodyAwareness', 'arousalAwareness', 'selfRegulation', 'mentalAttention',
  'emotionalResponse', 'contextCommunication', 'perceivedConfidence',
]);

function assertNoBranchCycle(questionMap) {
  const visiting = new Set();
  const visited = new Set();
  const walk = (code) => {
    if (visiting.has(code)) throw new Error('BRANCH_CYCLE');
    if (visited.has(code)) return;
    visiting.add(code);
    const target = questionMap.get(code)?.branch?.questionCode;
    if (target) walk(target);
    visiting.delete(code);
    visited.add(code);
  };
  for (const code of questionMap.keys()) walk(code);
}

export function loadInstrument(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('INVALID_INSTRUMENT');
  if (typeof raw.code !== 'string' || !raw.code) throw new Error('INVALID_INSTRUMENT_CODE');
  if (typeof raw.version !== 'string' || !raw.version) throw new Error('INVALID_INSTRUMENT_VERSION');
  if (!Number.isInteger(raw.maxAnswers) || raw.maxAnswers < 1 || raw.maxAnswers > 32) throw new Error('MAX_ANSWERS_EXCEEDED');
  if (!Array.isArray(raw.coreQuestionCodes) || raw.coreQuestionCodes.length !== 12) throw new Error('INVALID_CORE_QUESTION_COUNT');
  if (!Array.isArray(raw.questions)) throw new Error('INVALID_QUESTIONS');

  const questionMap = new Map();
  for (const question of raw.questions) {
    if (!question?.code || questionMap.has(question.code)) throw new Error('INVALID_QUESTION_CODE');
    if (!DIMENSIONS.has(question.dimension)) throw new Error('INVALID_DIMENSION');
    if (question.response?.type !== 'scale' || !Number.isFinite(question.response.min) || !Number.isFinite(question.response.max) || question.response.min > question.response.max) throw new Error('INVALID_RESPONSE_DOMAIN');
    questionMap.set(question.code, structuredClone(question));
  }
  for (const code of raw.coreQuestionCodes) if (!questionMap.has(code)) throw new Error('UNKNOWN_CORE_QUESTION');
  for (const question of questionMap.values()) {
    if (question.branch && !questionMap.has(question.branch.questionCode)) throw new Error('INVALID_BRANCH_TARGET');
  }
  assertNoBranchCycle(questionMap);

  return Object.freeze({
    code: raw.code,
    version: raw.version,
    maxAnswers: raw.maxAnswers,
    coreQuestionCodes: Object.freeze([...raw.coreQuestionCodes]),
    questions: Object.freeze([...questionMap.values()]),
  });
}
