-- P01 V1 identity additions contain eligibility/consent metadata only.
-- Intimate assessment answers and derived private state remain in cumg_vault.
ALTER TABLE identity.consent_receipts
  ADD COLUMN age_18_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN policy_version text NOT NULL DEFAULT 'UNVERSIONED';

CREATE INDEX consent_receipts_user_type_version_idx
  ON identity.consent_receipts(user_id, consent_type, policy_version);
