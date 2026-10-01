import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('CUM.G genesis exposes the approved product identity and privacy boundary', async () => {
  const manifest = JSON.parse(await read('apps/web/product.manifest.json'));
  assert.equal(manifest.brand, 'CUM.G');
  assert.equal(manifest.release, 'CUM.G V0.1 — EDUCATION VERTICAL SLICE');
  assert.equal(manifest.priority, 'education');
  assert.equal(manifest.boundaries.privateVaultInGenericAnalytics, false);
});

test('P01 seed keeps evidence provenance classes distinct', async () => {
  const seed = JSON.parse(await read('content/courses/CUMG-P01/course.json'));
  assert.equal(seed.id, 'CUMG-P01');
  assert.deepEqual(seed.provenanceClasses, ['SCIENTIFIC', 'EXPERIENTIAL', 'SOCIAL', 'HNK']);
  assert.equal(seed.medicalSafetyBehindPaywall, false);
});
