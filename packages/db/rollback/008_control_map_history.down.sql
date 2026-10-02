DROP INDEX IF EXISTS cumg_vault.control_maps_user_version_idx;
ALTER TABLE cumg_vault.control_maps DROP COLUMN IF EXISTS map_version;
