-- P01 adaptive map history: one immutable encrypted snapshot per user/map version.
ALTER TABLE cumg_vault.control_maps
  ADD COLUMN IF NOT EXISTS map_version integer NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS control_maps_user_version_idx
  ON cumg_vault.control_maps(user_id, map_version);

CREATE OR REPLACE FUNCTION cumg_vault.prevent_control_map_history_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.user_id IS DISTINCT FROM NEW.user_id
     OR OLD.map_version IS DISTINCT FROM NEW.map_version
     OR OLD.assessment_id IS DISTINCT FROM NEW.assessment_id
     OR OLD.instrument_version IS DISTINCT FROM NEW.instrument_version
     OR OLD.encrypted_snapshot IS DISTINCT FROM NEW.encrypted_snapshot THEN
    RAISE EXCEPTION 'CONTROL_MAP_HISTORY_IMMUTABLE';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS control_map_history_immutable ON cumg_vault.control_maps;
CREATE TRIGGER control_map_history_immutable
BEFORE UPDATE ON cumg_vault.control_maps
FOR EACH ROW EXECUTE FUNCTION cumg_vault.prevent_control_map_history_update();

COMMENT ON COLUMN cumg_vault.control_maps.map_version IS
  'Monotonic educational Control Map version. Persisted snapshots are immutable.';
COMMENT ON FUNCTION cumg_vault.prevent_control_map_history_update() IS
  'Prevents rewriting identity, version, provenance or encrypted Control Map snapshot data.';
