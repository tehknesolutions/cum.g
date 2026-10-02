CREATE TABLE cumg_vault.journey_checkpoints (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  encrypted_state bytea NOT NULL,
  state_version integer NOT NULL DEFAULT 1 CHECK (state_version >= 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX journey_checkpoints_user_created_idx
  ON cumg_vault.journey_checkpoints(user_id, created_at DESC);

ALTER TABLE cumg_vault.journey_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.journey_checkpoints FORCE ROW LEVEL SECURITY;

CREATE POLICY journey_checkpoints_owner_all
  ON cumg_vault.journey_checkpoints
  FOR ALL
  USING (user_id = cumg_vault.current_user_id())
  WITH CHECK (user_id = cumg_vault.current_user_id());

CREATE OR REPLACE FUNCTION cumg_vault.prevent_journey_checkpoint_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.user_id IS DISTINCT FROM NEW.user_id
     OR OLD.encrypted_state IS DISTINCT FROM NEW.encrypted_state
     OR OLD.state_version IS DISTINCT FROM NEW.state_version
     OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'JOURNEY_CHECKPOINT_IMMUTABLE';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS journey_checkpoint_immutable ON cumg_vault.journey_checkpoints;
CREATE TRIGGER journey_checkpoint_immutable
BEFORE UPDATE ON cumg_vault.journey_checkpoints
FOR EACH ROW EXECUTE FUNCTION cumg_vault.prevent_journey_checkpoint_update();

COMMENT ON TABLE cumg_vault.journey_checkpoints IS 'Encrypted resumable P01 journey state. User-owned, immutable checkpoints; never expose to analytics or marketing.';
