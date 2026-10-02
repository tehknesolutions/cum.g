export function evaluateAdultConsent({
  ageConfirmed,
  consentReceipt,
  requiredConsentType,
  requiredPolicyVersion,
} = {}) {
  if (ageConfirmed !== true) return { allowed: false, reason: 'AGE_REQUIRED' };
  if (!consentReceipt) return { allowed: false, reason: 'CONSENT_REQUIRED' };
  if (consentReceipt.revokedAt) return { allowed: false, reason: 'CONSENT_REVOKED' };
  if (consentReceipt.consentType !== requiredConsentType) return { allowed: false, reason: 'CONSENT_TYPE_MISMATCH' };
  if (consentReceipt.policyVersion !== requiredPolicyVersion) return { allowed: false, reason: 'CONSENT_VERSION_MISMATCH' };
  if (!consentReceipt.grantedAt) return { allowed: false, reason: 'CONSENT_REQUIRED' };
  return { allowed: true, reason: 'ALLOWED' };
}
