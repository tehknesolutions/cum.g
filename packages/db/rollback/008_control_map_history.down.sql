DROP TRIGGER IF EXISTS control_map_history_immutable ON cumg_vault.control_maps;
DROP FUNCTION IF EXISTS cumg_vault.prevent_control_map_history_update();
DROP INDEX IF EXISTS cumg_vault.control_maps_user_version_idx;
ALTER TABLE cumg_vault.control_maps DROP COLUMN IF EXISTS map_version;
