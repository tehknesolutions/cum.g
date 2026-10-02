REVOKE EXECUTE ON FUNCTION cumg_vault.current_user_id() FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON
  cumg_vault.assessments,
  cumg_vault.responses,
  cumg_vault.control_maps,
  cumg_vault.training_sessions
FROM authenticated;
REVOKE USAGE ON SCHEMA cumg_vault FROM authenticated;
