-- P01 V1 identity additions contain eligibility metadata only.
-- Versioned consent already exists as identity.consent_receipts.policy_version in 001_identity.sql.
-- Intimate assessment answers and derived private state remain in cumg_vault.
ALTER TABLE identity.consent_receipts
  ADD COLUMN age_18_confirmed boolean NOT NULL DEFAULT false;

CREATE INDEX consent_receipts_user_type_version_idx
  ON identity.consent_receipts(user_id, consent_type, policy_version);
