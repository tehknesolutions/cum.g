-- P01 V1 identity additions contain eligibility metadata only.
-- Versioned consent already exists as identity.consent_receipts.policy_version in 001_identity.sql.
-- Intimate assessment answers and derived private state remain in cumg_vault.
ALTER TABLE identity.consent_receipts
  ADD COLUMN age_18_confirmed boolean NOT NULL DEFAULT false;

CREATE INDEX consent_receipts_user_type_version_idx
  ON identity.consent_receipts(user_id, consent_type, policy_version);

CREATE TABLE cumg_vault.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  lesson_code text NOT NULL,
  record_version integer NOT NULL DEFAULT 1 CHECK (record_version > 0),
  encrypted_payload bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reflections_user_lesson_idx
  ON cumg_vault.reflections(user_id, lesson_code, created_at DESC);

ALTER TABLE cumg_vault.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.reflections FORCE ROW LEVEL SECURITY;

CREATE POLICY reflections_owner_all ON cumg_vault.reflections
  FOR ALL
  USING (current_setting('app.user_id', true)::uuid = user_id)
  WITH CHECK (current_setting('app.user_id', true)::uuid = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON cumg_vault.reflections TO authenticated;
