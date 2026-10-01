CREATE OR REPLACE FUNCTION vault.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

ALTER TABLE vault.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.assessments FORCE ROW LEVEL SECURITY;
ALTER TABLE vault.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.responses FORCE ROW LEVEL SECURITY;
ALTER TABLE vault.control_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.control_maps FORCE ROW LEVEL SECURITY;
ALTER TABLE vault.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.training_sessions FORCE ROW LEVEL SECURITY;

CREATE POLICY assessments_owner_all ON vault.assessments
FOR ALL
USING (user_id = vault.current_user_id())
WITH CHECK (user_id = vault.current_user_id());

CREATE POLICY responses_owner_all ON vault.responses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM vault.assessments a
    WHERE a.id = assessment_id
      AND a.user_id = vault.current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vault.assessments a
    WHERE a.id = assessment_id
      AND a.user_id = vault.current_user_id()
  )
);

CREATE POLICY control_maps_owner_all ON vault.control_maps
FOR ALL
USING (user_id = vault.current_user_id())
WITH CHECK (user_id = vault.current_user_id());

CREATE POLICY training_sessions_owner_all ON vault.training_sessions
FOR ALL
USING (user_id = vault.current_user_id())
WITH CHECK (user_id = vault.current_user_id());

COMMENT ON FUNCTION vault.current_user_id() IS 'Application session identity contract. Request transaction must SET LOCAL app.user_id to the authenticated identity UUID before Vault access.';
