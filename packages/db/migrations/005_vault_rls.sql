CREATE OR REPLACE FUNCTION cumg_vault.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

ALTER TABLE cumg_vault.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.assessments FORCE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.responses FORCE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.control_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.control_maps FORCE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumg_vault.training_sessions FORCE ROW LEVEL SECURITY;

CREATE POLICY assessments_owner_all ON cumg_vault.assessments FOR ALL USING (user_id = cumg_vault.current_user_id()) WITH CHECK (user_id = cumg_vault.current_user_id());
CREATE POLICY responses_owner_all ON cumg_vault.responses FOR ALL USING (EXISTS (SELECT 1 FROM cumg_vault.assessments a WHERE a.id = assessment_id AND a.user_id = cumg_vault.current_user_id())) WITH CHECK (EXISTS (SELECT 1 FROM cumg_vault.assessments a WHERE a.id = assessment_id AND a.user_id = cumg_vault.current_user_id()));
CREATE POLICY control_maps_owner_all ON cumg_vault.control_maps FOR ALL USING (user_id = cumg_vault.current_user_id()) WITH CHECK (user_id = cumg_vault.current_user_id());
CREATE POLICY training_sessions_owner_all ON cumg_vault.training_sessions FOR ALL USING (user_id = cumg_vault.current_user_id()) WITH CHECK (user_id = cumg_vault.current_user_id());

COMMENT ON FUNCTION cumg_vault.current_user_id() IS 'Application session identity contract. Request transaction must SET LOCAL app.user_id to the authenticated identity UUID before CUM.G Vault access.';
