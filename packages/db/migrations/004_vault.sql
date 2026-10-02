CREATE SCHEMA IF NOT EXISTS cumg_vault;

CREATE TABLE cumg_vault.assessments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  instrument_code text NOT NULL,
  instrument_version text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NULL,
  CONSTRAINT assessments_valid_window CHECK (completed_at IS NULL OR completed_at >= started_at),
  UNIQUE (id, user_id)
);

CREATE TABLE cumg_vault.responses (
  id uuid PRIMARY KEY,
  assessment_id uuid NOT NULL REFERENCES cumg_vault.assessments(id) ON DELETE CASCADE,
  question_code text NOT NULL,
  encrypted_payload bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, question_code)
);

CREATE TABLE cumg_vault.control_maps (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL,
  instrument_version text NOT NULL,
  encrypted_snapshot bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (assessment_id, user_id) REFERENCES cumg_vault.assessments(id, user_id) ON DELETE CASCADE
);

CREATE TABLE cumg_vault.training_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  program_id text NOT NULL REFERENCES learning.programs(id) ON DELETE RESTRICT,
  protocol_code text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NULL,
  encrypted_private_state bytea NULL,
  CONSTRAINT training_sessions_valid_window CHECK (completed_at IS NULL OR completed_at >= started_at)
);

CREATE INDEX assessments_user_idx ON cumg_vault.assessments(user_id);
CREATE INDEX responses_assessment_idx ON cumg_vault.responses(assessment_id);
CREATE INDEX control_maps_user_idx ON cumg_vault.control_maps(user_id);
CREATE INDEX training_sessions_user_idx ON cumg_vault.training_sessions(user_id);

COMMENT ON SCHEMA cumg_vault IS 'CUM.G private encrypted intimate assessment and training boundary. Never expose payloads to generic analytics or marketing systems.';
COMMENT ON TABLE cumg_vault.control_maps IS 'Educational self-observation artifact; not a medical diagnosis.';
