-- Runtime grants remain subordinate to FORCE RLS and owner policy.
GRANT SELECT, INSERT, UPDATE, DELETE ON cumg_vault.journey_checkpoints TO authenticated;
GRANT USAGE ON SCHEMA cumg_vault TO authenticated;
