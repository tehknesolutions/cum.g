-- Roll back P01 runtime hardening only.
-- This intentionally does not remove the underlying 007-010 P01 schema.

alter policy reflections_owner_all on cumg_vault.reflections
  using (user_id = cumg_vault.current_user_id())
  with check (user_id = cumg_vault.current_user_id());

drop index if exists learning.progress_lesson_idx;
drop index if exists learning.lesson_claims_claim_idx;
drop index if exists knowledge.claim_evidence_evidence_idx;
drop index if exists cumg_vault.training_sessions_program_idx;
drop index if exists cumg_vault.control_maps_assessment_user_idx;

alter function knowledge.enforce_scientific_claim_evidence() reset search_path;
alter function cumg_vault.prevent_journey_checkpoint_update() reset search_path;
alter function cumg_vault.prevent_control_map_history_update() reset search_path;
alter function cumg_vault.current_user_id() reset search_path;
