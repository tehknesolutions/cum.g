-- P01 runtime hardening
-- Mirrors the hardening verified on cum-g-staging after migrations 007-010.

alter function cumg_vault.current_user_id()
  set search_path = pg_catalog, cumg_vault;

alter function cumg_vault.prevent_control_map_history_update()
  set search_path = pg_catalog, cumg_vault;

alter function cumg_vault.prevent_journey_checkpoint_update()
  set search_path = pg_catalog, cumg_vault;

alter function knowledge.enforce_scientific_claim_evidence()
  set search_path = pg_catalog, knowledge;

create index if not exists control_maps_assessment_user_idx
  on cumg_vault.control_maps (assessment_id, user_id);

create index if not exists training_sessions_program_idx
  on cumg_vault.training_sessions (program_id);

create index if not exists claim_evidence_evidence_idx
  on knowledge.claim_evidence (evidence_id);

create index if not exists lesson_claims_claim_idx
  on learning.lesson_claims (claim_id);

create index if not exists progress_lesson_idx
  on learning.progress (lesson_id);

alter policy reflections_owner_all on cumg_vault.reflections
  using (user_id = (select cumg_vault.current_user_id()))
  with check (user_id = (select cumg_vault.current_user_id()));
