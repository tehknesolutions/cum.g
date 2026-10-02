import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadInstrument } from '../../packages/assessment/src/instrument.mjs';
import { startAssessment, answerQuestion, nextQuestion } from '../../packages/assessment/src/session.mjs';
import { buildControlMap } from '../../packages/control-map/src/control-map.mjs';

const raw = JSON.parse(await readFile(new URL('../../content/courses/CUMG-P01/assessment/control-map-v1.json', import.meta.url), 'utf8'));
const instrument = loadInstrument(raw);

function completedAssessment(value = 4) {
  let state = startAssessment({ instrument, accessDecision: { allowed: true } });
  while (state.status === 'IN_PROGRESS') {
    const question = nextQuestion(state);
    state = answerQuestion(state, { questionCode: question.code, value });
  }
  return state;
}

test('builds exactly seven deterministic educational dimensions without aggregate sexual-performance score', () => {
  const assessmentState = completedAssessment(4);
  const first = buildControlMap({ instrument, assessmentState, answers: assessmentState.answers });
  const second = buildControlMap({ instrument, assessmentState, answers: assessmentState.answers });
  assert.deepEqual(first, second);
  assert.equal(first.status, 'COMPLETE');
  assert.deepEqual(Object.keys(first.dimensions).sort(), [
    'arousalAwareness','bodyAwareness','contextCommunication','emotionalResponse','mentalAttention','perceivedConfidence','selfRegulation'
  ].sort());
  assert.equal(Object.hasOwn(first, 'score'), false);
  assert.equal(Object.hasOwn(first, 'diagnosis'), false);
  for (const dimension of Object.values(first.dimensions)) {
    assert.ok(dimension.value >= 0 && dimension.value <= 100);
    assert.match(dimension.interpretationKey, /^P01\.CONTROL_MAP\./);
  }
});

test('returns INCOMPLETE and explicit missing codes instead of fabricating values', () => {
  const assessmentState = completedAssessment(4);
  const answers = { ...assessmentState.answers };
  delete answers.P01Q01;
  const map = buildControlMap({ instrument, assessmentState, answers });
  assert.equal(map.status, 'INCOMPLETE');
  assert.deepEqual(map.missingQuestionCodes, ['P01Q01']);
  assert.deepEqual(map.dimensions, {});
});

test('rejects malformed/out-of-domain private answer values', () => {
  const assessmentState = completedAssessment(4);
  const answers = { ...assessmentState.answers, P01Q01: 99 };
  const map = buildControlMap({ instrument, assessmentState, answers });
  assert.equal(map.status, 'INCOMPLETE');
  assert.ok(map.invalidQuestionCodes.includes('P01Q01'));
  assert.deepEqual(map.dimensions, {});
});
