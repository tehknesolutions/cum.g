DROP POLICY IF EXISTS training_sessions_owner_all ON vault.training_sessions;
DROP POLICY IF EXISTS control_maps_owner_all ON vault.control_maps;
DROP POLICY IF EXISTS responses_owner_all ON vault.responses;
DROP POLICY IF EXISTS assessments_owner_all ON vault.assessments;
DROP FUNCTION IF EXISTS vault.current_user_id();
