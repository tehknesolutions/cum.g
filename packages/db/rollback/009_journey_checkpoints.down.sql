DROP TRIGGER IF EXISTS journey_checkpoint_immutable ON cumg_vault.journey_checkpoints;
DROP FUNCTION IF EXISTS cumg_vault.prevent_journey_checkpoint_update();
DROP POLICY IF EXISTS journey_checkpoints_owner_all ON cumg_vault.journey_checkpoints;
DROP INDEX IF EXISTS cumg_vault.journey_checkpoints_user_created_idx;
DROP TABLE IF EXISTS cumg_vault.journey_checkpoints;
