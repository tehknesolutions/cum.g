DROP POLICY IF EXISTS training_sessions_owner_all ON cumg_vault.training_sessions;
DROP POLICY IF EXISTS control_maps_owner_all ON cumg_vault.control_maps;
DROP POLICY IF EXISTS responses_owner_all ON cumg_vault.responses;
DROP POLICY IF EXISTS assessments_owner_all ON cumg_vault.assessments;
DROP FUNCTION IF EXISTS cumg_vault.current_user_id();
