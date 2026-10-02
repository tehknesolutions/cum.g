import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadInstrument } from '../../packages/assessment/src/instrument.mjs';
import { startAssessment, answerQuestion, nextQuestion } from '../../packages/assessment/src/session.mjs';

const raw = JSON.parse(await readFile(new URL('../../content/courses/CUMG-P01/assessment/control-map-v1.json', import.meta.url), 'utf8'));
const accessDecision = { allowed: true, reason: 'ALLOWED' };

const answerCore = (instrument, value = 4) => {
  let state = startAssessment({ instrument, accessDecision });
  while (state.status === 'IN_PROGRESS') {
    const question = nextQuestion(state);
    state = answerQuestion(state, { questionCode: question.code, value });
  }
  return state;
};

test('instrument defines exactly 12 core questions and a hard maximum of 32 answers', () => {
  const instrument = loadInstrument(raw);
  assert.equal(instrument.coreQuestionCodes.length, 12);
  assert.equal(instrument.maxAnswers, 32);
  assert.equal(new Set(instrument.coreQuestionCodes).size, 12);
});

test('normal high-awareness core path completes in 12 answers', () => {
  const instrument = loadInstrument(raw);
  const state = answerCore(instrument, 4);
  assert.equal(state.status, 'COMPLETE');
  assert.equal(state.answeredQuestionCodes.length, 12);
});

test('low response deterministically opens an adaptive branch', () => {
  const instrument = loadInstrument(raw);
  let state = startAssessment({ instrument, accessDecision });
  while (nextQuestion(state).code !== 'P01Q04') {
    const q = nextQuestion(state);
    state = answerQuestion(state, { questionCode: q.code, value: 4 });
  }
  state = answerQuestion(state, { questionCode: 'P01Q04', value: 1 });
  assert.equal(nextQuestion(state).code, 'P01B01');
});

test('fails closed for denied access, unknown question, malformed branch, cycles, and runaway limits', () => {
  const instrument = loadInstrument(raw);
  assert.throws(() => startAssessment({ instrument, accessDecision: { allowed: false } }), /ACCESS_DENIED/);
  const state = startAssessment({ instrument, accessDecision });
  assert.throws(() => answerQuestion(state, { questionCode: 'UNKNOWN', value: 1 }), /QUESTION_MISMATCH|UNKNOWN_QUESTION/);

  assert.throws(() => loadInstrument({ ...raw, version: '' }), /INVALID_INSTRUMENT_VERSION/);
  const badBranch = structuredClone(raw);
  badBranch.questions.find((q) => q.code === 'P01Q04').branch.questionCode = 'MISSING';
  assert.throws(() => loadInstrument(badBranch), /INVALID_BRANCH_TARGET/);

  const cycle = structuredClone(raw);
  const b1 = cycle.questions.find((q) => q.code === 'P01B01');
  b1.branch = { when: { lte: 4 }, questionCode: 'P01Q04' };
  assert.throws(() => loadInstrument(cycle), /BRANCH_CYCLE/);

  assert.throws(() => loadInstrument({ ...raw, maxAnswers: 33 }), /MAX_ANSWERS_EXCEEDED/);
});
