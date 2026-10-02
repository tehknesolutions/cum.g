-- Runtime grants are intentionally narrow. RLS remains the authorization boundary.
GRANT USAGE ON SCHEMA cumg_vault TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  cumg_vault.assessments,
  cumg_vault.responses,
  cumg_vault.control_maps,
  cumg_vault.training_sessions
TO authenticated;
GRANT EXECUTE ON FUNCTION cumg_vault.current_user_id() TO authenticated;
