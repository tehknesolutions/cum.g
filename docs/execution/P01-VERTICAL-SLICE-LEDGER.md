# CUM.G — P01 Vertical Slice Verification Ledger

**Program:** CUMG-P01 — Controle Ejaculatório  
**Scope:** V1 FREE educational vertical slice  
**Branch:** main  
**Status:** IMPLEMENTED / SAFETY-HARDENED / RUNTIME VERIFICATION PENDING WHERE ENVIRONMENT IS REQUIRED

## PASS — static/contract implementation evidence

- [x] Adult + versioned-consent gate exists and fails closed.
- [x] Assessment instrument has 12 core questions and a hard maximum of 32 answers.
- [x] Assessment branching is deterministic and cycle-checked.
- [x] Control Map has exactly seven educational dimensions and no aggregate score/diagnosis field.
- [x] P01-L01 has all seven stages in order.
- [x] P01-L02 is integrated with the canonical course manifest and provenance registry.
- [x] Provenance classes remain explicit: SCIENTIFIC / EXPERIENTIAL / SOCIAL / HNK.
- [x] Initial PRACTICE is explicitly non-sexual.
- [x] Private reflection storage is under `cumg_vault` with FORCE RLS.
- [x] Learning progress is not extended with private reflection payloads.
- [x] Safety guidance is resolved before premium offer in the web journey.
- [x] Entitlement gate independently refuses PREMIUM when a safety escalation is present.
- [x] FREE journey exposes meaningful Control Map/L01 value before offer.
- [x] Analytics allowlist contains only coarse P01 lifecycle identifiers and recursively rejects sensitive/private keys.
- [x] No real intimate/health fixtures are used by P01 tests.
- [x] Resumable journey checkpoints are encrypted at the Vault adapter boundary.
- [x] Journey checkpoints are user-owned, FORCE-RLS protected, and immutable in PostgreSQL.
- [x] Journey checkpoint versions are unique per user and use optimistic expected-version writes.
- [x] Cross-session recovery restores the latest checkpoint for the requested user.
- [x] A stale concurrent session fails closed with `CHECKPOINT_CONFLICT` and cannot overwrite a newer checkpoint.
- [x] OFFER/ERROR states are excluded from resumable checkpoint persistence.

## CURRENT GATE

L01 and L02 are integrated into the FREE journey. Resumable session persistence is now statically/contractually complete, including cross-session recovery and stale-writer protection. Runtime verification remains pending where PostgreSQL/staging or an executable runner is required.

## PENDING — requires runtime execution

- [x] CI workflow is configured to execute full Node test discovery on GitHub with Node 22.
- [x] CI workflow includes a focused P01 database/web test pass.
- [ ] Apply migration 007 to authorized FREE PostgreSQL staging.
- [ ] Apply migrations 009/010 for journey checkpoint persistence to authorized FREE PostgreSQL staging.
- [ ] Prove user A cannot read/write user B `cumg_vault.reflections` under non-bypass authenticated runtime role.
- [ ] Prove user A cannot read/write user B `cumg_vault.journey_checkpoints` under non-bypass authenticated runtime role.
- [ ] Verify RLS behavior with transaction-scoped `app.user_id`.
- [ ] Execute forward migration + rollback/reapply on disposable/staging database.
- [ ] Verify the full E2E journey against real package implementations rather than test doubles.
- [ ] Execute a two-session runtime concurrency probe against PostgreSQL and verify stale checkpoint writes are rejected.

## TOOLING-BLOCKED / DEBT

- Production KMS/encryption authorization is deferred by design; the staging codec is an opaque serialization contract, not production encryption.
- Existing M5.G2 destructive-lifecycle/CI debt remains separate and must not be represented as cleared by P01 static implementation.
- GitHub-hosted runner evidence for the latest checkpoint-concurrency commit is not yet GREEN; product implementation is not being marked failed solely because of runner/tooling availability.

## Privacy invariant

`PUBLIC/MEDIA ≠ EDUCATION ≠ PRIVATE VAULT ≠ ANALYTICS/ADS`

Assessment answers, Control Maps, reflections and safety/private signals must never become generic analytics or advertising properties.

## Acceptance gate

P01 becomes runtime-verified only after the PENDING database and executable-suite checks are performed with fresh evidence. Static implementation completion is not substituted for runtime evidence.

- [x] CI workflow is configured to execute full Node test discovery on GitHub with Node 22.
- [x] CI workflow includes a focused P01 database/web test pass.
- [x] FREE journey now requires L01 → L02 → reflection/map update before NEXT_STEP.
- [x] Recommendation now enters an executable practice runtime before OFFER.
- [x] P01 E2E covers START_PRACTICE → COMPLETE_PRACTICE → OFFER.
- [x] Practice completion now enters PRACTICE_RESULT and requires private reflection + MAP_UPDATE before OFFER.
- [x] Private reflection vault adapter contract is defined against the existing cumg_vault.reflections boundary.
- [x] Vault isolation contract tests pin `FORCE ROW LEVEL SECURITY` and owner-only `control_maps` policy.
- [x] Control Map history uses per-user `(user_id, map_version)` uniqueness as the concurrent-write conflict boundary.
- [x] Immutable history contract tests cover owner/version/provenance/encrypted-payload rewrite rejection.
- [x] Journey checkpoint persistence uses per-user `(user_id, state_version)` uniqueness as the concurrent-write conflict boundary.
- [x] Journey checkpoint adapter uses `expectedVersion` and fails closed on stale writes.
- [x] P01 orchestration carries checkpoint version state across resumable transitions.
