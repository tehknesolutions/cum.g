const cloneState = (state) => ({
  ...state,
  queue: [...state.queue],
  answeredQuestionCodes: [...state.answeredQuestionCodes],
  answers: { ...state.answers },
});

const questionMap = (instrument) => new Map(instrument.questions.map((q) => [q.code, q]));

export function startAssessment({ instrument, accessDecision } = {}) {
  if (accessDecision?.allowed !== true) throw new Error('ACCESS_DENIED');
  if (!instrument?.version || !Array.isArray(instrument.coreQuestionCodes)) throw new Error('UNKNOWN_INSTRUMENT_VERSION');
  return {
    instrumentCode: instrument.code,
    instrumentVersion: instrument.version,
    instrument,
    queue: [...instrument.coreQuestionCodes],
    answeredQuestionCodes: [],
    answers: {},
    status: 'IN_PROGRESS',
    errorReason: null,
  };
}

export function nextQuestion(state) {
  if (state?.status !== 'IN_PROGRESS') return null;
  const code = state.queue[0];
  if (!code) return null;
  const question = questionMap(state.instrument).get(code);
  if (!question) throw new Error('UNKNOWN_QUESTION');
  return question;
}

function branchMatches(branch, value) {
  if (!branch) return false;
  const when = branch.when ?? {};
  if (Number.isFinite(when.lte) && value <= when.lte) return true;
  if (Number.isFinite(when.gte) && value >= when.gte) return true;
  if (Object.hasOwn(when, 'equals') && value === when.equals) return true;
  return false;
}

export function answerQuestion(state, { questionCode, value } = {}) {
  if (state?.status !== 'IN_PROGRESS') throw new Error('ASSESSMENT_NOT_IN_PROGRESS');
  const next = nextQuestion(state);
  if (!next || next.code !== questionCode) throw new Error('QUESTION_MISMATCH');
  if (!Number.isFinite(value) || value < next.response.min || value > next.response.max) throw new Error('INVALID_ANSWER');
  if (state.answeredQuestionCodes.length >= state.instrument.maxAnswers) throw new Error('MAX_ANSWERS_EXCEEDED');

  const result = cloneState(state);
  result.queue.shift();
  result.answeredQuestionCodes.push(questionCode);
  result.answers[questionCode] = value;

  if (branchMatches(next.branch, value)) {
    const target = next.branch.questionCode;
    if (result.answeredQuestionCodes.includes(target) || result.queue.includes(target)) throw new Error('BRANCH_CYCLE');
    result.queue.unshift(target);
  }

  if (result.answeredQuestionCodes.length > result.instrument.maxAnswers) throw new Error('MAX_ANSWERS_EXCEEDED');
  if (result.queue.length === 0) result.status = 'COMPLETE';
  return result;
}
