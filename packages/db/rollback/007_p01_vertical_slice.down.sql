DROP INDEX IF EXISTS identity.consent_receipts_user_type_version_idx;
ALTER TABLE identity.consent_receipts
  DROP COLUMN IF EXISTS age_18_confirmed;
