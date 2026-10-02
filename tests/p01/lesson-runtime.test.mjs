import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadLesson, createLessonSession, advanceLesson } from '../../packages/learning/src/lesson-runtime.mjs';

const raw = JSON.parse(await readFile(new URL('../../content/courses/CUMG-P01/lessons/P01-L01.json', import.meta.url), 'utf8'));
const STAGES = ['LEARN','OBSERVE','PRACTICE','RECORD','REFLECT','COMPARE','ADVANCE'];

test('P01-L01 preserves the complete seven-stage learning loop and provenance boundaries', () => {
  const lesson = loadLesson(raw);
  assert.deepEqual(lesson.blocks.map((b) => b.stage), STAGES);
  assert.deepEqual(new Set(lesson.blocks.map((b) => b.provenanceClass)), new Set(['SCIENTIFIC','EXPERIENTIAL','SOCIAL','HNK']));
  for (const block of lesson.blocks.filter((b) => b.provenanceClass === 'SCIENTIFIC')) {
    assert.ok(Array.isArray(block.claimRefs) && block.claimRefs.length > 0);
  }
  const practice = lesson.blocks.find((b) => b.stage === 'PRACTICE');
  assert.equal(practice.nonSexual, true);
});

test('lesson stages cannot be silently skipped', () => {
  const lesson = loadLesson(raw);
  let session = createLessonSession(lesson);
  assert.equal(session.currentStage, 'LEARN');
  assert.throws(() => advanceLesson(session, { stage: 'PRACTICE', completed: true }), /STAGE_MISMATCH/);
  for (const stage of STAGES) session = advanceLesson(session, { stage, completed: true });
  assert.equal(session.status, 'COMPLETE');
});

test('invalid provenance and scientific blocks without claim refs fail closed', () => {
  const badProvenance = structuredClone(raw);
  badProvenance.blocks[0].provenanceClass = 'MIXED';
  assert.throws(() => loadLesson(badProvenance), /INVALID_PROVENANCE/);
  const missingClaim = structuredClone(raw);
  missingClaim.blocks.find((b) => b.provenanceClass === 'SCIENTIFIC').claimRefs = [];
  assert.throws(() => loadLesson(missingClaim), /SCIENTIFIC_CLAIM_REQUIRED/);
});
