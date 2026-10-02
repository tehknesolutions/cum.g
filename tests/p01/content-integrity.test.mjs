import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const courseUrl = new URL('../../content/courses/CUMG-P01/course.json', import.meta.url);
const lesson1Url = new URL('../../content/courses/CUMG-P01/lessons/P01-L01.json', import.meta.url);
const lesson2Url = new URL('../../content/courses/CUMG-P01/lessons/P01-L02.json', import.meta.url);
const instrumentUrl = new URL('../../content/courses/CUMG-P01/assessment/control-map-v1.json', import.meta.url);
const claimsUrl = new URL('../../content/courses/CUMG-P01/provenance/claims-v1.json', import.meta.url);

test('P01 manifest points to canonical instrument and both vertical-slice lessons', async () => {
  const course = JSON.parse(await readFile(courseUrl,'utf8'));
  const instrument = JSON.parse(await readFile(instrumentUrl,'utf8'));
  const lesson1 = JSON.parse(await readFile(lesson1Url,'utf8'));
  const lesson2 = JSON.parse(await readFile(lesson2Url,'utf8'));
  assert.equal(course.instruments.includes(instrument.code), true);
  assert.equal(course.verticalSliceLessons.includes(lesson1.lessonCode), true);
  assert.equal(course.verticalSliceLessons.includes(lesson2.lessonCode), true);
});

test('every scientific lesson claimRef resolves in the P01 claim registry', async () => {
  const claims = JSON.parse(await readFile(claimsUrl,'utf8'));
  const ids = new Set(claims.claims.map((claim)=>claim.id));
  for (const url of [lesson1Url, lesson2Url]) {
    const lesson = JSON.parse(await readFile(url,'utf8'));
    for (const block of lesson.blocks.filter((block)=>block.provenanceClass === 'SCIENTIFIC')) {
      for (const claimRef of block.claimRefs) assert.equal(ids.has(claimRef), true, 'unresolved scientific claim: '+claimRef);
    }
  }
});
