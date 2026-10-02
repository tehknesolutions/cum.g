import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAdultConsent } from '../../packages/access/src/adult-consent-gate.mjs';

const validReceipt = {
  consentType: 'P01_EDUCATION',
  policyVersion: '2026-10-02.v1',
  grantedAt: '2026-10-02T12:00:00Z',
  revokedAt: null,
};

const evaluate = (overrides = {}) => evaluateAdultConsent({
  ageConfirmed: true,
  consentReceipt: validReceipt,
  requiredConsentType: 'P01_EDUCATION',
  requiredPolicyVersion: '2026-10-02.v1',
  ...overrides,
});

test('blocks assessment when adult age is not confirmed', () => {
  assert.deepEqual(evaluate({ ageConfirmed: false }), { allowed: false, reason: 'AGE_REQUIRED' });
});

test('blocks missing, revoked, or mismatched consent', () => {
  assert.deepEqual(evaluate({ consentReceipt: null }), { allowed: false, reason: 'CONSENT_REQUIRED' });
  assert.deepEqual(evaluate({ consentReceipt: { ...validReceipt, revokedAt: '2026-10-02T13:00:00Z' } }), { allowed: false, reason: 'CONSENT_REVOKED' });
  assert.deepEqual(evaluate({ consentReceipt: { ...validReceipt, policyVersion: 'old' } }), { allowed: false, reason: 'CONSENT_VERSION_MISMATCH' });
  assert.deepEqual(evaluate({ consentReceipt: { ...validReceipt, consentType: 'OTHER' } }), { allowed: false, reason: 'CONSENT_TYPE_MISMATCH' });
});

test('allows a confirmed adult with active matching versioned consent', () => {
  assert.deepEqual(evaluate(), { allowed: true, reason: 'ALLOWED' });
});
