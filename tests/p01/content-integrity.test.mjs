import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const courseUrl = new URL('../../content/courses/CUMG-P01/course.json', import.meta.url);
const instrumentUrl = new URL('../../content/courses/CUMG-P01/assessment/control-map-v1.json', import.meta.url);
const lessonUrl = new URL('../../content/courses/CUMG-P01/lessons/P01-L01.json', import.meta.url);
const claimsUrl = new URL('../../content/courses/CUMG-P01/provenance/claims-v1.json', import.meta.url);

test('P01 course manifest points to the canonical instrument and lesson', async () => {
  const course = JSON.parse(await readFile(courseUrl,'utf8'));
  const instrument = JSON.parse(await readFile(instrumentUrl,'utf8'));
  const lesson = JSON.parse(await readFile(lessonUrl,'utf8'));
  assert.equal(course.instruments.includes(instrument.code), true);
  assert.equal(course.verticalSliceLessons.includes(lesson.lessonCode), true);
});

test('every scientific lesson claimRef resolves in the P01 claim registry', async () => {
  const lesson = JSON.parse(await readFile(lessonUrl,'utf8'));
  const claims = JSON.parse(await readFile(claimsUrl,'utf8'));
  const ids = new Set(claims.claims.map((claim)=>claim.id));
  for (const block of lesson.blocks.filter((block)=>block.provenanceClass === 'SCIENTIFIC')) {
    for (const claimRef of block.claimRefs) assert.equal(ids.has(claimRef), true, 'unresolved scientific claim: '+claimRef);
  }
});
