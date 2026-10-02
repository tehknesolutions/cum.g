const DIMENSIONS = [
  'bodyAwareness',
  'arousalAwareness',
  'selfRegulation',
  'mentalAttention',
  'emotionalResponse',
  'contextCommunication',
  'perceivedConfidence',
];

const interpretationKey = (dimension, value) => {
  const band = value < 34 ? 'EXPLORE' : value < 67 ? 'DEVELOP' : 'STRENGTHEN';
  return `P01.CONTROL_MAP.${dimension}.${band}`;
};

export function buildControlMap({ instrument, assessmentState, answers } = {}) {
  if (!instrument?.version || assessmentState?.instrumentVersion !== instrument.version) {
    throw new Error('INSTRUMENT_VERSION_MISMATCH');
  }
  if (assessmentState.status !== 'COMPLETE') throw new Error('ASSESSMENT_NOT_COMPLETE');
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new Error('INVALID_ANSWERS');

  const questions = new Map(instrument.questions.map((q) => [q.code, q]));
  const requiredCodes = assessmentState.answeredQuestionCodes;
  const missingQuestionCodes = requiredCodes.filter((code) => !Object.hasOwn(answers, code));
  const invalidQuestionCodes = requiredCodes.filter((code) => {
    if (!Object.hasOwn(answers, code)) return false;
    const question = questions.get(code);
    const value = answers[code];
    return !question || !Number.isFinite(value) || value < question.response.min || value > question.response.max;
  });

  if (missingQuestionCodes.length || invalidQuestionCodes.length) {
    return {
      status: 'INCOMPLETE',
      instrumentVersion: instrument.version,
      dimensions: {},
      missingQuestionCodes,
      invalidQuestionCodes,
    };
  }

  const buckets = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, []]));
  for (const code of requiredCodes) {
    const question = questions.get(code);
    if (!question || !Object.hasOwn(buckets, question.dimension)) continue;
    const span = question.response.max - question.response.min;
    const normalized = span === 0 ? 0 : ((answers[code] - question.response.min) / span) * 100;
    buckets[question.dimension].push(normalized);
  }

  const emptyDimensions = DIMENSIONS.filter((dimension) => buckets[dimension].length === 0);
  if (emptyDimensions.length) {
    return {
      status: 'INCOMPLETE',
      instrumentVersion: instrument.version,
      dimensions: {},
      missingQuestionCodes: [],
      invalidQuestionCodes: [],
      missingDimensions: emptyDimensions,
    };
  }

  const dimensions = {};
  for (const dimension of DIMENSIONS) {
    const values = buckets[dimension];
    const value = Math.round(values.reduce((sum, current) => sum + current, 0) / values.length);
    dimensions[dimension] = {
      value,
      interpretationKey: interpretationKey(dimension, value),
    };
  }

  return {
    status: 'COMPLETE',
    instrumentVersion: instrument.version,
    dimensions,
    missingQuestionCodes: [],
    invalidQuestionCodes: [],
  };
}

export function updateControlMap({ previousMap, dimension, selfRating } = {}) {
  if (!previousMap || previousMap.status !== 'COMPLETE' || !previousMap.dimensions) throw new Error('CONTROL_MAP_REQUIRED');
  if (!Object.hasOwn(previousMap.dimensions, dimension)) throw new Error('DIMENSION_REQUIRED');
  const rating = Number(selfRating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 100) throw new Error('SELF_RATING_OUT_OF_RANGE');
  const current = previousMap.dimensions[dimension].value;
  const value = Math.round((current * 80 + rating * 20) / 100);
  return {
    ...previousMap,
    version: (previousMap.version ?? 1) + 1,
    dimensions: {
      ...previousMap.dimensions,
      [dimension]: { ...previousMap.dimensions[dimension], value, interpretationKey: interpretationKey(dimension, value) }
    },
    updateSource: 'PRACTICE_FEEDBACK'
  };
}
