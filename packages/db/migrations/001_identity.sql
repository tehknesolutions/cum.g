CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE identity.users (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE identity.consent_receipts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  policy_version text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz NULL,
  CONSTRAINT consent_receipts_grant_before_revoke CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

CREATE INDEX consent_receipts_user_idx ON identity.consent_receipts(user_id);
CREATE INDEX consent_receipts_user_type_idx ON identity.consent_receipts(user_id, consent_type);

CREATE TABLE identity.entitlements (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  status text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NULL,
  CONSTRAINT entitlements_valid_window CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX entitlements_user_idx ON identity.entitlements(user_id);
CREATE INDEX entitlements_user_product_idx ON identity.entitlements(user_id, product_id);

COMMENT ON SCHEMA identity IS 'Non-intimate account, consent and entitlement boundary. Intimate sexual/health answers are forbidden here.';
