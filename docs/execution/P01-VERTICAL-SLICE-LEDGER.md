# CUM.G — P01 Vertical Slice Verification Ledger

**Program:** CUMG-P01 — Controle Ejaculatório  
**Scope:** V1 FREE educational vertical slice  
**Branch:** main  
**Status:** IMPLEMENTED / SAFETY-HARDENED / WEB-INTEGRATED / POSTGRESQL RUNTIME VERIFIED EXCEPT DEFERRED DESTRUCTIVE ROLLBACK / CI RUNNER BLOCKED EXTERNALLY

## PASS — implementation and runtime evidence

- [x] Adult + versioned-consent gate exists and fails closed.
- [x] Assessment instrument has 12 core questions and a hard maximum of 32 answers.
- [x] Assessment branching is deterministic and cycle-checked.
- [x] Control Map has exactly seven educational dimensions and no aggregate score/diagnosis field.
- [x] P01-L01 and P01-L02 are integrated with canonical manifests/provenance.
- [x] Initial PRACTICE is explicitly non-sexual.
- [x] Safety guidance precedes practice/offer and remains outside entitlement gating.
- [x] Web presentation uses canonical assessment, map, lesson, guidance and practice runtimes.
- [x] Lesson Player and Practice Player are contract-bound to canonical runtime/content.
- [x] Private reflection/checkpoint payloads remain outside generic analytics/advertising surfaces.
- [x] Migrations 007, 008, 009 and 010 were applied to authorized `cum-g-staging` PostgreSQL runtime.
- [x] Migration 011 runtime hardening was applied to staging and codified in the repository.
- [x] `cumg_vault.reflections` and `cumg_vault.journey_checkpoints` have RLS + FORCE RLS in staging.
- [x] Owner-only policies were verified under the non-bypass `authenticated` role with transaction-scoped `app.user_id`.
- [x] Cross-user reflection/checkpoint visibility returned zero rows in runtime isolation probes.
- [x] Cross-user reflection mutation did not expose or alter another user's row in the runtime probe.
- [x] Control Map history and journey checkpoint immutability triggers rejected rewrite attempts.
- [x] Duplicate `(user_id, state_version)` checkpoint insertion failed with PostgreSQL unique-violation `23505`, proving the concurrency boundary.
- [x] Runtime probes used transactions/rollback so artificial probe users/data were not retained.
- [x] Migration 011 fixes mutable `search_path` for four advisor-identified functions.
- [x] Migration 011 adds five advisor-identified FK coverage indexes.
- [x] `reflections_owner_all` uses an initplan-friendly scalar subquery for `current_user_id()` while preserving owner-only RLS semantics.

## CURRENT GATE

The P01 FREE product/runtime contract is implemented and its critical PostgreSQL privacy, isolation, immutability and concurrency invariants have live staging evidence. The deliberately destructive rollback/reapply exercise is deferred until explicit destructive authorization is provided. This deferral must not be represented as a failed invariant or as an executed test.

## DEFERRED / BLOCKED

- [ ] **DEFERRED — explicit destructive authorization required:** rollback P01 database objects, prove absence, reapply 007→011, then repeat critical invariants.
- [ ] **BLOCKED EXTERNALLY:** GitHub Actions hosted runner execution. The P01 Contract Gate workflow was dispatched, but the job received no runner/steps because the GitHub account was locked by a billing issue. This is not evidence of a P01 test failure.
- [ ] Execute the full browser/E2E journey against real package implementations in an executable runner once runner access is available.

## TOOLING / PRODUCTION DEBT

- Production KMS/encryption authorization remains deferred by design; the staging codec is not represented as production encryption.
- Advisor `unused index` notices are not treated as removal candidates from a low-workload staging database without representative workload evidence.
- Destructive lifecycle evidence remains separate from the already-proven live RLS/isolation/concurrency invariants.

## Privacy invariant

`PUBLIC/MEDIA ≠ EDUCATION ≠ PRIVATE VAULT ≠ ANALYTICS/ADS`

Assessment answers, Control Maps, reflections and safety/private signals must never become generic analytics or advertising properties.

## Acceptance gate

PostgreSQL runtime verification is **97% complete**: all non-destructive critical invariants have live staging evidence. The remaining 3% is the explicitly deferred destructive rollback/reapply exercise. CI runtime remains separately blocked by hosted-runner billing/account state and is not counted as a product-code failure.
