-- P01 adaptive map history: one immutable encrypted snapshot per user/map version.
ALTER TABLE cumg_vault.control_maps
  ADD COLUMN IF NOT EXISTS map_version integer NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS control_maps_user_version_idx
  ON cumg_vault.control_maps(user_id, map_version);

COMMENT ON COLUMN cumg_vault.control_maps.map_version IS
  'Monotonic educational Control Map version. Each persisted snapshot is immutable.';
