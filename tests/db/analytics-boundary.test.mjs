import test from 'node:test';
import assert from 'node:assert/strict';
import { projectAnalyticsEvent } from '../../packages/db/src/analytics-event-contract.mjs';

test('allows only minimal fields for approved events', () => {
  assert.deepEqual(projectAnalyticsEvent('lesson_completed',{lessonId:'P01-L01',programId:'CUMG-P01'}),{name:'lesson_completed',properties:{lessonId:'P01-L01',programId:'CUMG-P01'}});
  assert.deepEqual(projectAnalyticsEvent('assessment_completed',{assessmentId:'P01-ASSESSMENT',instrumentVersion:'1.0.0'}),{name:'assessment_completed',properties:{assessmentId:'P01-ASSESSMENT',instrumentVersion:'1.0.0'}});
});

test('rejects unknown events and unknown properties', () => {
  assert.throws(()=>projectAnalyticsEvent('unknown_event',{}),/event not allowed/i);
  assert.throws(()=>projectAnalyticsEvent('lesson_completed',{lessonId:'x',mood:'great'}),/property not allowed/i);
});

test('rejects sensitive keys recursively instead of silently stripping them', () => {
  const forbidden=['response','answer','freeText','controlMap','score','assessment','privateState','reflection','dimension','safetySignal','privateSignals','encryptedPayload','healthState'];
  for(const key of forbidden){
    assert.throws(()=>projectAnalyticsEvent('lesson_started',{lessonId:'x',metadata:{nested:{[key]:'secret'}}}),/sensitive analytics property/i,`expected recursive rejection for ${key}`);
  }
});
